# 📰 Resumen semanal de IA — 3 al 10 de julio de 2026

> Generado automáticamente el 2026-07-10. Cobertura estricta: solo novedades con fecha confirmada dentro de los últimos 7 días (03–10 jul 2026). Metodología: 105 sub-agentes, 5 ángulos de búsqueda, 23 fuentes consultadas, 80 afirmaciones extraídas, 25 verificadas adversarialmente (voto 2/3 mínimo), 24 confirmadas / 1 refutada.

## Resumen ejecutivo

La semana estuvo **dominada por Anthropic y el ecosistema GitHub Copilot**. Anthropic lanzó **"Reflect"** (dashboard de auto-análisis de uso de Claude), expandió **Claude Cowork a web y móvil**, y sumó **herramientas de escritura para Microsoft 365** (correo, calendario, OneDrive/SharePoint), además de varias actualizaciones incrementales de **Claude Code (v2.1.200 → v2.1.206)**. **GitHub Copilot** fue el más activo integrando modelos de terceros: sumó **GPT-5.6 (Sol/Terra/Luna)** de OpenAI, expandió **Kimi K2.7** de Moonshot AI a planes Business/Enterprise, e incorporó **Codex como proveedor de agentes en JetBrains**. **Mistral AI** tuvo semana activa con **Robostral Navigate** (su primer modelo de navegación embebida) y **Studio** (gestión versionada de prompts/skills). **No se hallaron novedades verificables de Gemini ni de Microsoft 365 Copilot** dentro de la ventana estricta de 7 días.

---

## 🟣 Anthropic / Claude

### 1. Claude Reflect
- 📅 **9 de julio de 2026**
- 📌 Nuevo **dashboard integrado en Claude** que permite visualizar patrones de uso propios: temas principales, tipos de tarea y franjas horarias, con ventanas de **1/3/6/12 meses**. Incluye prompts de reflexión y "horas silenciosas". Las conversaciones de salud quedan excluidas por privacidad.
- 🌍 Disponibilidad global (beta)
- 💳 Beta para planes **Free, Pro y Max** — requiere tener activada la función de memoria
- 💡 Un usuario que use Claude a diario puede revisar su resumen mensual para detectar en qué franjas horarias es más productivo y ajustar sus rutinas de trabajo con IA.
- 🔗 anthropic.com/news/reflect-with-claude · corroborado por TechCrunch, Axios, MacRumors (9-10 jul)

### 2. Claude Cowork llega a web y móvil
- 📅 **7 de julio de 2026**
- 📌 **Claude Cowork** (antes solo escritorio) se expande a **web y móvil**, con despliegue gradual iniciando en suscriptores **Max**. Incluye función beta de **sesión remota**: sincroniza sesiones/archivos entre dispositivos y permite que las tareas sigan ejecutándose aunque el dispositivo quede offline.
- 🌍 Global, despliegue gradual
- 💳 Requiere plan **Max** (fase inicial)
- 💡 Iniciar una tarea larga de análisis desde el portátil y revisar el progreso desde el móvil sin perder el hilo de la sesión.
- 🔗 support.claude.com/release-notes · claude.com/blog/cowork-web-mobile · corroborado por TechCrunch, 9to5Mac, MacRumors

### 3. Nuevas herramientas de escritura para el conector Microsoft 365
- 📅 **7 de julio de 2026**
- 📌 Claude puede ahora **redactar/enviar/organizar correo**, gestionar eventos de calendario, actualizar configuración de buzón y **crear/actualizar archivos en OneDrive y SharePoint**. Requiere consentimiento de administrador de Microsoft Entra.
- 🌍 Global (sujeto a políticas de TI de cada organización)
- 💳 Disponible donde exista el conector de Microsoft 365 (planes de pago con conectores empresariales)
- 💡 Pedirle a Claude que redacte y envíe el resumen semanal de reuniones directamente al equipo por correo, sin salir del chat.
- 🔗 support.claude.com/release-notes · corroborado por office365itpros.com

### 4. Expiración configurable de API keys
- 📅 **8 de julio de 2026**
- 📌 En **Claude Console** ahora se puede fijar **fecha de expiración** al crear una API key o Admin API key (preset, duración personalizada o "Never"). Para claves con vida ≥7 días se envía email de aviso antes de expirar.
- 🌍 Global
- 💳 Disponible para todos los usuarios de la API (afecta a desarrolladores, no a planes de chat)
- 💡 Una empresa puede emitir claves temporales de 30 días para un proyecto piloto y olvidarse de revocarlas manualmente.
- 🔗 docs.anthropic.com/en/release-notes/overview

