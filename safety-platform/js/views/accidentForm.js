// views/accidentForm.js — create / edit an accident report + RCA investigation.

import { store, newAccident, newAccidentAction } from '../store.js';
import {
  ACCIDENT_TYPES, getAccidentType, INCIDENT_CATEGORIES, INJURY_NATURES, BODY_PARTS,
  METHODOLOGIES, getMethodology, FISHBONE_CATEGORIES, TAPROOT_CATEGORIES,
  newTripodBarrier, newTaprootFactor,
} from '../accidents.js';
import { ENERGY_TYPES } from '../checklists.js';
import { EMPLOYEE_TYPES, WORK_TYPES } from '../checklists.js';
import { el, esc, fmtDateTime, toast, fileToCompressedDataURL, confirmDialog } from '../utils.js';

let _acc = null, _root = null, _saveTimer = null;

export async function renderAccidentForm(root, { type, accidentId }) {
  _root = root;
  if (accidentId) {
    _acc = await store.accident(accidentId);
    if (!_acc) { root.innerHTML = '<p class="empty">Accident report not found.</p>'; return; }
  } else {
    _acc = newAccident(type || '');
    await store.saveAccident(_acc);
    history.replaceState(null, '', `#/accident/${_acc.id}`);
  }
  paint();
}

function scheduleSave(immediate = false) {
  clearTimeout(_saveTimer);
  const run = async () => {
    await store.saveAccident(_acc);
    const ind = document.getElementById('saveState');
    if (ind) ind.textContent = `Saved · ${fmtDateTime(_acc.updatedAt)}`;
  };
  if (immediate) return run();
  const ind = document.getElementById('saveState');
  if (ind) ind.textContent = 'Saving…';
  _saveTimer = setTimeout(run, 600);
}

function field(label, value, oninput, opts = {}) {
  const wrap = el('label', { class: 'fld' });
  wrap.innerHTML = `<span>${esc(label)}</span>`;
  let input;
  if (opts.options) {
    input = el('select');
    input.innerHTML = `<option value="">—</option>` + opts.options.map((o) =>
      `<option value="${esc(o.value ?? o)}" ${value === (o.value ?? o) ? 'selected' : ''}>${esc(o.label ?? o)}</option>`).join('');
  } else if (opts.textarea) {
    input = el('textarea'); input.value = value || ''; if (opts.ph) input.placeholder = opts.ph;
  } else {
    input = el('input', { type: opts.type || 'text', value: value || '' }); if (opts.ph) input.placeholder = opts.ph;
  }
  input.addEventListener('input', () => oninput(input.value));
  if (input.tagName === 'SELECT') input.addEventListener('change', () => oninput(input.value));
  wrap.append(input);
  return wrap;
}

