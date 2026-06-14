"""Multi-agente: coordinación de varios agentes especializados.

Permite escenarios donde varios agentes con roles distintos colaboran, en
secuencia o en paralelo. Cada `AgenteEspecializado` envuelve el mismo bucle
agéntico (con su propia verificación) pero con un rol/persona enfocado, y el
`Orquestador` encadena o paraleliza sus ejecuciones.

Ejemplo (secuencial): Investigador → Redactor → Crítico-Editor.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from typing import Callable

from .agente import Agente, Resultado


class AgenteEspecializado:
    """Un agente con un rol concreto dentro de un flujo multi-agente."""

    def __init__(self, nombre: str, rol: str, agente: Agente) -> None:
        self.nombre = nombre
        self.rol = rol          # descripción del cometido del agente
        self.agente = agente

    def ejecutar(self, entrada: str, contexto: str | None = None) -> Resultado:
        objetivo = (
            f"Actúas como '{self.nombre}'. Tu cometido: {self.rol}\n\n"
            f"Tarea/entrada a procesar:\n{entrada}"
        )
        return self.agente.lograr(objetivo, contexto)


class Orquestador:
    """Coordina varios agentes especializados."""

    def __init__(self, on_evento: Callable[[str, str], None] | None = None) -> None:
        self.on_evento = on_evento

    def _evento(self, fase: str, detalle: str = "") -> None:
        if self.on_evento:
            self.on_evento(fase, detalle)

    def secuencial(self, etapas: list[AgenteEspecializado], entrada_inicial: str) -> list[Resultado]:
        """Ejecuta los agentes en cadena: la salida de uno alimenta al siguiente."""
        resultados: list[Resultado] = []
        entrada = entrada_inicial
        for etapa in etapas:
            self._evento("ETAPA", f"→ {etapa.nombre}")
            resultado = etapa.ejecutar(entrada)
            resultados.append(resultado)
            entrada = resultado.respuesta  # encadenado
        return resultados

    def paralelo(self, agentes: list[AgenteEspecializado], entrada: str) -> list[Resultado]:
        """Ejecuta varios agentes sobre la misma entrada de forma concurrente."""
        self._evento("PARALELO", f"{len(agentes)} agentes")
        with ThreadPoolExecutor(max_workers=min(4, len(agentes) or 1)) as pool:
            futuros = [pool.submit(a.ejecutar, entrada) for a in agentes]
            return [f.result() for f in futuros]


__all__ = ["AgenteEspecializado", "Orquestador"]
