"""Manos: las herramientas y acciones que el agente puede ejecutar.

Las "manos" son cómo el agente actúa sobre el mundo. Cada herramienta declara un
nombre, una descripción (que Claude usa para decidir cuándo invocarla) y un JSON
Schema de entrada; el bucle ReAct las ofrece al LLM y despacha sus llamadas.

Herramientas incluidas (diversas, como pide el caso de uso):
  * calculadora       — evaluación aritmética segura
  * ejecutar_python   — ejecución de código en un subproceso aislado
  * buscar_web        — búsqueda web (vía la herramienta server-side de Claude)
  * escribir_archivo  — escritura de ficheros en el workspace
  * leer_archivo      — lectura de ficheros del workspace
  * listar_archivos   — listado del workspace
  * buscar_memoria    — consulta a la base de datos vectorial (memoria larga)
  * recordar          — guarda un aprendizaje en la memoria larga

Este módulo no importa el SDK de Anthropic: `buscar_web` usa el `Cerebro` que se
le inyecta, de modo que el resto de herramientas funciona sin dependencias.
"""
from __future__ import annotations

import ast
import operator
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

# --- Evaluador aritmético seguro (sin eval()) ------------------------------
_OPERADORES = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _evaluar_expresion(nodo) -> float:
    if isinstance(nodo, ast.Constant) and isinstance(nodo.value, (int, float)):
        return nodo.value
    if isinstance(nodo, ast.BinOp) and type(nodo.op) in _OPERADORES:
        return _OPERADORES[type(nodo.op)](_evaluar_expresion(nodo.left), _evaluar_expresion(nodo.right))
    if isinstance(nodo, ast.UnaryOp) and type(nodo.op) in _OPERADORES:
        return _OPERADORES[type(nodo.op)](_evaluar_expresion(nodo.operand))
    raise ValueError("Expresión no permitida (solo aritmética básica).")


class Herramienta:
    """Una herramienta invocable por el agente."""

    def __init__(self, nombre: str, descripcion: str, esquema: dict, funcion: Callable[..., Any]) -> None:
        self.nombre = nombre
        self.descripcion = descripcion
        self.esquema = esquema
        self.funcion = funcion

    def definicion(self) -> dict:
        """Definición en el formato que espera la API de Claude."""
        return {"name": self.nombre, "description": self.descripcion, "input_schema": self.esquema}


