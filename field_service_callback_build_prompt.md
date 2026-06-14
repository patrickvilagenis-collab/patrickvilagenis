# Field Service Callback System — Build Specification (Production-Ready)

> **Document type:** Build prompt / technical specification.
> **Audience:** A developer or n8n specialist who will implement the system end to end.
> **Goal of this document:** Be precise enough that the implementer can build the
> system correctly **without asking clarifying questions**.
>
> **Provenance note:** This is the refined, production-ready revision of the original
> `field_service_callback_build_prompt.md` build prompt. It preserves the original
> requirements and intent (6-phase ticket lifecycle; the `customer_name`,
> `equipment_type`, `symptom_description`, `status`, `assigned_technician`, `eta`
> fields; n8n workflows; HTML intake form; technician page; supervisor view; README;
> WhatsApp/SMS notifications; and the stated non-goals) and makes them unambiguous,
> technically specific, and ready for implementation. Where the original left a choice
> open, this revision selects one explicit default and labels it **DEFAULT** so the
> implementer is never blocked.

---

## 0. How to read this document

- **MUST / MUST NOT** = mandatory requirement. Non-negotiable for "done".
- **SHOULD** = strong recommendation; deviation requires a written note in the README.
- **MAY / DEFAULT** = chosen default to remove ambiguity; an implementer may substitute
  an equivalent only if the substitution is documented in the README.
- Field names, enum values, and event names are written in `code font` and are
  **case-sensitive**. Use them verbatim.
- "The system" = the Field Service Callback agent defined by this document.

---

## 1. Mission & system identity

The system is a **Field Service Callback agent**: a lightweight ticketing and
notification service that captures a customer's equipment-failure callback, routes it
to a technician, and keeps the customer informed by WhatsApp/SMS as the ticket moves
through its lifecycle.

It is **one modular agent inside a larger ecosystem** (see §3). It owns the
"field service callback" domain only. It exposes stable inputs, outputs, and state so
that other agents (scheduling, billing, inventory, CRM) can connect later **without
requiring this agent to be rewritten**.

The system has exactly three human-facing surfaces:

1. **Intake form** — public/customer- or agent-facing HTML form that creates a ticket.
2. **Technician page** — per-technician HTML view to see assigned tickets and advance
   their status.
3. **Supervisor view** — read-mostly HTML dashboard of all tickets and their states.

And one automation layer:

4. **n8n workflows** — the orchestration engine that owns state transitions, validation,
   persistence, and notifications.

---

## 2. Scope — what the system DOES and DOES NOT do

These are **explicit constraint statements**. The implementer MUST treat anything not
listed under "DOES" as out of scope unless this document says otherwise.

### 2.1 The system DOES

- **D1.** Accept new callback tickets via the intake form (§8.2).
- **D2.** Persist each ticket with the schema in §5 to a single source-of-truth datastore.
- **D3.** Move a ticket through the 6-phase lifecycle in §6, enforcing legal transitions.
- **D4.** Assign exactly one technician to a ticket (`assigned_technician`).
- **D5.** Let the assigned technician advance the ticket through the on-site phases.
- **D6.** Send WhatsApp/SMS notifications to the customer at the phase boundaries
  defined in §7.
- **D7.** Give supervisors a real-time read view of every ticket and its status.
- **D8.** Record an append-only audit trail of every state transition (who, when,
  from-state, to-state).
- **D9.** Expose its data and events through stable contracts (§4) for future ecosystem
  integration.

### 2.2 The system DOES NOT do (non-goals → hard constraints)

- **N1.** MUST NOT implement payments, invoicing, or billing. (Billing is a separate
  future agent; this system only emits the `ticket.closed` event it can consume.)
- **N2.** MUST NOT implement route optimization, technician scheduling, or calendar
  management. It records an `eta` and an `assigned_technician`; it does not compute them.
- **N3.** MUST NOT manage parts/inventory.
- **N4.** MUST NOT store customer authentication credentials or implement a customer
  login/account system. The intake form is anonymous-to-light-auth (§8.2.4).
- **N5.** MUST NOT send marketing messages. Notifications are strictly transactional
  and limited to the templates in §7.4.
- **N6.** MUST NOT support multi-technician assignment, sub-tickets, or ticket merging
  in this version.
- **N7.** MUST NOT build a native mobile app. The three surfaces are responsive web
  pages (§8.1).
