# 🗞️ Resumen Semanal de IA — 26 junio a 3 julio 2026

> Ventana cubierta: **2026-06-26 a 2026-07-03**. Solo se incluyen novedades con fecha de publicación confirmada dentro de este rango (se indica explícitamente cuando la fecha exacta no pudo confirmarse).

## Resumen ejecutivo

Semana cargada en el frente de **modelos de código**: Anthropic lanzó **Claude Sonnet 5** (contexto nativo de 1M tokens) y GitHub Copilot sumó cinco laboratorios distintos a su selector de modelos, incluido el primer modelo de pesos abiertos (**Kimi K2.7 Code**). La **geopolítica marcó la disponibilidad**: EE.UU. levantó los controles de exportación que habían bloqueado **Claude Fable 5/Mythos 5**, mientras que los nuevos **GPT-5.6 Sol/Terra/Luna** de OpenAI siguen limitados a ~20 socios aprobados por el gobierno estadounidense por el mismo motivo. Google avanzó en **multimodalidad** con Nano Banana 2 Lite y Gemini Omni Flash (vídeo), y **Cursor lanzó app móvil** para pilotar agentes de código de forma remota. En el plano corporativo, Zuckerberg admitió públicamente que el progreso de los **agentes de IA en Meta va más lento de lo esperado**, pese a la fuerte inversión.

---

## ChatGPT / OpenAI

