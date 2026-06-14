"""Verificación: el Agente Crítico que valida los resultados.

La auto-verificación es lo que separa a un agente de un simple chatbot: antes de
dar por cumplido un objetivo, un **segundo agente** (el Crítico) evalúa la
propuesta contra el objetivo y la traza de acciones, y decide si se aprueba o si
debe reintentarse con ajustes.

El veredicto es JSON estructurado para que el bucle pueda actuar sobre él de
forma fiable.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# JSON Schema del veredicto (structured outputs).
ESQUEMA_VEREDICTO = {
    "type": "object",
    "properties": {
        "aprobado": {"type": "boolean"},
        "puntuacion": {"type": "integer"},  # 0..10
        "justificacion": {"type": "string"},
        "problemas": {"type": "array", "items": {"type": "string"}},
        "sugerencias": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["aprobado", "puntuacion", "justificacion", "problemas", "sugerencias"],
    "additionalProperties": False,
}


@dataclass
class Veredicto:
    aprobado: bool
    puntuacion: int
    justificacion: str = ""
    problemas: list[str] = field(default_factory=list)
    sugerencias: list[str] = field(default_factory=list)


class Verificador:
    """Agente Crítico: evalúa si la propuesta cumple el objetivo."""

    def __init__(self, cerebro, umbral: int = 7) -> None:
        self.cerebro = cerebro
        self.umbral = umbral  # puntuación mínima para aprobar aunque 'aprobado' venga dudoso

    def evaluar(self, objetivo: str, propuesta: str, traza: str) -> Veredicto:
        sistema = (
            "Eres un Agente Crítico riguroso e independiente. Tu trabajo es decidir "
            "si una propuesta cumple REALMENTE el objetivo, no si suena bien. Sé "
            "exigente: verifica que las afirmaciones estén respaldadas por la traza "
            "de acciones (herramientas ejecutadas y sus resultados), detecta errores "
            "factuales, pasos omitidos o requisitos del objetivo no satisfechos. "
            "Aprueba solo si el objetivo está cumplido de forma comprobable."
        )
        usuario = (
            f"OBJETIVO:\n{objetivo}\n\n"
            f"PROPUESTA DEL AGENTE (respuesta final candidata):\n{propuesta}\n\n"
            f"TRAZA DE ACCIONES (herramientas y observaciones):\n{traza or '(sin acciones)'}\n\n"
            "Evalúa y responde con el veredicto: aprobado (bool), puntuacion (0-10), "
            "justificacion, problemas concretos y sugerencias accionables para corregir."
        )
        try:
            datos = self.cerebro.completar_json(sistema, usuario, ESQUEMA_VEREDICTO)
        except Exception as exc:  # noqa: BLE001 — fallo del verificador ≠ aprobación
            return Veredicto(
                aprobado=False,
                puntuacion=0,
                justificacion=f"El verificador no pudo emitir veredicto: {exc}",
                problemas=["No se pudo verificar automáticamente."],
                sugerencias=["Reintentar la verificación o revisar manualmente."],
            )

        aprobado = bool(datos.get("aprobado")) and int(datos.get("puntuacion", 0)) >= self.umbral
        return Veredicto(
            aprobado=aprobado,
            puntuacion=int(datos.get("puntuacion", 0)),
            justificacion=str(datos.get("justificacion", "")),
            problemas=list(datos.get("problemas", [])),
            sugerencias=list(datos.get("sugerencias", [])),
        )
