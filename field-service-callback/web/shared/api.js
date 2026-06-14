/* FSC thin API client (spec §4, §8.1).
 * The ONLY way the web surfaces talk to the backend. No surface touches the
 * datastore directly (principle P1). All endpoints are namespaced /fsc/v1.
 *
 * Configure the base URL once per deployment via window.FSC_API_BASE
 * (e.g. <script>window.FSC_API_BASE = "https://fsc.example.com"</script>)
 * or leave empty to call same-origin.
 */
(function (global) {
  "use strict";

  const BASE = (global.FSC_API_BASE || "").replace(/\/+$/, "");
  const ROOT = BASE + "/fsc/v1";

  /** Escape user text before inserting into the DOM (spec §8.5). */
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async function request(method, path, { body, roleKey } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (roleKey) headers["X-FSC-Role-Key"] = roleKey;
    let res;
    try {
      res = await fetch(ROOT + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      throw { code: "NETWORK", message: "No se pudo conectar con el servidor." };
    }
    let payload = null;
    const text = await res.text();
    if (text) {
      try { payload = JSON.parse(text); } catch (_) { payload = { raw: text }; }
    }
    if (!res.ok) {
      const err = (payload && payload.error) || {
        code: "HTTP_" + res.status,
        message: "Error " + res.status,
      };
      throw err;
    }
    return payload;
  }

  const FSC = {
    escapeHtml,

    /** Create a ticket (intake). Returns { ticket_id, access_token, status }. */
    createTicket(ticket, idempotencyKey) {
      return request("POST", "/tickets", {
        body: Object.assign({ idempotency_key: idempotencyKey }, ticket),
      });
    },

    /** Read one ticket. Customer self-view passes { token }; staff passes { roleKey }. */
    getTicket(id, { token, roleKey } = {}) {
      const q = token ? "?t=" + encodeURIComponent(token) : "";
      return request("GET", "/tickets/" + encodeURIComponent(id) + q, { roleKey });
    },

    /** List tickets (staff only). filters: { status, assigned_technician, priority }. */
    listTickets(filters, roleKey) {
      const qs = new URLSearchParams();
      Object.entries(filters || {}).forEach(([k, v]) => { if (v) qs.append(k, v); });
      const q = qs.toString() ? "?" + qs.toString() : "";
      return request("GET", "/tickets" + q, { roleKey });
    },

    /** Advance state. body: { to_status, actor, eta?, assigned_technician?, priority?, note? }. */
    transition(id, body, roleKey) {
      return request("POST", "/tickets/" + encodeURIComponent(id) + "/transition", { body, roleKey });
    },
  };

  /** Lifecycle helpers shared by surfaces (spec §6.2). */
  FSC.LIFECYCLE = ["Intake", "Triage", "Dispatch", "On the way", "On site", "Close"];
  FSC.NEXT_FORWARD = {
    "Intake": "Triage",
    "Triage": "Dispatch",
    "Dispatch": "On the way",
    "On the way": "On site",
    "On site": "Close",
    "Close": null,
  };

  global.FSC = FSC;
})(window);
