"""Sistema de Agentes IA (framework `resumen-agentes-ia-2026`).

Un agente *agéntico*: persigue objetivos complejos de forma autónoma en lugar
de limitarse a responder. Está estructurado en los **cinco bloques esenciales**:

    Cerebro      -> razonamiento con un LLM (Claude)            cerebro.py
    Manos        -> herramientas y acciones ejecutables          manos.py
    Memoria      -> corto plazo (sesión) + largo plazo (patrones, errores, vector)
                                                                 memoria.py
    Loops        -> bucle ReAct con auto-corrección              bucle.py
    Verificación -> Agente Crítico que valida los resultados     verificacion.py

El bloque que orquesta los cinco es `Agente` (agente.py), y la coordinación de
varios agentes especializados está en `multiagente.py`.

Importes ligeros: este `__init__` no carga el SDK de Anthropic hasta que se
pide explícitamente `Agente`/`Config`/`Orquestador`, de modo que los bloques sin
LLM (Manos, Memoria) puedan usarse y probarse sin la dependencia instalada.
"""
from __future__ import annotations

__all__ = ["Agente", "Config", "Orquestador", "AgenteEspecializado"]
__version__ = "1.0.0"


def __getattr__(nombre: str):  # importación perezosa (PEP 562)
    if nombre in ("Agente", "Resultado"):
        from .agente import Agente, Resultado

        return {"Agente": Agente, "Resultado": Resultado}[nombre]
    if nombre == "Config":
        from .config import Config

        return Config
    if nombre in ("Orquestador", "AgenteEspecializado"):
        from .multiagente import Orquestador, AgenteEspecializado

        return {"Orquestador": Orquestador, "AgenteEspecializado": AgenteEspecializado}[nombre]
    raise AttributeError(f"module 'agente' has no attribute {nombre!r}")
