// views/analysis.js — data analysis: filterable explorer, breakdowns, export.

import { store, visitScore, visitVariabilities, countPhotos } from '../store.js';
import { barChart, donutChart, legend } from '../charts.js';
import { TEMPLATE_LIST } from '../checklists.js';
import { fmtDate, esc, download, toCSV, toast } from '../utils.js';

export async function renderAnalysis(root) {
  const all = (await store.visits()).filter((v) => v.status === 'submitted');

  // distinct filter values
  const cities = [...new Set(all.map((v) => v.general.city).filter(Boolean))].sort();
  const families = [...new Set(all.map((v) => v.family).filter(Boolean))].sort();

  root.innerHTML = `
    <header class="view-head">
      <div><h1>Data analysis</h1><p class="muted">Slice field data, surface trends and export. Replaces raw Excel dumps.</p></div>
      <div class="row-gap">
        <button class="btn" id="exportCsv">⬇ CSV</button>
        <button class="btn" id="exportJson">⬇ JSON</button>
      </div>
    </header>

    <div class="filters">
      <label class="fld"><span>Type</span><select id="fFamily"><option value="">All</option>${families.map((f) => `<option>${esc(f)}</option>`).join('')}</select></label>
      <label class="fld"><span>City</span><select id="fCity"><option value="">All</option>${cities.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label>
      <label class="fld"><span>Employee</span><select id="fEmp"><option value="">All</option><option>Schindler</option><option>Subcontractor</option></select></label>
      <label class="fld"><span>From</span><input type="date" id="fFrom"/></label>
      <label class="fld"><span>To</span><input type="date" id="fTo"/></label>
    </div>

    <section class="kpi-grid four" id="aKpis"></section>
    <section class="card-grid">
      <div class="card"><h3>Compliance by type</h3><div id="chartFam"></div></div>
      <div class="card"><h3>Compliance by city</h3><div id="chartCity"></div></div>
      <div class="card"><h3>Schindler vs subcontractor</h3><div class="center" id="chartEmp"></div><div id="legEmp"></div></div>
      <div class="card span3"><h3>Most frequent variabilities</h3><div id="topItems"></div></div>
    </section>

    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Date</th><th>Type</th><th>Observer</th><th>City</th><th>Employee</th><th class="num">Score</th><th class="num">Var.</th><th class="num">Photos</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  `;

  const filters = ['#fFamily', '#fCity', '#fEmp', '#fFrom', '#fTo'].map((s) => root.querySelector(s));
  filters.forEach((f) => f.addEventListener('input', update));

  function current() {
    const [fam, city, emp, from, to] = filters.map((f) => f.value);
    return all.filter((v) => {
      const d = v.general.date || v.createdAt.slice(0, 10);
      if (fam && v.family !== fam) return false;
      if (city && v.general.city !== city) return false;
      if (emp && v.general.employeeType !== emp) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  function update() {
    const list = current();

    // KPIs
    const scores = list.map(visitScore).filter((s) => s.score != null);
    const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : null;
    const totalVar = list.reduce((a, v) => a + visitVariabilities(v).length, 0);
    const photos = list.reduce((a, v) => a + countPhotos(v), 0);
    root.querySelector('#aKpis').innerHTML = `
      <div class="kpi"><div class="kpi-val">${list.length}</div><div class="kpi-lbl">Visits</div></div>
      <div class="kpi ${avg != null && avg < 80 ? 'warn' : 'good'}"><div class="kpi-val">${avg != null ? avg + '%' : '—'}</div><div class="kpi-lbl">Avg compliance</div></div>
      <div class="kpi ${totalVar ? 'bad' : ''}"><div class="kpi-val">${totalVar}</div><div class="kpi-lbl">Variabilities</div></div>
      <div class="kpi"><div class="kpi-val">${photos}</div><div class="kpi-lbl">Photos attached</div></div>`;

    // compliance by family
    root.querySelector('#chartFam').innerHTML = barChart(avgBy(list, (v) => v.family), { color: '#2563eb', valueFmt: (x) => x + '%' });
    // compliance by city
    root.querySelector('#chartCity').innerHTML = barChart(avgBy(list, (v) => v.general.city || '—'), { color: '#10b981', valueFmt: (x) => x + '%' });
    // employee split
    const empCount = {};
    list.forEach((v) => { const e = v.general.employeeType || '—'; empCount[e] = (empCount[e] || 0) + 1; });
    const empEntries = Object.entries(empCount);
    root.querySelector('#chartEmp').innerHTML = donutChart(empEntries);
    root.querySelector('#legEmp').innerHTML = legend(empEntries);

    // top variability items
    const itemMap = {};
    for (const v of list) for (const vr of visitVariabilities(v)) {
      const key = vr.item;
      itemMap[key] = (itemMap[key] || 0) + 1;
    }
    const top = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    root.querySelector('#topItems').innerHTML = top.length
      ? `<ul class="rank wide">${top.map(([txt, n], i) => `<li><span class="rank-n">${i + 1}</span><span class="rank-lbl">${esc(txt)}</span><b>${n}</b></li>`).join('')}</ul>`
      : '<p class="hint">No variabilities in the current selection.</p>';

    // table
    root.querySelector('#rows').innerHTML = list
      .sort((a, b) => (b.general.date || b.createdAt).localeCompare(a.general.date || a.createdAt))
      .map((v) => {
        const s = visitScore(v);
        return `<tr><td>${fmtDate(v.general.date || v.createdAt)}</td><td>${esc(v.templateName)}</td><td>${esc(v.general.observer || '—')}</td><td>${esc(v.general.city || '—')}</td><td>${esc(v.general.employeeType || '—')}</td><td class="num">${s.score == null ? '—' : `<span class="pill ${s.score >= 90 ? 'good' : s.score >= 75 ? 'warn' : 'bad'}">${s.score}%</span>`}</td><td class="num">${s.variability || 0}</td><td class="num">${countPhotos(v) || '—'}</td></tr>`;
      }).join('') || '<tr><td colspan="8" class="empty">No visits match the filters.</td></tr>';
  }

  function avgBy(list, keyFn) {
    const groups = {};
    for (const v of list) {
      const k = keyFn(v) || '—';
      const s = visitScore(v);
      if (s.score == null) continue;
      (groups[k] = groups[k] || []).push(s.score);
    }
    return Object.entries(groups).map(([k, arr]) => [k, Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)]).sort((a, b) => b[1] - a[1]);
  }

  function flatten(list) {
    return list.map((v) => {
      const s = visitScore(v);
      return {
        date: v.general.date || v.createdAt.slice(0, 10), type: v.templateName, family: v.family,
        observer: v.general.observer, observerId: v.general.observerId, technician: v.general.technician,
        employeeType: v.general.employeeType, equipment: v.general.equipmentNumber, workType: v.general.workType,
        city: v.general.city, branch: v.general.branch, address: v.general.address, supervisor: v.general.supervisor,
        score: s.score ?? '', conform: s.conform, variability: s.variability, photos: countPhotos(v),
      };
    });
  }

  root.querySelector('#exportCsv').addEventListener('click', () => {
    download('safety_visits.csv', toCSV(flatten(current())), 'text/csv'); toast('Exported CSV', 'good');
  });
  root.querySelector('#exportJson').addEventListener('click', () => {
    download('safety_visits.json', JSON.stringify(current(), null, 2)); toast('Exported JSON', 'good');
  });

  update();
}
