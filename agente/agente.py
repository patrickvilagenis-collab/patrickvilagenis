"""Agente: el orquestador que compone los cinco bloques.

`Agente` ensambla Cerebro + Manos + Memoria + Verificación y ejecuta el bucle
(Loops). Su método principal, `lograr(objetivo)`, lanza al agente a perseguir un
objetivo de forma autónoma y devuelve un `Resultado` verificado.
"""
from __future__ import annotations

from typing import Callable

from .bucle import BucleReAct, Resultado
from .cerebro import Cerebro
from .config import Config
from .manos import Manos
from .memoria import MemoriaCortoPlazo, MemoriaLargoPlazo
from .verificacion import Verificador


class Agente:
    def __init__(self, config: Config | None = None, on_evento: Callable[[str, str], None] | None = None) -> None:
        self.config = (config or Config()).validar()
        self.on_evento = on_evento

        # --- los cinco bloques ---
        self.cerebro = Cerebro(self.config.api_key, self.config.modelo)        # Cerebro
        self.memoria_largo = MemoriaLargoPlazo(self.config.workspace / "memoria_largo.json")  # Memoria
        self.manos = Manos(self.config.workspace, cerebro=self.cerebro, memoria=self.memoria_largo)  # Manos
        self.verificador = Verificador(self.cerebro)                           # Verificación

    def lograr(self, objetivo: str, contexto: str | None = None) -> Resultado:
        """Persigue un objetivo de forma autónoma y devuelve un resultado verificado."""
        memoria_corto = MemoriaCortoPlazo()  # nueva sesión de contexto por objetivo
        bucle = BucleReAct(                   # Loops
            cerebro=self.cerebro,
            manos=self.manos,
            memoria_largo=self.memoria_largo,
            verificador=self.verificador,
            max_iteraciones=self.config.max_iteraciones,
            max_reintentos=self.config.max_reintentos,
            on_evento=self.on_evento,
        )
        return bucle.ejecutar(objetivo, memoria_corto, contexto)


__all__ = ["Agente", "Resultado"]