- **N8.** MUST NOT delete tickets. Closure is a state, not a deletion (see §6, `Close`).

Any capability in §2.2 that becomes desired later is added as a **separate ecosystem
agent or a versioned extension**, never by relaxing these constraints in place.

---

## 3. Ecosystem architecture & extensibility

This system is the **first modular agent** of a multi-agent ecosystem. Everything below
exists so additional agents plug in later **without rework**.

### 3.1 Design principles (MUST follow)

- **P1 — Single source of truth.** One datastore owns ticket state. UIs and workflows
  read/write through it; no surface keeps its own private copy of state.
- **P2 — Contract-first boundaries.** All cross-system interaction happens through the
  named contracts in §4 (HTTP endpoints + event names + the data schema). Internal
  implementation MAY change; contracts MUST stay backward-compatible within a major
  version.
- **P3 — Stateless surfaces.** The HTML surfaces hold no business logic that another
  agent would need to duplicate. All state transitions go through the n8n layer.
- **P4 — Idempotency.** Every state-changing endpoint MUST be safe to retry: the same
  request with the same `ticket_id` + target state produces the same result and does
  not double-send notifications (§7.5).
- **P5 — Namespaced, versioned everything.** Endpoints, events, env vars, and config keys
  are namespaced with the agent id `fsc` (Field Service Callback) and carry a version,
  e.g. `fsc.v1.ticket.created`.

### 3.2 Folder / repository organization (MUST create this structure)

```
field-service-callback/
├── README.md                      # Operator + integrator guide (§9.5)
├── config/
│   ├── config.example.json        # All config keys with placeholder values (§3.4)
│   └── schema.json                # JSON Schema for the ticket object (§5, machine-readable)
├── data/
│   └── .gitkeep                   # Runtime datastore lives here; never committed
├── workflows/                     # n8n exports (one JSON per workflow)
│   ├── fsc_v1_intake.json
│   ├── fsc_v1_triage_dispatch.json
│   ├── fsc_v1_status_update.json
│   └── fsc_v1_notify.json
├── web/
│   ├── intake/index.html          # Intake form (§8.2)
│   ├── technician/index.html      # Technician page (§8.3)
│   ├── supervisor/index.html      # Supervisor view (§8.4)
│   └── shared/                     # Shared CSS/JS (one copy, no duplication — P3)
│       ├── styles.css
│       └── api.js                 # Thin client for the §4 endpoints
└── docs/
    ├── ARCHITECTURE.md            # This system's place in the ecosystem (§3)
    ├── DATA_SCHEMA.md             # Human-readable schema (mirrors §5)
    └── INTEGRATION.md             # How future agents connect (§4)
```

- The folder name `field-service-callback/` is the agent's root. Future agents live as
  **sibling roots** (e.g. `scheduling/`, `billing/`) under the same ecosystem repo or
  org, each following this same internal layout.

### 3.3 Access control (MUST implement at this granularity)

Three roles. Enforced at the n8n endpoint layer (not only hidden in the UI):

| Role | Can create tickets | Can read | Can change status | Allowed transitions |
|------|--------------------|----------|-------------------|---------------------|
| `customer`/`intake` | Yes (intake only) | Own ticket by token (§8.2.4) | No | none |
| `technician` | No | Tickets where `assigned_technician` = self | Yes | `Dispatch→On the way`, `On the way→On site`, `On site→Close` |
| `supervisor` | Yes | All tickets | Yes | all transitions, including `Triage`, `Dispatch` (assignment), and reopen-to-`Triage` |

- Authentication for `technician` and `supervisor` is a **per-role shared secret / API
  key passed as a header** (`X-FSC-Role-Key`) in v1 — **DEFAULT**, simplest that
  enforces the boundary. The README MUST document rotating these keys. A future identity
  agent can replace this without changing the endpoint contracts (P2).
- The role-key check MUST happen **server-side in n8n** before any state change.

### 3.4 Configuration (MUST be externalized; MUST NOT hardcode)

All operational values live in `config/config.example.json` (committed, with
placeholders) and a real `config/config.json` (gitignored). Every key is namespaced.
Environment variables override file config and take precedence.

