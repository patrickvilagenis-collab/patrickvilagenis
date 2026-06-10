// auth.js — login gate for the app.

import { el } from './utils.js';
import * as sync from './sync.js';

// Renders a full-screen login form into `mount`. Calls onSuccess() after login.
export function renderLogin(mount, onSuccess) {
  const box = el('div', { class: 'login-screen' });
  box.innerHTML = `
    <form class="login-card" autocomplete="on">
      <img class="login-logo" src="./assets/schindler.svg" alt="Schindler"/>
      <h1>Safety &amp; Health Information Tool</h1>
      <p class="login-sub">Sign in to continue</p>
      <label class="fld"><span>Username</span><input id="lgUser" autocomplete="username" autofocus required></label>
      <label class="fld"><span>Password</span><input id="lgPass" type="password" autocomplete="current-password" required></label>
      <button class="btn primary login-btn" id="lgBtn" type="submit">Sign in</button>
      <p class="login-msg" id="lgMsg"></p>
    </form>`;
  mount.innerHTML = '';
  mount.append(box);

  const msg = box.querySelector('#lgMsg');
  const btn = box.querySelector('#lgBtn');
  box.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = box.querySelector('#lgUser').value.trim();
    const p = box.querySelector('#lgPass').value;
    if (!u || !p) return;
    btn.disabled = true; msg.className = 'login-msg'; msg.textContent = 'Signing in…';
    try {
      await sync.login(u, p);
      msg.textContent = '';
      onSuccess();
    } catch (err) {
      btn.disabled = false;
      msg.className = 'login-msg err';
      msg.textContent = err.message === 'invalid'
        ? 'Wrong username or password.'
        : 'Could not reach the server (it may be waking up — wait a few seconds and try again).';
    }
  });
}