function paint() {
  const a = _acc;
  const t = getAccidentType(a.type);
  _root.innerHTML = `
    <div class="form-head">
      <div>
        <a class="back" href="#/accidents">← Accidents</a>
        <h1>Accident report <span class="muted">${esc(a.refNo)}</span></h1>
        <div class="form-sub"><span class="status ${a.status}">${esc(a.status)}</span>
          <span id="saveState" class="save-state">Saved · ${fmtDateTime(a.updatedAt)}</span></div>
      </div>
      <div class="form-head-actions">
        <label class="fld" style="min-width:170px"><span>Status</span>
          <select id="statusSel">${['draft', 'reported', 'investigation', 'closed'].map((s) => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
      </div>
    </div>

    <nav class="section-nav" id="secNav"></nav>

    <section class="card" id="sec-class">
      <h3>Classification (energy-based)</h3>
      <div class="atype-grid" id="typeGrid"></div>
      <div class="atype-desc" id="typeDesc">${t ? `<b>${esc(t.label)}</b> — ${esc(t.desc)}` : 'Select the incident classification above.'}</div>
    </section>

    <section class="card" id="sec-what">
      <h3>What happened</h3>
      <div class="grid2" id="whatTop"></div>
      <div id="whatText"></div>
    </section>

    <section class="card" id="sec-cat">
      <h3>Categorisation</h3>
      <div class="grid2" id="catFields"></div>
    </section>

    <section class="card" id="sec-energy">
      <h3>⚡ Energy & control</h3>
      <div class="grid2" id="energyFields"></div>
    </section>

    <section class="card" id="sec-photos">
      <h3>📷 Evidence</h3>
      <div class="photos" id="accPhotos"></div>
      <label class="photo-add">📷 Add photo<input type="file" accept="image/*" capture="environment" hidden id="accPhotoInput"></label>
    </section>

    <section class="card" id="sec-rca">
      <div class="card-head"><h3>🔎 Investigation — Root Cause Analysis</h3></div>
      <div class="method-picker" id="methodPicker"></div>
      <div class="method-hint" id="methodHint"></div>
      <div id="rcaLayout"></div>
      <label class="fld" style="margin-top:14px"><span>Root cause(s) — summary</span><textarea id="rootCauses" placeholder="Summarise the root cause(s) identified">${esc(a.rootCauses || '')}</textarea></label>
    </section>

    <section class="card" id="sec-actions">
      <div class="card-head"><h3>✅ Corrective / preventive actions</h3><button class="btn small" id="addAction">+ Add action</button></div>
      <p class="hint">Each action carries an owner, priority and deadline, and feeds the global action tracker.</p>
      <div id="accActions"></div>
    </section>

    <div class="form-footer">
      <button class="btn ghost danger" id="delBtn">Delete report</button>
    </div>
  `;

  buildTypeGrid();
  buildWhat();
  buildCategorisation();
  buildEnergy();
  buildPhotos();
  buildMethodPicker();
  buildRca();
  buildActions();
  buildNav();

  _root.querySelector('#statusSel').addEventListener('change', (e) => { _acc.status = e.target.value; scheduleSave(); refreshStatusChip(); });
  _root.querySelector('#rootCauses').addEventListener('input', (e) => { _acc.rootCauses = e.target.value; scheduleSave(); });
  _root.querySelector('#delBtn').addEventListener('click', async () => {
    if (!(await confirmDialog('Delete this accident report and its actions?'))) return;
    for (const x of (await store.actions()).filter((x) => x.accidentId === _acc.id)) await store.delAction(x.id);
    await store.delAccident(_acc.id);
    toast('Accident report deleted');
    location.hash = '#/accidents';
  });
}

function refreshStatusChip() {
  const chip = _root.querySelector('.form-sub .status');
  if (chip) { chip.className = `status ${_acc.status}`; chip.textContent = _acc.status; }
}

// --- Classification ---------------------------------------------------------
function buildTypeGrid() {
  const grid = _root.querySelector('#typeGrid');
  grid.innerHTML = ACCIDENT_TYPES.map((t) =>
    `<button class="atype-opt ${t.tone} ${_acc.type === t.id ? 'on' : ''}" data-type="${t.id}">
      <b>${esc(t.label)}</b><small>${esc(t.severity)}</small></button>`).join('');
  grid.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => {
    _acc.type = b.dataset.type;
    const t = getAccidentType(_acc.type);
    // align energy/control flags with the chosen classification when defined
    if (t.highEnergy != null) _acc.highEnergy = t.highEnergy;
    if (t.control != null) _acc.directControlPresent = t.control;
    grid.querySelectorAll('[data-type]').forEach((x) => x.classList.toggle('on', x === b));
    _root.querySelector('#typeDesc').innerHTML = `<b>${esc(t.label)}</b> — ${esc(t.desc)}`;
    buildEnergy();
    scheduleSave();
  }));
}

// --- What happened ----------------------------------------------------------
function buildWhat() {
  const top = _root.querySelector('#whatTop');
  top.append(
    field('Date & time occurred', _acc.occurredAt, (v) => { _acc.occurredAt = v; scheduleSave(); }, { type: 'datetime-local' }),
    field('Reported by', _acc.reportedBy, (v) => { _acc.reportedBy = v; scheduleSave(); }),
    field('City', _acc.location.city, (v) => { _acc.location.city = v; scheduleSave(); }),
    field('Zone / Hub', _acc.location.zone, (v) => { _acc.location.zone = v; scheduleSave(); }),
    field('Region', _acc.location.region, (v) => { _acc.location.region = v; scheduleSave(); }),
    field('Branch / Delegation', _acc.location.branch, (v) => { _acc.location.branch = v; scheduleSave(); }),
    field('Site / address', _acc.location.address, (v) => { _acc.location.address = v; scheduleSave(); }),
    field('Equipment / Comm. number', _acc.equipmentNumber, (v) => { _acc.equipmentNumber = v; scheduleSave(); }),
  );
  const text = _root.querySelector('#whatText');
  text.append(
    field('Description of the incident', _acc.description, (v) => { _acc.description = v; scheduleSave(); }, { textarea: true, ph: 'What happened, sequence of events, conditions…' }),
    field('Immediate actions taken', _acc.immediateActions, (v) => { _acc.immediateActions = v; scheduleSave(); }, { textarea: true, ph: 'Area secured, notifications, first aid…' }),
  );
}

