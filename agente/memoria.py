"""Memoria: el sistema de memoria del agente.

Dos niveles, tal como describe el framework:

  * **Corto plazo** (`MemoriaCortoPlazo`): el contexto de la sesión actual, es
    decir, la lista de mensajes que se envía al LLM en cada turno.

  * **Largo plazo** (`MemoriaLargoPlazo`): conocimiento que sobrevive entre
    sesiones — patrones aprendidos, historial de errores y una pequeña **base de
    datos vectorial** para recuperar recuerdos por similitud semántica. Se
    persiste en un JSON dentro del workspace.

La base vectorial es deliberadamente ligera (bolsa de palabras con *hashing* y
similitud coseno): no requiere servicios externos ni dependencias, pero ofrece
recuperación semántica suficiente para que el agente reutilice lo aprendido.
"""
from __future__ import annotations

import json
import math
import re
import time
from collections import Counter
from pathlib import Path

# Dimensión del espacio vectorial (hashing trick). Suficiente para evitar
# colisiones en vocabularios pequeños/medianos y mantener los vectores ligeros.
_DIM = 1024
_TOKEN = re.compile(r"[\wáéíóúñü]+", re.UNICODE)


def _tokenizar(texto: str) -> list[str]:
    return _TOKEN.findall(texto.lower())


def _vectorizar(texto: str) -> dict[int, float]:
    """Vector disperso (índice -> peso) por bolsa de palabras con hashing.

    Usamos un hash estable (no el `hash()` de Python, que varía entre procesos)
    para que los vectores sean reproducibles entre ejecuciones.
    """
    cuentas = Counter(_tokenizar(texto))
    vector: dict[int, float] = {}
    for token, n in cuentas.items():
        idx = _hash_estable(token) % _DIM
        vector[idx] = vector.get(idx, 0.0) + float(n)
    return vector


def _hash_estable(s: str) -> int:
    h = 2166136261
    for ch in s:  # FNV-1a de 32 bits, determinista entre procesos
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _coseno(a: dict[int, float], b: dict[int, float]) -> float:
    if not a or not b:
        return 0.0
    comunes = set(a) & set(b)
    producto = sum(a[i] * b[i] for i in comunes)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return producto / (na * nb)


# ---------------------------------------------------------------------------
# Corto plazo
# ---------------------------------------------------------------------------
class MemoriaCortoPlazo:
    """Contexto de la sesión actual: la conversación con el LLM."""

    def __init__(self) -> None:
        self.mensajes: list[dict] = []

    def anadir(self, rol: str, contenido) -> None:
        self.mensajes.append({"role": rol, "content": contenido})

    def historial(self) -> list[dict]:
        return self.mensajes

    def limpiar(self) -> None:
        self.mensajes = []


# ---------------------------------------------------------------------------
# Largo plazo
# ---------------------------------------------------------------------------
class MemoriaLargoPlazo:
    """Patrones aprendidos, errores pasados y base vectorial persistente."""

    def __init__(self, ruta: str | Path) -> None:
        self.ruta = Path(ruta)
        self.recuerdos: list[dict] = []   # {texto, etiqueta, ts}  (base vectorial)
        self.errores: list[dict] = []     # {objetivo, problema, correccion, ts}
        self.patrones: list[dict] = []    # {descripcion, ts}
        self._cargar()

    # ---- persistencia ----
    def _cargar(self) -> None:
        if self.ruta.is_file():
            try:
                datos = json.loads(self.ruta.read_text(encoding="utf-8"))
                self.recuerdos = datos.get("recuerdos", [])
                self.errores = datos.get("errores", [])
                self.patrones = datos.get("patrones", [])
            except (OSError, json.JSONDecodeError):
                pass

    def _guardar(self) -> None:
        self.ruta.parent.mkdir(parents=True, exist_ok=True)
        self.ruta.write_text(
            json.dumps(
                {
                    "recuerdos": self.recuerdos,
                    "errores": self.errores,
                    "patrones": self.patrones,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    # ---- base vectorial ----
    def recordar(self, texto: str, etiqueta: str = "nota") -> str:
        """Almacena un hecho/aprendizaje para recuperarlo después por similitud."""
        self.recuerdos.append({"texto": texto, "etiqueta": etiqueta, "ts": time.time()})
        self._guardar()
        return f"Recordado ({etiqueta}): {texto[:80]}"

    def buscar(self, consulta: str, k: int = 3) -> list[tuple[float, dict]]:
        """Devuelve los `k` recuerdos más parecidos a la consulta."""
        qv = _vectorizar(consulta)
        puntuados = [(_coseno(qv, _vectorizar(r["texto"])), r) for r in self.recuerdos]
        puntuados.sort(key=lambda x: x[0], reverse=True)
        return [(s, r) for s, r in puntuados[:k] if s > 0.0]

    # ---- aprendizaje a partir de fallos/éxitos ----
    def registrar_error(self, objetivo: str, problema: str, correccion: str) -> None:
        self.errores.append(
            {"objetivo": objetivo, "problema": problema, "correccion": correccion, "ts": time.time()}
        )
        self.errores = self.errores[-200:]  # acota el crecimiento
        self._guardar()

    def registrar_patron(self, descripcion: str) -> None:
        self.patrones.append({"descripcion": descripcion, "ts": time.time()})
        self.patrones = self.patrones[-200:]
        self._guardar()

    # ---- contexto inyectable al inicio de una tarea ----
    def contexto_relevante(self, objetivo: str) -> str:
        """Texto con recuerdos semánticamente próximos y errores recientes.

        Se inyecta al comienzo de cada tarea para que el agente aproveche lo que
        aprendió antes y no repita errores conocidos.
        """
        partes: list[str] = []

        recuerdos = self.buscar(objetivo, k=3)
        if recuerdos:
            partes.append("Recuerdos relevantes:")
            for sim, r in recuerdos:
                partes.append(f"  - [{r['etiqueta']}] {r['texto']} (similitud {sim:.2f})")

        if self.errores:
            partes.append("Errores recientes a evitar:")
            for e in self.errores[-3:]:
                partes.append(f"  - {e['problema']} -> corrección: {e['correccion']}")

        return "\n".join(partes)
