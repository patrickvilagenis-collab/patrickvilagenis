// app.js — application shell + hash router.

import { ensureSeed } from './store.js';
import { db, dbMode } from './db.js';
import * as sync from './sync.js';
import { renderLogin } from './auth.js';
import { renderDashboard } from './views/dashboard.js';
import { renderVisits, renderNewVisit } from './views/visits.js';
import { renderVisitForm } from './views/visitForm.js';
import { renderAnalysis } from './views/analysis.js';
import { renderActions } from './views/actions.js';
import { renderSettings } from './views/settings.js';
import { renderAccidents, renderNewAccident } from './views/accidents.js';
import { renderAccidentForm } from './views/accidentForm.js';
import { renderOles } from './views/oles.js';
import { renderOleForm } from './views/oleForm.js';
import { renderIntelligence } from './views/intelligence.js';

const NAV_GROUPS = [
  ['Overview', [
    ['#/dashboard', '📊', 'Dashboard'],
    ['#/intel', '🧠', 'Intelligence'],
  ]],
  ['Field operations', [
    ['#/visits', '📋', 'Field visits'],
    ['#/accidents', '🚨', 'Accidents'],
    ['#/oles', '🎓', 'OLE'],
  ]],
  ['Insights', [
    ['#/analysis', '📈', 'Analysis'],
    ['#/actions', '✅', 'Actions'],
  ]],
  ['System', [
    ['#/settings', '⚙️', 'Settings'],
  ]],
];
const NAV = NAV_GROUPS.flatMap(([, items]) => items);

function shell() {
  document.getElementById('app').innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="./assets/schindler.svg" alt="Schindler" />
        <div class="brand-txt"><b>Safety &amp; Health</b><small>Information Tool</small></div>
      </div>
      <nav class="nav">${NAV_GROUPS.map(([label, items]) =>
        `${label ? `<div class="nav-label">${label}</div>` : ''}` +
        items.map(([h, i, l]) => `<a href="${h}" data-nav="${h}"><span>${i}</span>${l}</a>`).join('')
      ).join('')}</nav>
      <div class="sidebar-foot">
        <div id="userBox" class="user-box"></div>
        <span id="netState" class="net"></span>
      </div>
    </aside>
    <main class="content"><div id="view"></div></main>
    <nav class="tabbar">${NAV.map(([h, i, l]) => `<a href="${h}" data-nav="${h}"><span>${i}</span><small>${l}</small></a>`).join('')}</nav>
  `;
  updateNet();
}

function setActive(hash) {
  const base = '#/' + (hash.split('/')[1] || 'dashboard');
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === base);
  });
}

function updateNet() {
  const n = document.getElementById('netState');
  if (n) { n.textContent = navigator.onLine ? '● Online' : '● Offline'; n.className = `net ${navigator.onLine ? 'on' : 'off'}`; }
  renderUserBox();
}

function renderUserBox() {
  const box = document.getElementById('userBox');
  if (!box) return;
  const u = sync.currentUser();
  if (!u) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="user-row"><span class="user-name" title="${u.role}">👤 ${u.username}${u.role === 'admin' ? ' <span class="user-role">admin</span>' : ''}</span><button class="signout" id="signOut">Sign out</button></div>`;
  box.querySelector('#signOut').addEventListener('click', async () => { await sync.logout(); location.reload(); });
}

async function route() {
  const view = document.getElementById('view');
  if (!view) { shell(); return route(); }
  const hash = location.hash || '#/dashboard';
  setActive(hash);
  window.scrollTo(0, 0);
  const parts = hash.slice(2).split('/'); // drop "#/"
  const [section, a, b] = parts;
  view.innerHTML = `<div class="skel">
    <div class="skel-line w30"></div><div class="skel-line w55 thin"></div>
    <div class="skel-cards">${'<div class="skel-card"></div>'.repeat(4)}</div>
    <div class="skel-block"></div>
  </div>`;
  try {
    switch (section) {
      case '': case 'dashboard': await renderDashboard(view); break;
      case 'visits': await renderVisits(view); break;
      case 'new':
        a ? await renderVisitForm(view, { templateId: a }) : await renderNewVisit(view); break;
      case 'visit': await renderVisitForm(view, { visitId: a }); break;
      case 'accidents':
        if (a === 'new') { b ? await renderAccidentForm(view, { type: b }) : renderNewAccident(view); }
        else await renderAccidents(view);
        break;
      case 'accident': await renderAccidentForm(view, { accidentId: a }); break;
      case 'oles':
        if (a === 'new') await renderOleForm(view, {}); else await renderOles(view);
        break;
      case 'ole': await renderOleForm(view, { oleId: a }); break;
      case 'intel': await renderIntelligence(view); break;
      case 'analysis': await renderAnalysis(view); break;
      case 'actions': await renderActions(view); break;
      case 'settings': await renderSettings(view); break;
      default: location.hash = '#/dashboard';
    }
  } catch (err) {
    console.error(err);
    view.innerHTML = `<div class="empty">Something went wrong rendering this view.<br><code>${esc(err.message)}</code>
      <br><br><a class="btn primary" href="./reset.html">Refresh the app</a></div>`;
  }
}

function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

function showStorageNotice() {
  const foot = document.querySelector('.sidebar-foot');
  if (foot && !document.getElementById('memNotice')) {
    const n = document.createElement('div');
    n.id = 'memNotice';
    n.className = 'mem-notice';
    n.title = 'This browser blocks persistent storage (common on corporate devices). The app works, but changes are not saved after you close it.';
    n.textContent = '⚠ Temporary storage';
    foot.prepend(n);
  }
}

async function boot() {
  // Access gate: when a backend is configured, require a valid login first.
  if (sync.enabled()) {
    const session = await sync.checkSession();
    if (!session) {
      document.getElementById('app').innerHTML = '';
      renderLogin(document.getElementById('app'), () => location.reload());
      registerServiceWorker();
      return;
    }
  }
  shell();
  // In backend mode, pull server data into the local cache before first render.
  if (sync.enabled()) {
    try { await sync.pullAll(db); await sync.flushOutbox(); }
    catch (err) { console.warn('Backend sync unavailable:', err && err.message); }
  }
  try {
    await ensureSeed();
  } catch (err) {
    console.error('Seed/DB error', err);
  }
  if (dbMode === 'memory') showStorageNotice();
  window.addEventListener('online', () => sync.flushOutbox());
  window.addEventListener('hashchange', route);
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  if (!location.hash) location.hash = '#/dashboard';
  route();
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || registerServiceWorker._done) return;
  registerServiceWorker._done = true;
  // Auto-update: when a new service worker takes control, reload once so the
  // user always gets the latest version instead of a stale cached one.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.update();
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) nw.postMessage?.('skipWaiting');
      });
    });
  }).catch(() => {});
}

boot();