| Config key | Env var | Type | Purpose |
|------------|---------|------|---------|
| `fsc.datastore.url` | `FSC_DATASTORE_URL` | string (URL) | Source-of-truth datastore connection |
| `fsc.notify.provider` | `FSC_NOTIFY_PROVIDER` | enum `whatsapp_cloud` \| `twilio` | Messaging provider (§7.2) |
| `fsc.notify.from` | `FSC_NOTIFY_FROM` | string (E.164) | Sender number |
| `fsc.notify.api_key` | `FSC_NOTIFY_API_KEY` | secret | Provider credential |
| `fsc.role_key.technician` | `FSC_ROLE_KEY_TECHNICIAN` | secret | Technician role key |
| `fsc.role_key.supervisor` | `FSC_ROLE_KEY_SUPERVISOR` | secret | Supervisor role key |
| `fsc.base_url` | `FSC_BASE_URL` | string (URL) | Public base URL for ticket links in messages |
| `fsc.locale` | `FSC_LOCALE` | enum `es` \| `en` | Notification template language (DEFAULT `es`) |

Secrets MUST NOT be committed. The README MUST list every key and how to set it.

---

## 4. Integration contracts (the system's public surface)

These are the stable inputs/outputs other ecosystem agents will use. Treat them as the
agent's API. All are namespaced `fsc` and versioned `v1`.

### 4.1 HTTP endpoints (n8n webhooks)

| Method | Path | Auth | Purpose | Idempotent |
|--------|------|------|---------|------------|
| `POST` | `/fsc/v1/tickets` | none/light | Create a ticket (intake) | by client-supplied `idempotency_key` |
| `GET`  | `/fsc/v1/tickets/:id` | role + token | Read one ticket | n/a |
| `GET`  | `/fsc/v1/tickets` | technician/supervisor | List tickets (filter by `status`, `assigned_technician`) | n/a |
| `POST` | `/fsc/v1/tickets/:id/transition` | technician/supervisor | Advance state; body `{ "to_status": "...", "actor": "...", "eta"?, "assigned_technician"? }` | yes (P4) |

- Request and response bodies MUST conform to the ticket schema (§5) / `config/schema.json`.
- Errors MUST return a structured body: `{ "error": { "code": "...", "message": "..." } }`
  with codes `VALIDATION_FAILED`, `ILLEGAL_TRANSITION`, `FORBIDDEN`, `NOT_FOUND`,
  `NOTIFY_FAILED` (notification failure does **not** roll back the state change — §7.5).

### 4.2 Domain events (emitted for future consumers)

Each successful transition MUST emit an event to an outbound sink (DEFAULT: append a row
to an `events` table + optional outgoing webhook `FSC_EVENT_WEBHOOK_URL` if configured).
Event envelope:

```json
{
  "event": "fsc.v1.ticket.<name>",
  "ticket_id": "FSC-2026-000123",
  "occurred_at": "2026-06-14T10:05:00Z",
  "actor": "supervisor:ana",
  "data": { "...full ticket snapshot per §5..." }
}
```

Event names (one per lifecycle boundary): `ticket.created`, `ticket.triaged`,
`ticket.dispatched`, `ticket.enroute`, `ticket.onsite`, `ticket.closed`.

- These events are the **only** sanctioned way future agents (billing, analytics,
  scheduling) learn about ticket activity. They MUST NOT read the datastore directly.

---

## 5. Data schema — the ticket object

The ticket is the system's single domain entity. The machine-readable copy lives in
`config/schema.json` (JSON Schema, draft 2020-12). The fields below are authoritative.

