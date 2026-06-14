# Field Service Callback (FSC) — Agent

FSC is a lightweight ticketing + notification agent. It captures a customer's
equipment-failure callback, routes it to a technician, and keeps the customer informed
by WhatsApp/SMS as the ticket moves through a 6-phase lifecycle. It is the **first
modular agent of a larger ecosystem** (see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).

This folder is a working scaffold that implements the build specification in
[`../field_service_callback_build_prompt.md`](../field_service_callback_build_prompt.md).

---

## What it does / does not do

**Does:** intake tickets, persist them, enforce a 6-phase lifecycle, assign one
technician, let technicians advance status, notify the customer at phase boundaries,
give supervisors a live read view, keep an append-only audit trail, and emit domain
events for future agents.

**Does NOT:** billing/payments, scheduling/route-optimization, inventory, customer
accounts/login, marketing messages, multi-technician assignment, native mobile apps, or
ticket deletion (closing is a state, not a delete). These are future ecosystem agents,
not extensions of FSC. (Full constraint list: build-spec §2.2.)

---

## Quickstart (run it now, no n8n needed)

A zero-dependency reference backend in [`server/`](server/) implements the full
`/fsc/v1` contract, so you can run the whole system end to end immediately:

```bash
# 1. Backend — serves the API AND the three web pages on one URL (Python stdlib only)
cd server
FSC_ROLE_KEY_TECHNICIAN=devtech FSC_ROLE_KEY_SUPERVISOR=devsup \
FSC_BASE_URL=http://localhost:8080 python3 reference_server.py

# 2. Open it: http://localhost:8080/  (landing -> Cliente / Supervisor / Técnico)

# 3. End-to-end acceptance test (build spec §9.7)
python3 smoke_test.py
```

The backend serves both the web UI and the API (same origin), so no second server is
needed. It also doubles as the thin datastore behind n8n (it serves the `/tickets/*`
storage paths too), so both modes share one store. See [`server/README.md`](server/README.md).

### Deploy it for real (hosted, multi-user, real WhatsApp/SMS)

To let real customers submit, share one dashboard across devices, and send real
WhatsApp/SMS, deploy the single-service `Dockerfile` (one URL = API + UI). Step-by-step
runbook (Render/Twilio/WhatsApp Cloud, env vars, persistence, costs):
**[`server/DEPLOY.md`](server/DEPLOY.md)**. A Render blueprint is in [`render.yaml`](render.yaml).

## Prerequisites

- **n8n** ≥ 1.x (self-hosted or cloud) to import the four workflows.
- A **datastore** exposing a small REST surface at `FSC_DATASTORE_URL`:
  - `POST /tickets`, `GET /tickets/:id`, `GET /tickets`, `PUT /tickets/:id`,
    `PATCH /tickets/:id/notification`. Any backend works (n8n + Postgres, Supabase,
    a tiny service) as long as it stores the [ticket schema](config/schema.json).
- A **messaging provider**: WhatsApp Cloud API (default) or Twilio.
- Static hosting (or n8n static serving / any web server) for the three HTML pages.

---

## Setup

### 1. Configure

Copy the example config and fill it in (never commit the real file):

```bash
cp config/config.example.json config/config.json
```

| Config key | Env var | Purpose |
|------------|---------|---------|
| `fsc.datastore.url` | `FSC_DATASTORE_URL` | Datastore base URL |
| `fsc.notify.provider` | `FSC_NOTIFY_PROVIDER` | `whatsapp_cloud` (default) or `twilio` |
| `fsc.notify.from` | `FSC_NOTIFY_FROM` | Sender number / WhatsApp phone-number id |
| `fsc.notify.api_key` | `FSC_NOTIFY_API_KEY` | Provider credential (secret) |
| `fsc.role_key.technician` | `FSC_ROLE_KEY_TECHNICIAN` | Technician role key (secret) |
| `fsc.role_key.supervisor` | `FSC_ROLE_KEY_SUPERVISOR` | Supervisor role key (secret) |
| `fsc.base_url` | `FSC_BASE_URL` | Public base URL used in message links |
| `fsc.locale` | `FSC_LOCALE` | `es` (default) or `en` |
| `fsc.event_webhook_url` | `FSC_EVENT_WEBHOOK_URL` | Optional outbound event sink |

