# Resumen Semanal de IA — 4 al 11 de junio de 2026

---

## Resumen Ejecutivo

**Claude Fable 5** (Mythos-class) fue lanzado el 9 de junio, el modelo más capaz de Anthropic hasta la fecha, con ~80% en SWE-Bench Pro. **Grok V9-Medium** (1.5T parámetros) completó entrenamiento el 5 de junio y ya despliega en Tesla y X. **OpenAI** confirma la retirada de GPT-4.5 para el 27 de junio y avanza hacia convertir ChatGPT en "superaplicación" con GPT-5.5 Instant como modelo por defecto. **Moonshot AI (Kimi)** abrió pruebas internas de Kimi Work, agente local de 1T parámetros, y valora la empresa en $30B en nueva ronda de financiación. **Microsoft Copilot** añade agentes de voz en tiempo real y Computer-Using Agents en Copilot Studio.

---

## ChatGPT / OpenAI

### GPT-5.5 Instant como modelo predeterminado
- 📅 **Fecha:** Junio 2026 (en curso)
- 📌 **Descripción:** **GPT-5.5 Instant** se convierte en el modelo por defecto de ChatGPT, incluyendo el plan gratuito. Mejoras en precisión, velocidad y personalización; **elimina el exceso de emojis** en respuestas. Mejor análisis de imágenes y archivos adjuntos. El modelo **recuerda historial de conversaciones previas** para mayor contexto.
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Disponible en plan **gratuito y de pago**
- 💡 **Ejemplo:** Un usuario puede preguntar sobre un tema que discutió la semana pasada y GPT-5.5 Instant integrará ese contexto sin necesidad de recordar manualmente.
- 🔗 Fuente: [OpenAI Help Center - Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

### Retirada de GPT-4.5
- 📅 **Fecha:** 27 de junio de 2026 (retirada efectiva)
- 📌 **Descripción:** GPT-4.5 **será retirado de ChatGPT** el 27 de junio tras un período de transición gradual de 30 días.
- 🌍 **Disponibilidad:** Afecta a todos los usuarios globales
- 💳 **Restricciones:** Impacta a todos los planes
- 💡 **Ejemplo:** Los usuarios que dependan de GPT-4.5 vía API deben migrar sus integraciones a GPT-5.5 Instant antes del 27 de junio.
- 🔗 Fuente: [ChatGPT en 2026 - Gend](https://www.gend.co/blog/chatgpt-2026-latest-features)

### OpenAI Codex CLI — Actualización masiva
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Codex CLI recibe una **actualización amplia**: markdown enriquecido en TUI, archivado de sesiones (`/archive`), **búsqueda web directa desde modo código**, soporte mejorado para app-server y ejecución remota, opciones de sandbox en Windows, y extensión de generación de imágenes. Los esquemas de herramientas preservan `oneOf` y `allOf` para mejor compatibilidad MCP.
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Acceso con cuenta OpenAI (con niveles gratuito y de pago)
- 💡 **Ejemplo:** Un desarrollador puede archivar sesiones de debugging largas con `/archive` y recuperarlas semanas después sin que interfieran con el flujo de trabajo activo.
- 🔗 Fuente: [Codex Updates - Releasebot](https://releasebot.io/updates/openai/codex) | [OpenAI Codex GitHub](https://github.com/openai/codex)

---

## Gemini / Google

### Google I/O 2026: Gemini 3.5 y Gemini Omni
- 📅 **Fecha:** Mayo-junio 2026 (anunciado en Google I/O)
- 📌 **Descripción:** Google lanzó **Gemini 3.5**, modelo de nueva generación enfocado en razonamiento y ejecución de acciones. También presentó **Gemini Omni**, modelo multimodal para generación de video de alta calidad con entradas de texto, imagen y audio.
- 🌍 **Disponibilidad:** Global (despliegue gradual)
- 💳 **Restricciones:** Gemini Advanced (Google One AI Premium)
- 💡 **Ejemplo:** Un creador de contenido puede subir una foto y pedirle a Gemini Omni que genere un clip de video cinématico de 15 segundos basado en esa imagen.
- 🔗 Fuente: [Google Gemini 3.5 - Blockchain News](https://blockchain.news/news/google-gemini-3-5-ai-updates-io-2026)

### Gemini Spark — Agente personal 24/7
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** **Gemini Spark** es un agente personal en la nube que **trabaja en segundo plano** incluso cuando el teléfono está bloqueado. Transforma Gemini de asistente reactivo a socio activo que gestiona tareas autónomamente.
- 🌍 **Disponibilidad:** Android (despliegue gradual)
- 💳 **Restricciones:** Google One AI Premium / Gemini Advanced
- 💡 **Ejemplo:** El usuario puede pedirle a Gemini Spark que busque y reserve el vuelo más barato para un viaje mientras sigue en una reunión.
- 🔗 Fuente: [TechCrunch - Gemini App Updates](https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/)

### Daily Brief y nuevo diseño "Neural Expressive"
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** La app de Gemini incorpora **Daily Brief**, un resumen matutino personalizado que integra bandeja de entrada, calendario y tareas prioritarias. Nuevo lenguaje de diseño **"Neural Expressive"** con animaciones fluidas, colores vibrantes y feedback háptico.
- 🌍 **Disponibilidad:** Global (Android e iOS)
- 💳 **Restricciones:** Funcionalidades avanzadas requieren Google One AI Premium
- 💡 **Ejemplo:** Al despertar, el usuario abre Gemini y recibe en segundos un resumen de sus 3 reuniones del día, los correos prioritarios y una alerta de tarea con fecha de entrega.
- 🔗 Fuente: [Gemini Intelligence - Android Blog](https://blog.google/products-and-platforms/platforms/android/gemini-intelligence/)

### Incidente de caída masiva de Gemini
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Gemini experimentó su **mayor caída registrada**, con errores 1076 y 1099 afectando a usuarios globalmente. El servicio se recuperó paulatinamente.
- 🌍 **Disponibilidad:** Afectó a todos los usuarios globalmente
- 💳 **Restricciones:** N/A
- 💡 **Ejemplo:** N/A (incidente de servicio)
- 🔗 Fuente: [TechRadar - Gemini Down](https://www.techradar.com/news/live/gemini-down-june-2026)

---

## Claude / Anthropic

### Claude Fable 5 — Modelo Mythos-class (el más poderoso de Anthropic)
- 📅 **Fecha:** 9 de junio de 2026
- 📌 **Descripción:** **Claude Fable 5** es el primer modelo Mythos-class de Anthropic disponible públicamente, superando a Claude Opus 4.8. Lidera benchmarks de código agentic con **~80% en SWE-Bench Pro**. Rendimiento excepcional en ingeniería de software, ciencia, visión e investigación. Precio: **$10/$50 por millón de tokens** entrada/salida. Disponible sin costo adicional en planes Pro, Max, Team y Enterprise hasta el **22 de junio**. Incluye **bloques de seguridad en áreas de alto riesgo** (ciberseguridad, biología, química).
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Gratuito en planes pagos hasta el 22/6; luego precio diferenciado
- 💡 **Ejemplo:** Un equipo de desarrollo puede usar Fable 5 para refactorizar un proyecto complejo en Python, con el modelo entendiendo dependencias entre archivos y proponiendo cambios arquitecturales coherentes.
- 🔗 Fuente: [TechCrunch - Claude Fable 5](https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/) | [Gate News](https://www.gate.com/news/detail/anthropic-releases-claude-mythos-ai-model-as-claude-fable-on-june-9-2026-21740412)

### Claude para Microsoft 365 — Disponibilidad General
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Add-ins de Claude para **Excel, PowerPoint y Word** alcanzan disponibilidad general. **Outlook** entra en beta pública. Mantiene contexto de conversación entre apps y sincroniza ediciones entre archivos abiertos.
- 🌍 **Disponibilidad:** Global (planes de pago)
- 💳 **Restricciones:** Requiere plan pagado de Anthropic (Pro, Team o Enterprise)
- 💡 **Ejemplo:** Un analista puede abrir Excel con datos de ventas, pedir a Claude que genere un resumen ejecutivo, y el mismo contexto viaja automáticamente a PowerPoint para crear la presentación.
- 🔗 Fuente: [Releasebot - Claude Updates](https://releasebot.io/updates/anthropic/claude)

### Claude + 20 conectores legales MCP
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Claude publica **20+ conectores MCP legales** y 12 plugins por área de práctica, cubriendo investigación jurídica, contratos, discovery, gestión de asuntos y ayuda legal. Permite a despachos de abogados automatizar flujos de trabajo completos.
- 🌍 **Disponibilidad:** Global (mercado legal)
- 💳 **Restricciones:** Planes Team y Enterprise
- 💡 **Ejemplo:** Un abogado puede pedirle a Claude que revise 300 contratos de arrendamiento y señale cláusulas no estándar, directamente desde su sistema de gestión de casos.
- 🔗 Fuente: [Releasebot - Anthropic](https://releasebot.io/updates/anthropic)

---

## Claude Code

### Claude Code v2.1.170 — Fable 5 + Sub-agentes anidados
- 📅 **Fecha:** Junio 2026 (semana del 4-11)
- 📌 **Descripción:** Claude Code añade soporte para **Fable 5** (actualizar a v2.1.170). Los **sub-agentes pueden ahora crear sus propios sub-agentes** (hasta 5 niveles de profundidad). Nuevo buscador de plugins en `/plugin`. Amazon Bedrock ahora lee la región AWS desde `~/.aws`. Corrección crítica: sesiones con 1M de contexto sin créditos ya no quedan bloqueadas permanentemente — se compactan automáticamente.
- 🌍 **Disponibilidad:** Global (CLI + extensiones IDE)
- 💳 **Restricciones:** Planes Pro, Max, Team, Enterprise de Anthropic
- 💡 **Ejemplo:** Un agente de DevOps puede orquestar sub-agentes para testear, construir, deployar y monitorear una aplicación en paralelo, todo desde Claude Code.
- 🔗 Fuente: [Claude Code Changelog](https://code.claude.com/docs/en/changelog) | [Releasebot - Claude Code](https://releasebot.io/updates/anthropic/claude-code)

---

## Grok / xAI

### Grok V9-Medium (1.5T parámetros) — Tesla y X
- 📅 **Fecha:** 5 de junio de 2026 (entrenamiento completado); despliegue en curso
- 📌 **Descripción:** Grok V9-Medium completa entrenamiento con **1.5 billones de parámetros** (3× el modelo anterior v8-small de 500B). xAI inicia despliegue en la **flota de Tesla** y la red social **X**. Supervisión fina y aprendizaje por refuerzo ya en marcha; lanzamiento público previsto para **mediados de junio 2026**.
- 🌍 **Disponibilidad:** Tesla (vehículos conectados) y X; lanzamiento público próximo
- 💳 **Restricciones:** Usuarios de X Premium y propietarios de Tesla
- 💡 **Ejemplo:** Conductores de Tesla podrán hacer preguntas complejas sobre navegación, servicios cercanos o consultas técnicas usando Grok V9 integrado en el sistema del vehículo.
- 🔗 Fuente: [TechTimes - Grok V9](https://www.techtimes.com/articles/318165/20260610/grok-v9-rolls-tesla-cars-x-why-musks-distribution-flywheel-worries-ai-rivals.htm)

### Grok Voice — Interacción por voz
- 📅 **Fecha:** 4 de junio de 2026
- 📌 **Descripción:** xAI lanza públicamente **Grok Voice** — interacción hablada con el modelo — junto a **Grok Imagine 1.5 Preview** (imagen a video cinématico, hasta 720p).
- 🌍 **Disponibilidad:** Global vía app X y xAI API
- 💳 **Restricciones:** X Premium; API requiere suscripción xAI
- 💡 **Ejemplo:** Un usuario puede dictar una pregunta técnica compleja a Grok mientras conduce y recibir una respuesta de voz en tiempo real.
- 🔗 Fuente: [xAI Release Notes](https://docs.x.ai/developers/release-notes) | [Grok Release Notes](https://grok.com/release-notes)

### Grok Build 0.1 — Modelo de codificación agentic
- 📅 **Fecha:** Beta pública desde el 29 de mayo de 2026
- 📌 **Descripción:** **Grok Build 0.1** es un modelo de coding dedicado a tareas agénticas con ventana de contexto de **256K tokens**, razonamiento activado permanentemente, y soporte nativo para worktrees. Acepta texto e imágenes.
- 🌍 **Disponibilidad:** Global vía xAI API (beta pública)
- 💳 **Restricciones:** Requiere acceso a xAI API (de pago)
- 💡 **Ejemplo:** Un desarrollador puede pedirle a Grok Build que gestione un repositorio completo: crear ramas, escribir código, ejecutar tests y hacer PR, todo de forma autónoma.
- 🔗 Fuente: [xAI Release Notes](https://docs.x.ai/developers/release-notes)

---

## Kimi / Moonshot AI

### Kimi Work — Agente local de IA para trabajadores del conocimiento
- 📅 **Fecha:** Junio 2026 (pruebas internas)
- 📌 **Descripción:** **Kimi Work** es el agente local general de Moonshot AI. Se ejecuta **directamente en el equipo del usuario** (no solo en la nube), coordina **hasta 300 sub-agentes** en 4.000 pasos coordinados, y puede actuar sobre archivos locales y sesiones de navegador autenticadas vía **Kimi WebBridge**. Alimentado por **Kimi K2.6** (~1T parámetros, 32B activos por token, contexto 256K).
- 🌍 **Disponibilidad:** China (pruebas internas); expansión prevista
- 💳 **Restricciones:** Pruebas internas — sin disponibilidad pública aún
- 💡 **Ejemplo:** Un analista financiero puede pedirle a Kimi Work que descargue informes de su banca en línea (sin compartir credenciales), los procese y genere un dashboard de gastos en Excel.
- 🔗 Fuente: [Lushbinary - Kimi Work](https://lushbinary.com/blog/kimi-work-local-ai-agent-knowledge-workers-guide/) | [Bloomberg - Moonshot $30B](https://www.bloomberg.com/news/articles/2026-06-08/china-s-moonshot-ai-seeks-30-billion-value-in-new-funding-talks)

### Moonshot AI busca valoración de $30B en nueva ronda
- 📅 **Fecha:** 8 de junio de 2026
- 📌 **Descripción:** Moonshot AI busca **$2.000M** en nueva ronda que la valoraría en **$30.000M** — tercera financiación en seis meses, en respuesta a la intensa competencia en el mercado de IA en China.
- 🌍 **Disponibilidad:** N/A (noticia financiera)
- 💳 **Restricciones:** N/A
- 💡 **Ejemplo:** N/A
- 🔗 Fuente: [Bloomberg](https://www.bloomberg.com/news/articles/2026-06-08/china-s-moonshot-ai-seeks-30-billion-value-in-new-funding-talks)

---

## Microsoft Copilot

### Computer-Using Agents y Voz en Tiempo Real en Copilot Studio
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** **Computer-Using Agents** permiten operar sistemas sin APIs. **Real-time Voice Agents** integran Copilot Studio en canales de telefonía para interacción de voz dinámica. Nuevo **Workflows Canvas rediseñado** para orquestar procesos multiplataforma.
- 🌍 **Disponibilidad:** Global (preview)
- 💳 **Restricciones:** Microsoft 365 Copilot (Enterprise)
- 💡 **Ejemplo:** Un agente de soporte técnico puede operar un sistema legacy sin API simplemente "viendo" la pantalla y haciendo clics autónomamente, como un operador humano.
- 🔗 Fuente: [Superhub - Copilot Studio June 2026](https://www.superhub.com.hk/blog/microsoft-copilot-studio-updates-june-2026/)

### Nuevo diseño de M365 Copilot — Workspace adaptativo
- 📅 **Fecha:** 28 de mayo de 2026 (en despliegue durante junio)
- 📌 **Descripción:** Rediseño de la interfaz de M365 Copilot: la **línea de prompt se convierte en un workspace adaptativo** consciente de la tarea. Controles de presentación mejorados (longitud, tono, estilo de diapositivas). Nuevos controles de administración para **generación de video con IA**.
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Microsoft 365 Business Standard/Premium con Copilot ($23.50–$32/usuario/mes desde julio 2026)
- 💡 **Ejemplo:** Al redactar un informe en Word, Copilot detecta el contexto del documento y ofrece herramientas específicas (tablas, gráficos, traducción) sin necesidad de un prompt explícito.
- 🔗 Fuente: [Microsoft 365 Blog](https://www.microsoft.com/en-us/microsoft-365/blog/2026/05/28/introducing-a-new-design-for-microsoft-365-copilot/)

---

## GitHub Copilot

### Cambio a modelo de créditos AI (token-based) — Impacto en desarrolladores
- 📅 **Fecha:** 1 de junio de 2026
- 📌 **Descripción:** GitHub Copilot migra de **tarifa plana por solicitudes** a **AI Credits basados en tokens**. Los precios de los planes no cambiaron, pero el volumen efectivo por dólar se redujo drásticamente — **algunos desarrolladores agotan su cuota en horas**. Plan Pro: $10/mes; **Pro+: $39/mes** con acceso a Opus, logs de auditoría y 4× más créditos incluidos.
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Pro ($10/mes), Pro+ ($39/mes)
- 💡 **Ejemplo:** Un desarrollador con plan Pro que antes usaba Copilot libremente puede encontrar que operaciones de agente intensivo (refactoring de proyectos grandes) consumen créditos rápidamente.
- 🔗 Fuente: [Developers Digest - AI Coding Tools Pricing](https://www.developersdigest.tech/blog/ai-coding-tools-pricing-june-2026)

### Versión 1.0.61 — Mejoras en agentes y Rubber Duck activado
- 📅 **Fecha:** 9 de junio de 2026 (v1.0.61)
- 📌 **Descripción:** v1.0.61 pule el **selector `/agents`** y el asistente "Create New Agent". v1.0.58 (2 junio) activa **Rubber Duck por defecto** (explicación de código en voz alta) y Remote JSON RPC.
- 🌍 **Disponibilidad:** Global (extensión VS Code, JetBrains, etc.)
- 💳 **Restricciones:** Plan Pro o superior
- 💡 **Ejemplo:** Un desarrollador junior puede activar Rubber Duck y pedirle a Copilot que explique paso a paso por qué un algoritmo recursivo falla, como un senior explicando en voz alta.
- 🔗 Fuente: [Havoptic - GitHub Copilot Updates](https://www.havoptic.com/tools/github-copilot)

---

## Cursor

### Nuevo tier Pro+ y actualización de precios
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Cursor introduce **Pro+** ($60/mes) como nivel intermedio entre Pro ($20/mes) y Ultra ($200/mes). El plan **Teams** también se actualiza con los nuevos precios de mediados de 2026. Cursor mantiene el 52% en SWE-bench según benchmarks independientes.
- 🌍 **Disponibilidad:** Global
- 💳 **Restricciones:** Hobby (gratis), Pro ($20/mes), Pro+ ($60/mes), Ultra ($200/mes), Teams ($40/usuario/mes)
- 💡 **Ejemplo:** Un freelancer que necesita más capacidad que Pro pero no el ultra intensivo uso de Ultra puede ahora usar Pro+ a $60/mes con acceso a modelos premium y mayor cuota.
- 🔗 Fuente: [NxCode - Cursor vs Claude Code vs GitHub Copilot 2026](https://www.nxcode.io/resources/news/cursor-vs-claude-code-vs-github-copilot-2026-ultimate-comparison)

---

## Mistral AI

### Voxtral TTS disponible en Mistral Studio
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Mistral pone a prueba en **Mistral Studio** su **text-to-speech empresarial Voxtral TTS**: baja latencia, bajo costo y fácil adaptación para empresas que quieren controlar su stack de voz IA.
- 🌍 **Disponibilidad:** Global (Mistral Studio)
- 💳 **Restricciones:** Acceso empresarial
- 💡 **Ejemplo:** Una empresa de atención al cliente puede integrar Voxtral TTS para que sus chatbots de soporte hablen con voz personalizada de la marca, sin depender de terceros.
- 🔗 Fuente: [Serenities AI - Mistral Models 2026](https://serenitiesai.com/articles/mistral-ai-models-2026-complete-guide)

### Emmi AI — Física industrial integrada en plataforma enterprise
- 📅 **Fecha:** Junio 2026
- 📌 **Descripción:** Mistral integra **Emmi AI** en su plataforma enterprise: IA de física para ingeniería industrial con simulaciones más rápidas, exploración de diseños y **gemelos digitales en tiempo real** para manufactura, aeroespacial y semiconductores.
- 🌍 **Disponibilidad:** Enterprise global
- 💳 **Restricciones:** Planes enterprise de Mistral
- 💡 **Ejemplo:** Un ingeniero aeroespacial puede simular el comportamiento de un nuevo material en condiciones extremas en minutos en lugar de días, usando gemelos digitales en Emmi AI.
- 🔗 Fuente: [Releasebot - Mistral](https://releasebot.io/updates/mistral)

---

## Meta AI / Llama

> **Nota:** No se detectaron lanzamientos significativos de Meta AI en la ventana exacta 4-11 junio 2026. Los modelos Llama 4 Scout y Maverick fueron lanzados en abril 2025. **Llama 4 Behemoth** sigue sin lanzamiento público oficial a la fecha. Meta estaría evaluando un modelo de nueva generación (nombre código "Avocado") con posible desplazamiento hacia arquitectura cerrada.

- 🔗 Fuente: [LLM Stats - AI Updates Today](https://llm-stats.com/llm-updates) | [Llama 4 Behemoth Status](https://serenitiesai.com/articles/llama-4-behemoth-maverick-scout-review-2026)

---

## Tendencias de la Semana

1. **La carrera por el modelo "más poderoso"** se intensifica: Fable 5 de Anthropic, V9-Medium de xAI y la apuesta de OpenAI por GPT-5.5 marcan una semana de hitos en capacidad bruta.

2. **Los agentes locales emergen como nuevo paradigma:** Kimi Work (Moonshot) apuesta por IA que corre en tu máquina y controla tu navegador autenticado. Esta tendencia de "agente local" puede responder a preocupaciones de privacidad y latencia que los modelos puramente cloud no resuelven.

3. **La monetización del coding IA se complica para los usuarios:** GitHub Copilot migra a créditos por tokens, Cursor añade tiers intermedios y Claude Code requiere planes pagos para Fable 5. El mercado de herramientas de coding IA está en plena consolidación de precios.

4. **Integración total en el ecosistema de trabajo:** Claude en M365, Gemini en Android/Chrome, Copilot con Computer-Using Agents y Grok en Tesla muestran que los LLMs ya no viven solo en chatbots — son la capa de inteligencia sobre todos los productos.

5. **Seguridad vs. Capacidad como tensión central:** Anthropic lanzó Fable 5 días después de advertir públicamente sobre los peligros de la IA avanzada — e incluyó blockers en dominios de alto riesgo. Esta tensión entre capacidad y responsabilidad será definitoria del ecosistema en el segundo semestre de 2026.

---

*Generado automáticamente el 11 de junio de 2026 | Próximo resumen: 18 de junio de 2026*
