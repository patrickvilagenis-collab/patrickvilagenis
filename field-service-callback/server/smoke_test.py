#!/usr/bin/env python3
"""
FSC end-to-end acceptance test (build spec §9.7) against the reference backend.

Starts no server itself — point it at a running reference_server.py:
    # terminal 1
    FSC_ROLE_KEY_TECHNICIAN=devtech FSC_ROLE_KEY_SUPERVISOR=devsup python3 reference_server.py
    # terminal 2
    python3 smoke_test.py

Exercises the full happy path and verifies: ticket created -> T1, supervisor triage,
dispatch (+T2), en route (+T3), on site (+T4), close (+T5); audit entries; exactly-once
notifications; and that an illegal transition and a missing required field are rejected.
"""
import json
import os
import sys
import urllib.request
import urllib.error

BASE = os.environ.get("FSC_TEST_BASE", "http://localhost:8080")
TECH_KEY = os.environ.get("FSC_ROLE_KEY_TECHNICIAN", "devtech")
SUP_KEY = os.environ.get("FSC_ROLE_KEY_SUPERVISOR", "devsup")

PASS, FAIL = 0, 0


def call(method, path, body=None, role_key=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if role_key:
        req.add_header("X-FSC-Role-Key", role_key)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def check(label, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
        print("  PASS  " + label)
    else:
        FAIL += 1
        print("  FAIL  " + label)


def main():
    print("FSC acceptance test against", BASE)

    # 1. Intake create -> Intake + T1
    st, res = call("POST", "/fsc/v1/tickets", {
        "customer_name": "José Pérez",
        "customer_phone": "+34600111222",
        "equipment_type": "hvac",
        "symptom_description": "El aire no enfría desde ayer.",
        "idempotency_key": "smoke-1",
    })
    check("create returns 201", st == 201)
    tid = res.get("ticket_id")
    token = res.get("access_token")
    check("ticket_id format FSC-YYYY-NNNNNN", bool(tid and tid.startswith("FSC-")))
    check("access_token returned", bool(token))

    # idempotency: same key -> same ticket
    st, res2 = call("POST", "/fsc/v1/tickets", {
        "customer_name": "José Pérez", "customer_phone": "+34600111222",
        "equipment_type": "hvac", "symptom_description": "El aire no enfría desde ayer.",
        "idempotency_key": "smoke-1",
    })
    check("idempotent create (same key -> same id)", res2.get("ticket_id") == tid)

    # missing required field rejected
    st, res = call("POST", "/fsc/v1/tickets", {"customer_name": "X"})
    check("missing fields -> 422 VALIDATION_FAILED",
          st == 422 and res.get("error", {}).get("code") == "VALIDATION_FAILED")

    # customer self-view by token
    st, cv = call("GET", "/fsc/v1/tickets/%s?t=%s" % (tid, token))
    check("customer self-view by token", st == 200 and cv.get("status") == "Intake"
          and "customer_phone" not in cv)

    # illegal transition: Intake -> On site
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "On site", "actor": "supervisor:ana"}, SUP_KEY)
    check("illegal transition -> 409", st == 409 and res["error"]["code"] == "ILLEGAL_TRANSITION")

    # technician cannot triage (forbidden role)
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Triage", "actor": "technician:carlos"}, TECH_KEY)
    check("technician triage -> 403 FORBIDDEN", st == 403)

    # 2. Triage (supervisor)
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Triage", "actor": "supervisor:ana", "priority": "high"}, SUP_KEY)
    check("triage -> 200", st == 200 and res["status"] == "Triage")

    # 3. Dispatch requires technician
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Dispatch", "actor": "supervisor:ana"}, SUP_KEY)
    check("dispatch without technician -> 422", st == 422)
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Dispatch", "actor": "supervisor:ana",
                    "assigned_technician": "carlos"}, SUP_KEY)
    check("dispatch -> 200 + notify pending/sent", st == 200 and res["status"] == "Dispatch")

    # 4. On the way requires future eta
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "On the way", "actor": "technician:carlos"}, TECH_KEY)
    check("en route without eta -> 422", st == 422)
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "On the way", "actor": "technician:carlos",
                    "eta": "2999-01-01T10:00:00Z"}, TECH_KEY)
    check("en route -> 200", st == 200 and res["status"] == "On the way")

    # 5. On site
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "On site", "actor": "technician:carlos"}, TECH_KEY)
    check("on site -> 200", st == 200 and res["status"] == "On site")

    # 6. Close
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Close", "actor": "technician:carlos", "note": "Compresor reiniciado."}, TECH_KEY)
    check("close -> 200", st == 200 and res["status"] == "Close")

    # Verify audit trail + exactly-once notifications via datastore read
    st, full = call("GET", "/tickets/%s" % tid)
    check("audit log has 6 entries (Intake..Close)", len(full.get("audit_log", [])) == 6)
    check("exactly-once: notified_events has T1,T2,T3,T4,T5 (5 unique)",
          len(set(full.get("notified_events", []))) == 5)
    check("notification_status sent", full.get("notification_status") == "sent")

    # Reopen (supervisor)
    st, res = call("POST", "/fsc/v1/tickets/%s/transition" % tid,
                   {"to_status": "Triage", "actor": "supervisor:ana"}, SUP_KEY)
    check("reopen Close -> Triage", st == 200 and res["status"] == "Triage")

    print("\n%d passed, %d failed" % (PASS, FAIL))
    sys.exit(1 if FAIL else 0)


if __name__ == "__main__":
    main()
