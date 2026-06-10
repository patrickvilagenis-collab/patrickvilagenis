// views/dashboard.js — KPI cockpit and trend charts.

import { store, buildKpis, visitsByMonth, visitsByFamily, actionsByStatus,
  energyDistribution, controlHierarchyDistribution, topVariabilitySections } from '../store.js';
import { barChart, lineChart, donutChart, legend, gauge, sparkline, PALETTE } from '../charts.js';
import { monthLabel } from '../utils.js';
import { ENERGY_TYPES, CONTROL_HIERARCHY } from '../checklists.js';
import { filterButton, filterVisits, filterActions, activeFilterChips } from '../filters.js';

export async function renderDashboard(root) {
  const [allVisits, allActions] = await Promise.all([store.visits(), store.actions()]);
  const submittedAll = allVisits.filter((v) => v.status === 'submitted');
  const visits = filterVisits(allVisits);
  const submitted = visits.filter((v) => v.status === 'submitted');
  const actions = filterActions(allActions, submitted);
  const k = buildKpis(visits, actions);

  const months = visitsByMonth(submitted).map(([m, n]) => [monthLabel(m), n]);
  const fam = visitsByFamily(submitted);
  const actStatus = actionsByStatus(actions);
  const energy = energyDistribution(submitted).map(([id, n]) => {
    const e = ENERGY_TYPES.find((x) => x.id === id);
    return [e ? `${e.icon} ${e.label}` : id, n];
  });
  const ctrl = controlHierarchyDistribution(submitted);
  const ctrlEntries = CONTROL_HIERARCHY.map((c) => [c.label, ctrl[c.id] || 0]);
  const topVar = topVariabilitySections(submitted);

  const kpi = (label, value, sub, tone = '', extra = '') =>
    `<div class="kpi ${tone}"><div class="kpi-val">${value}</div><div class="kpi-lbl">${label}</div>${sub ? `<div class="kpi-sub">${sub}</div>` : ''}${extra}</div>`;

  // month-over-month delta for visit activity
  const mvals = months.map((m) => m[1]);
  const lastM = mvals.length ? mvals[mvals.length - 1] : 0;
  const prevM = mvals.length > 1 ? mvals[mvals.length - 2] : null;
  const delta = prevM ? Math.round(((lastM - prevM) / prevM) * 100) : null;
  const deltaChip = delta == null ? '' : `<span class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%</span>`;

  root.innerHTML = `
    <header class="view-head">
      <div>
        <h1>Safety cockpit</h1>
        <p class="muted">Live view of field safety activity, controls and open actions.</p>
      </div>
      <div class="row-gap"><span id="filterMount"></span><a class="btn primary" href="#/new">+ New field visit</a></div>
    </header>
    <div id="chipMount"></div>

    <section class="kpi-grid">
      ${kpi('Visits (total)', k.totalVisits, `${k.visitsThisMonth} this month ${deltaChip}`, '', mvals.length > 1 ? `<div class="kpi-spark">${sparkline(mvals)}</div>` : '')}
      ${kpi('Avg. compliance', k.avgScore != null ? k.avgScore + '%' : '—', `${k.totalVariabilities} variabilities`, k.avgScore != null && k.avgScore < 80 ? 'warn' : 'good')}
      ${kpi('Open actions', k.openActions, `${k.overdueActions} overdue`, k.overdueActions ? 'bad' : '')}
      ${kpi('EBS control coverage', k.controlCoverage != null ? k.controlCoverage + '%' : '—', `${k.energyPresent} energies assessed`, k.controlCoverage != null && k.controlCoverage < 80 ? 'warn' : 'good')}
      ${kpi('High-energy exposures', k.highEnergy, `${k.highUncontrolled} without direct control`, k.highUncontrolled ? 'bad' : 'good')}
      ${kpi('Drafts in progress', k.drafts, 'auto-saved offline')}
    </section>

    <section class="card-grid">
      <div class="card span2">
        <h3>Visits per month</h3>
        ${lineChart(months, { color: '#E2001A' })}
      </div>
      <div class="card">
        <h3>Avg. compliance</h3>
        <div class="center">${gauge(k.avgScore, { label: 'conform rate' })}</div>
      </div>

      <div class="card">
        <h3>Visits by type</h3>
        <div class="center">${donutChart(fam)}</div>
        ${legend(fam)}
      </div>
      <div class="card">
        <h3>Actions by status</h3>
        ${barChart(actStatus, { color: '#2b2f36' })}
      </div>
      <div class="card">
        <h3>Hierarchy of controls used</h3>
        ${barChart(ctrlEntries, { color: '#10b981' })}
        <p class="hint">Higher bars on the left (elimination / engineering) mean stronger controls.</p>
      </div>

      <div class="card span2">
        <h3>Hazardous energies present (EBS)</h3>
        ${barChart(energy, { color: '#f59e0b' })}
      </div>
      <div class="card">
        <h3>Top areas with variabilities</h3>
        ${topVar.length ? `<ul class="rank">${topVar.map((t, i) =>
          `<li><span class="rank-n" style="background:${PALETTE[i % PALETTE.length]}">${i + 1}</span><span class="rank-lbl">${t[0]}</span><b>${t[1]}</b></li>`).join('')}</ul>`
          : '<p class="hint">No variabilities recorded yet.</p>'}
      </div>
    </section>
  `;

  const rerender = () => renderDashboard(root);
  root.querySelector('#filterMount').append(filterButton(submittedAll, rerender));
  const chips = activeFilterChips(rerender);
  if (chips) root.querySelector('#chipMount').append(chips);
}