**1. Nuevo modelo de dictado (speech-to-text)**
- 📅 26 junio 2026
- 📌 Nuevo modelo de voz-a-texto para la función de dictado de ChatGPT. **Mejora la precisión de transcripción** especialmente en japonés, coreano, chino, urdu, vietnamita, inglés con acento, y formas largas en español/francés/italiano/portugués; más robusto en entornos ruidosos y con mezcla de idiomas. Cambio de backend, sin cambios visibles en la interfaz.
- 🌍 Global
- 💳 Todos los planes (Free a Enterprise)
- 💡 Un usuario bilingüe que dicta un mensaje alternando español e inglés obtiene ahora una transcripción más fiel que antes.
- Fuente: [ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

**2. Retiro de GPT-4.5**
- 📅 26 junio 2026
- 📌 GPT-4.5 **deja de estar disponible** como modelo seleccionable en ChatGPT, incluso en GPTs personalizados; las conversaciones existentes migran automáticamente a GPT-5.5.
- 🌍 Global
- 💳 Afecta a todos los planes que tenían acceso a GPT-4.5
- 💡 Un usuario con un GPT personalizado construido sobre GPT-4.5 lo verá funcionar automáticamente sobre GPT-5.5 sin ninguna acción de su parte.
- Fuente: [ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

**3. Finanzas personales expandidas a plan Plus (EE.UU.)**
- 📅 26–30 junio 2026 (rollout progresivo, confirmado por prensa el 30 jun–1 jul)
- 📌 Los suscriptores **Plus** (antes solo Pro) pueden **conectar sus cuentas bancarias vía Plaid** (+12.000 instituciones: Chase, Fidelity, Schwab, Amex, Robinhood, Capital One) y obtener un panel financiero con respuestas de ChatGPT basadas en sus datos personales.
- 🌍 Solo Estados Unidos
- 💳 Plus y Pro (web, iOS; Android limitado a Plus/Pro)
- 💡 Un usuario Plus conecta sus cuentas de Chase y Fidelity y pregunta: "¿Cuánto gasté en restaurantes el mes pasado comparado con mi presupuesto?"
- Fuente: [OpenAI — Personal finance in ChatGPT](https://openai.com/index/personal-finance-chatgpt/)

**4. Mejoras en descubrimiento de compras** *(fecha exacta no confirmada, dentro de la ventana según fuentes)*
- 📌 Resultados de producto más visuales, exploración conversacional y tablas comparativas (precio, reseñas, características).
- 🌍 No especificado
- 💳 Todos los usuarios de ChatGPT
- 💡 Un usuario pide un robot aspirador por menos de 400 USD y recibe una tabla comparativa de tres opciones, luego refina pidiendo "la opción más silenciosa".

**5. Más imágenes web integradas para usuarios Free** *(fecha exacta no confirmada)*
- 📌 GPT-5.5-Instant (nivel Free) muestra más imágenes en línea extraídas de la web dentro de las respuestas, con atribución de fuente.
- 🌍 Global (web e iOS)
- 💳 Solo nivel Free
- 💡 Un usuario Free pregunta "¿cómo se ve la Torre Eiffel de noche?" y ahora recibe una foto en línea con enlace a la fuente.

## OpenAI Codex

**1–2. Codex CLI 0.142.4 y 0.142.5**
- 📅 29 junio y 1 julio 2026
- 📌 0.142.4: parche de mantenimiento sin cambios visibles. 0.142.5: **corrección de seguridad** que evita que los payloads completos de las peticiones WebSocket queden grabados en los logs de traza.
- 🌍 Global
- 💳 Todos los usuarios de Codex CLI
- 💡 Un desarrollador que depura con trazas activadas ya no encontrará payloads completos (potencialmente con código propietario o secretos) guardados en los logs.
- Fuente: [Codex Changelog](https://developers.openai.com/codex/changelog)

**3. Codex Micro (adelanto de hardware)**
- 📅 29 junio 2026 (presentado en AI Engineer World's Fair; lanzamiento completo previsto 15 julio, fuera de ventana)
- 📌 Primer producto de hardware de la marca Codex: un **teclado macro programable** (13 teclas mecánicas, joystick, dial) construido con Work Louder, para atajos táctiles de acciones frecuentes del agente Codex.
- 🌍 No especificado
- 💳 Compra de hardware, precio aún no anunciado
- 💡 Un desarrollador asigna una tecla física para "aprobar acción pendiente de Codex" en vez de usar combinaciones de teclado.

**4. GPT-5.6 Sol/Terra en Codex (acceso limitado)**
- 📅 26 junio 2026
- 📌 Los nuevos modelos Sol y Terra de GPT-5.6 llegan a Codex, pero **solo para ~20 organizaciones aprobadas por el gobierno de EE.UU.**, no para usuarios generales de Codex.
- 🌍 Restringido — lista de socios aprobados por EE.UU.
- 💳 No disponible aún para Plus/Pro/Team/Enterprise generales
- 💡 Una organización asociada puede ejecutar una tarea de Codex sobre GPT-5.6 Sol para evaluar rendimiento de codificación antes del lanzamiento público.

## Otros modelos GPT (OpenAI)

**1. GPT-5.6 Sol, Terra y Luna — preview limitado**
- 📅 26 junio 2026
- 📌 Tres modelos nuevos: **Sol** (buque insignia, estado del arte en Terminal-Bench 2.1), **Terra** (rinde como GPT-5.5 a mitad de costo) y **Luna** (más rápido/económico). Mejoras en programación, biología y ciberseguridad; stack de seguridad reforzado.
- 🌍 Restringido — solo ~20 organizaciones aprobadas por el gobierno de EE.UU. por motivos de seguridad nacional; disponibilidad general "en las próximas semanas"
- 💳 No disponible en ChatGPT para consumidores; acceso vía API/Codex solo a socios nombrados. Precios previstos: Sol 5/30 USD por 1M tokens (entrada/salida), Terra 2,50/15 USD, Luna 1/6 USD
- 💡 No aplicable para usuarios generales todavía.
- Fuente: [OpenAI — Previewing GPT-5.6 Sol](https://openai.com/index/previewing-gpt-5-6-sol/)

**2. GPT-5.6 Sol sobre hardware Cerebras**
- 📅 ~26–28 junio 2026 (anuncio; despliegue efectivo previsto para julio)
- 📌 Sol funcionará en hardware de inferencia Cerebras a **hasta 750 tokens/segundo**, 5–15x más rápido que la inferencia típica en GPU.
- 🌍 Acceso inicial limitado a clientes seleccionados
- 💳 Oferta API/empresarial, no de consumo
- 💡 Un asistente de codificación en tiempo real construido sobre Sol-Cerebras podría devolver completados de código largos en fracciones de segundo.

---

## Gemini / Google AI

**1. Nano Banana 2 Lite (Gemini 3.1 Flash-Lite Image) — Disponibilidad general**
- 📅 30 junio 2026
- 📌 `gemini-3.1-flash-lite-image` alcanza GA: modelo de **generación y edición de imágenes más rápido y económico** de Google (~4 segundos de latencia), con mejor consistencia de personajes y renderizado de texto/localización.
- 🌍 Global — Gemini API, Google AI Studio, Gemini Enterprise; despliegue progresivo a Gemini app, NotebookLM, Google Photos, Stitch, Flow, Google Ads
- 💳 API de pago por uso (~0,034 USD por imagen de 1K de resolución)
- 💡 Un desarrollador genera imágenes de producto localizadas para un catálogo de e-commerce en ~4 segundos cada una y a bajo costo.
- Fuente: [Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/)

**2. Gemini Omni Flash — Preview público (generación de vídeo)**
- 📅 30 junio 2026
- 📌 `gemini-omni-flash-preview`, modelo multimodal que **genera y edita vídeo de forma conversacional**: entrada texto/imagen/vídeo, salida de vídeo 720p hasta 10s con audio sincronizado; permite ediciones como cambio de personaje o de iluminación conservando audio/vídeo original.
- 🌍 Global — Google AI Studio y Gemini API (Interactions API)
- 💳 Preview para desarrolladores; 0,10 USD por segundo de vídeo generado
- 💡 Un desarrollador envía una foto de producto y el prompt "ilumina la escena al atardecer y haz que el personaje salude" y obtiene un clip de 6 segundos con audio sincronizado.
- Fuente: [Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/)

**3. Google AI Studio — "Design Variations"** *(fecha aproximada, solo confirmada por prensa, no por blog oficial)*
- 📅 26–27 junio 2026 (no confirmado oficialmente)
- 📌 Genera con un clic **variantes de diseño alternativas** (espaciado, colores, tipografía) para apps creadas en el modo "Build" de AI Studio, preservando la lógica subyacente.
- 🌍 Global, incluido EE.UU. y Reino Unido
- 💳 Gratis con cuenta de Google (nivel gratuito de AI Studio)
- 💡 Un usuario crea una app de lista de tareas por prompt, no le gusta el diseño y con un clic en "Design Variations" elige entre cuatro layouts alternativos generados automáticamente.

**4. Gemini 3.5 Pro retrasado a julio** *(noticia de estado, no lanzamiento)*
- 📅 Reportado el 27 junio 2026
- 📌 El lanzamiento público de Gemini 3.5 Pro, previsto para junio, **se pospone a julio**; sigue en preview empresarial limitado en Vertex AI. Coincide con la salida de varios investigadores senior de Gemini/DeepMind hacia Anthropic.
- 🌍 N/A — aún no lanzado públicamente
- 💳 N/A
- 💡 Los desarrolladores que esperaban la ventana de contexto de 2M tokens de Gemini 3.5 Pro deben esperar a julio para acceso público vía API.

---

## Claude / Anthropic

**1. Límites de la API elevados en todos los niveles**
- 📅 26 junio 2026
- 📌 Los límites de velocidad de **Claude Sonnet y Haiku ahora igualan a Opus** en cada nivel de uso; los niveles se consolidan en tres: Start, Build, Scale. Ningún cliente pierde capacidad.
- 🌍 Global
- 💳 Solo API, todos los niveles de uso
- 💡 Una startup en el nivel "Build" que antes topaba con Haiku en su bot de soporte ahora puede enviar muchas más solicitudes por minuto sin recibir errores 429.
- Fuente: [Claude API Release Notes](https://platform.claude.com/docs/en/release-notes/api)

**2. Claude Mythos 5 aprobado para ~100 organizaciones de confianza**
- 📅 26 junio 2026
- 📌 El Departamento de Comercio de EE.UU. autorizó la liberación de **Mythos 5** (menos barreras de seguridad, enfocado en ciberdefensa) a ~100 empresas y agencias gubernamentales vetadas, como parte del "Project Glasswing".
- 🌍 Solo organizaciones de EE.UU. vetadas
- 💳 Acceso solo por invitación
- 💡 Un contratista de defensa preaprobado podría usar Mythos 5 para pruebas de penetración que el clasificador más estricto de Fable 5 bloquearía.
- Fuente: [CNBC](https://www.cnbc.com/2026/06/26/us-government-anthropic-claude-mythos5-ai.html)

**3. Se elimina el "fast mode" de Claude Opus 4.6 (API)**
- 📅 29 junio 2026
- 📌 Las solicitudes con `speed: "fast"` a `claude-opus-4-6` **dejan de ejecutarse en modo rápido**; ahora corren a velocidad y precio estándar sin devolver error. Se recomienda migrar a Opus 4.8.
- 🌍 Global (API)
- 💳 Solo API
- 💡 Un desarrollador con `speed: "fast"` fijo en su código verá sus solicitudes degradarse silenciosamente a velocidad estándar; conviene revisar `usage.speed` en las respuestas.

**4. Lanzamiento de Claude Sonnet 5**
- 📅 30 junio 2026
- 📌 El **Sonnet más agéntico hasta la fecha**: grandes mejoras en razonamiento, uso de herramientas, codificación y finalización autónoma de tareas, acercándose a Opus 4.8 a menor costo. **Contexto nativo de 1M tokens**, salida máxima de 128K, "adaptive thinking" activado por defecto.
- 🌍 Global
- 💳 Modelo por defecto en Free y Pro; también en Max, Team, Enterprise, Claude Code y API (`claude-sonnet-5`). Precio introductorio 2/10 USD por MTok hasta el 31 agosto 2026 (luego 3/15 USD)
- 💡 Un desarrollador que llama a la API con `model: "claude-sonnet-5"` obtiene la ventana de 1M tokens de forma nativa sin cabecera beta.
- Fuente: [Anthropic — Claude Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)

**5. Lanzamiento de Claude Science**
- 📅 30 junio 2026 (anuncio), 1 julio 2026 (beta)
- 📌 Nueva app (no un modelo nuevo) que integra **60+ bases de datos y herramientas científicas** (genómica, proteómica, biología estructural, quiminformática), con un agente coordinador, subagentes especialistas y un agente revisor que verifica citas y cálculos.
- 🌍 No restringido regionalmente
- 💳 Beta, solo macOS y Linux, planes Pro, Max, Team y Enterprise
- 💡 Un investigador en biología instala Claude Science, dirige al agente coordinador hacia un dataset genómico y obtiene una figura lista para publicación con cada cálculo y cita trazable.
- Fuente: [Anthropic — Claude Science](https://www.anthropic.com/news/claude-science-ai-workbench)

**6. Se levantan los controles de exportación; Fable 5 y Mythos 5 vuelven globalmente**
- 📅 Anunciado 30 junio, efectivo 1 julio 2026
- 📌 Se levanta la directiva del 12 de junio que forzó la desactivación de Fable 5/Mythos 5. **Fable 5 vuelve a estar disponible globalmente** en Claude Platform, Claude.ai, Claude Code y Claude Cowork. Se propone además un marco de severidad de jailbreaks ("CJS") junto a Amazon, Microsoft y Google.
- 🌍 Fable 5: global. Mythos 5: restringido a organizaciones de EE.UU. aprobadas
- 💳 Hasta el 7 julio: incluido en Pro, Max y Team hasta el 50% del límite semanal; después, acceso vía créditos de uso en todos los planes de pago
- 💡 Un suscriptor Pro que perdió acceso a Fable 5 el 12 de junio puede volver a seleccionarlo desde el 1 de julio.
- Fuente: [Anthropic — Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5)

**7. Entitlements de modelo para planes Enterprise (beta)**
- 📅 1 julio 2026
- 📌 Los administradores Enterprise pueden **controlar qué modelos y niveles de esfuerzo** puede usar cada usuario.
- 🌍 No especificado
- 💳 Solo Enterprise, beta
- 💡 Un administrador restringe al equipo de finanzas a Sonnet 5 únicamente, mientras el equipo de I+D mantiene acceso completo.
- Fuente: [Claude Release Notes](https://support.claude.com/en/articles/12138966-release-notes)

**8. Analítica de administración y alertas de gasto para Claude Enterprise**
- 📅 2 julio 2026
- 📌 Nuevo panel de analítica por grupo/usuario (artefactos creados, archivos editados, skills/conectores usados junto al costo); **alertas de gasto** al 75%/90% del límite para admins y 75%/95% para usuarios finales.
- 🌍 No especificado
- 💳 Claude Enterprise
- 💡 Un administrador recibe una alerta automática al alcanzar el 75% del gasto mensual, con margen para ajustar el límite antes de bloquear a algún equipo.
- Fuente: [Claude Blog](https://claude.com/blog/giving-admins-more-visibility-and-control-over-claude-usage-and-spend)

**9. Detalles de salvaguardas de Fable 5 y marco de severidad de jailbreaks**
- 📅 2 julio 2026
- 📌 Anthropic publica el diseño de su clasificador de seguridad (4 niveles de riesgo) y un marco temprano ("CJS", severidad 1–10) desarrollado con Amazon, Microsoft y Google; lanza además un programa de recompensas por jailbreaks en HackerOne.
- 🌍 Publicación global
- 💳 N/A (informativo)
- 💡 Un investigador de seguridad que descubre un jailbreak de Fable 5 puede reportarlo vía HackerOne usando el marco CJS para describir su severidad.
- Fuente: [Anthropic — Fable Safeguards](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework)

---

## Kimi (Moonshot AI)

**1. Kimi K2.7 Code alcanza disponibilidad general — en GitHub Copilot**
- 📅 1 julio 2026
- 📌 El modelo de pesos abiertos de Moonshot AI (**1 billón de parámetros, 32B activos, MoE**) se convierte en el **primer modelo open-weight seleccionable en GitHub Copilot**, alojado por GitHub en Azure.
- 🌍 Sin restricción geográfica declarada; disponible en VS Code 1.127.0+, Visual Studio, JetBrains, Xcode, Eclipse, Copilot CLI y GitHub.com
- 💳 Planes de pago de Copilot: Pro, Pro+, Max (expansión a Business/Enterprise en curso)
- 💡 Un desarrollador cambia al modelo "Kimi K2.7 Code" en el selector de Copilot Chat para planificar y ejecutar un refactor multi-paso a menor costo por token.
- Fuente: [GitHub Changelog](https://github.blog/changelog/2026-07-01-kimi-k2-7-is-now-available-in-github-copilot/)

*No se encontraron novedades verificables en canales propios de Kimi/Moonshot (chatbot, app, precios) dentro de la ventana.*

---

## Mistral

**1. Leanstral 1.5 (modelo de demostración formal Lean 4)**
- 📅 30 junio 2026
- 📌 Versión actualizada del modelo de Mistral especializado en **demostración automática de teoremas y autoformalización** en Lean 4; arquitectura MoE de 119B parámetros totales (6.5B activos), contexto de 256K tokens.
- 🌍 Global (Mistral Studio/consola)
- 💳 Gratis, nivel "Labs" de la API (`labs-leanstral-1-5`)
- 💡 Un desarrollador que trabaja en Lean 4 le da un objetivo de prueba estancado y Leanstral 1.5 propone los pasos o tácticas faltantes, verificables mecánicamente.
- Fuente: [Mistral Docs](https://docs.mistral.ai/models/model-cards/leanstral-1-5)

*No se hallaron otras novedades de Le Chat / API Mistral con fecha confirmada dentro de la ventana.*

---

## Grok (xAI)

**1. Grok 4.5 entra en beta privada en SpaceX y Tesla**
- 📅 28 junio 2026
- 📌 Musk anunció que **Grok 4.5**, construido sobre el modelo base "V9" de 1,5 billones de parámetros con datos de entrenamiento adicionales de Cursor, entró en pruebas internas en SpaceX y Tesla. Musk afirmó que su rendimiento se acerca (o supera) a Claude Opus, **sin benchmark independiente publicado** — dato no verificado.
- 🌍 No público; solo interno en SpaceX y Tesla
- 💳 N/A — no disponible para SuperGrok, X Premium ni API
- 💡 N/A para el público general por el momento.
- Fuente: [Cybernews](https://cybernews.com/ai-news/musk-grok-4-5-private-beta-superior-claude-opus/)

**2. Actualizaciones del changelog de Grok Build (CLI de codificación agéntica)**
- 📅 26–28 junio 2026 (versiones 0.2.69 a 0.2.73)
- 📌 Nuevo comando `grok wrap`, atajo de cola de prompts, resúmenes de sesión más completos, flag `--json-schema`, corrección de cuelgues en Windows y mejoras de portapapeles.
- 🌍 Global (herramienta CLI)
- 💳 Requiere API key de pago de xAI (uso por consumo)
- 💡 Un desarrollador en VS Code sobre Windows ya no sufre cuelgues de sesión persistente y puede ejecutar `grok wrap npm test` para copiar la salida al portapapeles.
- Fuente: [Grok Build Changelog](https://releasebot.io/updates/xai/grok-build)

*No se encontró lanzamiento público de Grok 5 ni nuevas funciones de consumo (SuperGrok/X Premium) en esta ventana.*

---

## Meta AI

**1. "Spin View" y "Multi-Cam" de Instagram para gafas Meta**
- 📅 1 julio 2026
- 📌 Nuevos formatos de Stories para contenido capturado con **Ray-Ban Meta / Oakley Meta / Meta Glasses**: Spin View (panorámica interactiva) y Multi-Cam (sincroniza vídeo de teléfono y gafas). Se suma un "Creator Toolkit for AI Glasses".
- 🌍 No especificado — ligado a la posesión del hardware, no a región
- 💳 Gratis para propietarios de las gafas
- 💡 Un creador graba una demo de cocina con sus gafas mientras se filma con el móvil; Multi-Cam sincroniza ambas perspectivas automáticamente en una sola Story.
- Fuente: [SocialSamosa](https://www.socialsamosa.com/news-2/meta-instagram-stories-features-ray-ban-oakley-glasses-12122892)

**2. "Side Chat" de WhatsApp con Meta AI (prueba limitada)**
- 📅 27 junio 2026
- 📌 Función de privacidad que permite deslizar y preguntar a Meta AI sobre el contenido de un chat concreto **sin que el resto de participantes lo vea**, protegida por un entorno de ejecución confiable auditado externamente (NCC Group, Trail of Bits).
- 🌍 Global, pero desplegado solo a un número muy reducido de usuarios Android/iOS
- 💳 Gratis; no disponible en chats con mensajes temporales o privacidad avanzada activada
- 💡 En un chat grupal debatiendo restaurantes, un usuario desliza, toca "Preguntar en privado" y pide el rango de precios promedio sin que el resto del grupo lo vea.
- Fuente: [WABetaInfo](https://wabetainfo.com/whatsapp-is-testing-a-private-side-chat-feature-with-meta-ai/)

**3. Zuckerberg reconoce que el progreso de los agentes de IA va más lento de lo esperado**
- 📅 2 julio 2026
- 📌 En una reunión interna, Zuckerberg admitió que el desarrollo de **agentes de IA "no se ha acelerado como esperábamos"** en los últimos cuatro meses, pese a la reorganización de la compañía (miles de despidos y reasignaciones al área de IA).
- 🌍 N/A — comunicación interna
- 💳 N/A
- 💡 N/A — no es una función de producto.
- Fuente: [TechCrunch](https://techcrunch.com/2026/07/02/mark-zuckerberg-tells-staff-that-ai-agents-havent-progressed-as-quickly-as-hed-hoped/)

**4. Filtración sobre el modelo "Watermelon" de Meta** *(dato de una sola fuente, no confirmado oficialmente)*
- 📅 2 julio 2026
- 📌 Según una filtración, el modelo en entrenamiento "Watermelon" **iguala a GPT-5.5 de OpenAI** en benchmarks internos no especificados, usando un orden de magnitud más de cómputo que modelos anteriores de Meta.
- 🌍 N/A — no lanzado
- 💳 N/A
- 💡 N/A
- Fuente: [Techmeme / Business Insider](https://www.techmeme.com/260702/p40)

---

## Claude Code (Anthropic)

**v2.1.197**
- 📅 30 junio 2026
- 📌 **Claude Sonnet 5 pasa a ser el modelo por defecto** en Claude Code, con ventana de contexto nativa de 1M tokens a precio introductorio.
- 🌍 Global — 💳 Todos los planes de Claude Code
- 💡 Al abrir una nueva sesión de Claude Code tras esta versión, el desarrollador ya trabaja con Sonnet 5 sin configurar nada.

**v2.1.198**
- 📅 1 julio 2026
- 📌 **"Claude in Chrome" alcanza disponibilidad general** (antes en beta); los **subagentes ahora corren en segundo plano por defecto**; nuevo skill `/dataviz`; los agentes en segundo plano **hacen commit, push y abren un PR en borrador automáticamente** al terminar en lugar de detenerse a pedir aprobación.
- 🌍 Global — 💳 Pro, Max, Team y Enterprise (Claude in Chrome)
- 💡 Un desarrollador lanza tres subagentes en segundo plano para corregir bugs distintos; cada uno hace commit, push y abre un PR en borrador automáticamente, listo para revisión.

**v2.1.199**
- 📅 2 julio 2026
- 📌 Los errores transitorios de límite de velocidad del servidor **ahora reintentan automáticamente** (hasta 300 intentos vía `CLAUDE_CODE_RETRY_WATCHDOG`); corrección de más de una decena de bugs de estabilidad de sesión.
- 🌍 Global — 💳 Todos los planes con suscripción
- 💡 Una sesión larga que antes fallaba silenciosamente ante un error 429 ahora reintenta automáticamente hasta completarse.

Fuente (las tres versiones): [Claude Code Changelog](https://code.claude.com/docs/en/changelog)

---

## GitHub Copilot

**1. Claude Sonnet 5 — disponibilidad general**
- 📅 30 junio 2026 — 🌍 Global (rollout gradual)
- 📌 Sonnet 5 de Anthropic llega como modelo seleccionable en todas las superficies de Copilot.
- 💳 Pro, Pro+, Max, Business, Enterprise (excluye plan gratuito)
- 💡 Un desarrollador elige "Claude Sonnet 5" en VS Code, Visual Studio, Copilot CLI o github.com para una sesión de codificación agéntica.

**2. Claude Opus 4.8 (fast mode) — preview**
- 📅 29 junio 2026 — 🌍 No especificado
- 📌 Variante de Opus 4.8 con **mayor velocidad de tokens** para flujos interactivos/agénticos.
- 💳 Pro+, Max, Business, Enterprise (activado por admin, apagado por defecto en Business/Enterprise)
- 💡 Un admin habilita la política y un desarrollador la usa para chats de agente de baja latencia.

**3. MAI-Code-1-Flash — disponibilidad general**
- 📅 26 junio 2026
- 📌 Modelo propio de Microsoft AI optimizado para **codificación agéntica rápida y de bajo costo**.
- 🌍 No especificado — 💳 Solo Business y Enterprise (activado por admin)
- 💡 Un equipo habilita el modelo para bucles rápidos de refactorización iterativa.

**4. Kimi K2.7 Code — disponibilidad general** (ver también sección Kimi)
- 📅 1 julio 2026 — 🌍 No especificado — 💳 Pro, Pro+, Max

**5. Copilot Vision — disponibilidad general**
- 📅 1 julio 2026
- 📌 Adjuntar **imágenes/PDFs** directamente al chat para que Copilot razone sobre contenido visual junto al código; antes requería activación manual, ahora activado por defecto.
- 🌍 No especificado — 💳 Todos los planes, incluido Free
- 💡 Un desarrollador arrastra una captura de un mockup de interfaz y pide implementar el diseño en React.

**6. Herramientas de navegador para Copilot en VS Code — disponibilidad general**
- 📅 1 julio 2026
- 📌 Los agentes pueden **manejar un navegador real de forma autónoma** (navegar, hacer clic, escribir, capturar pantalla, usar DevTools).
- 🌍 No especificado — 💳 No restringido por nivel según el anuncio
- 💡 Un desarrollador pide al agente "abre localhost:3000 y prueba el formulario de registro"; el agente navega, rellena campos e informa de errores de consola.

**7. Streaming de sesiones de agente — preview público**
- 📅 2 julio 2026
- 📌 Las empresas obtienen visibilidad en tiempo real de la actividad de los agentes (prompts, respuestas, llamadas a herramientas), con integración a SIEM/Microsoft Purview.
- 🌍 No especificado — 💳 Solo GitHub Enterprise Cloud con EMU
- 💡 Un equipo de seguridad consulta la API para revisar las últimas 48 horas de actividad de agentes.

**8. Copilot Agent disponible en JetBrains AI Assistant**
- 📅 30 junio 2026 — 💡 Un desarrollador en IntelliJ selecciona "GitHub Copilot" como agente activo desde el selector de AI Assistant.

**9. GitHub Desktop 3.6**
- 📅 26 junio 2026
- 📌 Soporte de **worktrees de Git** para trabajo paralelo en ramas; generación de mensajes de commit con Copilot; resolución de conflictos de fusión asistida por IA.
- 🌍 macOS/Windows — 💳 App gratuita; funciones de Copilot requieren suscripción
- 💡 Al resolver un conflicto de fusión, Desktop sugiere una resolución basada en la intención de ambas ramas.

Fuente (todos los ítems de Copilot): [GitHub Changelog](https://github.blog/changelog/)

---

## Cursor

**1. Cursor para iOS — beta pública**
- 📅 29 junio 2026
- 📌 App nativa de iPhone para **lanzar y gestionar agentes de codificación remotos**: entrada de voz, comandos slash, "Remote Control" para pilotar agentes que corren en tu propia máquina desde el móvil, Live Activities en pantalla de bloqueo, revisión de diffs/logs/capturas/PRs desde la app.
- 🌍 No especificado (disponibilidad regional en App Store no confirmada)
- 💳 Todos los planes de pago (excluye Free/Hobby); promo de 75% de descuento en ejecuciones de Composer 2.5 en la app móvil hasta el 5 de julio
- 💡 Un desarrollador lanza un agente en la nube desde el móvil para corregir un bug durante un trayecto y luego fusiona el PR ya resuelto.
- Fuente: [Cursor Changelog](https://cursor.com/changelog/ios-mobile-app)

**2. MCPs de equipo y grupos de organización en Team Marketplaces**
- 📅 30 junio 2026
- 📌 Los administradores configuran un **servidor MCP de equipo una sola vez** y se propaga a agentes en la nube, IDE y CLI; los marketplaces de equipo ahora soportan grupos de organización además de grupos de directorio SCIM.
- 🌍 No especificado — 💳 Solo planes Teams y Enterprise
- 💡 Un admin añade un servidor MCP interno de Jira una vez; cada miembro del equipo lo ve e instala automáticamente sin configurar nada.
- Fuente: [Cursor Changelog](https://cursor.com/changelog/team-marketplace-updates)

---

## 📈 Tendencias de la semana

1. **Guerra de "model pickers"**: GitHub Copilot ahora ofrece modelos de cinco laboratorios distintos (OpenAI, Anthropic, Google, Microsoft, Moonshot/Kimi) en el mismo selector — la competencia se traslada a quién integra más rápido los mejores modelos de terceros, no solo el propio.
2. **Los agentes de código ganan autonomía real**: Claude Code ahora hace commit/push/PR sin pedir aprobación, Copilot maneja un navegador real de forma autónoma, y Cursor permite pilotar agentes remotos desde el móvil — la tendencia es reducir la supervisión humana constante en tareas de desarrollo.
3. **Geopolítica como factor de disponibilidad**: tanto Anthropic (Fable 5/Mythos 5) como OpenAI (GPT-5.6 Sol/Terra/Luna) tuvieron su disponibilidad condicionada por controles de exportación de EE.UU. esta semana — en direcciones opuestas (uno se libera, el otro sigue restringido).
4. **Modelos de bajo costo y open-weight entran en herramientas empresariales**: Kimi K2.7 Code (pesos abiertos) y MAI-Code-1-Flash llegan a Copilot como alternativas económicas a los modelos cerrados líderes.
5. **Expansión hacia lo multimodal y lo vertical**: Google avanza en generación de vídeo (Gemini Omni Flash) e imagen (Nano Banana 2 Lite); Anthropic lanza un producto vertical para ciencia (Claude Science); OpenAI profundiza en finanzas personales — la competencia ya no es solo "mejor chatbot" sino integración en flujos de trabajo específicos.
6. **Grietas en el relato del ritmo de la IA**: pese a la ola de lanzamientos, Zuckerberg reconoció públicamente que el progreso en agentes de Meta es más lento de lo esperado, y Google retrasó el lanzamiento público de Gemini 3.5 Pro en medio de salidas de investigadores senior — señal de que no todo avanza al ritmo que sugieren los anuncios.

---

*Fuentes citadas junto a cada ítem. Elaborado mediante búsqueda web en tiempo real el 2026-07-03. Los ítems sin fecha exacta confirmada están marcados explícitamente.*
