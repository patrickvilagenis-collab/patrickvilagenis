# Resumen semanal de IA — 20 al 27 de noviembre de 2026

> Generado automáticamente el 27/11/2026. Periodo cubierto: **20/11/2026 – 27/11/2026**. Se han excluido las noticias anteriores al 20/11 (p. ej. el lanzamiento de Gemini 4 Neon el 18/11 o GPT-6.2 Astra/Sol el 17/11), que solo se citan como contexto cuando hace falta.

## Resumen ejecutivo

- **OpenAI lleva GPT-6.2 a la pestaña Chat de ChatGPT** (23/11) y empieza a **fusionar Chat y Work con un único contador de uso** (24–25/11), lo que puede hacer que los usuarios más intensivos agoten antes sus límites.
- **ChatGPT Space llega a Plus** (20/11): páginas y presentaciones interactivas y colaborativas que se actualizan desde apps conectadas.
- **Google pone en disponibilidad general los servidores MCP y la CLI de Workspace** (24/11) para agentes de IA, y lanza **Mass Spec Skills para Antigravity** (25/11).
- **Claude Code encadena tres versiones (2.1.330–2.1.332)**: tareas programadas de hasta 30 días, Code Mode en nubes de terceros y **skills servidas desde MCP (beta)**. Anthropic **cierra su OPV** a 83 $/acción (20/11).
- **Semana tranquila para Cursor, Grok, Microsoft Copilot, Meta AI y Mistral**: ninguna novedad de producto confirmada en el periodo.

---

## ChatGPT (OpenAI)