### 5. "The Making of Claude Code" (retrospectiva)
- 📅 **6 de julio de 2026**
- 📌 Artículo retrospectivo oficial que documenta la **evolución de Claude Code** de CLI interna a producto de agente de codificación.
- 🌍 Global
- 💳 Gratuito (contenido editorial, no una función de producto)
- 💡 Útil como lectura de contexto para equipos de ingeniería que evalúan adoptar Claude Code, entendiendo su filosofía de diseño.
- 🔗 anthropic.com/features/making-of-claude-code

### 6. Claude Code — actualizaciones incrementales v2.1.200 → v2.1.206
- 📅 **3, 8 y 9/10 de julio de 2026** (⚠️ discrepancia entre fuentes: docs.claude.com fecha v2.1.206 el 9 jul, GitHub Releases la fecha el 10 jul 01:45 — ambas dentro de ventana, no resuelto)
- 📌 **v2.1.200 (3 jul):** modo de permisos por defecto pasa a **"Manual"** en CLI/VS Code/JetBrains; elimina auto-continuar en diálogos AskUserQuestion; corrige fallos de sesiones en segundo plano tras suspender/reanudar el equipo; mejora accesibilidad para lectores de pantalla.
  **v2.1.205 (8 jul):** bloquea la manipulación de archivos de transcripción de sesión.
  **v2.1.206 (9/10 jul):** sugerencias de rutas en `/cd`, soporte de login para gateways públicos operados por Anthropic, `/doctor` propone recortar archivos CLAUDE.md, auto-actualización de agentes en segundo plano, corrige timeout en servidores MCP.
- 🌍 Global
- 💳 Gratuito (parte del propio Claude Code; requiere cuenta con acceso a Claude Code)
- 💡 Un equipo que use CLAUDE.md muy extenso puede correr `/doctor` para que sugiera qué recortar automáticamente.
- 🔗 code.claude.com/docs/en/changelog · github.com/anthropics/claude-code/releases

---

## ⚫ OpenAI / ChatGPT

### 7. GPT-5.6 (familia Sol / Terra / Luna)
- 📅 **9 de julio de 2026**
- 📌 OpenAI lanza la familia **GPT-5.6**, con tres variantes (**Sol, Terra, Luna**) orientadas a distintos balances de velocidad/coste/capacidad.
- 🌍 Global
- 💳 Disponible en ChatGPT/API (planes de pago; nivel exacto de acceso gratuito no confirmado con precisión en las fuentes)
- 💡 Un desarrollador puede elegir la variante **Luna** para tareas rápidas y económicas, y **Sol** para razonamiento complejo, dentro del mismo flujo de trabajo.
- 🔗 openai.com/index/gpt-5-6 · corroborado por 9to5Mac, CNBC (8-10 jul)

> ⚠️ No se encontraron más novedades propias de OpenAI/ChatGPT confirmadas de forma independiente dentro de la ventana estricta (el changelog oficial de release notes no pudo verificarse con fecha exacta en este pase). Se menciona en fuentes secundarias un posible "ChatGPT Work agent" (9 jul, 9to5Mac) pero no se confirmó de forma adversarial — se excluye por precaución.

---

## 🔵 Google / Gemini

- 📌 **No se hallaron novedades verificables de Gemini/Google Apps** dentro de la ventana 3–10 julio 2026. La entrada más reciente del changelog oficial (gemini.google/release-notes) es del **30 de junio de 2026** (Gemini Spark en macOS), fuera de rango.
- Nota: existe una actualización relacionada de "Fill with Gemini" en Google Sheets fechada 7 de julio, pero vive en el blog de Google Workspace Updates (no en el changelog de Gemini Apps), por lo que queda fuera de esta cobertura estricta.
- 🔗 gemini.google/release-notes

---

## 🟦 Microsoft Copilot (365)

- 📌 **No se hallaron novedades verificables de Microsoft 365 Copilot** dentro de la ventana. El changelog oficial muestra su última sección fechada el **1 de julio de 2026**, dos días antes del inicio de la ventana.
- 🔗 learn.microsoft.com/microsoft-365/copilot/release-notes

---

## ⚪ xAI / Grok

