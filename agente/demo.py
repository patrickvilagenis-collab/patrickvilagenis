"""Demostración ejecutable del sistema de agentes.

Ejecuta:
    export ANTHROPIC_API_KEY=sk-ant-...
    python -m agente.demo                 # objetivo autónomo (un solo agente)
    python -m agente.demo multiagente     # flujo multi-agente (Investigador→Redactor→Editor)
    python -m agente.demo "tu objetivo"   # objetivo personalizado

Imprime la traza ReAct en tiempo real (Pensar/Actuar/Observar/Reflexionar/…)
para que se vea al agente trabajando hacia el objetivo, no solo respondiendo.
"""
from __future__ import annotations

import sys

from .agente import Agente
from .config import Config
from .multiagente import AgenteEspecializado, Orquestador

# Colores ANSI por fase (degradación elegante si la terminal no los soporta).
_COLOR = {
    "OBJETIVO": "\033[1;36m",
    "PENSAR": "\033[0;90m",
    "ACTUAR": "\033[1;33m",
    "OBSERVAR": "\033[0;32m",
    "REFLEXIONAR": "\033[1;35m",
    "REINTENTAR": "\033[1;31m",
    "OBJETIVO_CUMPLIDO": "\033[1;32m",
    "ETAPA": "\033[1;36m",
    "PARALELO": "\033[1;36m",
    "LIMITE": "\033[1;31m",
    "RECHAZO": "\033[1;31m",
    "ERROR": "\033[1;31m",
}
_RESET = "\033[0m"


def imprimir_evento(fase: str, detalle: str) -> None:
    color = _COLOR.get(fase, "")
    print(f"  {color}{fase:<18}{_RESET} {detalle}")


def _separador(titulo: str) -> None:
    print("\n" + "=" * 70)
    print(titulo)
    print("=" * 70)


def demo_un_agente(objetivo: str) -> None:
    _separador("AGENTE AUTÓNOMO — un objetivo, los cinco bloques")
    agente = Agente(Config(), on_evento=imprimir_evento)
    print(f"Modelo: {agente.config.modelo} · Workspace: {agente.config.workspace}\n")

    resultado = agente.lograr(objetivo)

    _separador("RESULTADO")
    print(f"Cumplido: {'SÍ ✅' if resultado.cumplido else 'NO ❌'}")
    if resultado.veredicto:
        print(f"Veredicto del Crítico: {resultado.veredicto.puntuacion}/10 — "
              f"{resultado.veredicto.justificacion}")
    print(f"Iteraciones: {resultado.iteraciones} · Reintentos: {resultado.reintentos}")
    print("\nRespuesta final:\n")
    print(resultado.respuesta)


def demo_multiagente(tema: str) -> None:
    _separador("MULTI-AGENTE — Investigador → Redactor → Editor-Crítico")
    agente = Agente(Config(), on_evento=imprimir_evento)
    orquestador = Orquestador(on_evento=imprimir_evento)

    etapas = [
        AgenteEspecializado(
            "Investigador",
            "Reúne 3-5 hechos clave y verificables sobre el tema y devuélvelos como "
            "lista breve con su relevancia.",
            agente,
        ),
        AgenteEspecializado(
            "Redactor",
            "A partir de los hechos recibidos, redacta un resumen ejecutivo claro de "
            "un párrafo, fiel a los datos.",
            agente,
        ),
        AgenteEspecializado(
            "Editor-Crítico",
            "Revisa el resumen recibido: corrige imprecisiones y estilo, y entrega la "
            "versión final pulida.",
            agente,
        ),
    ]

    resultados = orquestador.secuencial(etapas, tema)

    _separador("RESULTADO FINAL DEL FLUJO")
    print(resultados[-1].respuesta)


def main() -> None:
    args = sys.argv[1:]
    try:
        if args and args[0] == "multiagente":
            tema = " ".join(args[1:]) or "El impacto de los agentes de IA en el trabajo del conocimiento en 2026"
            demo_multiagente(tema)
        elif args:
            demo_un_agente(" ".join(args))
        else:
            # Objetivo por defecto: multi-paso, autónomo y verificable.
            demo_un_agente(
                "Calcula la suma de los cuadrados de los primeros 15 números primos. "
                "Guarda el número resultante en el archivo 'resultado.txt' y luego "
                "vuelve a leer el archivo para confirmar que se guardó correctamente. "
                "Informa del valor final."
            )
    except RuntimeError as exc:  # típicamente falta la API key
        print(f"\n⚠️  {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