### GPT-6.2, ahora en la pestaña Chat
- 📅 **23/11/2026**
- 📌 Una versión de **GPT-6.2 optimizada para la pestaña Chat** (basada en GPT-6.2 Sol). **Sigue mejor las instrucciones detalladas**, mejora la **investigación web**, la comprensión de **imágenes** (71,7 % frente a 47,4 % de GPT-6 según OpenAI) y sabe **cuándo hacer preguntas de seguimiento**. Los modelos de Work y Codex no cambian.
- 🌍 Despliegue **global** progresivo.
- 💳 **Plus, Pro, Business y Enterprise** (en Enterprise depende de la configuración del administrador). No disponible en Free.
- 💡 Pegar un briefing largo con 15 requisitos de formato para un informe y obtener un primer borrador que los respeta todos, con citas web actualizadas.
- 🔗 Fuente: [ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

### ChatGPT Space llega a Plus
- 📅 **20/11/2026**
- 📌 **Space** permite crear **páginas y presentaciones interactivas en colaboración**, que pueden **actualizarse automáticamente desde apps conectadas**. **Sustituye a Library**. Web, escritorio, iOS y Android.
- 🌍 Despliegue **global**.
- 💳 **Plus (mayores de 18 años)**. Para abrir páginas compartidas hace falta Plus/Pro/Business/Enterprise con Space; **los usuarios Free no pueden abrirlas** y **no hay enlaces públicos**.
- 💡 Un equipo de marketing crea una página de KPIs de campaña conectada a sus herramientas, que se actualiza sola antes de la reunión semanal.
- 🔗 Fuente: [ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

### Fusión de Chat y Work con límite de uso compartido
- 📅 Anunciado el **martes 24/11/2026** en X por Thibault Sottiaux; cubierto por TechCrunch el **25/11/2026**.
- 📌 Experiencia **unificada de Chat y Work** con **un solo contador de uso**. Las conversaciones con el **modelo Instant siguen siendo ilimitadas** y no consumen cuota. OpenAI admite que **"una pequeña fracción de los usuarios más intensivos puede alcanzar sus límites antes"**. Los límites compartidos se generalizarán **en diciembre**.
- 🌍 Sin restricciones geográficas indicadas.
- 💳 De momento, **un grupo reducido de suscriptores Pro**.
- 💡 Un usuario Pro que alterna entre tareas largas de agente en Work y consultas en Chat debería reservar los modelos de razonamiento para las tareas duras y usar Instant para lo rutinario, y así no agotar el contador compartido.
- 🔗 Fuente: [TechCrunch](https://techcrunch.com/2026/11/25/openai-says-heavy-chatgpt-users-may-hit-limits-sooner-as-it-merges-chat-and-work/)

---

## OpenAI Codex

### Codex CLI v0.171.0: GPT-6.2 Sol pasa a ser el modelo por defecto
- 📅 **Fecha exacta no confirmada**: aparece en un resumen semanal publicado el 21/11/2026, así que salió hacia el 19–21/11.
- 📌 **GPT-6.2 Sol pasa a ser el modelo por defecto del catálogo** y el **espacio de trabajo de la TUI viene activado por defecto**. La v0.170.0 anterior corrigió que los hilos hijos perdieran las restricciones del sandbox.
- 🌍 Global.
- 💳 Requiere un plan de ChatGPT con Codex (Plus, Pro, Business, Enterprise y Edu) o una clave de API.
- 💡 Tras actualizar, `codex` usa Sol directamente para refactorizaciones del día a día, más baratas que con Astra.
- 🔗 Fuente: [DEV Community – semana del 22/11](https://dev.to/aicoding-guide/this-week-in-claude-code-codex-and-gemini-cli-week-of-november-22-2026-1ofi) · [Codex changelog](https://developers.openai.com/codex/changelog)

---

## Gemini (Google)

### Servidores MCP y CLI de Workspace en disponibilidad general
- 📅 **24/11/2026**
- 📌 Los **servidores MCP de Google Workspace y la Workspace CLI pasan a GA**. Llegan **nuevos niveles de uso de API, Standard (gratuito) y Scaled**, y **controles de administración** (confirmaciones, DLP y registros de auditoría). **Desde el 1/2/2027 los agentes de IA tendrán que usar MCP**, y la facturación del nivel Scaled empieza el 1/4/2027.
- 🌍 **Todos los clientes y desarrolladores de Workspace**; llega a los dominios Rapid y Scheduled Release en unas 2 semanas.
- 💳 Nivel Standard gratuito; el nivel Scaled será de pago.
- 💡 Conectar Claude Code, Codex o un agente propio al servidor MCP de Gmail/Drive para clasificar correos y archivar adjuntos, con registro de auditoría para el equipo de TI.
- 🔗 Fuente: [Releasebot – Google Gemini](https://releasebot.io/updates/google/gemini) (agrega el blog de Google Workspace)

### Mass Spec Skills para Google Antigravity
- 📅 **25/11/2026**
- 📌 **Skills que combinan Gemini con herramientas de espectrometría de masas** para **identificar moléculas a partir de espectros en tándem**. Con las skills, los tres modelos probados encontraron la molécula exacta **en torno al 97 % de las veces**. Además, **10.000 científicos pueden solicitar el nivel de uso más alto de Antigravity gratis durante 6 meses**.
- 🌍 No se indica restricción geográfica.
- 💳 App Antigravity (plugin Mass Spec) y usuarios Enterprise mediante una cuenta de Google Cloud.
- 💡 Un laboratorio de metabolómica sube un espectro MS/MS desconocido y obtiene la estructura candidata con su justificación.
- 🔗 Fuente: [Releasebot – Google Gemini](https://releasebot.io/updates/google/gemini)

### Búsqueda más personalizada: Google Wallet en Personal Intelligence
- 📅 **23/11/2026**
- 📌 **Google Wallet puede conectarse a Personal Intelligence en AI Mode** (en despliegue); las conexiones con **Drive y la app Gemini llegarán en las próximas semanas**. AI Overviews y AI Mode **adaptan las respuestas a tus búsquedas recientes**.
- 🌍 No especificado (probablemente EE. UU. primero).
- 💳 No especificado.
- 💡 Preguntar en AI Mode "¿a qué hora sale mi vuelo del viernes?" y que responda a partir de la tarjeta de embarque guardada en Wallet.
- 🔗 Fuente: [Releasebot – Google Gemini](https://releasebot.io/updates/google/gemini)

### Nuevas Connected Apps en Search y en la app Gemini
- 📅 **20/11/2026**
- 📌 **Apps conectadas de supermercados** (Albertsons, Safeway, Shaw's y Target) en Search y en la app Gemini. **Estimaciones fiscales de H&R Block** en Search; Experian, Angi y Thumbtack llegarán después.
- 🌍 **Solo EE. UU.**
- 💳 No especificado.
- 💡 "Prepara la lista de la compra para la cena de Acción de Gracias y añádela a mi carrito de Target."
- 🔗 Fuente: [Releasebot – Google Gemini](https://releasebot.io/updates/google/gemini)

### Gemini Enterprise: ajuste fino (tuning) de Gemini 3.8 Flash
- 📅 **20/11/2026** (según un agregador; **no se ha verificado en una fuente oficial**)
- 📌 **Soporte para hacer tuning de Gemini 3.8 Flash** en Gemini Enterprise.
- 🌍 No especificado.
- 💳 Gemini Enterprise (de pago).
- 💡 Ajustar Flash con tickets históricos de soporte para clasificar incidencias con la taxonomía propia de la empresa.
- 🔗 Fuente: [Releasebot – Google](https://releasebot.io/updates/google)

> Fuera del periodo: "computer use" en la app Gemini para Mac tiene fecha de origen **19/11** y Gemini 4 Neon se lanzó el **18/11**, así que no se incluyen como novedades de esta semana.

---

## Claude (Anthropic)

### Cierre de la OPV de Anthropic
- 📅 **20/11/2026**
- 📌 Anthropic **cierra su oferta pública inicial**: **1.127 millones de acciones de clase A a 83,00 $**, incluida la opción completa de los colocadores (147 millones de acciones), más una colocación privada simultánea. Es una noticia corporativa, no un cambio de producto.
- 🌍 / 💳 No aplica.
- 💡 Contexto: tiene implicaciones para la hoja de ruta y la capacidad de cómputo de Claude en 2027.
- 🔗 Fuente: [Anthropic News](https://www.anthropic.com/news)

## Claude Code

### v2.1.332: skills desde servidores MCP (beta)
- 📅 **25/11/2026**
- 📌 **Skills servidas desde servidores MCP (beta)**, mostradas como `server:skill`. Nuevo hook **`PreSkillShellCommand`** y más eventos de **OpenTelemetry**. El alias `sonnet` pasa a **Sonnet 5.5** en Google Cloud Agent Platform y Foundry, y el alias `opus` de Foundry pasa a **Opus 5.5** (en Bedrock, `sonnet` sigue en Sonnet 4.5). Incluye 93 correcciones.
- 🌍 Global.
- 💳 Cualquier plan con Claude Code (Pro, Max, Team, Enterprise o API).
- 💡 Un equipo publica en su servidor MCP interno una skill "deploy-staging" que todos los desarrolladores usan sin copiar archivos a cada repositorio.
- 🔗 Fuente: [Claude Code changelog](https://code.claude.com/docs/en/changelog)

### v2.1.331: Code Mode en nubes de terceros e integración con VS Code
- 📅 **23/11/2026**
- 📌 **Code Mode en sesiones de terminal sobre Bedrock, Agent Platform, Foundry y Claude Platform en AWS**. Nueva **comprobación de conectividad de API en `claude doctor`**. En VS Code llegan **"Fix with Claude Code"** y **"Resolve Merge Conflicts"**. **Desde el 30/11 los marketplaces gestionados se actualizarán solos por defecto.**
- 🌍 Global.
- 💳 Pro/Max/Team/Enterprise o API; Code Mode en nube requiere cuenta en el proveedor.
- 💡 Resolver con un clic un conflicto de merge complejo directamente desde VS Code.
- 🔗 Fuente: [Claude Code changelog](https://code.claude.com/docs/en/changelog)

### v2.1.330: tareas de 30 días y gráficos integrados
- 📅 **20/11/2026**
- 📌 **Las tareas recurrentes y `/loop` pasan de 7 a 30 días**. Nuevo mod de gráficos **`easel`** e **inicio de sesión en organizaciones gestionadas desde Enterprise Admin Console**.
- 🌍 Global; `easel` solo en macOS y Linux.
- 💳 `easel`: **Pro y Max**, y Team/Enterprise donde esté disponible.
- 💡 Programar una revisión diaria de dependencias vulnerables que se ejecute durante un mes entero sin renovarla.
- 🔗 Fuente: [Claude Code changelog](https://code.claude.com/docs/en/changelog)

---

## GitHub Copilot

### La facturación de Copilot code review pasa por defecto a la organización
- 📅 **25/11/2026**
- 📌 **Las revisiones de código de Copilot se facturarán por defecto a la organización**, no al usuario individual.
- 🌍 Global.
- 💳 Planes Copilot Business/Enterprise.
- 💡 Un administrador puede controlar el gasto en revisiones automáticas desde un único presupuesto de la organización.
- 🔗 Fuente: [GitHub Changelog](https://github.blog/changelog/)

> Otras novedades de GitHub sin IA: estados de issues y tableros de repositorio en vista previa pública (23/11), y GHES 3.23 RC (20/11).

---

## Cursor
- **Sin novedades en el periodo.** La última entrada del changelog es del **06/11/2026** ("Voice Chat with Agents"). Fuente: [Cursor changelog](https://cursor.com/changelog)

## Grok (xAI)
- **Sin lanzamientos confirmados en el periodo.** Grok Build 1.0.92 y el anuncio de Musk de que Grok 4.8 está en beta con varias variantes son del **19/11**, fuera de rango. **Grok 5 sigue sin fecha.** Fuente: [Releasebot – xAI](https://releasebot.io/updates/xai)

## Microsoft Copilot
- **Sin novedades fechadas en el periodo.** La última actualización de Microsoft 365 Copilot es del **17/11/2026** (Autopilot en acceso anticipado, skills en Chat, destino Code). Fuente: [Releasebot – Microsoft Copilot](https://releasebot.io/updates/microsoft/microsoft-copilot)

## Meta AI
- **Sin novedades confirmadas en el periodo.** Lo último fue el despliegue de los modelos especializados entrenados con Muse Wonder (06/11) y Muse Ember 1.0 (09/11).

## Mistral
- 📅 **24/11/2026** (según un briefing semanal secundario; **no se ha verificado en una fuente oficial**): **Mistral abre su sede para Asia-Pacífico en Singapur.** No hay nuevo modelo insignia en noviembre. Fuente: [Distill Intelligence – AI Leaders Weekly Briefing](https://www.distillintelligence.com/briefings/ai-leaders-2026-11-27)

## Kimi (Moonshot AI)
- 📅 **26/11/2026**: según un informe de Reuters recogido por otros medios, **Kimi K4 no tiene fecha** y podría retrasarse **hasta mediados de 2027** si Moonshot pierde acceso al cómputo alquilado en el extranjero (relacionado con la nueva norma de EE. UU. que cierra el acceso remoto a chips). No hay nuevo producto. Fuente: [Careergraph – New AI Models November 2026](https://blog.careergraph.in/new-ai-models-november-2026/)

## Otros
- **Tencent Hy4 Flash** (pesos abiertos) llega a la API serverless de **Fireworks AI** (**25/11/2026**) a 0,07 $ por millón de tokens de entrada y 0,281 $ por millón de salida. Fuente: [Rudi Daily AI News 25/11](https://learnrudi.com/insights/rudi-daily-ai-news-2026-11-25.html)

---

## Tendencias de la semana

1. **Límites de uso unificados y más estrictos.** OpenAI fusiona Chat y Work con un solo contador, igual que Anthropic hizo con Claude y Cowork en septiembre. El coste del cómputo empuja a todos hacia **cuotas compartidas** y a **modelos "Instant" ilimitados** como válvula de escape.
2. **MCP se consolida como estándar de facto.** Google exigirá MCP a los agentes en Workspace desde febrero de 2027 y Claude Code ya distribuye **skills vía MCP**. El protocolo pasa de conectar herramientas a **distribuir capacidades y aplicar políticas corporativas**.
3. **Agentes de larga duración.** Tareas programadas de 30 días en Claude Code, Space con datos vivos en ChatGPT y Autopilot en Microsoft: la IA pasa de responder a **trabajar de forma continua en segundo plano**.
4. **Modelos "eficientes" por defecto.** GPT-6.2 Sol es el modelo por defecto en Codex y la base de la pestaña Chat. Los proveedores reservan el modelo frontera (Astra, Opus, Argon) para tareas duras y **optimizan coste con un modelo medio**.
5. **Verticalización científica y de consumo.** Hay skills de espectrometría en Antigravity y apps conectadas de supermercados e impuestos en Gemini (solo EE. UU.): **muchas funciones llegan primero a EE. UU.**
6. **Geopolítica del cómputo.** Las restricciones de EE. UU. sobre el acceso remoto a chips ya afectan a las hojas de ruta chinas (Kimi K4), mientras Mistral se expande en Asia.

---

### Notas de validación
- Fuentes primarias consultadas: notas de versión de ChatGPT, changelog de Claude Code, Anthropic News, GitHub Changelog y changelog de Cursor.
- Las fuentes marcadas como agregador o secundaria (Releasebot, DEV Community, briefings) **no se han contrastado con un comunicado oficial**.
- Gemini 4 Neon (18/11), GPT-6.2 Astra/Sol en Work y Codex (17/11) y computer use de Gemini para Mac (19/11) quedan **fuera de los 7 días** y no se cuentan como novedades.