| Field | Type | Required | Default | Validation / constraints |
|-------|------|----------|---------|--------------------------|
| `ticket_id` | string | system-set | — | Format `FSC-YYYY-NNNNNN` (zero-padded sequence). Immutable. Primary key. |
| `customer_name` | string | **yes** | — | 2–80 chars after trim. Letters, spaces, `.'-`. Not blank. |
| `customer_phone` | string | **yes** | — | E.164 (`+` + 8–15 digits). Used as the notification destination. |
| `equipment_type` | enum | **yes** | — | One of: `hvac`, `refrigeration`, `electrical`, `plumbing`, `appliance`, `other`. Free-text detail goes in `symptom_description`. |
| `symptom_description` | string | **yes** | — | 5–1000 chars after trim. Plain text; HTML stripped/escaped on input (§8.5). |
| `status` | enum | system-set | `Intake` | One of the 6 lifecycle states: `Intake`, `Triage`, `Dispatch`, `On the way`, `On site`, `Close`. Verbatim, case-sensitive. |
| `assigned_technician` | string \| null | no | `null` | Technician identifier (id or handle). MUST be non-null before leaving `Dispatch`. |
| `eta` | string (ISO 8601) \| null | no | `null` | Datetime with timezone, e.g. `2026-06-14T15:30:00Z`. MUST be ≥ current time when set. MUST be set before/at `On the way`. |
| `customer_address` | string | no | `null` | 0–200 chars. Where the service occurs (not auto-routed — N2). |
| `priority` | enum | no | `normal` | `low` \| `normal` \| `high`. Set during `Triage`. |
| `access_token` | string | system-set | — | Opaque, unguessable (≥128-bit). Lets the customer view their own ticket without an account (N4). Never shown to other roles. |
| `created_at` | string (ISO 8601) | system-set | now | Immutable. |
| `updated_at` | string (ISO 8601) | system-set | now | Set on every write. |
| `audit_log` | array<AuditEntry> | system-set | `[]` | Append-only (§5.1). |

### 5.1 AuditEntry (sub-object, append-only)

| Field | Type | Notes |
|-------|------|-------|
| `at` | string (ISO 8601) | When the transition happened. |
| `actor` | string | `role:identifier`, e.g. `technician:carlos`, `supervisor:ana`, `system`. |
| `from_status` | enum \| null | Previous `status` (null for creation). |
| `to_status` | enum | New `status`. |
| `note` | string \| null | Optional free text (e.g. dispatch reason, close summary). |

### 5.2 Validation rules (MUST enforce server-side, not only in the browser)

- All `required` fields MUST be present and pass their constraints at `POST /tickets`;
  otherwise return `VALIDATION_FAILED` with a per-field message map.
- `status` MUST only be changed via the transition endpoint and only along legal edges
  (§6.2). Direct writes to `status` are forbidden.
- `eta` in the past, or `assigned_technician` null at `On the way`, MUST be rejected.
- Inputs MUST be trimmed; `symptom_description` and `customer_name` MUST be
  HTML-escaped before storage and before rendering (§8.5).

---

## 6. The 6-phase ticket lifecycle (state machine)

The lifecycle is a **finite state machine**. Each row gives the exact trigger, the
actions the system performs, the data that changes, and the event emitted.

### 6.1 Phases, triggers, actions, data changes

| # | State | Trigger (system event) | Actions performed | Data changes | Event emitted | Notify customer? |
|---|-------|------------------------|-------------------|--------------|---------------|------------------|
| 1 | `Intake` | `POST /fsc/v1/tickets` (form submit) | Validate (§5.2); generate `ticket_id`, `access_token`; persist | New ticket; `status=Intake`; `created_at`, `updated_at` set; audit `null→Intake` | `ticket.created` | **Yes** — "received" (§7.4 T1) |
| 2 | `Triage` | Supervisor classifies the ticket | Set `priority`; optionally enrich; validate completeness | `status=Triage`; `priority` set; `updated_at`; audit `Intake→Triage` | `ticket.triaged` | No |
| 3 | `Dispatch` | Supervisor assigns a technician | Require non-null `assigned_technician`; (optionally set provisional `eta`) | `status=Dispatch`; `assigned_technician` set; `updated_at`; audit `Triage→Dispatch` | `ticket.dispatched` | **Yes** — "assigned" (§7.4 T2) |
| 4 | `On the way` | Technician marks en route | Require `eta` set and ≥ now | `status=On the way`; `eta` set/confirmed; `updated_at`; audit `Dispatch→On the way` | `ticket.enroute` | **Yes** — "on the way + ETA" (§7.4 T3) |
| 5 | `On site` | Technician marks arrival | Record arrival time in audit `note` | `status=On site`; `updated_at`; audit `On the way→On site` | `ticket.onsite` | **Yes** — "technician arrived" (§7.4 T4) |
| 6 | `Close` | Technician (or supervisor) closes the ticket | Record resolution `note`; freeze ticket (read-only except reopen) | `status=Close`; `updated_at`; audit `On site→Close` | `ticket.closed` | **Yes** — "completed" (§7.4 T5) |

### 6.2 Legal transitions (the ONLY allowed edges)

```
Intake ──► Triage ──► Dispatch ──► On the way ──► On site ──► Close
                          ▲                                      │
                          └──────────── reopen (supervisor) ─────┘
```