// --- Categorisation ---------------------------------------------------------
function buildCategorisation() {
  const f = _root.querySelector('#catFields');
  f.append(
    field('Incident category', _acc.category, (v) => { _acc.category = v; scheduleSave(); }, { options: INCIDENT_CATEGORIES }),
    field('Injured person', _acc.injuredPerson, (v) => { _acc.injuredPerson = v; scheduleSave(); }),
    field('Role', _acc.role, (v) => { _acc.role = v; scheduleSave(); }, { options: ['Technician', 'Apprentice', 'Supervisor', 'Subcontractor staff', 'Third party', 'Other'] }),
    field('Employee type', _acc.employeeType, (v) => { _acc.employeeType = v; scheduleSave(); }, { options: EMPLOYEE_TYPES }),
    field('Work type', _acc.workType, (v) => { _acc.workType = v; scheduleSave(); }, { options: WORK_TYPES }),
    field('Body part', _acc.bodyPart, (v) => { _acc.bodyPart = v; scheduleSave(); }, { options: BODY_PARTS }),
    field('Nature of injury', _acc.injuryNature, (v) => { _acc.injuryNature = v; scheduleSave(); }, { options: INJURY_NATURES }),
    field('Investigation lead', _acc.investigationLead, (v) => { _acc.investigationLead = v; scheduleSave(); }),
  );
}

// --- Energy & control -------------------------------------------------------
function buildEnergy() {
  const f = _root.querySelector('#energyFields');
  f.innerHTML = '';
  f.append(
    field('Energy involved', _acc.energyType, (v) => { _acc.energyType = v; scheduleSave(); },
      { options: ENERGY_TYPES.map((e) => ({ value: e.id, label: `${e.icon} ${e.label}` })) }),
    checkField('High energy (serious-harm potential)', _acc.highEnergy, (v) => { _acc.highEnergy = v; scheduleSave(); }),
    checkField('Direct control present at the time', _acc.directControlPresent, (v) => { _acc.directControlPresent = v; scheduleSave(); }),
  );
}
function checkField(label, value, onchange) {
  const wrap = el('label', { class: 'chk energy-check' });
  wrap.innerHTML = `<input type="checkbox" ${value ? 'checked' : ''}/> ${esc(label)}`;
  wrap.querySelector('input').addEventListener('change', (e) => onchange(e.target.checked));
  return wrap;
}

// --- Photos -----------------------------------------------------------------
function buildPhotos() {
  const cont = _root.querySelector('#accPhotos');
  const render = async () => {
    cont.innerHTML = '';
    for (const pid of _acc.photos || []) {
      const p = await store.photo(pid); if (!p) continue;
      const thumb = el('div', { class: 'thumb' });
      thumb.innerHTML = `<img src="${p.dataURL}"/><button class="thumb-del" data-pid="${pid}">×</button>`;
      thumb.querySelector('img').addEventListener('click', () => {
        const lb = el('div', { class: 'lightbox', onClick: () => lb.remove() }); lb.innerHTML = `<img src="${p.dataURL}"/>`; document.body.append(lb);
      });
      thumb.querySelector('.thumb-del').addEventListener('click', async () => {
        _acc.photos = _acc.photos.filter((x) => x !== pid); await store.delPhoto(pid); scheduleSave(); render();
      });
      cont.append(thumb);
    }
  };
  _root.querySelector('#accPhotoInput').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      try { const url = await fileToCompressedDataURL(file); const id = await store.savePhoto(url); _acc.photos.push(id); }
      catch { toast('Could not read image', 'bad'); }
    }
    e.target.value = ''; scheduleSave(); render();
  });
  render();
}

// --- RCA methodology --------------------------------------------------------
function buildMethodPicker() {
  const picker = _root.querySelector('#methodPicker');
  picker.innerHTML = METHODOLOGIES.map((m) =>
    `<button class="method-opt ${_acc.methodology === m.id ? 'on' : ''}" data-m="${m.id}"><span>${m.icon}</span>${esc(m.label)}</button>`).join('');
  picker.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
    _acc.methodology = _acc.methodology === b.dataset.m ? '' : b.dataset.m;
    picker.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x.dataset.m === _acc.methodology));
    buildRca();
    scheduleSave();
  }));
}

