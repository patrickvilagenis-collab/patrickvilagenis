#!/usr/bin/env python3
"""
FSC reference backend — a zero-dependency implementation of the full /fsc/v1 contract.

Why this exists
---------------
The n8n workflows in ../workflows are the production orchestration layer; they expect a
small datastore REST API at FSC_DATASTORE_URL. This single file plays BOTH roles so the
system runs end to end with nothing else installed:

  1. Public API  (/fsc/v1/*)  — full validation, the 6-phase state machine, role auth,
                                 and notification dispatch. Lets you run the web UIs and
                                 the whole lifecycle WITHOUT n8n.
  2. Datastore   (/tickets/*) — thin persistence the n8n workflows write to when you do
                                 run them. Same store, so both modes share data.

It is a *reference* (in-process JSON-file store, stdlib only) — swap it for a real
datastore/n8n in production. Logic mirrors the build spec §5–§7 and the n8n Code nodes.

Run:
    FSC_ROLE_KEY_TECHNICIAN=devtech FSC_ROLE_KEY_SUPERVISOR=devsup \
    FSC_BASE_URL=http://localhost:8080 python3 reference_server.py
"""
import json
import os
import re
import sys
import threading
import secrets
import datetime
import html
import mimetypes
import base64
import urllib.request
import urllib.parse
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# ---------------------------------------------------------------------------
# Config (env-first, matches build spec §3.4)
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("FSC_DATA_DIR", os.path.join(os.path.dirname(HERE), "data"))
WEB_DIR = os.path.join(os.path.dirname(HERE), "web")
STORE_PATH = os.path.join(DATA_DIR, "tickets.json")
NOTIFY_LOG = os.path.join(DATA_DIR, "notifications.log")
EVENTS_LOG = os.path.join(DATA_DIR, "events.log")

CFG = {
    "role_key_technician": os.environ.get("FSC_ROLE_KEY_TECHNICIAN", "devtech"),
    "role_key_supervisor": os.environ.get("FSC_ROLE_KEY_SUPERVISOR", "devsup"),
    "base_url": os.environ.get("FSC_BASE_URL", "http://localhost:8080"),
    "locale": os.environ.get("FSC_LOCALE", "es"),
    "port": int(os.environ.get("FSC_PORT") or os.environ.get("PORT") or "8080"),
    # Notification delivery (real WhatsApp/SMS when configured; otherwise just logs).
    "notify_provider": os.environ.get("FSC_NOTIFY_PROVIDER", "log"),  # log | twilio | whatsapp_cloud
    "notify_from": os.environ.get("FSC_NOTIFY_FROM", ""),
    "twilio_sid": os.environ.get("FSC_TWILIO_SID", ""),
    "twilio_token": os.environ.get("FSC_TWILIO_TOKEN", ""),
    "wa_token": os.environ.get("FSC_NOTIFY_API_KEY", ""),
    "wa_phone_id": os.environ.get("FSC_WA_PHONE_ID", ""),
}

EQUIPMENT = {"hvac", "refrigeration", "electrical", "plumbing", "appliance", "other"}
LIFECYCLE = ["Intake", "Triage", "Dispatch", "On the way", "On site", "Close"]
PHONE_RE = re.compile(r"^\+[1-9][0-9]{7,14}$")

# Legal edges: from -> { to: allowed_roles } (spec §6.2)
LEGAL = {
    "Intake": {"Triage": {"supervisor"}},
    "Triage": {"Dispatch": {"supervisor"}},
    "Dispatch": {"On the way": {"technician", "supervisor"}},
    "On the way": {"On site": {"technician", "supervisor"}},
    "On site": {"Close": {"technician", "supervisor"}},
    "Close": {"Triage": {"supervisor"}},  # reopen
}
EVENT_OF = {
    "Triage": "fsc.v1.ticket.triaged",
    "Dispatch": "fsc.v1.ticket.dispatched",
    "On the way": "fsc.v1.ticket.enroute",
    "On site": "fsc.v1.ticket.onsite",
    "Close": "fsc.v1.ticket.closed",
}
TEMPLATE_OF = {"Dispatch": "T2", "On the way": "T3", "On site": "T4", "Close": "T5"}

