// views/accidents.js — Accident Reporting overview: dashboard, filters, list.

import { store, buildAccidentKpis, accidentsByType, accidentsByMonth, accidentsBy, accidentControlSplit } from '../store.js';
import { ACCIDENT_TYPES, getAccidentType, getMethodology, METHODOLOGIES } from '../accidents.js';
import { ENERGY_TYPES } from '../checklists.js';
import { barChart, lineChart, donutChart, legend, PALETTE } from '../charts.js';
import { monthLabel, fmtDate, esc, toast, confirmDialog } from '../utils.js';
import { accFilterButton, filterAccidents, accActiveChips } from '../accidentFilters.js';

export async function renderAccidents(root) {
  const [allAccidents, actions] = await Promise.all([store.accidents(), store.actions()]);
  const reportedAll = allAccidents.filter((a) => a.status !== 'draft');
  const list = filterAccidents(allAccidents);
  const reported = list.filter((a) => a.status !== 'draft');
  const k = buildAccidentKpis(list, actions);

  const byType = accidentsByType(reported);
  const months = accidentsByMonth(reported).map(([m, n]) => [monthLabel(m), n]);
  const energyCounts = {};
  for (const a of reported) {
    const list = Array.isArray(a.energyTypes) && a.energyTypes.length ? a.energyTypes : (a.energyType ? [a.energyType] : []);
    for (const id of list) energyCounts[id] = (energyCounts[id] || 0) + 1;
  }
  const byEnergy = Object.entries(energyCounts).sort((x, y) => y[1] - x[1]).map(([id, n]) => {
    const e = ENERGY_TYPES.find((x) => x.id === id); return [e ? `${e.icon} ${e.label}` : id, n];
  });
  const byZone = accidentsBy(reported, (a) => a.location.zone || '—');
  const ctrl = accidentControlSplit(reported);

  const kpi = (label, value, sub, tone = '') =>
    `<div class="kpi ${tone}"><div class="kpi-val">${value}</div><div class="kpi-lbl">${label}</div>${sub ? `<div class="kpi-sub">${sub}</div>` : ''}</div>`;

  const typeBadge = (id) => { const t = getAccidentType(id); return t ? `<span class="atype ${t.tone}">${esc(t.short)}</span>` : '—'; };

  const row = (a) => `
    <tr data-id="${a.id}" class="rowlink">
      <td>${typeBadge(a.type)}</td>
      <td><b>${esc(a.refNo)}</b><div class="sub">${esc(a.location.city || '')}${a.location.zone ? ' · ' + esc(a.location.zone) : ''}</div></td>
      <td>${esc((a.description || '').slice(0, 60))}${(a.description || '').length > 60 ? '…' : ''}</td>
      <td>${esc(a.injuredPerson || '—')}<div class="sub">${esc(a.employeeType || '')}</div></td>
      <td>${a.directControlPresent ? '<span class="pill good">Yes</span>' : '<span class="pill bad">No</span>'}</td>
      <td>${a.methodology ? esc((getMethodology(a.methodology) || {}).label || '') : '<span class="muted">—</span>'}</td>
      <td><span class="status ${a.status}">${esc(a.status)}</span></td>
      <td>${fmtDate(a.occurredAt || a.createdAt)}</td>
      <td class="num"><button class="icon-btn" data-del="${a.id}" title="Delete">🗑</button></td>
    </tr>`;

  root.innerHTML = `
    <header class="view-head">
      <div><h1>Accident reporting</h1><p class="muted">Energy-based incident classification, investigation (RCA) and corrective actions.</p></div>
      <div class="row-gap"><span id="filterMount"></span><a class="btn primary" href="#/accidents/new">+ New accident report</a></div>
    </header>
    <div id="chipMount"></div>

    <section class="kpi-grid">
      ${kpi('Incidents', k.total, `${k.month} this month`)}
      ${kpi('SIF events', k.sif, 'High + Low Energy SIF', k.sif ? 'bad' : 'good')}
      ${kpi('Serious near misses', k.psif, 'pSIF', k.psif ? 'warn' : '')}
      ${kpi('High energy, no control', k.highEnergyNoControl, 'SIF potential', k.highEnergyNoControl ? 'bad' : 'good')}
      ${kpi('Open investigations', k.openInvestigations, '')}
      ${kpi('Open actions', k.openActions, `${k.overdueActions} overdue`, k.overdueActions ? 'bad' : '')}
    </section>

    <section class="card-grid">
      <div class="card span2"><h3>Incidents per month</h3>${lineChart(months, { color: '#E2001A' })}</div>
      <div class="card"><h3>By classification (SIF)</h3>${barChart(byType, { color: '#E2001A' })}</div>
      <div class="card"><h3>Direct control present?</h3><div class="center">${donutChart(ctrl, { colors: ['#1b9e5a', '#cc1122'] })}</div>${legend(ctrl, { colors: ['#1b9e5a', '#cc1122'] })}</div>
      <div class="card"><h3>Energy involved</h3>${barChart(byEnergy, { color: '#e08600' })}</div>
      <div class="card"><h3>By zone / hub</h3>${barChart(byZone, { color: '#2b2f36' })}</div>
    </section>

    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Type</th><th>Ref / site</th><th>What happened</th><th>Person</th><th>Control</th><th>RCA</th><th>Status</th><th>Date</th><th></th></tr></thead>
        <tbody id="rows">${reported.map(row).join('') || '<tr><td colspan="9" class="empty">No accident reports match the filters. <a href="#/accidents/new">Create one →</a></td></tr>'}</tbody>
      </table>
    </div>
  `;

  const rerender = () => renderAccidents(root);
  root.querySelector('#filterMount').append(accFilterButton(reportedAll, rerender));
  const chips = accActiveChips(rerender);
  if (chips) root.querySelector('#chipMount').append(chips);

  root.querySelector('#rows').addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      if (await confirmDialog('Delete this accident report?')) {
        for (const a of (await store.actions()).filter((x) => x.accidentId === del.dataset.del)) await store.delAction(a.id);
        await store.delAccident(del.dataset.del);
        toast('Accident report deleted');
        renderAccidents(root);
      }
      return;
    }
    const tr = e.target.closest('tr.rowlink');
    if (tr) location.hash = `#/accident/${tr.dataset.id}`;
  });
}

export function renderNewAccident(root) {
  root.innerHTML = `
    <header class="view-head"><div><h1>New accident report</h1><p class="muted">Select the energy-based classification. You can change it later; drafts auto-save.</p></div></header>
    <section class="picker-grid">
      ${ACCIDENT_TYPES.map((t) => `
        <a class="picker atype-card ${t.tone}" href="#/accidents/new/${t.id}">
          <div class="atype-tag ${t.tone}">${esc(t.label)}</div>
          <p>${esc(t.desc)}</p>
          <div class="picker-meta">
            <span class="chip">${t.highEnergy === true ? '⚡ High energy' : t.highEnergy === false ? 'Low energy' : 'Energy: t.b.d.'}</span>
            ${t.control === true ? '<span class="chip">🛡️ Control present</span>' : t.control === false ? '<span class="chip">No direct control</span>' : ''}
            ${t.sif ? '<span class="chip">SIF</span>' : ''}
          </div>
        </a>`).join('')}
    </section>
  `;
}