function buildRca() {
  const host = _root.querySelector('#rcaLayout');
  const hint = _root.querySelector('#methodHint');
  const m = getMethodology(_acc.methodology);
  hint.innerHTML = m ? `ℹ ${esc(m.hint)}` : '';
  host.innerHTML = '';
  if (!_acc.methodology) { host.innerHTML = '<p class="hint">Select a methodology above to start the investigation.</p>'; return; }
  ({ five_whys: rcaFiveWhys, fishbone: rcaFishbone, tripod: rcaTripod, taproot: rcaTapRoot }[_acc.methodology])(host);
}

// 5 Whys -------------------------------------------------------------------
function rcaFiveWhys(host) {
  const d = _acc.rca.five_whys;
  const wrap = el('div', { class: 'rca five-whys' });
  const render = () => {
    wrap.innerHTML = `<label class="fld"><span>Problem statement</span><textarea data-k="problem" placeholder="The problem to investigate">${esc(d.problem || '')}</textarea></label>`;
    const chain = el('div', { class: 'why-chain' });
    d.whys.forEach((w, i) => {
      const r = el('div', { class: 'why-row' });
      r.innerHTML = `<span class="why-n">Why ${i + 1}?</span><textarea data-i="${i}" placeholder="Because…">${esc(w)}</textarea>${d.whys.length > 1 ? `<button class="icon-btn" data-del="${i}">🗑</button>` : ''}`;
      chain.append(r);
    });
    wrap.append(chain);
    const add = el('button', { class: 'btn small', onClick: () => { d.whys.push(''); scheduleSave(); render(); } }, '+ Add why');
    wrap.append(add);
    wrap.append(field('Root cause', d.root, (v) => { d.root = v; scheduleSave(); }, { textarea: true }));
    wrap.querySelector('[data-k="problem"]').addEventListener('input', (e) => { d.problem = e.target.value; scheduleSave(); });
    chain.querySelectorAll('textarea[data-i]').forEach((ta) => ta.addEventListener('input', () => { d.whys[+ta.dataset.i] = ta.value; scheduleSave(); }));
    chain.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { d.whys.splice(+b.dataset.del, 1); scheduleSave(); render(); }));
  };
  render();
  host.append(wrap);
}

// Fishbone (Ishikawa) 6M ----------------------------------------------------
function rcaFishbone(host) {
  const d = _acc.rca.fishbone;
  const wrap = el('div', { class: 'rca' });
  wrap.append(field('Effect (problem)', d.effect, (v) => { d.effect = v; scheduleSave(); }, { textarea: true, ph: 'The effect being analysed' }));
  const diagram = el('div', { class: 'fishbone' });
  diagram.innerHTML = `<div class="fish-spine"><span class="fish-head">${esc(d.effect || 'Effect')}</span></div>`;
  wrap.append(diagram);
  const grid = el('div', { class: 'fish-grid' });
  FISHBONE_CATEGORIES.forEach((cat) => {
    d.causes[cat] = d.causes[cat] || [''];
    const card = el('div', { class: 'fish-cat' });
    const render = () => {
      card.innerHTML = `<h4>${esc(cat)}</h4>`;
      d.causes[cat].forEach((c, i) => {
        const r = el('div', { class: 'fish-cause' });
        r.innerHTML = `<input value="${esc(c)}" data-i="${i}" placeholder="Cause…"/>${d.causes[cat].length > 1 ? `<button class="icon-btn" data-del="${i}">×</button>` : ''}`;
        card.append(r);
      });
      const add = el('button', { class: 'linklike', onClick: () => { d.causes[cat].push(''); scheduleSave(); render(); } }, '+ add');
      card.append(add);
      card.querySelectorAll('input[data-i]').forEach((inp) => inp.addEventListener('input', () => { d.causes[cat][+inp.dataset.i] = inp.value; scheduleSave(); diagram.querySelector('.fish-head').textContent = d.effect || 'Effect'; }));
      card.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { d.causes[cat].splice(+b.dataset.del, 1); scheduleSave(); render(); }));
    };
    render();
    grid.append(card);
  });
  wrap.append(grid);
  // keep the diagram head synced with the effect field
  wrap.querySelector('textarea').addEventListener('input', () => { diagram.querySelector('.fish-head').textContent = d.effect || 'Effect'; });
  host.append(wrap);
}

