# FSC — Data Schema (human-readable)

This mirrors the authoritative machine-readable schema in
[`config/schema.json`](../config/schema.json) and the build spec §5. If the two
ever disagree, **`config/schema.json` wins** and this file must be corrected.

## Ticket object

| Field | Type | Required | Default | Validation / constraints |
|-------|------|----------|---------|--------------------------|
| `ticket_id` | string | system-set | — | `FSC-YYYY-NNNNNN` (zero-padded). Immutable. Primary key. |
| `customer_name` | string | yes | — | 2–80 chars after trim. Letters, spaces, `.'-`. |
| `customer_phone` | string | yes | — | E.164 (`+` + 8–15 digits). Notification destination. |
| `equipment_type` | enum | yes | — | `hvac` \| `refrigeration` \| `electrical` \| `plumbing` \| `appliance` \| `other`. |
| `symptom_description` | string | yes | — | 5–1000 chars. HTML-escaped on input. |
| `status` | enum | system-set | `Intake` | `Intake` \| `Triage` \| `Dispatch` \| `On the way` \| `On site` \| `Close`. Case-sensitive. |
| `assigned_technician` | string \| null | no | `null` | Non-null required before leaving `Dispatch`. |
| `eta` | ISO 8601 \| null | no | `null` | Must be ≥ now when set. Required by `On the way`. |
| `customer_address` | string \| null | no | `null` | 0–200 chars. |
| `priority` | enum | no | `normal` | `low` \| `normal` \| `high`. Set during `Triage`. |
| `access_token` | string | system-set | — | Opaque ≥128-bit. Customer self-view only. Never shown to staff. |
| `created_at` | ISO 8601 | system-set | now | Immutable. |
| `updated_at` | ISO 8601 | system-set | now | Set on every write. |
| `notified_events` | string[] | system-set | `[]` | Exactly-once notification guard (§7.5). |
| `notification_status` | enum \| null | system-set | `null` | `sent` \| `pending` \| `failed`. `failed` flagged in supervisor view. |
| `audit_log` | AuditEntry[] | system-set | `[]` | Append-only. |

## AuditEntry

| Field | Type | Notes |
|-------|------|-------|
| `at` | ISO 8601 | When the transition happened. |
| `actor` | string | `role:identifier` (`technician:carlos`, `supervisor:ana`, `system`). |
| `from_status` | enum \| null | Previous status (`null` on creation). |
| `to_status` | enum | New status. |
| `note` | string \| null | Optional free text. |

## Validation is server-side

Every rule above is enforced in the n8n workflows (`Validate & Build Ticket`,
`Validate edge & build patch`), **not** only in the browser. Client-side checks
exist for fast feedback; the server is authoritative.
