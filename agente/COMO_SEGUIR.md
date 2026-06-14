# Cómo seguir trabajando 🚀

Guía corta para retomar el proyecto cuando no sepas por dónde continuar.

---

## 1. Lo que ya está hecho

Tienes un **sistema de agentes IA completo y funcional** en la carpeta `agente/`,
con los cinco bloques (Cerebro, Manos, Memoria, Loops, Verificación), bucle ReAct,
multi-agente, demo y pruebas. Está en la rama `claude/modest-franklin-nm66dd`.

Además, este repo ya instala las dependencias solo en cada sesión de Claude Code
on the web (hook en `.claude/hooks/session-start.sh`).

---

## 2. Probarlo ahora mismo (3 pasos)

```bash
# 1) Dependencias (en Claude Code web ya se instalan solas; en local:)
pip install -r agente/requirements.txt

# 2) Tu clave de Anthropic (https://console.anthropic.com)
export ANTHROPIC_API_KEY=sk-ant-...

# 3) Lánzalo
python -m agente.demo                 # objetivo autónomo (verás la traza ReAct)
python -m agente.demo multiagente     # flujo Investigador → Redactor → Editor
python -m agente.demo "tu objetivo"   # tu propio objetivo
```

¿Sin clave todavía? Comprueba que los bloques internos funcionan sin red ni API:

```bash
python -m agente.pruebas_offline
```

---

## 3. Qué puedes construir a continuación (ideas)

Elige una y pídemela; cada una es un paso pequeño y autocontenido:

- **Nuevas herramientas (Manos):** conectar una API real (clima, finanzas,
  correo de la app "Asistente Pro"), una base de datos, o lectura de PDFs.
  → Se añade registrando un `Herramienta(...)` en `agente/manos.py`.
- **Interfaz:** una pequeña UI web (FastAPI + página) o una pestaña nueva en la
  app de escritorio existente para lanzar objetivos al agente.
- **Memoria mejorada:** sustituir la base vectorial casera por embeddings reales
  o una BD vectorial (Chroma/SQLite) manteniendo la misma interfaz de `memoria.py`.
- **Más agentes especializados:** ampliar `multiagente.py` (p. ej. un agente
  "Planificador" que reparte subtareas y otro "Ejecutor").
- **Persistencia de sesiones:** guardar cada `Resultado` y su traza para auditoría.
- **Tests:** ampliar `pruebas_offline.py` o añadir `pytest`.

---

## 4. Cómo añadir una herramienta (ejemplo)

En `agente/manos.py`, dentro de `_registrar_basicas` (o desde fuera con
`manos.registrar(...)`):

```python
self.registrar(Herramienta(
    "hora_actual",
    "Devuelve la fecha y hora actuales.",
    {"type": "object", "properties": {}},   # sin parámetros
    lambda: __import__("datetime").datetime.now().isoformat(),
))
```

El agente la descubrirá y la usará sola cuando haga falta.

---

## 5. ¿Prefieres un repositorio nuevo y separado?

Todo vive dentro de este repo a propósito (comparte la integración con Claude de
la app "Asistente Pro"). Si quieres un repo independiente solo para el agente,
dímelo y lo extraigo a uno nuevo con su propio historial. Mi recomendación es
seguir aquí para no fragmentar el proyecto.

---

## 6. Trabajar conmigo

Solo dime en lenguaje natural qué quieres lograr, por ejemplo:
- *"Añade una herramienta para leer mis correos y que el agente resuma la bandeja."*
- *"Crea una API web para lanzar objetivos al agente."*
- *"Mejora la memoria con embeddings reales."*

Yo me encargo del código, las pruebas y el commit.