// Tripod Beta ----------------------------------------------------------------
function rcaTripod(host) {
  const d = _acc.rca.tripod;
  const wrap = el('div', { class: 'rca' });
  const trio = el('div', { class: 'tripod-trio' });
  trio.append(
    tripodNode('Hazard / Agent', d.agent, (v) => { d.agent = v; }, 'tri-agent'),
    tripodNode('Event', d.event, (v) => { d.event = v; }, 'tri-event'),
    tripodNode('Target / Object', d.target, (v) => { d.target = v; }, 'tri-target'),
  );
  wrap.append(trio);

  const barriersWrap = el('div', { class: 'barriers' });
  const render = () => {
    barriersWrap.innerHTML = '<h4>Failed / missing barriers</h4>';
    if (!d.barriers.length) barriersWrap.innerHTML += '<p class="hint empty-row">No barriers added yet.</p>';
    d.barriers.forEach((bar, i) => {
      const card = el('div', { class: 'barrier-card' });
      card.innerHTML = `
        <div class="barrier-head"><b>Barrier ${i + 1}</b><button class="icon-btn" data-del>🗑</button></div>
        <label class="fld"><span>Barrier (control that failed/was missing)</span><input data-k="desc" value="${esc(bar.desc)}"/></label>
        <div class="tripod-causes">
          <label class="fld"><span>Active failure (immediate act/condition)</span><textarea data-k="active">${esc(bar.active)}</textarea></label>
          <label class="fld"><span>Precondition</span><textarea data-k="precondition">${esc(bar.precondition)}</textarea></label>
          <label class="fld"><span>Latent / organisational failure</span><textarea data-k="latent">${esc(bar.latent)}</textarea></label>
        </div>`;
      card.querySelectorAll('[data-k]').forEach((inp) => inp.addEventListener('input', () => { bar[inp.dataset.k] = inp.value; scheduleSave(); }));
      card.querySelector('[data-del]').addEventListener('click', () => { d.barriers.splice(i, 1); scheduleSave(); render(); });
      barriersWrap.append(card);
    });
    const add = el('button', { class: 'btn small', onClick: () => { d.barriers.push(newTripodBarrier()); scheduleSave(); render(); } }, '+ Add barrier');
    barriersWrap.append(add);
  };
  render();
  wrap.append(barriersWrap);
  host.append(wrap);
}
function tripodNode(label, value, onchange, cls) {
  const node = el('div', { class: `tripod-node ${cls}` });
  node.innerHTML = `<span>${esc(label)}</span><textarea placeholder="${esc(label)}">${esc(value || '')}</textarea>`;
  node.querySelector('textarea').addEventListener('input', (e) => { onchange(e.target.value); scheduleSave(); });
  return node;
}

