# FSC reference backend

A **zero-dependency** (Python stdlib only) implementation of the full `/fsc/v1`
contract. It lets you run the whole Field Service Callback system end to end —
intake form, technician page, supervisor view, lifecycle, and notifications —
**without n8n or any database**.

It plays two roles from one process (see `reference_server.py` header):

1. **Public API** `/fsc/v1/*` — full validation, the 6-phase state machine, role
   auth, and notification dispatch. This is what the web UIs talk to.
2. **Datastore** `/tickets/*` — thin persistence the n8n workflows write to. Point
   `FSC_DATASTORE_URL` here when you run the production n8n workflows; they share
   the same JSON store, so both modes interoperate.

Storage is a single JSON file at `../data/tickets.json`. Notifications are written to
`../data/notifications.log` and domain events to `../data/events.log` (swap
`_deliver()` for a real WhatsApp Cloud API / Twilio call). Nothing here is committed.

> This is a **reference** implementation for development and demos. For production,
> use a real datastore and the n8n orchestration layer (or harden this service).

## Run

```bash
cd field-service-callback/server
FSC_ROLE_KEY_TECHNICIAN=devtech \
FSC_ROLE_KEY_SUPERVISOR=devsup \
FSC_BASE_URL=http://localhost:8080 \
python3 reference_server.py
```

Then serve the web pages (any static server) and set `window.FSC_API_BASE` in each
page to `http://localhost:8080`. For example, from `field-service-callback/`:

```bash
python3 -m http.server 5500 --directory web
# open http://localhost:5500/intake/index.html  (set FSC_API_BASE = "http://localhost:8080")
```

## Configuration (env)

| Env var | Default | Purpose |
|---------|---------|---------|
| `FSC_PORT` | `8080` | Listen port |
| `FSC_DATA_DIR` | `../data` | Where the JSON store + logs live |
| `FSC_ROLE_KEY_TECHNICIAN` | `devtech` | Technician role key |
| `FSC_ROLE_KEY_SUPERVISOR` | `devsup` | Supervisor role key |
| `FSC_BASE_URL` | `http://localhost:8080` | Base URL used in status links inside messages |
| `FSC_LOCALE` | `es` | `es` or `en` message templates |

## Acceptance test (build spec §9.7)

With the server running:

```bash
python3 smoke_test.py
```

It drives the full lifecycle (Intake → Triage → Dispatch → On the way → On site →
Close + reopen) and asserts: ticket-id format, idempotent create, customer self-view,
illegal-transition rejection (409), forbidden-role rejection (403), required-field
enforcement for Dispatch (`assigned_technician`) and On the way (`eta`), a 6-entry audit
trail, and exactly-once notifications (T1–T5).