- Forward edges only, one step at a time, **except**:
  - **Reopen:** a supervisor MAY move a `Close` ticket back to `Triage` (records audit
    `Close→Triage`, emits `ticket.triaged`). This is the only backward edge.
- Any other transition MUST be rejected with `ILLEGAL_TRANSITION`.
- Skipping states is forbidden (e.g. `Triage→On site` is illegal).
- Each transition MUST be **atomic**: persist state + append audit + emit event, or
  fail entirely (no partial writes). Notification send is **outside** the atomic boundary
  (§7.5).

---

## 7. Notification logic (WhatsApp / SMS)

### 7.1 When notifications fire

Notifications fire **only** on the lifecycle boundaries marked "Yes" in §6.1:
`ticket.created` (T1), `ticket.dispatched` (T2), `ticket.enroute` (T3),
`ticket.onsite` (T4), `ticket.closed` (T5). No other event sends a customer message
(N5). All five go to `customer_phone`.

### 7.2 Channel & provider

- DEFAULT channel: **WhatsApp** via WhatsApp Cloud API (`fsc.notify.provider =
  whatsapp_cloud`). If WhatsApp send fails or the number is not WhatsApp-reachable,
  the system MUST fall back to **SMS** via the same provider config (Twilio supported as
  alternate provider).
- The provider and credentials come from config (§3.4). The implementer MUST NOT
  hardcode numbers or keys.

### 7.3 Delivery requirements (technical precision)

- Each notification MUST include the ticket reference (`ticket_id`) and, where relevant,
  the customer view link `{fsc.base_url}/intake/status?id={ticket_id}&t={access_token}`.
- Messages MUST be rendered in `fsc.locale` (DEFAULT `es`; `en` available).
- Phone numbers MUST be normalized to E.164 before send.

### 7.4 Message templates (use verbatim; `{...}` are substitutions)

> Spanish (`es`) is the DEFAULT; English (`en`) equivalents in italics. Keep them
> transactional and ≤ 1024 chars.

- **T1 — created (`ticket.created`)**
  `Hola {customer_name}, recibimos tu solicitud de servicio para {equipment_type}. Tu número de ticket es {ticket_id}. Te avisaremos cuando asignemos un técnico. Seguimiento: {status_link}`
  *(“We received your service request… your ticket is {ticket_id}…”)*

- **T2 — dispatched (`ticket.dispatched`)**
  `{customer_name}, asignamos a {assigned_technician} a tu ticket {ticket_id}. Pronto te confirmaremos la hora estimada de llegada.`

- **T3 — en route (`ticket.enroute`)**
  `{assigned_technician} va en camino para tu ticket {ticket_id}. Hora estimada de llegada: {eta_local}.`

- **T4 — on site (`ticket.onsite`)**
  `{assigned_technician} ha llegado para atender tu ticket {ticket_id}.`

- **T5 — closed (`ticket.closed`)**
  `Tu servicio {ticket_id} se ha completado. Gracias por confiar en nosotros. Si el problema persiste, responde a este mensaje.`

`{eta_local}` MUST be formatted in the customer's local timezone if known, otherwise the
business timezone, with a clear human format (e.g. `14 jun 15:30`).

### 7.5 Failure handling (MUST implement)

- **Decoupled from state.** Sending a notification MUST NOT block or roll back a state
  transition. The transition commits first; the notify step runs after.
- **Retry.** On send failure, retry up to **3 times** with exponential backoff
  (5s, 15s, 45s).
- **Fallback.** If WhatsApp ultimately fails, attempt SMS once (if provider supports it).
- **Idempotency (P4).** Each `(ticket_id, event)` pair MUST send **at most one**
  successful customer message. Record a `notified_events` set per ticket; a retried
  transition that already notified MUST NOT re-send.
- **Dead-letter + visibility.** A notification that fails all retries MUST be recorded
  (status `NOTIFY_FAILED`, with reason) and surfaced in the supervisor view (§8.4) as a
  flag on the ticket. It MUST NOT silently disappear.
- The transition endpoint returns success for the state change even if the notification
  is still pending/failed; the response includes `"notification": "sent|pending|failed"`.

---

## 8. Web surfaces — requirements & success criteria

### 8.1 Cross-cutting UI requirements (apply to all three pages)

