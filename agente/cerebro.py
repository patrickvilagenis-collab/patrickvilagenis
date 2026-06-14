"""Cerebro: el componente de razonamiento (LLM) del agente.

Es el único bloque que "piensa": decide qué hacer, qué herramienta invocar y
cuándo el objetivo está cumplido. Envuelve la API de Claude (Anthropic) y usa
**razonamiento adaptativo** (`thinking: adaptive`), de modo que Claude decide por
sí mismo cuánto deliberar en cada paso antes de actuar.

Este es el único módulo del paquete que importa el SDK de Anthropic.
"""
from __future__ import annotations

import json
from typing import Any

import anthropic


class Cerebro:
    def __init__(self, api_key: str, modelo: str = "claude-opus-4-8") -> None:
        self.client = anthropic.Anthropic(api_key=api_key)
        self.modelo = modelo

    # ---- Un turno de razonamiento con herramientas -------------------
    def turno(
        self,
        sistema: str,
        mensajes: list[dict],
        herramientas: list[dict] | None = None,
        max_tokens: int = 8000,
    ):
        """Ejecuta un turno del bucle agéntico y devuelve el `Message` crudo.

        Devolvemos el mensaje completo (no solo el texto) porque el bucle ReAct
        necesita inspeccionar `stop_reason` y los bloques `tool_use`, y debe
        reenviar el contenido íntegro —incluidos los bloques de *thinking*— en el
        siguiente turno cuando hay uso de herramientas.
        """
        kwargs: dict[str, Any] = {
            "model": self.modelo,
            "max_tokens": max_tokens,
            "thinking": {"type": "adaptive"},
            "system": sistema,
            "messages": mensajes,
        }
        if herramientas:
            kwargs["tools"] = herramientas
        return self.client.messages.create(**kwargs)

    # ---- Respuesta estructurada (JSON) -------------------------------
    def completar_json(
        self, sistema: str, usuario: str, esquema: dict, max_tokens: int = 2000
    ) -> dict:
        """Pide una respuesta que cumpla un JSON Schema (structured outputs).

        Lo usa el Agente Crítico para emitir veredictos en un formato fiable.
        """
        resp = self.client.messages.create(
            model=self.modelo,
            max_tokens=max_tokens,
            system=sistema,
            messages=[{"role": "user", "content": usuario}],
            output_config={"format": {"type": "json_schema", "schema": esquema}},
        )
        texto = next((b.text for b in resp.content if b.type == "text"), "{}")
        return json.loads(texto)

    # ---- Texto plano (resúmenes, redacción) --------------------------
    def completar(self, sistema: str, usuario: str, max_tokens: int = 4000) -> str:
        resp = self.client.messages.create(
            model=self.modelo,
            max_tokens=max_tokens,
            thinking={"type": "adaptive"},
            system=sistema,
            messages=[{"role": "user", "content": usuario}],
        )
        return self.texto_de(resp)

    @staticmethod
    def texto_de(respuesta) -> str:
        """Concatena los bloques de texto de una respuesta de Claude."""
        return "".join(b.text for b in respuesta.content if b.type == "text").strip()