_LOCK = threading.Lock()


# ---------------------------------------------------------------------------
# Persistence (single JSON file under data/, guarded by a lock)
# ---------------------------------------------------------------------------
def _load():
    if not os.path.exists(STORE_PATH):
        return {"seq": 0, "by_id": {}, "by_idem": {}}
    with open(STORE_PATH, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _save(store):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp = STORE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(store, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, STORE_PATH)


def _now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def _append_log(path, obj):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(obj, ensure_ascii=False) + "\n")


class ApiError(Exception):
    def __init__(self, status, code, message, fields=None):
        self.status = status
        self.body = {"error": {"code": code, "message": message}}
        if fields:
            self.body["error"]["fields"] = fields


# ---------------------------------------------------------------------------
# Domain logic
# ---------------------------------------------------------------------------
def _validate_intake(body):
    esc = lambda v: html.escape(str(v), quote=True)
    data = {
        "customer_name": (body.get("customer_name") or "").strip(),
        "customer_phone": (body.get("customer_phone") or "").strip(),
        "equipment_type": (body.get("equipment_type") or "").strip(),
        "symptom_description": (body.get("symptom_description") or "").strip(),
        "customer_address": (body.get("customer_address") or "").strip() or None,
    }
    fields = {}
    if not (2 <= len(data["customer_name"]) <= 80):
        fields["customer_name"] = "Nombre de 2 a 80 caracteres."
    if not PHONE_RE.match(data["customer_phone"]):
        fields["customer_phone"] = "Teléfono en formato E.164 (+34600111222)."
    if data["equipment_type"] not in EQUIPMENT:
        fields["equipment_type"] = "Tipo de equipo no válido."
    if not (5 <= len(data["symptom_description"]) <= 1000):
        fields["symptom_description"] = "Descripción de 5 a 1000 caracteres."
    if data["customer_address"] and len(data["customer_address"]) > 200:
        fields["customer_address"] = "Dirección máx. 200 caracteres."
    if fields:
        raise ApiError(422, "VALIDATION_FAILED", "Datos no válidos.", fields)
    # HTML-escape free text on storage (spec §8.5)
    data["customer_name"] = esc(data["customer_name"])
    data["symptom_description"] = esc(data["symptom_description"])
    if data["customer_address"]:
        data["customer_address"] = esc(data["customer_address"])
    return data


def create_ticket(body):
    data = _validate_intake(body)
    idem = body.get("idempotency_key")
    with _LOCK:
        store = _load()
        if idem and idem in store["by_idem"]:
            return store["by_id"][store["by_idem"][idem]]  # idempotent replay (P4)
        store["seq"] += 1
        year = datetime.datetime.now(datetime.timezone.utc).year
        ticket_id = "FSC-%d-%06d" % (year, store["seq"])
        now = _now()
        ticket = {
            "ticket_id": ticket_id,
            "customer_name": data["customer_name"],
            "customer_phone": data["customer_phone"],
            "equipment_type": data["equipment_type"],
            "symptom_description": data["symptom_description"],
            "status": "Intake",
            "assigned_technician": None,
            "eta": None,
            "customer_address": data["customer_address"],
            "priority": "normal",
            "access_token": secrets.token_urlsafe(24),
            "created_at": now,
            "updated_at": now,
            "notified_events": [],
            "notification_status": None,
            "audit_log": [{"at": now, "actor": "system", "from_status": None,
                           "to_status": "Intake", "note": "created via intake form"}],
        }
        store["by_id"][ticket_id] = ticket
        if idem:
            store["by_idem"][idem] = ticket_id
        _save(store)
    emit_event("fsc.v1.ticket.created", ticket, "system")
    notify(ticket, "T1", "fsc.v1.ticket.created")
    return ticket


