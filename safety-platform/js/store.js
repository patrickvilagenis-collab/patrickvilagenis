// store.js — data access layer on top of db.js.
// Owns the Visit / Action data model, derived metrics and seed data.

import { db } from './db.js';
import { uid, nowISO, monthKey, daysBetween } from './utils.js';
import { getTemplate, TEMPLATE_LIST } from './checklists.js';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------
export function newVisit(templateId) {
  const t = getTemplate(templateId);
  return {
    id: uid('visit'),
    templateId,
    templateName: t ? t.name : templateId,
    family: t ? t.family : '',
    status: 'draft',
    general: {
      observer: '', observerId: '', technician: '', employeeType: 'Schindler',
      technicianId: '', equipmentNumber: '', workType: '', address: '',
      supervisor: '', branch: '', city: '', date: new Date().toISOString().slice(0, 10),
    },
    technical: { installationType: '', tractionType: '' },
    responses: {},          // { sectionId: { itemId: { answer, remark, photos:[id] } } }
    energy: [],             // EBS rows
    actions: [],            // embedded action ids materialised in `actions` store
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

export function newAction(visit, partial = {}) {
  return {
    id: uid('act'),
    visitId: visit ? visit.id : null,
    title: partial.title || '',
    description: partial.description || '',
    type: partial.type || 'Learning',
    priority: partial.priority || 'Medium',
    status: partial.status || 'Open',     // Open | In progress | Implemented | Closed
    owner: partial.owner || '',
    site: visit ? (visit.general.address || visit.general.city) : (partial.site || ''),
    dueDate: partial.dueDate || '',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
export const store = {
  visits: () => db.all('visits'),
  visit: (id) => db.get('visits', id),
  async saveVisit(v) { v.updatedAt = nowISO(); return db.put('visits', v); },
  delVisit: (id) => db.del('visits', id),

  actions: () => db.all('actions'),
  action: (id) => db.get('actions', id),
  async saveAction(a) { a.updatedAt = nowISO(); return db.put('actions', a); },
  delAction: (id) => db.del('actions', id),

  async savePhoto(dataURL) {
    const id = uid('ph');
    await db.put('photos', { id, dataURL, createdAt: nowISO() });
    return id;
  },
  photo: (id) => db.get('photos', id),
  delPhoto: (id) => db.del('photos', id),

  meta: (id) => db.get('meta', id),
  setMeta: (id, value) => db.put('meta', { id, value }),
};

// ---------------------------------------------------------------------------
// Derived metrics
// ---------------------------------------------------------------------------
// Per-visit compliance: conform / (conform + variability). N/A excluded.
export function visitScore(visit) {
  let conform = 0, variability = 0;
  for (const sec of Object.values(visit.responses || {})) {
    for (const r of Object.values(sec)) {
      if (r.answer === 'conform') conform++;
      else if (r.answer === 'variability') variability++;
    }
  }
  const total = conform + variability;
  return {
    conform, variability,
    answered: total,
    score: total ? Math.round((conform / total) * 100) : null,
  };
}

export function visitVariabilities(visit) {
  const out = [];
  const t = getTemplate(visit.templateId);
  for (const [secId, sec] of Object.entries(visit.responses || {})) {
    const tsec = t && t.sections.find((s) => s.id === secId);
    for (const [itemId, r] of Object.entries(sec)) {
      if (r.answer === 'variability') {
        const titem = tsec && tsec.items.find((i) => i.id === itemId);
        out.push({ section: tsec ? tsec.title : secId, item: titem ? titem.text : itemId, remark: r.remark || '' });
      }
    }
  }
  return out;
}

export function countPhotos(visit) {
  let n = 0;
  for (const sec of Object.values(visit.responses || {})) {
    for (const r of Object.values(sec)) n += (r.photos || []).length;
  }
  for (const e of visit.energy || []) n += (e.photos || []).length;
  return n;
}

// Dashboard aggregation.
export function buildKpis(visits, actions) {
  const submitted = visits.filter((v) => v.status === 'submitted');
  const thisMonth = monthKey(nowISO());
  const visitsThisMonth = submitted.filter((v) => monthKey(v.general.date || v.createdAt) === thisMonth).length;

  const scores = submitted.map(visitScore).filter((s) => s.score !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : null;
  const totalVar = scores.reduce((a, s) => a + s.variability, 0);

  const openActions = actions.filter((a) => a.status !== 'Closed' && a.status !== 'Implemented');
  const overdue = openActions.filter((a) => a.dueDate && daysBetween(a.dueDate) > 0);

  // EBS coverage: of energies flagged present, share with a direct control in place.
  let energyPresent = 0, energyControlled = 0, highEnergy = 0, highUncontrolled = 0;
  for (const v of submitted) {
    for (const e of v.energy || []) {
      if (!e.present) continue;
      energyPresent++;
      if (e.directControl && e.controlInPlace === 'conform') energyControlled++;
      if (e.highEnergy) {
        highEnergy++;
        if (!(e.directControl && e.controlInPlace === 'conform')) highUncontrolled++;
      }
    }
  }

  return {
    totalVisits: submitted.length,
    drafts: visits.length - submitted.length,
    visitsThisMonth,
    avgScore,
    totalVariabilities: totalVar,
    openActions: openActions.length,
    overdueActions: overdue.length,
    energyPresent,
    controlCoverage: energyPresent ? Math.round((energyControlled / energyPresent) * 100) : null,
    highEnergy,
    highUncontrolled,
  };
}

export function visitsByMonth(visits) {
  const map = {};
  for (const v of visits) {
    const k = monthKey(v.general.date || v.createdAt);
    map[k] = (map[k] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

export function visitsByFamily(visits) {
  const map = {};
  for (const v of visits) map[v.family || 'Other'] = (map[v.family || 'Other'] || 0) + 1;
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function actionsByStatus(actions) {
  const order = ['Open', 'In progress', 'Implemented', 'Closed'];
  const map = Object.fromEntries(order.map((s) => [s, 0]));
  for (const a of actions) map[a.status] = (map[a.status] || 0) + 1;
  return order.map((s) => [s, map[s]]);
}

export function energyDistribution(visits) {
  const map = {};
  for (const v of visits) {
    for (const e of v.energy || []) {
      if (e.present && e.energyId) map[e.energyId] = (map[e.energyId] || 0) + 1;
    }
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export function controlHierarchyDistribution(visits) {
  const map = {};
  for (const v of visits) {
    for (const e of v.energy || []) {
      if (e.present && e.controlType) map[e.controlType] = (map[e.controlType] || 0) + 1;
    }
  }
  return map;
}

export function topVariabilitySections(visits, limit = 6) {
  const map = {};
  for (const v of visits) {
    for (const vr of visitVariabilities(v)) {
      map[vr.section] = (map[vr.section] || 0) + 1;
    }
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Seed data (only on first run) so dashboards/analytics are not empty.
// ---------------------------------------------------------------------------
export async function ensureSeed() {
  const seeded = await store.meta('seeded');
  if (seeded && seeded.value) return;

  const observers = [
    ['Marta Ruiz', 'S10231'], ['Jon Eriksen', 'S20144'], ['Li Wei', 'S33120'],
    ['Carlos Méndez', 'S40988'], ['Anke Müller', 'S55012'],
  ];
  const cities = [
    ['Madrid', 'Iberia Hub', 'Calle Gran Vía 21'],
    ['Milano', 'South Europe Hub', 'Via Torino 14'],
    ['Shanghai', 'China Hub', 'Nanjing Road 88'],
    ['São Paulo', 'LatAm Hub', 'Av. Paulista 1500'],
    ['Berlin', 'DACH Hub', 'Alexanderplatz 3'],
  ];
  const templates = ['safe_ni_trans', 'safe_ei', 'safety_inspection_ei', 'safety_inspection_ni', 'mini_ole'];
  const energies = ['gravity', 'motion', 'electrical', 'mechanical', 'pressure'];

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const created = [];

  for (let i = 0; i < 28; i++) {
    const tplId = rand(templates);
    const t = getTemplate(tplId);
    const v = newVisit(tplId);
    const [name, id] = rand(observers);
    const [city, branch, addr] = rand(cities);
    const daysAgo = Math.floor(Math.random() * 150);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

    v.status = 'submitted';
    v.createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    v.updatedAt = v.createdAt;
    v.general = {
      observer: name, observerId: id, technician: rand(['A. Santos', 'P. Novak', 'R. Costa', 'M. Yilmaz', 'K. Tanaka']),
      employeeType: rand(['Schindler', 'Subcontractor']), technicianId: 'T' + (1000 + i),
      equipmentNumber: 'EQ' + (200000 + Math.floor(Math.random() * 9999)),
      workType: rand(['New installation (NI)', 'Existing installation / Maintenance (EI)', 'Modernization (MOD)']),
      address: addr, supervisor: rand(['L. Romano', 'S. Becker', 'D. Alvarez']),
      branch, city, date,
    };
    v.technical = { installationType: rand(['MR (Machine Room)', 'MRL (Machine Room-Less)']), tractionType: rand(['EG (one speed)', 'VF (variable frequency drive)']) };

    // Answer each item; mostly conform with some variabilities.
    for (const sec of t.sections) {
      if (sec.kind === 'open') continue;
      v.responses[sec.id] = {};
      for (const it of sec.items) {
        const roll = Math.random();
        const answer = roll < 0.12 ? 'variability' : roll < 0.2 ? 'na' : 'conform';
        v.responses[sec.id][it.id] = {
          answer,
          remark: answer === 'variability' ? 'Observed deviation discussed with the technician on site.' : '',
          photos: [],
        };
      }
    }

    // EBS energy rows for templates that support it.
    if (t.hasEBS) {
      const n = 2 + Math.floor(Math.random() * 3);
      const used = new Set();
      for (let k = 0; k < n; k++) {
        let eid = rand(energies);
        if (used.has(eid)) continue;
        used.add(eid);
        const high = Math.random() < 0.45;
        const controlled = Math.random() < 0.8;
        v.energy.push({
          energyId: eid, present: true, highEnergy: high, directControl: controlled,
          controlType: controlled ? rand(['engineering', 'engineering', 'administrative', 'ppe']) : rand(['administrative', 'ppe']),
          controlInPlace: controlled ? 'conform' : 'variability',
          notes: '', photos: [],
        });
      }
    }

    await store.saveVisit(v);
    created.push(v);

    // Create actions from variabilities (a subset).
    const vars = visitVariabilities(v);
    for (const vr of vars) {
      if (Math.random() < 0.55) {
        const st = rand(['Open', 'Open', 'In progress', 'Implemented', 'Closed']);
        const due = new Date(Date.now() + (Math.floor(Math.random() * 40) - 15) * 86400000).toISOString().slice(0, 10);
        const a = newAction(v, {
          title: vr.section,
          description: vr.item,
          type: rand(['Training', 'Learning', 'Risk elimination']),
          priority: rand(['High', 'Medium', 'Low']),
          status: st,
          owner: rand(['L. Romano', 'S. Becker', 'D. Alvarez']),
          dueDate: due,
        });
        a.createdAt = v.createdAt;
        await store.saveAction(a);
      }
    }
  }

  await store.setMeta('seeded', true);
}
