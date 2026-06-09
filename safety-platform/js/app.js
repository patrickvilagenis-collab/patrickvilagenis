// app.js — application shell + hash router.

import { ensureSeed } from './store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderVisits, renderNewVisit } from './views/visits.js';
import { renderVisitForm } from './views/visitForm.js';
import { renderAnalysis } from './views/analysis.js';
import { renderActions } from './views/actions.js';
import { renderSettings } from './views/settings.js';
import { renderAccidents, renderNewAccident } from './views/accidents.js';
import { renderAccidentForm } from './views/accidentForm.js';

const NAV = [
  ['#/dashboard', '📊', 'Dashboard'],
  ['#/visits', '📋', 'Field visits'],
  ['#/accidents', '🚨', 'Accidents'],
  ['#/analysis', '📈', 'Analysis'],
  ['#/actions', '✅', 'Actions'],
  ['#/settings', '⚙️', 'Settings'],
];

function shell() {
  document.getElementById('app').innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="./assets/schindler.svg" alt="Schindler" />
        <div class="brand-txt"><b>Safety &amp; Health</b><small>Information Tool</small></div>
      </div>
      <nav class="nav">${NAV.map(([h, i, l]) => `<a href="${h}" data-nav="${h}"><span>${i}</span>${l}</a>`).join('')}</nav>
      <div class="sidebar-foot">
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
}

async function route() {
  const view = document.getElementById('view');
  if (!view) { shell(); return route(); }
  const hash = location.hash || '#/dashboard';
  setActive(hash);
  window.scrollTo(0, 0);
  const parts = hash.slice(2).split('/'); // drop "#/"
  const [section, a, b] = parts;
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

async function boot() {
  shell();
  try {
    await ensureSeed();
  } catch (err) {
    console.error('Seed/DB error', err);
    const view = document.getElementById('view');
    if (view) view.innerHTML = `<div class="empty">The local database could not be opened.<br><code>${esc(err.message)}</code><br><br><a class="btn primary" href="./reset.html">Refresh the app</a></div>`;
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  if (!location.hash) location.hash = '#/dashboard';
  route();

  if ('serviceWorker' in navigator) {
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
}

boot();