- **MUST be responsive and functional on iOS Safari 14+, Chrome on Android 10+, and the
  current and prior major versions of desktop Chrome, Edge, Firefox, and Safari.**
- Layout MUST be usable from 320px (small phone) to 1440px+ (desktop) with no horizontal
  scrolling and tap targets ≥ 44×44px.
- MUST be plain HTML/CSS/JS or a single lightweight framework; no build step required to
  open the pages (DEFAULT: vanilla HTML/CSS/JS + the shared `api.js` client). All three
  share one stylesheet and one API client (`web/shared/`) — no duplicated logic (P3).
- All data fetches go through the §4 endpoints; **no surface talks to the datastore
  directly** (P1).
- Accessibility: semantic HTML, labeled form controls, color contrast ≥ WCAG AA, keyboard
  operable.
- All user-supplied text MUST be escaped on render (§8.5).

### 8.2 Intake form (`web/intake/index.html`)

- **8.2.1 Fields (in order):** `customer_name`, `customer_phone`, `equipment_type`
  (select with the §5 enum), `symptom_description` (textarea), `customer_address`
  (optional). Each labeled; required fields marked.
- **8.2.2 Client validation** mirrors §5.2 (phone E.164 hint, lengths) for fast feedback,
  but the **server is authoritative** — never trust the client.
- **8.2.3 Submit** → `POST /fsc/v1/tickets`. On success, show the `ticket_id` and the
  status-tracking link; on `VALIDATION_FAILED`, show per-field errors inline.
- **8.2.4 Status view (`/intake/status`)** lets a customer view **their own** ticket
  using `id` + `access_token` from the link — no account, no password (N4). It shows
  current `status`, `assigned_technician` (if any), and `eta` (if any), read-only.
- **Success criteria:** A valid submission creates a ticket in `Intake`, returns a
  `ticket_id`, fires T1, and the status link shows the live status. An invalid submission
  shows clear per-field errors and creates nothing.

### 8.3 Technician page (`web/technician/index.html`)

- Authenticated by the technician role key (§3.3). Shows **only** tickets where
  `assigned_technician` = the logged-in technician, in states `Dispatch`, `On the way`,
  `On site` (closed tickets in a collapsible "recent" list).
- Each ticket card shows `ticket_id`, `customer_name`, `equipment_type`,
  `symptom_description`, `customer_address`, `eta`, current `status`.
- Action buttons reflect the **only legal next transition** for that ticket: a
  `Dispatch` ticket shows "Mark on the way" (requires entering/confirming `eta`);
  `On the way` shows "Mark arrived"; `On site` shows "Close" (with a resolution note).
- Buttons call `POST /tickets/:id/transition`. Illegal actions are never shown.
- **Success criteria:** A technician can move a ticket `Dispatch→On the way→On site→Close`,
  each step persists, fires the right event/notification, and the page reflects new state
  without a manual refresh (poll ≤ 30s or live update).

### 8.4 Supervisor view (`web/supervisor/index.html`)

- Authenticated by the supervisor role key. Shows **all** tickets with filters by
  `status`, `assigned_technician`, and `priority`, and a text search over
  `customer_name`/`ticket_id`.
- Supports the supervisor-only actions: `Intake→Triage` (set `priority`),
  `Triage→Dispatch` (assign `assigned_technician`, optional provisional `eta`), and
  reopen `Close→Triage`.
- MUST visibly flag any ticket with a failed notification (§7.5) and any ticket stuck in
  a state beyond a configurable threshold (DEFAULT: `Intake`/`Triage` > 2h) for triage
  follow-up.
- Read-real-time: reflects state changes from technicians within ≤ 30s.
- **Success criteria:** A supervisor sees every ticket and its true status, can triage and
  dispatch, assignment is enforced before leaving `Dispatch`, and notification failures
  are visible.

### 8.5 Input safety (all surfaces)

User text MUST be HTML-escaped on input (storage) and on output (render). The system MUST
NOT render raw user strings into the DOM. This blocks stored XSS via `customer_name` or
`symptom_description`.

---

## 9. Deliverables & success criteria ("done" definition)

The implementation is **done** only when every item below is met.

### 9.1 n8n workflows (`workflows/*.json`)

- Four exported workflows: **intake**, **triage_dispatch**, **status_update**, **notify**
  (names per §3.2).
