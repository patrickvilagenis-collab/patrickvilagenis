// views/settings.js — data management & platform info.

import { store } from '../store.js';
import { db } from '../db.js';
import { download, toast, confirmDialog } from '../utils.js';

export async function renderSettings(root) {
  const [visits, actions, photos] = await Promise.all([store.visits(), store.actions(), db.all('photos')]);

  root.innerHTML = `
    <header class="view-head"><div><h1>Settings & data</h1><p class="muted">All data lives in this browser (IndexedDB). Nothing is sent to a server — works fully offline.</p></div></header>

    <section class="kpi-grid four">
      <div class="kpi"><div class="kpi-val">${visits.length}</div><div class="kpi-lbl">Visits</div></div>
      <div class="kpi"><div class="kpi-val">${actions.length}</div><div class="kpi-lbl">Actions</div></div>
      <div class="kpi"><div class="kpi-val">${photos.length}</div><div class="kpi-lbl">Photos</div></div>
      <div class="kpi"><div class="kpi-val">${onlineLabel()}</div><div class="kpi-lbl">Connectivity</div></div>
    </section>

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