def transition(ticket_id, body, role):
    to = body.get("to_status")
    actor = body.get("actor") or ""
    with _LOCK:
        store = _load()
        ticket = store["by_id"].get(ticket_id)
        if not ticket:
            raise ApiError(404, "NOT_FOUND", "Ticket no encontrado.")
        frm = ticket["status"]
        allowed = LEGAL.get(frm, {}).get(to)
        if allowed is None:
            raise ApiError(409, "ILLEGAL_TRANSITION", "No se permite %s -> %s." % (frm, to))
        if role not in allowed:
            raise ApiError(403, "FORBIDDEN", "El rol %s no puede %s -> %s." % (role, frm, to))

        now = _now()
        patch = {"status": to, "updated_at": now}
        if to == "Triage":
            patch["priority"] = body.get("priority") if body.get("priority") in {"low", "normal", "high"} else ticket.get("priority", "normal")
            if frm == "Close":  # reopen reset
                patch["assigned_technician"] = None
                patch["eta"] = None
        if to == "Dispatch":
            if not body.get("assigned_technician"):
                raise ApiError(422, "VALIDATION_FAILED", "assigned_technician es obligatorio para Dispatch.",
                               {"assigned_technician": "Obligatorio."})
            patch["assigned_technician"] = body["assigned_technician"]
            if body.get("eta"):
                patch["eta"] = body["eta"]
        if to == "On the way":
            eta = body.get("eta") or ticket.get("eta")
            if not eta or _is_past(eta):
                raise ApiError(422, "VALIDATION_FAILED", "eta válida (>= ahora) es obligatoria para On the way.",
                               {"eta": "Obligatoria y futura."})
            patch["eta"] = eta

        ticket.update(patch)
        ticket["audit_log"].append({"at": now, "actor": actor, "from_status": frm,
                                    "to_status": to, "note": body.get("note")})
        store["by_id"][ticket_id] = ticket
        _save(store)

    emit_event(EVENT_OF[to], ticket, actor)
    tpl = TEMPLATE_OF.get(to)
    note_result = "none"
    if tpl:
        note_result = notify(ticket, tpl, EVENT_OF[to])
    return ticket, note_result


def _is_past(iso):
    try:
        dt = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt < datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=1)
    except Exception:
        return True


def emit_event(name, ticket, actor):
    _append_log(EVENTS_LOG, {"event": name, "ticket_id": ticket["ticket_id"],
                             "occurred_at": _now(), "actor": actor, "data": ticket})


def notify(ticket, template, event_name):
    """Build + 'send' the customer message. Exactly-once per (ticket,event) (§7.5).
    Reference 'send' writes to notifications.log; swap _deliver() for a real provider."""
    if not template:
        return "none"
    with _LOCK:
        store = _load()
        t = store["by_id"][ticket["ticket_id"]]
        if event_name in t.get("notified_events", []):
            return "skipped"  # idempotency guard
        body = _render_message(t, template)
        try:
            _deliver(t["customer_phone"], body)
            status = "sent"
            print("[notify] %s -> %s via %s : OK" % (event_name, t["customer_phone"], CFG["notify_provider"]), flush=True)
        except Exception as exc:
            status = "failed"  # dead-letter; surfaced in supervisor view (§7.5)
            print("[notify] %s -> %s via %s : FAILED: %s" % (event_name, t["customer_phone"], CFG["notify_provider"], exc), file=sys.stderr, flush=True)
        if status == "sent":
            t.setdefault("notified_events", []).append(event_name)
        t["notification_status"] = status
        store["by_id"][ticket["ticket_id"]] = t
        _save(store)
    return status


