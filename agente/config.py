"""Configuración del sistema de agentes.

Resuelve las credenciales y parámetros desde (en orden de prioridad):
  1. Argumentos explícitos del constructor.
  2. Variables de entorno (`ANTHROPIC_API_KEY`, `AGENTE_MODELO`, `AGENTE_WORKSPACE`).
  3. El `data/config.json` de la app "Asistente Pro" si existe (clave `anthropic_api_key`).
"""
from __future__ import annotations

import json
import os
from pathlib import Path

# Por defecto usamos el modelo más capaz; configurable con AGENTE_MODELO.
MODELO_POR_DEFECTO = "claude-opus-4-8"


def _leer_api_key_app() -> str | None:
    """Intenta reutilizar la API key guardada por la app de escritorio."""
    candidatos = [
        Path(__file__).resolve().parent.parent / "data" / "config.json",
        Path.cwd() / "data" / "config.json",
        Path.cwd() / "config.json",
    ]
    for ruta in candidatos:
        try:
            if ruta.is_file():
                datos = json.loads(ruta.read_text(encoding="utf-8"))
                clave = datos.get("anthropic_api_key", "").strip()
                if clave and not clave.startswith("sk-ant-..."):  # ignora el placeholder
                    return clave
        except (OSError, json.JSONDecodeError):
            continue
    return None


class Config:
    """Parámetros de ejecución del agente."""

    def __init__(
        self,
        api_key: str | None = None,
        modelo: str | None = None,
        workspace: str | os.PathLike | None = None,
        idioma: str = "español",
        max_iteraciones: int = 14,
        max_reintentos: int = 3,
    ) -> None:
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY") or _leer_api_key_app()
        self.modelo = modelo or os.environ.get("AGENTE_MODELO", MODELO_POR_DEFECTO)
        self.workspace = Path(
            workspace or os.environ.get("AGENTE_WORKSPACE", "agente_workspace")
        ).resolve()
        self.idioma = idioma
        self.max_iteraciones = max_iteraciones
        self.max_reintentos = max_reintentos
        self.workspace.mkdir(parents=True, exist_ok=True)

    def validar(self) -> "Config":
        """Lanza un error claro si falta la credencial obligatoria."""
        if not self.api_key:
            raise RuntimeError(
                "Falta la API key de Anthropic. Define la variable de entorno "
                "ANTHROPIC_API_KEY (consíguela en https://console.anthropic.com) "
                "o pásala como Config(api_key=...)."
            )
        return self

    def __repr__(self) -> str:  # útil para depurar sin filtrar la clave
        tiene = "sí" if self.api_key else "no"
        return (
            f"Config(modelo={self.modelo!r}, workspace={str(self.workspace)!r}, "
            f"api_key={tiene}, max_iteraciones={self.max_iteraciones}, "
            f"max_reintentos={self.max_reintentos})"
        )