### 8. Grok 4.5
- 📅 **8 de julio de 2026** *(fuente oficial de xAI no pudo verificarse directamente en este pase; corroborado por dos medios independientes con detalles consistentes — tratar con cautela moderada)*
- 📌 xAI lanza **Grok 4.5**, descrito por Elon Musk como modelo **"clase Opus"** pero más rápido y económico. Orientado a **coding y tareas agénticas**, entrenado en colaboración con Cursor. Precio reportado: ~$2/$6 por millón de tokens input/output.
- 🌍 Global
- 💳 De pago (acceso vía API/planes X Premium+; nivel exacto no confirmado con fuente primaria)
- 💡 Un equipo de desarrollo podría probarlo como alternativa de menor coste para tareas agénticas de codificación de alto volumen.
- 🔗 TechCrunch (8 jul), Axios (8 jul) — anuncio oficial en x.ai/news/grok-4-5 no verificado de forma independiente en este pase

---

## 🟠 Mistral AI

### 9. Robostral Navigate
- 📅 **8 de julio de 2026**
- 📌 Primer modelo de Mistral para **navegación embebida (embodied navigation)**: modelo de robótica de **8B parámetros** que guía robots para ejecutar tareas en lenguaje natural usando **una sola cámara RGB**. Resultados de vanguardia en el benchmark R2R-CE (76.6% de éxito en validación no vista).
- 🌍 Global (open weights)
- 💳 Gratuito / open weights
- 💡 Un laboratorio de robótica puede integrar Robostral Navigate para que un robot móvil siga instrucciones como "ve a la cocina y busca la taza roja" usando solo una cámara.
- 🔗 mistral.ai/news/robostral-navigate

### 10. Mistral Studio
- 📅 **9 de julio de 2026**
- 📌 Nueva función **"Studio"**: sistema de registro versionado para **prompts y skills de IA**, con propiedad, trazabilidad y despliegue controlado mediante etiquetas.
- 🌍 Global
- 💳 Disponible en la plataforma Mistral (nivel de suscripción exacto no confirmado con precisión)
- 💡 Un equipo puede versionar un prompt de producción, probar una nueva versión en un entorno "staging" y desplegarla solo cuando pase las pruebas, sin perder el historial.
- 🔗 mistral.ai/news/manage-prompts-and-skills-in-studio

### 11. Leanstral 1.5 *(cobertura débil — un solo medio secundario, sin fuente primaria verificada en este pase)*
- 📅 **3 de julio de 2026** *(no confirmado por fuente oficial de Mistral en este pase)*
- 📌 Modelo de agente de código para **demostración de teoremas en Lean 4**, con pesos abiertos bajo **Apache 2.0**; resolvió 587 de 672 problemas de PutnamBench según la fuente.
- 🌍 Global (open weights)
- 💳 Gratuito / open weights, con endpoint de API gratuito según la fuente
- 💡 Investigadores en matemática formal podrían usarlo para acelerar la formalización de demostraciones en Lean 4.
- 🔗 marktechpost.com (3 jul) — pendiente de confirmación en mistral.ai/news

---

## 🟢 GitHub Copilot / herramientas de codificación asistida

### 12. GPT-5.6 (Sol/Terra/Luna) disponible en Copilot
- 📅 **9 de julio de 2026**
- 📌 GitHub Copilot suma soporte para los tres modelos de la familia **GPT-5.6**, permitiendo elegir modelo según la tarea (velocidad vs. capacidad).
- 🌍 Global
- 💳 Requiere plan de pago de Copilot (tier exacto no especificado en la fuente)
- 💡 Cambiar a **Luna** para autocompletado rápido y a **Sol** para refactors complejos, dentro del mismo IDE.
- 🔗 github.blog/changelog/2026-07-09-openais-gpt-5-6-sol-terra-and-luna-are-now-available-in-github-copilot

### 13. Kimi K2.7 llega a Copilot Business/Enterprise
- 📅 **7 de julio de 2026**
- 📌 El modelo **Kimi K2.7** de Moonshot AI, antes solo en planes individuales (Pro/Pro+/Max desde el 1 jul), se expande a **Copilot Business y Enterprise**, con habilitación requerida por administradores.
- 🌍 Global
- 💳 Planes **Copilot Business / Enterprise** (requiere activación de admin)
- 💡 Un administrador de una empresa puede habilitar Kimi K2.7 para que su equipo lo compare con GPT y Claude en tareas de codificación específicas.
- 🔗 github.blog/changelog/2026-07-07-kimi-k2-7-now-available-for-copilot-business-and-enterprise

### 14. Codex como proveedor de agentes en JetBrains + mejoras agénticas
- 📅 **7 de julio de 2026**
- 📌 GitHub Copilot en **JetBrains IDEs** (IntelliJ IDEA, PyCharm, WebStorm) incorpora **OpenAI Codex** como nuevo proveedor de agentes (vista previa pública), junto con soporte de **Hooks**, gestión ampliada de servidores **MCP**, modelos personalizados para admins de Business/Enterprise, y **disponibilidad general del Inline Chat**.
- 🌍 Global
- 💳 Vista previa pública gratuita; funciones de admin requieren Business/Enterprise
- 💡 Un desarrollador en PyCharm puede alternar entre el agente nativo de Copilot y Codex según qué modelo rinda mejor en su tarea concreta.
- 🔗 github.blog/changelog/2026-07-07-codex-as-agent-provider-and-agentic-enhancements-in-jetbrains-ides

