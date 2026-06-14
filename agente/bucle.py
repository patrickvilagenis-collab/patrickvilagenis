"""Loops: el bucle ReAct con auto-corrección.

Implementa el modelo operativo del framework como un `while True` con condiciones
de salida explícitas:

    Objetivo    -> se define la meta a lograr
    Pensar      -> el Cerebro razona el siguiente paso
    Actuar      -> se ejecuta una herramienta (Manos)
    Observar    -> se incorpora el resultado de la herramienta
    Reflexionar -> el Agente Crítico evalúa la respuesta candidata (Verificación)
    Reintentar  -> si no se aprueba, se ajusta la estrategia y se repite

El bucle combina dos niveles de control:
  * Interior: ciclo Pensar→Actuar→Observar con uso de herramientas, hasta que el
    LLM produce una respuesta final candidata.
  * Exterior: la Verificación; si el Crítico no aprueba, se realimenta con su
    crítica y se reintenta (auto-corrección), aprendiendo de los errores.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Callable

from .verificacion import Veredicto


@dataclass
class Resultado:
    objetivo: str
    respuesta: str
    veredicto: Veredicto | None
    iteraciones: int
    reintentos: int
    traza: list[str] = field(default_factory=list)
    cumplido: bool = False


class BucleReAct:
    def __init__(
        self,
        cerebro,
        manos,
        memoria_largo,
        verificador,
        max_iteraciones: int = 14,
        max_reintentos: int = 3,
        on_evento: Callable[[str, str], None] | None = None,
    ) -> None:
        self.cerebro = cerebro
        self.manos = manos
        self.memoria_largo = memoria_largo
        self.verificador = verificador
        self.max_iteraciones = max_iteraciones
        self.max_reintentos = max_reintentos
        self.on_evento = on_evento

    def _evento(self, fase: str, detalle: str = "") -> None:
        if self.on_evento:
            self.on_evento(fase, detalle)

    def _sistema(self, objetivo: str) -> str:
        nombres = ", ".join(d["name"] for d in self.manos.definiciones())
        return (
            "Eres un agente autónomo orientado a objetivos. NO te limitas a "
            "responder: trabajas de forma autónoma hasta CUMPLIR el objetivo, "
            "usando herramientas cuando haga falta.\n\n"
            "Sigue el ciclo Pensar→Actuar→Observar: razona el siguiente paso, "
            "invoca una herramienta, observa el resultado y repite. Verifica tus "
            "propios resultados (por ejemplo, releyendo un archivo que escribiste "
            "o recalculando) antes de concluir.\n\n"
            f"Herramientas disponibles: {nombres}.\n\n"
            "Cuando el objetivo esté realmente cumplido, responde SIN llamar a "
            "ninguna herramienta, con una respuesta final clara que explique el "
            "resultado y cómo lo verificaste. Un Agente Crítico revisará tu "
            "respuesta; si no es correcta, recibirás su crítica para corregir."
        )

    def ejecutar(self, objetivo: str, memoria_corto, contexto: str | None = None) -> Resultado:
        # --- Objetivo ---
        self._evento("OBJETIVO", objetivo)
        sistema = self._sistema(objetivo)

        primer_mensaje = f"OBJETIVO: {objetivo}"
        if contexto:
            primer_mensaje += f"\n\nCONTEXTO ADICIONAL:\n{contexto}"
        contexto_mem = self.memoria_largo.contexto_relevante(objetivo)
        if contexto_mem:
            primer_mensaje += f"\n\nMEMORIA DE TAREAS ANTERIORES:\n{contexto_mem}"
        memoria_corto.anadir("user", primer_mensaje)

        herramientas = self.manos.definiciones()
        traza: list[str] = []
        iteraciones = 0
        reintentos = 0
        propuesta = ""
        veredicto: Veredicto | None = None

        while True:  # bucle ReAct con salidas explícitas
            iteraciones += 1
            if iteraciones > self.max_iteraciones:
                self._evento("LIMITE", "Se alcanzó el máximo de iteraciones.")
                break

            # --- Pensar ---
            self._evento("PENSAR", f"Iteración {iteraciones}")
            respuesta = self.cerebro.turno(sistema, memoria_corto.historial(), herramientas)

            if respuesta.stop_reason == "refusal":
                propuesta = "[El modelo rechazó la solicitud por motivos de seguridad.]"
                self._evento("RECHAZO", propuesta)
                break

            # El contenido completo (incluidos bloques de thinking) debe reenviarse.
            memoria_corto.anadir("assistant", respuesta.content)
            bloques_tool = [b for b in respuesta.content if b.type == "tool_use"]

            if bloques_tool:
                # --- Actuar + Observar ---
                resultados = []
                for bloque in bloques_tool:
                    entrada_txt = json.dumps(bloque.input, ensure_ascii=False)
                    self._evento("ACTUAR", f"{bloque.name}({entrada_txt})")
                    salida, es_error = self.manos.ejecutar(bloque.name, bloque.input)
                    marca = "⚠️ " if es_error else ""
                    self._evento("OBSERVAR", f"{marca}{salida[:400]}")
                    traza.append(f"{bloque.name}({entrada_txt}) -> {salida[:300]}")
                    resultados.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": bloque.id,
                            "content": salida,
                            "is_error": es_error,
                        }
                    )
                memoria_corto.anadir("user", resultados)
                continue  # vuelve a Pensar

            # --- Respuesta final candidata -> Reflexionar (Verificación) ---
            propuesta = self.cerebro.texto_de(respuesta)
            self._evento("REFLEXIONAR", "El Agente Crítico evalúa la respuesta…")
            veredicto = self.verificador.evaluar(objetivo, propuesta, "\n".join(traza))

            if veredicto.aprobado:
                self._evento("OBJETIVO_CUMPLIDO", f"puntuación {veredicto.puntuacion}/10")
                self.memoria_largo.registrar_patron(
                    f"Objetivo logrado ({veredicto.puntuacion}/10): {objetivo[:100]}"
                )
                return Resultado(objetivo, propuesta, veredicto, iteraciones, reintentos, traza, True)

            if reintentos >= self.max_reintentos:
                self._evento("LIMITE", "Máximo de reintentos sin aprobación del Crítico.")
                break

            # --- Reintentar (auto-corrección) ---
            reintentos += 1
            problema = "; ".join(veredicto.problemas) or veredicto.justificacion
            self._evento("REINTENTAR", f"Reintento {reintentos}: {problema}")
            self.memoria_largo.registrar_error(
                objetivo, problema, "; ".join(veredicto.sugerencias) or "revisar enfoque"
            )
            memoria_corto.anadir(
                "user",
                "El Agente Crítico NO aprobó la respuesta.\n"
                f"Puntuación: {veredicto.puntuacion}/10\n"
                f"Problemas: {veredicto.problemas}\n"
                f"Sugerencias: {veredicto.sugerencias}\n\n"
                "Corrige el trabajo (usa herramientas si hace falta) y entrega una "
                "nueva respuesta final cuando el objetivo esté cumplido.",
            )

        return Resultado(
            objetivo,
            propuesta,
            veredicto,
            iteraciones,
            reintentos,
            traza,
            cumplido=bool(veredicto and veredicto.aprobado),
        )
