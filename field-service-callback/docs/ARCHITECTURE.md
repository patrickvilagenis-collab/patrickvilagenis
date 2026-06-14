# FSC — Architecture & place in the ecosystem

The **Field Service Callback (FSC)** agent is the first modular agent of a larger
multi-agent ecosystem. It owns exactly one domain: capturing an equipment-failure
callback, routing it to a technician, and keeping the customer informed.

## Components

```
                 ┌────────────────────────────────────────────────┐
   Customer ───► │  Intake form (web/intake)                      │
                 │  Technician page (web/technician)              │ ── X-FSC-Role-Key
  Technician ──► │  Supervisor view (web/supervisor)              │ ── X-FSC-Role-Key
  Supervisor ─►  └───────────────┬────────────────────────────────┘
                                 │ HTTPS, /fsc/v1/* only (web/shared/api.js)
                                 ▼
                 ┌────────────────────────────────────────────────┐
                 │  n8n workflows (orchestration layer)           │
                 │   • intake          POST /tickets, GET reads   │
                 │   • status_update   POST /tickets/:id/transition│
                 │   • triage_dispatch (supervisor sub-workflow)  │
                 │   • notify          (WhatsApp/SMS sub-workflow) │
                 └───────┬───────────────────────────┬────────────┘
                         │ single source of truth     │ domain events
                         ▼                             ▼
                 ┌───────────────┐           ┌──────────────────────┐
                 │  Datastore    │           │  Event sink / webhook │ ──► future agents
                 │ (FSC_DATASTORE│           │ (FSC_EVENT_WEBHOOK_URL)│    (billing, etc.)
                 │  _URL)        │           └──────────────────────┘
                 └───────────────┘
                         │
                         ▼  WhatsApp Cloud API / Twilio
                  Customer phone (E.164)
```

## Design principles (build-spec §3.1)

- **P1 Single source of truth.** One datastore owns ticket state. UIs and workflows
  read/write through it; no surface keeps a private copy.
- **P2 Contract-first boundaries.** All cross-system interaction goes through the
  named contracts in [`INTEGRATION.md`](./INTEGRATION.md). Contracts stay
  backward-compatible within a major version.
- **P3 Stateless surfaces.** All business logic and state transitions live in the n8n
  layer. The HTML pages share one stylesheet and one API client (`web/shared/`).
- **P4 Idempotency.** Create is idempotent by `idempotency_key`; transitions are
  safe to retry and never double-send notifications.
- **P5 Namespaced & versioned.** Endpoints, events, env vars and config keys are
  prefixed `fsc` and versioned `v1`.

## Where future agents plug in

Future agents (scheduling, billing, inventory, CRM, identity) live as **sibling
roots** next to `field-service-callback/`, each with this same internal layout. They
**never read this datastore directly** — they subscribe to the domain events
(`fsc.v1.ticket.*`) and, if they need to act on a ticket, call the public HTTP
endpoints. The shared-secret role auth in v1 can be swapped for a dedicated identity
agent without touching any endpoint contract.