- Each workflow: validates inputs (§5.2), enforces role + legal transition (§3.3, §6.2),
  writes atomically (§6.2), appends audit, and emits the domain event (§4.2).
- The **notify** workflow implements §7 in full (templates, retry/backoff, fallback,
  idempotency, dead-letter flag).
- **Done =** importing the four JSON files into a clean n8n instance with valid config
  reproduces the full lifecycle end to end with no manual node edits.

### 9.2 Intake form — done per §8.2 success criteria.

### 9.3 Technician page — done per §8.3 success criteria.

### 9.4 Supervisor view — done per §8.4 success criteria.

### 9.5 README (`README.md`) — done when it contains:

- One-paragraph description of the agent and its place in the ecosystem (§3).
- Prerequisites (n8n version, messaging provider account, datastore).
- Step-by-step setup: import workflows, fill `config/config.json` / env vars (every key
  in §3.4 listed), where to host the three HTML pages, how to set `fsc.base_url`.
- The data schema (link to `docs/DATA_SCHEMA.md` / §5) and the lifecycle diagram (§6.2).
- The integration contracts (§4) and how a future agent subscribes to events.
- How to rotate role keys and provider secrets.
- A "Scope / non-goals" section restating §2.2 so operators don't expect billing/scheduling.
- Troubleshooting: validation errors, illegal-transition errors, notification failures
  (where the dead-letter flag shows up).

### 9.6 Schema & docs

- `config/schema.json` (JSON Schema) matches §5 exactly and is what the workflows
  validate against (single source of schema truth).
- `docs/ARCHITECTURE.md`, `docs/DATA_SCHEMA.md`, `docs/INTEGRATION.md` present and
  consistent with this spec.

### 9.7 End-to-end acceptance test (MUST pass)

A scripted or documented run that: submits the intake form → ticket in `Intake` + T1 sent
→ supervisor triages → supervisor dispatches (assigns tech) + T2 → technician en route
(sets eta) + T3 → technician on site + T4 → technician closes + T5; verifies every audit
entry, every event, and exactly-once notification per boundary; and confirms an illegal
transition and a missing-required-field are both rejected with structured errors.

---

## 10. Recommended implementation sequence (build in this order to minimize rework)

1. **Data schema first.** Author `config/schema.json` and `docs/DATA_SCHEMA.md` (§5).
   Everything else validates against this; locking it first prevents downstream churn.
2. **Config & folders.** Create the §3.2 structure and `config/config.example.json`
   (§3.4). Establishes namespacing and the integration contract surface early.
3. **Datastore + state machine core.** Stand up the single datastore (P1) and implement
   the transition logic and audit trail (§6) — the heart of the system.
4. **n8n workflows (intake → transitions → events).** Build intake, then
   triage_dispatch, then status_update; wire the §4 endpoints and event emission. Defer
   notifications.
5. **Notify workflow.** Add §7 last among workflows (templates, retry, fallback,
   idempotency, dead-letter) so it layers cleanly on stable transitions.
6. **HTML surfaces.** Build `web/shared/` (styles + api.js) once, then intake, technician,
   supervisor — each consuming the already-stable §4 endpoints.
7. **README + docs.** Write `README.md`, `ARCHITECTURE.md`, `INTEGRATION.md` against the
   finished contracts.
8. **End-to-end acceptance test (§9.7).** Run the full path; fix; re-run until green.

Rationale: schema and contracts are the expensive-to-change foundation; UIs and
notifications are leaves. Building leaves last means they're written against settled
interfaces, so there's nothing to redo.

---

## 11. Open defaults summary (every choice this doc made for you)

| Topic | DEFAULT chosen | Where to change |
|-------|----------------|-----------------|
| UI stack | Vanilla HTML/CSS/JS + shared `api.js` | §8.1 |
| Auth (v1) | Per-role shared key header `X-FSC-Role-Key` | §3.3 |
| Notification channel | WhatsApp Cloud API, SMS fallback | §7.2 |
| Locale | `es` (Spanish), `en` available | §3.4, §7.4 |
| Reopen | Supervisor only, `Close→Triage` | §6.2 |
| Stuck-ticket threshold | `Intake`/`Triage` > 2h flagged | §8.4 |
| Notify retries | 3× backoff 5/15/45s, then SMS, then dead-letter | §7.5 |

An implementer MAY substitute any DEFAULT with a documented equivalent in the README; all
**MUST** requirements stand regardless.
