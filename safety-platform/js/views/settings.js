// views/settings.js — data management & platform info.

import { store } from '../store.js';
import { db } from '../db.js';
import * as sync from '../sync.js';
import { download, toast, confirmDialog, esc } from '../utils.js';

const escAttr = esc;

export async function renderSettings(root) {
  const [visits, actions, photos] = await Promise.all([store.visits(), store.actions(), db.all('photos')]);

  root.innerHTML = `
    <header class="view-head"><div><h1>Settings & data</h1><p class="muted">By default data lives in this browser and works fully offline. Connect a backend below to save on a server and share across users.</p></div></header>

    <section class="kpi-grid four">
      <div class="kpi"><div class="kpi-val">${visits.length}</div><div class="kpi-lbl">Visits</div></div>
      <div class="kpi"><div class="kpi-val">${actions.length}</div><div class="kpi-lbl">Actions</div></div>
      <div class="kpi"><div class="kpi-val">${photos.length}</div><div class="kpi-lbl">Photos</div></div>
      <div class="kpi"><div class="kpi-val">${onlineLabel()}</div><div class="kpi-lbl">Connectivity</div></div>
    </section>

    <div class="card">
      <h3>🔌 Backend sync <span id="syncBadge"></span></h3>
      <p class="hint">Connect a backend so data is saved on a server and shared across users and devices. This setting is per browser — configure it on each device. Leave the URL empty to stay fully local.</p>
      <div class="grid2">
        <label class="fld"><span>API base URL</span><input id="apiUrl" type="url" placeholder="https://your-backend.onrender.com" value="${escAttr((sync.getConfig().url) || '')}"></label>
        <label class="fld"><span>API key</span><input id="apiKey" type="text" placeholder="from Render → Environment → API_KEY" value="${escAttr((sync.getConfig().key) || '')}"></label>
      </div>
      <div class="row-gap" style="margin-top:10px">
        <button class="btn" id="syncTest">Test connection</button>
        <button class="btn primary" id="syncConnect">Connect &amp; load shared data</button>
        <button class="btn" id="syncUpload">Upload this device's data → server</button>
        <button class="btn ghost" id="syncDisable">Disconnect</button>
      </div>
      <p class="hint" id="syncStatus"></p>
    </div>

    <div class="card">
      <h3>Backup & restore</h3>
      <p class="hint">Export a full backup (visits, actions and photos) to a JSON file, or import one on another device.</p>
      <div class="row-gap">
        <button class="btn primary" id="backup">⬇ Export full backup</button>
        <label class="btn">⬆ Import backup<input type="file" id="restore" accept="application/json" hidden></label>
      </div>
    </div>

    <div class="card">
      <h3>Demo data</h3>
      <p class="hint">The platform seeds sample visits on first run so dashboards aren't empty. Reset wipes everything and re-seeds.</p>
      <div class="row-gap">
        <button class="btn danger" id="reset">Reset & reseed demo data</button>
        <button class="btn ghost danger" id="wipe">Wipe all data</button>
      </div>
    </div>

    <div class="card about">
      <h3>About this platform</h3>
      <p>A mobile-first, offline-capable safety reporting platform inspired by Enablon — built to address the SRS pain points: no mobile access, no offline/auto-save, weak reporting, raw Excel exports, photos missing from reports and no closed-loop action management.</p>
      <ul class="feature-list">
        <li><b>Dashboards</b> — live KPIs, trends, control coverage.</li>
        <li><b>Field visit checklists</b> — SAFE, Safety Inspection, Mini OLE, JHA.</li>
        <li><b>Energy-Based Safety (EBS)</b> — energy wheel, direct controls, hierarchy of controls.</li>
        <li><b>Photos</b> — attach evidence to any checkpoint, kept with the report.</li>
        <li><b>Data analysis</b> — filter, breakdowns, CSV/JSON export.</li>
        <li><b>Closed-loop actions</b> — owner, due date, escalation, mass-close.</li>
        <li><b>Offline-first</b> — auto-save drafts, pause & resume, installable PWA.</li>
      </ul>
    </div>
  `;

  // --- Backend sync ---
  const statusEl = root.querySelector('#syncStatus');
  const badgeEl = root.querySelector('#syncBadge');
  const refreshSyncStatus = () => {
    const on = sync.enabled();
    badgeEl.innerHTML = on ? '<span class="pill good">connected</span>' : '<span class="pill muted">local only</span>';
    const ob = sync.outboxCount();
    statusEl.textContent = on
      ? `Syncing with the configured backend.${ob ? ` ${ob} change(s) queued (offline).` : ''}`
      : 'Not connected — data stays in this browser only.';
  };
  refreshSyncStatus();

  // Wake a sleeping free-tier server and confirm it is reachable + the key works.
  async function reachAndAuth(url, key) {
    sync.setConfig({ url, key });
    let lastErr = null;
    for (let i = 0; i < 6; i++) {            // free instances can take ~50s to wake
      try { await sync.test(); lastErr = null; break; }
      catch (e) { lastErr = e; statusEl.textContent = 'Waking the server… (free plan can take up to a minute)'; await new Promise((r) => setTimeout(r, 4000)); }
    }
    if (lastErr) throw new Error('unreachable');
    return sync.verify(); // 'ok' | 'unauthorized'
  }

  root.querySelector('#syncTest').addEventListener('click', async () => {
    const url = root.querySelector('#apiUrl').value.trim();
    const key = root.querySelector('#apiKey').value.trim();
    if (!url) { toast('Enter the API URL first', 'bad'); return; }
    try {
      const auth = await reachAndAuth(url, key);
      if (auth === 'unauthorized') { toast('Wrong / missing API key', 'bad'); statusEl.textContent = 'Server reached, but the API key is invalid. Copy it from Render → your service → Environment → API_KEY.'; return; }
      toast('Connected ✓', 'good'); statusEl.textContent = 'Connection OK and API key accepted. Use “Connect & load shared data”.';
    } catch { toast('Could not reach the server', 'bad'); statusEl.textContent = 'Could not reach ' + url + '. Check the URL is exact, the server is deployed, and try again (it may be waking up).'; }
  });

  // Join the shared backend: clear stale local cache, then reload to pull server data.
  root.querySelector('#syncConnect').addEventListener('click', async () => {
    const url = root.querySelector('#apiUrl').value.trim();
    const key = root.querySelector('#apiKey').value.trim();
    if (!url) { toast('Enter the API URL first', 'bad'); return; }
    let auth;
    try { auth = await reachAndAuth(url, key); }
    catch { toast('Server did not respond', 'bad'); statusEl.textContent = 'The server did not respond — check the URL and try again.'; return; }
    if (auth === 'unauthorized') { toast('Wrong / missing API key', 'bad'); statusEl.textContent = 'The API key is invalid. Copy it from Render → Environment → API_KEY.'; return; }
    toast('Connecting — loading shared data…', 'good');
    await sync.clearLocal(db);   // drop local demo/stale cache so the pull mirrors the server
    setTimeout(() => location.reload(), 700);
  });

  // Seed the server from this device's data (use once, from the device that holds the real records).
  root.querySelector('#syncUpload').addEventListener('click', async () => {
    const url = root.querySelector('#apiUrl').value.trim();
    const key = root.querySelector('#apiKey').value.trim();
    if (!url) { toast('Enter the API URL first', 'bad'); return; }
    if (!(await confirmDialog("Upload this device's current records to the server? Existing server records with the same id are overwritten."))) return;
    let auth;
    try { auth = await reachAndAuth(url, key); }
    catch { toast('Server did not respond', 'bad'); return; }
    if (auth === 'unauthorized') { toast('Wrong / missing API key', 'bad'); statusEl.textContent = 'The API key is invalid.'; return; }
    statusEl.textContent = 'Uploading…';
    const res = await sync.pushBulk(db);
    if (res.unauthorized) { toast('API key invalid', 'bad'); return; }
    toast(`Uploaded ${res.pushed} record(s)`, 'good');
    statusEl.textContent = `Uploaded ${res.pushed} record(s) to the server${res.failed ? `, ${res.failed} failed` : ''}.`;
  });

  root.querySelector('#syncDisable').addEventListener('click', () => {
    sync.setConfig({ url: '', key: '' });
    root.querySelector('#apiUrl').value = '';
    root.querySelector('#apiKey').value = '';
    toast('Disconnected — local only');
    refreshSyncStatus();
  });

  root.querySelector('#backup').addEventListener('click', async () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), visits, actions, photos };
    download(`safety-platform-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload));
    toast('Backup exported', 'good');
  });

  root.querySelector('#restore').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.visits) throw new Error('bad file');
      for (const v of data.visits) await store.saveVisit(v);
      for (const a of (data.actions || [])) await store.saveAction(a);
      for (const p of (data.photos || [])) await db.put('photos', p);
      toast('Backup imported', 'good');
      renderSettings(root);
    } catch { toast('Invalid backup file', 'bad'); }
  });

  root.querySelector('#reset').addEventListener('click', async () => {
    if (!(await confirmDialog('Reset all data and reload demo data?'))) return;
    await wipe();
    await store.setMeta('seeded', false);
    location.hash = '#/dashboard';
    location.reload();
  });

  root.querySelector('#wipe').addEventListener('click', async () => {
    if (!(await confirmDialog('Permanently delete ALL data? This cannot be undone.'))) return;
    await wipe();
    await store.setMeta('seeded', true);
    toast('All data wiped');
    renderSettings(root);
  });
}

function onlineLabel() {
  return navigator.onLine ? 'Online' : 'Offline';
}

async function wipe() {
  await db.clear('visits');
  await db.clear('actions');
  await db.clear('photos');
}
