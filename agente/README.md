# Sistema de Agentes IA

Implementación **lista para producción** de un agente *agéntico* siguiendo el
framework de `resumen-agentes-ia-2026`: un sistema que persigue **objetivos
complejos de forma autónoma**, no que se limita a responder.

Construido sobre **Claude** (`claude-opus-4-8` por defecto) con razonamiento
adaptativo, uso de herramientas y auto-verificación.

---

## Arquitectura — los cinco bloques esenciales

| Bloque | Qué hace | Módulo |
|---|---|---|
| **Cerebro** | Razonamiento con un LLM (Claude). Decide qué hacer y cuándo el objetivo está cumplido. | `cerebro.py` |
| **Manos** | Herramientas y acciones ejecutables (código, búsqueda web, ficheros, memoria…). | `manos.py` |
| **Memoria** | Corto plazo (sesión) + largo plazo (patrones, historial de errores, **base vectorial**). | `memoria.py` |
| **Loops** | Bucle **ReAct** con auto-corrección y reintentos. | `bucle.py` |
| **Verificación** | **Agente Crítico** que valida si la respuesta cumple el objetivo. | `verificacion.py` |

El bloque que los compone es `Agente` (`agente.py`); la coordinación de varios
agentes especializados está en `multiagente.py`.

```
Objetivo
   │
   ▼
┌──────────────────── BUCLE ReAct (while True) ─────────────────────┐
│  Pensar  → el Cerebro razona el siguiente paso (Claude)           │
│  Actuar  → ejecuta una herramienta (Manos)                        │
│  Observar→ incorpora el resultado al contexto (Memoria corto)     │
│     ▲                                              │              │
│     └──────────────── (repite con herramientas) ◄──┘              │
│  Reflexionar → el Agente Crítico evalúa (Verificación)            │
│  Reintentar  → si no aprueba, realimenta la crítica y ajusta      │
│                (y registra el error en Memoria largo)             │
└───────────────────────────────────────────────────────────────────┘
   │  (sale cuando el Crítico aprueba el objetivo)
   ▼
Resultado verificado
```

---

## Modelo operativo: el bucle ReAct

`bucle.py` implementa exactamente el ciclo del framework como un `while True`
con condiciones de salida explícitas:

`Objetivo → Pensar → Actuar → Observar → Reflexionar → Reintentar`

- **Nivel interior**: Pensar→Actuar→Observar con uso de herramientas hasta que el
  LLM produce una respuesta final candidata.
- **Nivel exterior**: la **Verificación**. Si el Crítico no aprueba, su crítica se
  realimenta al agente, que corrige y reintenta (auto-corrección). Cada fallo se
  guarda en la memoria de largo plazo para no repetirlo.

El bucle **sale** cuando el Agente Crítico aprueba el objetivo (o al alcanzar los
límites de iteraciones/reintentos).

---

## Herramientas incluidas (Manos)

Diversas y combinables, sin servicios externos más allá de Claude:

- `calculadora` — aritmética segura (sin `eval`).
- `ejecutar_python` — ejecución de código en un subproceso aislado (timeout).
- `buscar_web` — búsqueda web mediante la herramienta *server-side* de Claude.
- `escribir_archivo` / `leer_archivo` / `listar_archivos` — ficheros en un *workspace* sandboxeado.
- `buscar_memoria` / `recordar` — acceso a la **base de datos vectorial** (memoria larga).

Añadir una herramienta nueva es registrar un `Herramienta(nombre, descripción, esquema, función)`.

---

## Instalación

```bash
pip install -r agente/requirements.txt        # solo el SDK de Anthropic
export ANTHROPIC_API_KEY=sk-ant-...            # https://console.anthropic.com
```

> Si ya usas la app "Asistente Pro" de este repo, el agente reutiliza
> automáticamente la API key de `data/config.json` si no defines la variable.

---

## Uso

### Como librería

```python
from agente import Agente, Config

agente = Agente(Config())
resultado = agente.lograr(
    "Calcula la suma de los cuadrados de los primeros 15 números primos, "
    "guárdala en resultado.txt y verifica el archivo."
)

print(resultado.cumplido)            # True/False (lo decide el Agente Crítico)
print(resultado.veredicto.puntuacion)  # 0..10
print(resultado.respuesta)           # respuesta final verificada
```

### Demo ejecutable (imprime la traza ReAct en vivo)

```bash
python -m agente.demo                      # objetivo autónomo por defecto
python -m agente.demo "tu objetivo aquí"   # objetivo personalizado
python -m agente.demo multiagente          # flujo Investigador → Redactor → Editor
```

### Multi-agente

```python
from agente import Agente, Config
from agente.multiagente import Orquestador, AgenteEspecializado

base = Agente(Config())
orq = Orquestador()
etapas = [
    AgenteEspecializado("Investigador", "Reúne hechos verificables.", base),
    AgenteEspecializado("Redactor", "Redacta un resumen ejecutivo.", base),
    AgenteEspecializado("Editor", "Pule y corrige el resumen.", base),
]
resultados = orq.secuencial(etapas, "Agentes de IA en 2026")
print(resultados[-1].respuesta)
# orq.paralelo(agentes, entrada)  # también disponible (fan-out concurrente)
```

---

## Pruebas

Los bloques deterministas (Manos y Memoria) se prueban **sin API ni red**:

```bash
python -m agente.pruebas_offline
```

---

## Calidad y seguridad

- **Modular**: cada bloque es un módulo independiente y sustituible.
- **Importes perezosos**: Manos y Memoria funcionan sin el SDK instalado.
- **Tolerante a fallos**: los errores de herramientas se devuelven al agente como
  observaciones (`is_error`) para que se auto-corrija, en vez de romper el bucle.
- **Sandbox de ficheros**: las rutas se restringen al *workspace*.
- ⚠️ `ejecutar_python` ejecuta código generado por el agente en un subproceso; está
  pensado para entornos de confianza, no es un sandbox de seguridad. Acótalo o
  retíralo si vas a procesar objetivos no confiables.
