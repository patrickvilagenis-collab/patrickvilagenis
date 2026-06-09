// sync.js — optional backend synchronisation.
// When a backend API URL is configured (Settings → Backend sync), the app
// mirrors every write to the server and pulls server data on start. Writes
// that fail (offline) are queued in an outbox and flushed when back online.
// With no URL configured, the app stays purely local (unchanged behaviour).

const CFG = 'shi_sync_cfg';
const OUTBOX = 'shi_sync_outbox';
export const COLLECTIONS = ['visits', 'accidents', 'actions', 'photos', 'meta'];

export function getConfig() {
  try { return { url: '', key: '', ...(JSON.parse(localStorage.getItem(CFG)) || {}) }; }
  catch { return { url: '', key: '' }; }
}
export function setConfig(cfg) { localStorage.setItem(CFG, JSON.stringify({ url: (cfg.url || '').trim(), key: (cfg.key || '').trim() })); }
export function enabled() { return !!getConfig().url; }

function base() { return getConfig().url.replace(/\/+$/, ''); }
function headers() {
  const k = getConfig().key;
  return Object.assign({ 'Content-Type': 'application/json' }, k ? { 'x-api-key': k } : {});
}

async function api(path, opts = {}) {
  const r = await fetch(base() + path, { headers: headers(), ...opts });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.status === 204 ? null : r.json();
}

export function test() { return api('/api/health'); }

// Pull every collection from the server into the local cache (db).
export async function pullAll(db) {
  if (!enabled()) return { pulled: 0 };
  let pulled = 0;
  for (const c of COLLECTIONS) {
    const list = await api('/api/' + c);
    for (const item of list) { await db.put(c, item); pulled++; }
  }
  return { pulled };
}

// Fire-and-forget push of a single record (queues on failure).
export function push(collection, obj) {
  if (!enabled() || !obj || !obj.id) return;
  api('/api/' + collection + '/' + encodeURIComponent(obj.id), { method: 'PUT', body: JSON.stringify(obj) })
    .catch(() => enqueue({ op: 'put', collection, id: obj.id, obj }));
}

export function remove(collection, id) {
  if (!enabled() || !id) return;
  api('/api/' + collection + '/' + encodeURIComponent(id), { method: 'DELETE' })
    .catch(() => enqueue({ op: 'del', collection, id }));
}

function readOutbox() { try { return JSON.parse(localStorage.getItem(OUTBOX)) || []; } catch { return []; } }
function writeOutbox(q) { localStorage.setItem(OUTBOX, JSON.stringify(q)); }
function enqueue(item) { const q = readOutbox(); q.push(item); writeOutbox(q); }
export function outboxCount() { return readOutbox().length; }

export async function flushOutbox() {
  if (!enabled()) return;
  const q = readOutbox();
  if (!q.length) return;
  const remaining = [];
  for (const item of q) {
    try {
      if (item.op === 'put') await api('/api/' + item.collection + '/' + encodeURIComponent(item.id), { method: 'PUT', body: JSON.stringify(item.obj) });
      else await api('/api/' + item.collection + '/' + encodeURIComponent(item.id), { method: 'DELETE' });
    } catch { remaining.push(item); }
  }
  writeOutbox(remaining);
}