Environment variables override the file and take precedence. The n8n workflows read
the `FSC_*` env vars, so set those in your n8n environment.

### 2. Import the workflows

Import all four JSON files from `workflows/` into n8n:

- `fsc_v1_intake.json` — owns `POST /fsc/v1/tickets` (create) + the GET reads.
- `fsc_v1_status_update.json` — owns `POST /fsc/v1/tickets/:id/transition`
  (the complete transition engine for every legal edge).
- `fsc_v1_triage_dispatch.json` — sub-workflow (Execute-Workflow trigger): the
  canonical supervisor-edge validator/enricher. `status_update` already embeds the
  equivalent rules; this file is the reusable, separately-callable unit.
- `fsc_v1_notify.json` — sub-workflow: builds the message, sends via WhatsApp with
  3× retry (5/15/45s backoff), falls back to SMS once, enforces exactly-once per
  `(ticket, event)`, and dead-letters failures.

The workflows reference the notify sub-workflow by the fixed id `fsc_v1_notify`, so
importing all four preserves the wiring. Activate the two webhook workflows.

### 3. Host the web pages

Serve `web/` from any static host. In each page set the API base once:

```html
<script>window.FSC_API_BASE = "https://fsc.example.com";</script>
```

(leave empty for same-origin). Set `FSC_BASE_URL` to this same public URL so the
status-tracking links in messages resolve.

### 4. Rotating secrets

Role keys and the provider key are plain secrets in v1. To rotate: change the
`FSC_ROLE_KEY_*` / `FSC_NOTIFY_API_KEY` env vars in n8n and redistribute the role keys
to staff. A future identity agent can replace this without changing any endpoint.

---

## Lifecycle (6 phases)

```
Intake ─► Triage ─► Dispatch ─► On the way ─► On site ─► Close
              ▲                                            │
              └──────────── reopen (supervisor) ───────────┘
```

| Phase | Who | Notifies customer | Event |
|-------|-----|-------------------|-------|
| Intake | system (form) | ✅ T1 received | `ticket.created` |
| Triage | supervisor | — | `ticket.triaged` |
| Dispatch | supervisor (assigns tech) | ✅ T2 assigned | `ticket.dispatched` |
| On the way | technician (sets eta) | ✅ T3 en route + ETA | `ticket.enroute` |
| On site | technician | ✅ T4 arrived | `ticket.onsite` |
| Close | technician / supervisor | ✅ T5 completed | `ticket.closed` |

Full data schema: [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) ·
Contracts for future agents: [`docs/INTEGRATION.md`](docs/INTEGRATION.md).

---

## Browser support

The three surfaces are responsive and functional on iOS Safari 14+, Chrome on
Android 10+, and current + prior major desktop Chrome/Edge/Firefox/Safari, usable from
320px to 1440px+ with ≥44px tap targets.

---

## Troubleshooting

- **`VALIDATION_FAILED`** — a required field failed a rule; the response `fields` map
  names each one. The intake form shows these inline.
- **`ILLEGAL_TRANSITION` (409)** — you tried to skip a phase or go backward. Only the
  edges in the lifecycle diagram are allowed (reopen is supervisor-only).
- **`FORBIDDEN` (403)** — wrong/missing `X-FSC-Role-Key`, or the role isn't allowed
  that transition (e.g. a technician trying to dispatch).
- **Notification failed** — the state change still succeeded (notifications are
  decoupled). The ticket gets `notification_status: "failed"` and shows a ⚠ flag in the
  supervisor view. Re-check the provider key and that the number is WhatsApp-reachable.

---

## Scope / non-goals

Restating the hard constraints so operators set expectations correctly: FSC does **not**
do billing, scheduling/routing, inventory, customer login, marketing, multi-tech
assignment, native apps, or deletion. Anything in that list arrives later as a separate
ecosystem agent. See build-spec §2.2.
