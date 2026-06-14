# Desplegar el sistema REAL (alojado, multiusuario, con WhatsApp/SMS)

Esta guía pone en marcha el sistema de verdad: clientes reales crean avisos, tú y los
técnicos veis **los mismos tickets** desde cualquier dispositivo, y salen
**WhatsApp/SMS reales**. Todo se sirve como **un solo servicio web** (una sola URL):
el backend y las tres páginas (cliente / supervisor / técnico) juntos.

> ⚠️ GitHub Pages NO sirve para esto (solo archivos estáticos). Hace falta un hosting
> que ejecute el servidor. Aquí usamos **Render.com** como camino recomendado; el mismo
> `Dockerfile` funciona igual en Railway, Fly.io o un VPS.

---

## Qué cuentas necesitas (las creas tú)

1. **Hosting** — una cuenta en [Render.com](https://render.com) (u otro). Para que los
   datos **no se borren** al reiniciar hace falta un *disco persistente*, que en Render
   está en el plan **Starter** (de pago, ~7 $/mes). El plan Free no tiene disco: serviría
   para probar, pero perderías los tickets en cada reinicio.
2. **Mensajería (para WhatsApp/SMS real)** — lo más rápido es
   [Twilio](https://www.twilio.com): da SMS y un *sandbox* de WhatsApp para empezar en
   minutos. Para WhatsApp con tu propio número de empresa necesitas la
   **WhatsApp Cloud API** de Meta (más trámites: verificación de empresa).

---

## Paso 1 — Desplegar el servicio en Render (5 min)

Opción A — **Blueprint (recomendado, casi automático):**
1. En Render: **New + → Blueprint**.
2. Conecta este repositorio y rama `claude/sleepy-newton-16jg8i`. Render leerá
   `field-service-callback/render.yaml`.
3. Acepta crear el servicio y el disco. En **Environment**, rellena los valores secretos
   (ver tabla abajo). Deja `FSC_NOTIFY_PROVIDER=log` de momento.
4. **Deploy**. Cuando termine, copia la URL pública (p. ej.
   `https://field-service-callback.onrender.com`) y pégala en `FSC_BASE_URL`. Redeploy.

Opción B — **Manual:** New + → **Web Service** → este repo → Root Directory
`field-service-callback`, Runtime **Docker**, plan **Starter**, añade un **Disk** montado
en `/data` (1 GB), y define las variables de la tabla.

Al abrir tu URL verás la portada con tres botones: **Cliente**, **Supervisor**, **Técnico**.

---

## Paso 2 — Variables de entorno

| Variable | Obligatoria | Para qué |
|----------|-------------|----------|
| `FSC_BASE_URL` | sí | La URL pública del servicio; se usa en los enlaces de seguimiento del cliente. |
| `FSC_ROLE_KEY_SUPERVISOR` | sí | Clave para entrar como supervisor. Pon un secreto largo y aleatorio. |
| `FSC_ROLE_KEY_TECHNICIAN` | sí | Clave para los técnicos. Otro secreto. |
| `FSC_DATA_DIR` | sí (ya puesta) | `/data` — el disco persistente. |
| `FSC_LOCALE` | no | `es` (defecto) o `en`. |
| `FSC_NOTIFY_PROVIDER` | no | `log` (defecto, no envía) · `twilio` · `whatsapp_cloud`. |
| `FSC_NOTIFY_FROM` | si envías | Número remitente. Twilio SMS: `+1...`; Twilio WhatsApp: `whatsapp:+14155238886`. |
| `FSC_TWILIO_SID` | Twilio | Account SID de Twilio. |
| `FSC_TWILIO_TOKEN` | Twilio | Auth Token de Twilio. |
| `FSC_NOTIFY_API_KEY` | WA Cloud | Token de la WhatsApp Cloud API (si usas `whatsapp_cloud`). |
| `FSC_WA_PHONE_ID` | WA Cloud | Phone Number ID de la WhatsApp Cloud API. |

> Genera claves de rol fuertes, por ejemplo: `python3 -c "import secrets;print(secrets.token_urlsafe(24))"`.

---

## Paso 3 — Activar WhatsApp/SMS real

### Opción rápida: Twilio (SMS o WhatsApp sandbox)
1. Crea la cuenta en Twilio y copia **Account SID** y **Auth Token** (Console).
2. **SMS:** compra/usa un número Twilio y ponlo en `FSC_NOTIFY_FROM` (`+1...`).
   **WhatsApp sandbox:** en Twilio → Messaging → Try WhatsApp; tu `FSC_NOTIFY_FROM` será
   `whatsapp:+14155238886` y cada cliente debe unirse al sandbox una vez (Twilio te da el
   mensaje "join ...").
3. Pon `FSC_NOTIFY_PROVIDER=twilio` y las variables `FSC_TWILIO_SID`, `FSC_TWILIO_TOKEN`,
   `FSC_NOTIFY_FROM`. Redeploy.

### Opción producción: WhatsApp Cloud API (Meta)
1. Crea una app en Meta for Developers, añade WhatsApp, verifica tu empresa y número.
2. Copia el **token** y el **Phone Number ID**.
3. Pon `FSC_NOTIFY_PROVIDER=whatsapp_cloud`, `FSC_NOTIFY_API_KEY=<token>`,
   `FSC_WA_PHONE_ID=<id>`. Redeploy.

Si dejas `FSC_NOTIFY_PROVIDER=log`, el sistema funciona igual pero los avisos solo se
registran (no se envían) — útil para probar sin gastar.

---

## Paso 4 — Comprobar que va

1. Abre `TU_URL/` → pulsa **Cliente**, crea un aviso.
2. Abre `TU_URL/supervisor/` en otro dispositivo, entra con tu clave de supervisor:
   **debe aparecer el mismo ticket** → haz Triage y Asignar.
3. `TU_URL/technician/`, entra como técnico: avanza En camino → Llegada → Cerrar.
4. El cliente recibe los 5 avisos (si activaste Twilio/WhatsApp).

---

## Notas importantes (honestas)

- **Persistencia:** los tickets viven en el disco `/data`. Sin disco persistente (plan
  Free) se borran al reiniciar. Para volumen alto o varios procesos, migra a una base de
  datos (Postgres) y/o al orquestador n8n — el sistema ya está preparado para ello
  (`docs/INTEGRATION.md`).
- **Servidor:** el backend es ligero (Python stdlib). Es válido para el volumen de un
  taller/empresa pequeña; para gran escala conviene la opción n8n + base de datos.
- **Seguridad:** cambia SIEMPRE las claves de rol por secretos fuertes; el hosting te da
  HTTPS automático. El modelo v1 usa una clave compartida por rol (documentado en la
  spec §3.3); para identidades por usuario se añade después un agente de identidad.
- **Coste:** Render Starter ~7 $/mes + lo que consuma Twilio por mensaje. Empezar en
  `log` (sin Twilio) es gratis salvo el hosting.
