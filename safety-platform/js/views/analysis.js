// views/analysis.js — data analysis: breakdowns, drill-down and export.
// Filtering is driven by the shared filter drawer (see filters.js).

import { store, visitScore, visitVariabilities, countPhotos } from '../store.js';
import { hbarChart, donutChart, legend } from '../charts.js';
import { fmtDate, esc, download, toCSV, toast } from '../utils.js';
import { filterButton, filterVisits, activeFilterChips } from '../filters.js';

export async function renderAnalysis(root) {
  const submittedAll = (await store.visits()).filter((v) => v.status === 'submitted');
  const list = filterVisits(submittedAll);

  // KPIs
  const scores = list.map(visitScore).filter((s) => s.score != null);
  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : null;
  const totalVar = list.reduce((a, v) => a + visitVariabilities(v).length, 0);
  const photos = list.reduce((a, v) => a + countPhotos(v), 0);

  // breakdowns
  const byFam = avgBy(list, (v) => v.family);
  const byCity = avgBy(list, (v) => v.general.city || '—');
  const byZone = avgBy(list, (v) => v.general.zone || '—');
  const empCount = {};
  list.forEach((v) => { const e = v.general.employeeType || '—'; empCount[e] = (empCount[e] || 0) + 1; });
  const empEntries = Object.entries(empCount);

  const itemMap = {};
  for (const v of list) for (const vr of visitVariabilities(v)) itemMap[vr.item] = (itemMap[vr.item] || 0) + 1;
  const top = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const rows = list
    .sort((a, b) => (b.general.date || b.createdAt).localeCompare(a.general.date || a.createdAt))
    .map((v) => {
      const s = visitScore(v);
      const badge = s.score == null ? '—'
        : `<span class="pill ${s.score >= 90 ? 'good' : s.score >= 75 ? 'warn' : 'bad'}">${s.score}%</span>`;
      return `<tr>
        <td>${fmtDate(v.general.date || v.createdAt)}</td>
        <td><b>${esc(v.templateName)}</b><div class="sub">${esc(v.general.zone || '')}</div></td>
        <td>${esc(v.general.observer || '—')}</td>
        <td>${esc(v.general.city || '—')}</td>
        <td>${esc(v.general.technician || '—')}</td>
        <td>${esc(v.general.employeeType || '—')}</td>
        <td class="num">${badge}</td>
        <td class="num">${s.variability || 0}</td>
        <td class="num">${countPhotos(v) || '—'}</td>
        <td class="num"><a class="link src-link" href="#/visit/${v.id}">open ↗</a></td>
      </tr>`;
    }).join('') || '<tr><td colspan="10" class="empty">No visits match the current filters.</td></tr>';

  root.innerHTML = `
    <header class="view-head">
      <div><h1>Data analysis</h1><p class="muted">Slice field data, surface trends and drill into any field visit. Replaces raw Excel dumps.</p></div>
      <div class="row-gap"><span id="filterMount"></span><button class="btn" id="exportCsv">⬇ CSV</button><button class="btn" id="exportJson">⬇ JSON</button></div>
    </header>
    <div id="chipMount"></div>

    <section class="kpi-grid four">
      <div class="kpi"><div class="kpi-val">${list.length}</div><div class="kpi-lbl">Visits</div></div>
      <div class="kpi ${avg != null && avg < 80 ? 'warn' : 'good'}"><div class="kpi-val">${avg != null ? avg + '%' : '—'}</div><div class="kpi-lbl">Avg compliance</div></div>
      <div class="kpi ${totalVar ? 'bad' : ''}"><div class="kpi-val">${totalVar}</div><div class="kpi-lbl">Variabilities</div></div>
      <div class="kpi"><div class="kpi-val">${photos}</div><div class="kpi-lbl">Photos attached</div></div>
    </section>

    <section class="card-grid">
      <div class="card"><h3>Compliance by type</h3>${hbarChart(byFam, { color: '#E2001A', valueFmt: (x) => x + '%' })}</div>
      <div class="card"><h3>Compliance by zone / hub</h3>${hbarChart(byZone, { color: '#2b2f36', valueFmt: (x) => x + '%' })}</div>
      <div class="card"><h3>Compliance by city</h3>${hbarChart(byCity, { color: '#0073a8', valueFmt: (x) => x + '%' })}</div>
      <div class="card"><h3>Schindler vs subcontractor</h3><div class="center">${donutChart(empEntries)}</div>${legend(empEntries)}</div>
      <div class="card span2"><h3>Most frequent variabilities</h3>${top.length
        ? `<ul class="rank wide">${top.map(([txt, n], i) => `<li><span class="rank-n">${i + 1}</span><span class="rank-lbl">${esc(txt)}</span><b>${n}</b></li>`).join('')}</ul>`
        : '<p class="hint">No variabilities in the current selection.</p>'}</div>
    </section>

    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Date</th><th>Type</th><th>Observer</th><th>City</th><th>Technician</th><th>Employee</th><th class="num">Score</th><th class="num">Var.</th><th class="num">Photos</th><th class="num">Source</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  const rerender = () => renderAnalysis(root);
  root.querySelector('#filterMount').append(filterButton(submittedAll, rerender));
  const chips = activeFilterChips(rerender);
  if (chips) root.querySelector('#chipMount').append(chips);

  root.querySelector('#exportCsv').addEventListener('click', () => {
    download('safety_visits.csv', toCSV(flatten(list)), 'text/csv'); toast('Exported CSV', 'good');
  });
  root.querySelector('#exportJson').addEventListener('click', () => {
    download('safety_visits.json', JSON.stringify(list, null, 2)); toast('Exported JSON', 'good');
  });
}

function avgBy(list, keyFn) {
  const groups = {};
  for (const v of list) {
    const k = keyFn(v) || '—';
    const s = visitScore(v);
    if (s.score == null) continue;
    (groups[k] = groups[k] || []).push(s.score);
  }
  return Object.entries(groups)
    .map(([k, arr]) => [k, Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)])
    .sort((a, b) => b[1] - a[1]);
}

function flatten(list) {
  return list.map((v) => {
    const s = visitScore(v);
    return {
      date: v.general.date || v.createdAt.slice(0, 10), type: v.templateName, family: v.family,
      observer: v.general.observer, observerId: v.general.observerId, technician: v.general.technician,
      employeeType: v.general.employeeType, equipment: v.general.equipmentNumber, workType: v.general.workType,
      city: v.general.city, zone: v.general.zone, region: v.general.region, branch: v.general.branch,
      address: v.general.address, supervisor: v.general.supervisor,
      installationType: (v.technical || {}).installationType || '',
      score: s.score ?? '', conform: s.conform, variability: s.variability, photos: countPhotos(v),
    };
  });
}
