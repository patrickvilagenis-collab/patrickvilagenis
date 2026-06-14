# FSC — Integration contracts (the agent's public surface)

These are the stable inputs/outputs other ecosystem agents use. Treat them as the
agent's API. Everything is namespaced `fsc` and versioned `v1` (build-spec §4).

## HTTP endpoints (n8n webhooks)

| Method | Path | Auth | Purpose | Idempotent |
|--------|------|------|---------|------------|
| `POST` | `/fsc/v1/tickets` | none / light | Create a ticket (intake) | by `idempotency_key` |
| `GET`  | `/fsc/v1/tickets/:id` | role key **or** `?t=<access_token>` | Read one ticket | n/a |
| `GET`  | `/fsc/v1/tickets` | technician / supervisor | List tickets (`status`, `assigned_technician`, `priority` filters) | n/a |
| `POST` | `/fsc/v1/tickets/:id/transition` | technician / supervisor | Advance state | yes |

### Transition request body

```json
{
  "to_status": "On the way",
  "actor": "technician:carlos",
  "eta": "2026-06-14T15:30:00Z",
  "assigned_technician": "carlos",
  "priority": "high",
  "note": "optional free text"
}
```

`eta`/`assigned_technician`/`priority` are only required for the edges that need them
(see [DATA_SCHEMA](./DATA_SCHEMA.md) and build-spec §6.1).

### Error envelope

```json
{ "error": { "code": "ILLEGAL_TRANSITION", "message": "No se permite Triage → On site.", "fields": { } } }
```

Codes: `VALIDATION_FAILED` (422), `FORBIDDEN` (403), `ILLEGAL_TRANSITION` (409),
`NOT_FOUND` (404), `NOTIFY_FAILED` (notification only — never rolls back the state
change).

## Domain events (for future consumers)

Every successful transition emits one event. Envelope:

```json
{
  "event": "fsc.v1.ticket.dispatched",
  "ticket_id": "FSC-2026-000123",
  "occurred_at": "2026-06-14T10:05:00Z",
  "actor": "supervisor:ana",
  "data": { "...full ticket snapshot..." }
}
```

| Lifecycle boundary | Event name |
|--------------------|-----------|
| Intake (created) | `fsc.v1.ticket.created` |
| Triage | `fsc.v1.ticket.triaged` |
| Dispatch | `fsc.v1.ticket.dispatched` |
| On the way | `fsc.v1.ticket.enroute` |
| On site | `fsc.v1.ticket.onsite` |
| Close | `fsc.v1.ticket.closed` |

Events are delivered to the configured sink (`FSC_EVENT_WEBHOOK_URL`, optional) and/or
an `events` table. **Future agents subscribe to these events — they must not read the
datastore directly** (principle P1/P2).

### How a future agent connects

1. Subscribe to the event sink (point `FSC_EVENT_WEBHOOK_URL` at the agent, or read the
   `events` table).
2. React to the events it cares about (e.g. a billing agent acts on
   `fsc.v1.ticket.closed`).
3. If it needs to change a ticket, call the public HTTP endpoints with a role key —
   never write the datastore directly.

This keeps FSC replaceable and the ecosystem loosely coupled.