def _deliver(phone, body):
    """Send the message via the configured provider; always log for audit/debug.
    Raises on provider failure (or misconfig) so notify() records 'failed' (§7.5)."""
    provider = CFG["notify_provider"]
    if provider == "twilio":
        if not (CFG["twilio_sid"] and CFG["twilio_token"] and CFG["notify_from"]):
            raise RuntimeError("provider=twilio pero faltan FSC_TWILIO_SID / FSC_TWILIO_TOKEN / FSC_NOTIFY_FROM")
        _deliver_twilio(phone, body)
    elif provider == "whatsapp_cloud":
        if not (CFG["wa_token"] and CFG["wa_phone_id"]):
            raise RuntimeError("provider=whatsapp_cloud pero faltan FSC_NOTIFY_API_KEY / FSC_WA_PHONE_ID")
        _deliver_whatsapp_cloud(phone, body)
    # provider == "log" -> no external send; just recorded below.
    _append_log(NOTIFY_LOG, {"at": _now(), "to": phone, "body": body, "provider": provider})


def _deliver_twilio(phone, body):
    """Twilio Messages API (SMS or WhatsApp). For WhatsApp set FSC_NOTIFY_FROM=whatsapp:+1...."""
    frm = CFG["notify_from"]
    to = phone
    if frm.startswith("whatsapp:") and not to.startswith("whatsapp:"):
        to = "whatsapp:" + to
    url = "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json" % CFG["twilio_sid"]
    data = urllib.parse.urlencode({"To": to, "From": frm, "Body": body}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    auth = base64.b64encode(("%s:%s" % (CFG["twilio_sid"], CFG["twilio_token"])).encode()).decode()
    req.add_header("Authorization", "Basic " + auth)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            r.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise RuntimeError("Twilio HTTP %s: %s" % (e.code, detail))


def _deliver_whatsapp_cloud(phone, body):
    """Meta WhatsApp Cloud API."""
    url = "https://graph.facebook.com/v19.0/%s/messages" % CFG["wa_phone_id"]
    payload = json.dumps({"messaging_product": "whatsapp", "to": phone.lstrip("+"),
                          "type": "text", "text": {"body": body}}).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Authorization", "Bearer " + CFG["wa_token"])
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=15) as r:
        r.read()


def _render_message(t, tpl):
    base = CFG["base_url"]
    link = "%s/intake/index.html?id=%s&t=%s" % (base, t["ticket_id"], t["access_token"])
    eta_local = t["eta"] or ""
    es = {
        "T1": "Hola %s, recibimos tu solicitud de servicio para %s. Tu número de ticket es %s. Te avisaremos cuando asignemos un técnico. Seguimiento: %s" % (t["customer_name"], t["equipment_type"], t["ticket_id"], link),
        "T2": "%s, asignamos a %s a tu ticket %s. Pronto te confirmaremos la hora estimada de llegada." % (t["customer_name"], t["assigned_technician"], t["ticket_id"]),
        "T3": "%s va en camino para tu ticket %s. Hora estimada de llegada: %s." % (t["assigned_technician"], t["ticket_id"], eta_local),
        "T4": "%s ha llegado para atender tu ticket %s." % (t["assigned_technician"], t["ticket_id"]),
        "T5": "Tu servicio %s se ha completado. Gracias por confiar en nosotros. Si el problema persiste, responde a este mensaje." % t["ticket_id"],
    }
    en = {
        "T1": "Hi %s, we received your service request for %s. Your ticket is %s. We'll let you know when a technician is assigned. Track it: %s" % (t["customer_name"], t["equipment_type"], t["ticket_id"], link),
        "T2": "%s, we assigned %s to your ticket %s. We'll confirm the ETA shortly." % (t["customer_name"], t["assigned_technician"], t["ticket_id"]),
        "T3": "%s is on the way for your ticket %s. ETA: %s." % (t["assigned_technician"], t["ticket_id"], eta_local),
        "T4": "%s has arrived to handle your ticket %s." % (t["assigned_technician"], t["ticket_id"]),
        "T5": "Your service %s is complete. Thank you. If the issue persists, reply to this message." % t["ticket_id"],
    }
    return (es if CFG["locale"] == "es" else en)[tpl]