### 15. Resumen de cambios VS Code (junio 2026) + GA de herramientas de navegador agéntico
- 📅 **8 de julio de 2026** (consolida cambios de finales de junio; la GA de herramientas de navegador se anunció originalmente el 1 de julio, un día fuera de la ventana estricta, pero se reconfirmó en esta entrada del 8 de julio)
- 📌 GitHub publica el resumen de cambios de **Copilot en VS Code** (versiones 1.123-1.127). Incluye la **disponibilidad general de herramientas de navegador agéntico**, activadas por defecto: los agentes pueden **navegar páginas, inspeccionar contenido, capturar screenshots y validar apps web** directamente desde VS Code.
- 🌍 Global
- 💳 Incluido en planes de pago de Copilot
- 💡 Un agente de Copilot puede abrir la app web que acabas de modificar, hacer clic en el nuevo botón y confirmar visualmente que funciona, sin que el desarrollador tenga que probarlo a mano.
- 🔗 github.blog/changelog/2026-07-08-github-copilot-in-visual-studio-code-june-2026-releases

> ❌ **Afirmación refutada y descartada:** "GitHub Copilot en VS Code ahora soporta ventana de contexto de 1M tokens para modelos Anthropic/OpenAI" — verificada 0-3 en el pase adversarial, no se incluye como confirmada.

---

## ⚫ Sin novedades verificadas esta semana (7 días estrictos)

- **Gemini / Google** — última entrada oficial: 30 jun 2026
- **Microsoft 365 Copilot** — última entrada oficial: 1 jul 2026
- **Kimi / Moonshot AI (canal propio)** — solo se confirmó su integración en GitHub Copilot, no un anuncio directo de Moonshot
- **Meta AI / Llama** — sin anuncios propios confirmados en la ventana
- **Cursor, Windsurf, Replit** — sin novedades propias confirmadas en la ventana (no descarta que existan; no fueron halladas/verificadas en este pase)

---

## 📈 Tendencias de la semana

1. **La "capa de personalización" se vuelve el nuevo campo de batalla.** Claude Reflect (Anthropic) apunta a que los usuarios entiendan y confíen más en su propio uso de IA — una jugada de retención más que de capacidad bruta.
2. **Los IDEs se están convirtiendo en "mercados de modelos".** GitHub Copilot suma GPT-5.6, Kimi K2.7 y Codex como proveedor en la misma semana — la competencia ya no es "qué IDE" sino "qué modelo dentro del IDE", y GitHub gana como plataforma neutral que agrega a todos los proveedores.
3. **Los agentes ganan "manos" fuera del chat.** Claude Cowork a móvil/web con sesiones remotas, y las herramientas de navegador agéntico de Copilot en GA, muestran que los agentes de código y de productividad están dejando de ser asistentes de texto para ejecutar tareas de forma semi-autónoma en el mundo real (archivos, navegador, dispositivos).
4. **La IA física/robótica gana tracción entre los grandes labs de LLM.** Robostral Navigate de Mistral confirma que los laboratorios de lenguaje están invirtiendo en robótica embebida, no solo en chat/código.
5. **Silencio notable de Google y Microsoft en sus changelogs "core" esta semana** — contrasta con el ritmo de lanzamientos de Anthropic, Mistral y el ecosistema Copilot, aunque esto puede reflejar ciclos de publicación distintos más que inactividad real.

---

## Metodología y limitaciones

- Proceso: 5 ángulos de búsqueda → 23 fuentes fetcheadas → 80 afirmaciones extraídas → 25 verificadas con voto adversarial 3 vías (mínimo 2/3 para confirmar) → 24 confirmadas, 1 refutada, 0 sin resolver.
- Los ítems marcados con ⚠️ tienen discrepancias de fecha entre fuentes primarias, sin resolver.
- Los ítems marcados con "cobertura débil" (Grok 4.5, Leanstral 1.5) se basan en fuentes secundarias corroboradas pero no fueron parte del lote de 25 afirmaciones verificadas adversarialmente en este pase — se incluyen con la advertencia explícita solicitada.
- La ausencia de novedades para una herramienta indica que no se hallaron/verificaron anuncios propios en la ventana con las fuentes consultadas, no que no existan.
