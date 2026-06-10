// views/dashboard.js — KPI cockpit and trend charts.

import { store, buildKpis, visitsByMonth, visitsByFamily, actionsByStatus,
  energyDistribution, controlHierarchyDistribution, topVariabilitySections, monthDeltas } from '../store.js';
import { hbarChart, lineChart, donutChart, legend, gauge, sparkline, PALETTE } from '../charts.js';
import { monthLabel } from '../utils.js';
import { ENERGY_TYPES, CONTROL_HIERARCHY } from '../checklists.js';
import { filterButton, filterVisits, filterActions, activeFilterChips, filters, setFilter } from '../filters.js';

export async function renderDashboard(root) {
  const [allVisits, allActions] = await Promise.all([store.visits(), store.actions()]);
  const submittedAll = allVisits.filter((v) => v.status === 'submitted');
  const visits = filterVisits(allVisits);
  const submitted = visits.filter((v) => v.status === 'submitted');
  const actions = filterActions(allActions, submitted);
  const k = buildKpis(visits, actions);

  const months = visitsByMonth(submitted).map(([m, n]) => [monthLabel(m), n]);
  const fam = visitsByFamily(submitted);
  const famDrills = fam.map(([f]) => 'type:' + f);

  // month-over-month deltas per category
  const energyRows = submitted.flatMap((v) => (v.energy || []).filter((e) => e.present && e.energyId)
    .map((e) => ({ date: v.general.date || v.createdAt, energyId: e.energyId, controlType: e.controlType })));
  const energyDelta = monthDeltas(energyRows, (x) => x.date, (x) => x.energyId);
  const ctrlDelta = monthDeltas(energyRows, (x) => x.date, (x) => x.controlType);
  const statusDelta = monthDeltas(actions, (a) => a.createdAt, (a) => a.status);

  const actStatus = actionsByStatus(actions).map(([s, n]) => [s, n, statusDelta[s] ?? null]);
  const energyDist = energyDistribution(submitted);
  const energy = energyDist.map(([id, n]) => {
    const e = ENERGY_TYPES.find((x) => x.id === id);
    return [e ? `${e.icon} ${e.label}` : id, n, energyDelta[id] ?? null];
  });
  const energyDrills = energyDist.map(([id]) => 'hazard:' + id);
  const ctrl = controlHierarchyDistribution(submitted);
  const ctrlEntries = CONTROL_HIERARCHY.map((c) => [c.label, ctrl[c.id] || 0, ctrlDelta[c.id] ?? null]);
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
        <div class="center">${donutChart(fam, { drills: famDrills })}</div>
        ${legend(fam)}
      </div>
      <div class="card">
        <h3>Actions by status</h3>
        ${hbarChart(actStatus, { color: '#2b2f36' })}
        <p class="hint">▲▼ vs last month (created).</p>
      </div>
      <div class="card">
        <h3>Hierarchy of controls used</h3>
        ${hbarChart(ctrlEntries, { color: '#1b9e5a', deltaGoodUp: true })}
        <p class="hint">Stronger controls (elimination / engineering) at the top.</p>
      </div>

      <div class="card span2">
        <h3>Hazardous energies present (EBS)</h3>
        ${hbarChart(energy, { color: '#e08600', drills: energyDrills })}
        <p class="hint">▲▼ vs last month · click a row to filter the cockpit.</p>
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
  bindDrill(root, rerender);
}

// Click a chart bar/segment to toggle the matching filter.
function bindDrill(root, rerender) {
  root.addEventListener('click', (e) => {
    const d = e.target.closest && e.target.closest('[data-drill]');
    if (!d || !root.contains(d)) return;
    const i = d.dataset.drill.indexOf(':');
    const key = d.dataset.drill.slice(0, i), value = d.dataset.drill.slice(i + 1);
    setFilter(key, filters[key] === value ? '' : value);
    rerender();
  });
}