// TapRooT --------------------------------------------------------------------
function rcaTapRoot(host) {
  const d = _acc.rca.taproot;
  const wrap = el('div', { class: 'rca' });

  // SnapCharT — sequence of events
  const seq = el('div', { class: 'taproot-seq' });
  const renderSeq = () => {
    seq.innerHTML = '<h4>Sequence of events (SnapCharT)</h4>';
    const row = el('div', { class: 'snap-row' });
    d.events.forEach((ev, i) => {
      const step = el('div', { class: 'snap-step' });
      step.innerHTML = `<span class="snap-n">${i + 1}</span><input value="${esc(ev)}" data-i="${i}" placeholder="Event step"/>${d.events.length > 1 ? `<button class="icon-btn" data-del="${i}">×</button>` : ''}`;
      row.append(step);
    });
    seq.append(row);
    const add = el('button', { class: 'btn small', onClick: () => { d.events.push(''); scheduleSave(); renderSeq(); } }, '+ Add event');
    seq.append(add);
    row.querySelectorAll('input[data-i]').forEach((inp) => inp.addEventListener('input', () => { d.events[+inp.dataset.i] = inp.value; scheduleSave(); }));
    row.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { d.events.splice(+b.dataset.del, 1); scheduleSave(); renderSeq(); }));
  };
  renderSeq();
  wrap.append(seq);

  // Causal factors → Root Cause Tree category → root cause
  const facWrap = el('div', { class: 'taproot-factors' });
  const renderFac = () => {
    facWrap.innerHTML = '<h4>Causal factors → root causes</h4>';
    if (!d.factors.length) facWrap.innerHTML += '<p class="hint empty-row">No causal factors yet.</p>';
    d.factors.forEach((f, i) => {
      const card = el('div', { class: 'factor-card' });
      card.innerHTML = `
        <div class="barrier-head"><b>Causal factor ${i + 1}</b><button class="icon-btn" data-del>🗑</button></div>
        <label class="fld"><span>Causal factor</span><input data-k="desc" value="${esc(f.desc)}"/></label>
        <div class="grid2">
          <label class="fld"><span>Root cause category</span><select data-k="category"><option value="">—</option>${TAPROOT_CATEGORIES.map((c) => `<option ${f.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
          <label class="fld"><span>Root cause</span><input data-k="root" value="${esc(f.root)}"/></label>
        </div>`;
      card.querySelectorAll('[data-k]').forEach((inp) => inp.addEventListener('input', () => { f[inp.dataset.k] = inp.value; scheduleSave(); }));
      card.querySelector('select').addEventListener('change', (e) => { f.category = e.target.value; scheduleSave(); });
      card.querySelector('[data-del]').addEventListener('click', () => { d.factors.splice(i, 1); scheduleSave(); renderFac(); });
      facWrap.append(card);
    });
    const add = el('button', { class: 'btn small', onClick: () => { d.factors.push(newTaprootFactor()); scheduleSave(); renderFac(); } }, '+ Add causal factor');
    facWrap.append(add);
  };
  renderFac();
  wrap.append(facWrap);
  host.append(wrap);
}

// --- Actions ----------------------------------------------------------------
async function buildActions() {
  const wrap = _root.querySelector('#accActions');
  const all = (await store.actions()).filter((x) => x.accidentId === _acc.id);
  wrap.innerHTML = '';
  if (!all.length) wrap.innerHTML = '<p class="hint empty-row">No actions yet.</p>';
  all.forEach((a) => wrap.append(actionRow(a)));
  const add = _root.querySelector('#addAction');
  if (add && !add._bound) {
    add._bound = true;
    add.addEventListener('click', async () => { await store.saveAction(newAccidentAction(_acc, { type: 'Corrective' })); buildActions(); });
  }
}
function actionRow(a) {
  const node = el('div', { class: 'action-row' });
  node.innerHTML = `
    <div class="grid2">
      <label class="fld"><span>Title</span><input data-k="title" value="${esc(a.title)}"/></label>
      <label class="fld"><span>Owner / responsible</span><input data-k="owner" value="${esc(a.owner)}"/></label>
    </div>
    <label class="fld"><span>Description</span><textarea data-k="description">${esc(a.description)}</textarea></label>
    <div class="grid4">
      <label class="fld"><span>Type</span><select data-k="type">${['Corrective', 'Preventive', 'Training', 'Risk elimination'].map((x) => `<option ${a.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="fld"><span>Priority</span><select data-k="priority">${['High', 'Medium', 'Low'].map((x) => `<option ${a.priority === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="fld"><span>Status</span><select data-k="status">${['Open', 'In progress', 'Implemented', 'Closed'].map((x) => `<option ${a.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="fld"><span>Deadline</span><input type="date" data-k="dueDate" value="${esc(a.dueDate)}"/></label>
    </div>
    <div class="action-foot"><button class="icon-btn del" data-del>🗑 Remove</button></div>`;
  node.querySelectorAll('[data-k]').forEach((inp) => inp.addEventListener('input', async () => { a[inp.dataset.k] = inp.value; await store.saveAction(a); }));
  node.querySelector('[data-del]').addEventListener('click', async () => { await store.delAction(a.id); buildActions(); });
  return node;
}

// --- Section nav ------------------------------------------------------------
function buildNav() {
  const nav = _root.querySelector('#secNav');
  const links = [['Classification', 'sec-class'], ['What happened', 'sec-what'], ['Categorisation', 'sec-cat'],
    ['⚡ Energy', 'sec-energy'], ['📷 Evidence', 'sec-photos'], ['🔎 RCA', 'sec-rca'], ['✅ Actions', 'sec-actions']];
  nav.innerHTML = links.map(([l, id]) => `<a href="#" data-to="${id}">${esc(l)}</a>`).join('');
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('[data-to]'); if (!a) return; e.preventDefault();
    document.getElementById(a.dataset.to)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