def list_tickets(role, filters):
    store = _load()
    out = list(store["by_id"].values())
    if role == "technician":
        # v1 shared-key model: technician must scope to a technician id (documented limitation)
        tech = filters.get("assigned_technician")
        out = [t for t in out if t.get("assigned_technician") == tech]
    fs, fp, ft = filters.get("status"), filters.get("priority"), filters.get("assigned_technician")
    if fs:
        out = [t for t in out if t["status"] == fs]
    if fp:
        out = [t for t in out if t.get("priority") == fp]
    if ft and role == "supervisor":
        out = [t for t in out if t.get("assigned_technician") == ft]
    out.sort(key=lambda t: t["created_at"], reverse=True)
    return [_strip_for_staff(t) for t in out]


def _strip_for_staff(t):
    c = dict(t)
    c.pop("access_token", None)  # never shown to staff (spec §5)
    return c


def _customer_view(t):
    return {"ticket_id": t["ticket_id"], "status": t["status"],
            "assigned_technician": t["assigned_technician"], "eta": t["eta"]}


def role_from_key(key):
    if key and key == CFG["role_key_supervisor"]:
        return "supervisor"
    if key and key == CFG["role_key_technician"]:
        return "technician"
    return None


# ---------------------------------------------------------------------------
# HTTP layer — serves BOTH /fsc/v1/* (public) and /tickets/* (datastore for n8n)
# ---------------------------------------------------------------------------
class Handler(BaseHTTPRequestHandler):
    server_version = "FSC-reference/1.0"

    def _send(self, status, obj):
        payload = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-FSC-Role-Key")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(payload)

    def _body(self):
        n = int(self.headers.get("Content-Length", "0") or "0")
        if not n:
            return {}
        return json.loads(self.rfile.read(n).decode("utf-8") or "{}")

    def _err(self, e):
        self._send(e.status, e.body)

    def do_OPTIONS(self):
        self._send(204, {})

    def log_message(self, *a):  # quieter logs
        pass

    # ---- routing -------------------------------------------------------
    def do_GET(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        parts = [p for p in u.path.split("/") if p]
        try:
            # Public read: GET /fsc/v1/tickets  and  /fsc/v1/tickets/:id
            if parts[:3] == ["fsc", "v1", "tickets"]:
                role = role_from_key(self.headers.get("X-FSC-Role-Key"))
                if len(parts) == 3:  # list
                    if not role:
                        raise ApiError(403, "FORBIDDEN", "Se requiere clave de rol.")
                    return self._send(200, {"tickets": list_tickets(role, q)})
                tid = parts[3]
                store = _load()
                t = store["by_id"].get(tid)
                if not t:
                    raise ApiError(404, "NOT_FOUND", "Ticket no encontrado.")
                token = q.get("t")
                if token and secrets.compare_digest(token, t["access_token"]):
                    return self._send(200, _customer_view(t))
                if role:
                    return self._send(200, _strip_for_staff(t))
                raise ApiError(403, "FORBIDDEN", "Token o clave de rol requeridos.")
            # Datastore read (for n8n): GET /tickets, /tickets/:id
            if parts[:1] == ["tickets"]:
                store = _load()
                if len(parts) == 1:
                    return self._send(200, {"tickets": list(store["by_id"].values())})
                t = store["by_id"].get(parts[1])
                if not t:
                    raise ApiError(404, "NOT_FOUND", "Ticket no encontrado.")
                return self._send(200, t)
            # Anything else: serve the static web UI (intake/supervisor/technician)
            return self._serve_static(u.path)
        except ApiError as e:
            self._err(e)
        except Exception as e:  # noqa
            self._send(500, {"error": {"code": "INTERNAL", "message": str(e)}})

    def _serve_static(self, path):
        rel = path.lstrip("/") or "index.html"
        if rel.endswith("/"):
            rel += "index.html"
        full = os.path.normpath(os.path.join(WEB_DIR, rel))
        if not (full == WEB_DIR or full.startswith(WEB_DIR + os.sep)):
            raise ApiError(403, "FORBIDDEN", "Ruta no permitida.")
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not os.path.isfile(full):
            raise ApiError(404, "NOT_FOUND", "No encontrado: " + rel)
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        with open(full, "rb") as fh:
            data = fh.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_POST(self):
        u = urlparse(self.path)
        parts = [p for p in u.path.split("/") if p]
        try:
            body = self._body()
            # Public create: POST /fsc/v1/tickets
            if parts == ["fsc", "v1", "tickets"]:
                return self._send(201, _create_response(create_ticket(body)))
            # Public transition: POST /fsc/v1/tickets/:id/transition
            if parts[:3] == ["fsc", "v1", "tickets"] and parts[-1:] == ["transition"]:
                role = role_from_key(self.headers.get("X-FSC-Role-Key"))
                expected = (body.get("actor") or "").split(":")[0]
                if not role or role != expected:
                    raise ApiError(403, "FORBIDDEN", "Clave de rol no válida.")
                t, note = transition(parts[3], body, role)
                return self._send(200, {"ticket_id": t["ticket_id"], "status": t["status"],
                                        "notification": note})
            # Datastore write (for n8n): POST /tickets  (raw persist of a full ticket)
            if parts == ["tickets"]:
                with _LOCK:
                    store = _load()
                    store["by_id"][body["ticket_id"]] = body
                    _save(store)
                return self._send(201, body)
            raise ApiError(404, "NOT_FOUND", "Ruta no encontrada.")
        except ApiError as e:
            self._err(e)
        except Exception as e:  # noqa
            self._send(500, {"error": {"code": "INTERNAL", "message": str(e)}})

    def do_PUT(self):
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        try:
            body = self._body()
            if parts[:1] == ["tickets"] and len(parts) == 2:  # datastore overwrite
                with _LOCK:
                    store = _load()
                    store["by_id"][parts[1]] = body
                    _save(store)
                return self._send(200, body)
            raise ApiError(404, "NOT_FOUND", "Ruta no encontrada.")
        except ApiError as e:
            self._err(e)

    def do_PATCH(self):
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        try:
            body = self._body()
            # Datastore: PATCH /tickets/:id/notification
            if parts[:1] == ["tickets"] and parts[-1:] == ["notification"]:
                with _LOCK:
                    store = _load()
                    t = store["by_id"].get(parts[1])
                    if not t:
                        raise ApiError(404, "NOT_FOUND", "Ticket no encontrado.")
                    ev = body.get("append_notified_event")
                    if ev and ev not in t.get("notified_events", []):
                        t.setdefault("notified_events", []).append(ev)
                    if body.get("notification_status"):
                        t["notification_status"] = body["notification_status"]
                    store["by_id"][parts[1]] = t
                    _save(store)
                return self._send(200, t)
            raise ApiError(404, "NOT_FOUND", "Ruta no encontrada.")
        except ApiError as e:
            self._err(e)


def _create_response(t):
    return {"ticket_id": t["ticket_id"], "access_token": t["access_token"], "status": t["status"]}


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    srv = ThreadingHTTPServer(("0.0.0.0", CFG["port"]), Handler)
    print("FSC backend on http://localhost:%d" % CFG["port"])
    print("  web UI     : /  ·  /intake/  ·  /supervisor/  ·  /technician/")
    print("  public API : /fsc/v1/tickets ...")
    print("  datastore  : /tickets ...  (point FSC_DATASTORE_URL here for n8n)")
    print("  notify     : provider=%s  twilio_creds=%s  from=%s  data dir=%s" % (
        CFG["notify_provider"],
        "yes" if (CFG["twilio_sid"] and CFG["twilio_token"]) else "no",
        CFG["notify_from"] or "-", DATA_DIR))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        srv.shutdown()


if __name__ == "__main__":
    main()