class Manos:
    def __init__(self, workspace: str | Path, cerebro=None, memoria=None) -> None:
        self.workspace = Path(workspace).resolve()
        self.workspace.mkdir(parents=True, exist_ok=True)
        self.cerebro = cerebro      # para buscar_web (búsqueda server-side de Claude)
        self.memoria = memoria      # MemoriaLargoPlazo, para recordar/buscar_memoria
        self._herramientas: dict[str, Herramienta] = {}
        self._registrar_basicas()

    # ---- registro -----------------------------------------------------
    def registrar(self, herramienta: Herramienta) -> None:
        self._herramientas[herramienta.nombre] = herramienta

    def definiciones(self) -> list[dict]:
        return [h.definicion() for h in self._herramientas.values()]

    def ejecutar(self, nombre: str, entrada: dict) -> tuple[str, bool]:
        """Ejecuta una herramienta. Devuelve (salida, es_error).

        Nunca lanza: los errores se devuelven como texto con `es_error=True` para
        que el agente los observe y ajuste su estrategia (auto-corrección).
        """
        herramienta = self._herramientas.get(nombre)
        if herramienta is None:
            return (f"Herramienta desconocida: {nombre}", True)
        try:
            salida = herramienta.funcion(**(entrada or {}))
            return (str(salida), False)
        except Exception as exc:  # noqa: BLE001 — se reporta al agente, no se propaga
            return (f"Error al ejecutar '{nombre}': {exc}", True)

    # ---- utilidades de seguridad de rutas -----------------------------
    def _ruta_segura(self, ruta: str) -> Path:
        destino = (self.workspace / ruta).resolve()
        if not str(destino).startswith(str(self.workspace)):
            raise ValueError("Ruta fuera del workspace permitido.")
        return destino

    # ---- definición de las herramientas básicas -----------------------
    def _registrar_basicas(self) -> None:
        self.registrar(
            Herramienta(
                "calculadora",
                "Evalúa una expresión aritmética (suma, resta, producto, división, "
                "potencia, módulo). Ej.: '2 ** 10 + 5 * 3'.",
                {
                    "type": "object",
                    "properties": {"expresion": {"type": "string", "description": "Expresión aritmética"}},
                    "required": ["expresion"],
                },
                self._calculadora,
            )
        )
        self.registrar(
            Herramienta(
                "ejecutar_python",
                "Ejecuta un fragmento de código Python en un subproceso aislado "
                "(timeout 20 s) y devuelve su salida estándar y de error. Úsalo para "
                "cálculos, transformaciones de datos o lógica que no cubran otras "
                "herramientas. Imprime (print) lo que necesites observar.",
                {
                    "type": "object",
                    "properties": {"codigo": {"type": "string", "description": "Código Python a ejecutar"}},
                    "required": ["codigo"],
                },
                self._ejecutar_python,
            )
        )
        self.registrar(
            Herramienta(
                "buscar_web",
                "Busca información actual en la web y devuelve un resumen con fuentes. "
                "Úsalo cuando necesites datos posteriores a tu conocimiento o hechos "
                "verificables del mundo real.",
                {
                    "type": "object",
                    "properties": {"consulta": {"type": "string", "description": "Qué buscar"}},
                    "required": ["consulta"],
                },
                self._buscar_web,
            )
        )
        self.registrar(
            Herramienta(
                "escribir_archivo",
                "Escribe (o sobrescribe) un archivo de texto en el workspace.",
                {
                    "type": "object",
                    "properties": {
                        "ruta": {"type": "string", "description": "Ruta relativa dentro del workspace"},
                        "contenido": {"type": "string", "description": "Contenido del archivo"},
                    },
                    "required": ["ruta", "contenido"],
                },
                self._escribir_archivo,
            )
        )
        self.registrar(
            Herramienta(
                "leer_archivo",
                "Lee un archivo de texto del workspace y devuelve su contenido.",
                {
                    "type": "object",
                    "properties": {"ruta": {"type": "string", "description": "Ruta relativa dentro del workspace"}},
                    "required": ["ruta"],
                },
                self._leer_archivo,
            )
        )
        self.registrar(
            Herramienta(
                "listar_archivos",
                "Lista los archivos existentes en el workspace.",
                {"type": "object", "properties": {}},
                self._listar_archivos,
            )
        )
        self.registrar(
            Herramienta(
                "buscar_memoria",
                "Consulta la memoria de largo plazo (base vectorial) y recupera "
                "aprendizajes de tareas anteriores relevantes a una consulta.",
                {
                    "type": "object",
                    "properties": {"consulta": {"type": "string", "description": "Qué recordar"}},
                    "required": ["consulta"],
                },
                self._buscar_memoria,
            )
        )
        self.registrar(
            Herramienta(
                "recordar",
                "Guarda un hecho o aprendizaje en la memoria de largo plazo para "
                "futuras tareas.",
                {
                    "type": "object",
                    "properties": {
                        "texto": {"type": "string", "description": "Lo que conviene recordar"},
                        "etiqueta": {"type": "string", "description": "Categoría breve (opcional)"},
                    },
                    "required": ["texto"],
                },
                self._recordar,
            )
        )

    # ---- implementaciones --------------------------------------------
    def _calculadora(self, expresion: str) -> str:
        valor = _evaluar_expresion(ast.parse(expresion, mode="eval").body)
        return f"{expresion} = {valor}"

    def _ejecutar_python(self, codigo: str) -> str:
        # Subproceso aislado con timeout. Pensado para uso de confianza
        # (el agente genera el código); no es un sandbox de seguridad.
        proc = subprocess.run(
            [sys.executable, "-c", codigo],
            capture_output=True,
            text=True,
            timeout=20,
            cwd=str(self.workspace),
        )
        salida = (proc.stdout or "").strip()
        error = (proc.stderr or "").strip()
        partes = []
        if salida:
            partes.append(f"stdout:\n{salida}")
        if error:
            partes.append(f"stderr:\n{error}")
        partes.append(f"(código de salida: {proc.returncode})")
        return "\n".join(partes)

    def _buscar_web(self, consulta: str) -> str:
        if self.cerebro is None:
            return "buscar_web no disponible (no se configuró el Cerebro)."
        client = self.cerebro.client
        mensajes = [
            {"role": "user", "content": f"Busca en la web y resume con fuentes: {consulta}"}
        ]
        tools = [{"type": "web_search_20260209", "name": "web_search"}]
        respuesta = None
        for _ in range(5):  # el bucle server-side puede pausar (pause_turn)
            respuesta = client.messages.create(
                model=self.cerebro.modelo, max_tokens=2000, messages=mensajes, tools=tools
            )
            if respuesta.stop_reason == "pause_turn":
                mensajes.append({"role": "assistant", "content": respuesta.content})
                continue
            break
        texto = "".join(b.text for b in respuesta.content if b.type == "text").strip()
        return texto or "(la búsqueda no devolvió texto)"

    def _escribir_archivo(self, ruta: str, contenido: str) -> str:
        destino = self._ruta_segura(ruta)
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(contenido, encoding="utf-8")
        return f"Escrito {len(contenido)} caracteres en {ruta}"

    def _leer_archivo(self, ruta: str) -> str:
        return self._ruta_segura(ruta).read_text(encoding="utf-8")

    def _listar_archivos(self) -> str:
        archivos = [
            str(p.relative_to(self.workspace))
            for p in sorted(self.workspace.rglob("*"))
            if p.is_file()
        ]
        return "\n".join(archivos) if archivos else "(workspace vacío)"

    def _buscar_memoria(self, consulta: str) -> str:
        if self.memoria is None:
            return "Memoria de largo plazo no disponible."
        resultados = self.memoria.buscar(consulta, k=3)
        if not resultados:
            return "Sin recuerdos relevantes."
        return "\n".join(f"[{r['etiqueta']}] {r['texto']} (similitud {s:.2f})" for s, r in resultados)

    def _recordar(self, texto: str, etiqueta: str = "nota") -> str:
        if self.memoria is None:
            return "Memoria de largo plazo no disponible."
        return self.memoria.recordar(texto, etiqueta)
