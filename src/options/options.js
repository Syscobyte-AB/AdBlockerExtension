/**
 * AdBlocker Pro - Options Page Controller
 */

'use strict';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function sendMsg(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(resp);
    });
  });
}

function formatBig(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

// ─── Tab navigation ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    link.classList.add('active');
    document.getElementById('tab-' + tab)?.classList.add('active');
  });
});

// ─── General settings ─────────────────────────────────────────────────────────
const sEnabled  = $('s-enabled');
const sAds      = $('s-ads');
const sTrackers = $('s-trackers');
const sMalware  = $('s-malware');
const sBadge    = $('s-badge');
const btnSave   = $('btn-save');
const saveStatus = $('save-status');

async function loadSettings() {
  try {
    const state = await sendMsg({ type: 'GET_STATE', tabId: -1 });
    const s = state.settings;
    sEnabled.checked  = s.enabled;
    sAds.checked      = s.blockAds;
    sTrackers.checked = s.blockTrackers;
    sMalware.checked  = s.blockMalware;
    sBadge.checked    = s.showBadge !== false;
  } catch (e) {
    console.error('[Options] loadSettings failed:', e);
  }
}

btnSave.addEventListener('click', async () => {
  const settings = {
    enabled:       sEnabled.checked,
    blockAds:      sAds.checked,
    blockTrackers: sTrackers.checked,
    blockMalware:  sMalware.checked,
    showBadge:     sBadge.checked,
  };
  await sendMsg({ type: 'SET_SETTINGS', settings });

  saveStatus.textContent = '✓ Saved';
  saveStatus.classList.add('visible');
  setTimeout(() => saveStatus.classList.remove('visible'), 2500);
});

// ─── Whitelist ─────────────────────────────────────────────────────────────────
const wlInput = $('wl-input');
const wlAdd   = $('wl-add');
const wlList  = $('wl-list');
const wlEmpty = $('wl-empty');
const wlError = $('wl-error');

let whitelist = [];

function isValidDomain(domain) {
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain);
}

function renderWhitelist() {
  wlList.innerHTML = '';
  wlEmpty.style.display = whitelist.length ? 'none' : 'block';

  for (const domain of whitelist) {
    const li = document.createElement('li');
    li.className = 'wl-item';
    li.innerHTML = `
      <span class="wl-domain">${domain}</span>
      <button class="wl-remove" data-domain="${domain}" title="Remove">×</button>
    `;
    wlList.appendChild(li);
  }
}

async function loadWhitelist() {
  try {
    const state = await sendMsg({ type: 'GET_STATE', tabId: -1 });
    whitelist = state.settings.whitelist || [];
    renderWhitelist();
  } catch (e) {
    console.error('[Options] loadWhitelist failed:', e);
  }
}

wlAdd.addEventListener('click', async () => {
  const raw = wlInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  wlError.classList.remove('visible');

  if (!raw) { showError('Enter a domain.'); return; }
  if (!isValidDomain(raw)) { showError('Enter a valid domain like "example.com".'); return; }
  if (whitelist.includes(raw)) { showError('Domain already whitelisted.'); return; }

  await sendMsg({ type: 'ADD_WHITELIST', domain: raw });
  whitelist.push(raw);
  renderWhitelist();
  wlInput.value = '';
});

wlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') wlAdd.click();
});

wlList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.wl-remove');
  if (!btn) return;
  const domain = btn.dataset.domain;
  await sendMsg({ type: 'REMOVE_WHITELIST', domain });
  whitelist = whitelist.filter(d => d !== domain);
  renderWhitelist();
});

function showError(msg) {
  wlError.textContent = msg;
  wlError.classList.add('visible');
}

// ─── Statistics ──────────────────────────────────────────────────────────────
const gsTotal    = $('gs-total');
const gsAds      = $('gs-ads');
const gsTrackers = $('gs-trackers');
const gsMalware  = $('gs-malware');
const gsPages    = $('gs-pages');
const btnReset   = $('btn-reset-stats');

async function loadStats() {
  try {
    const state = await sendMsg({ type: 'GET_STATE', tabId: -1 });
    const g = state.globalStats;
    gsTotal.textContent    = formatBig(g.totalBlocked    || 0);
    gsAds.textContent      = formatBig(g.adsBlocked      || 0);
    gsTrackers.textContent = formatBig(g.trackersBlocked || 0);
    gsMalware.textContent  = formatBig(g.malwareBlocked  || 0);
    gsPages.textContent    = formatBig(g.pagesProtected  || 0);
  } catch (e) {
    console.error('[Options] loadStats failed:', e);
  }
}

btnReset.addEventListener('click', async () => {
  if (!confirm('Reset all lifetime statistics? This cannot be undone.')) return;
  await sendMsg({ type: 'RESET_STATS' });
  await loadStats();
});

// ─── About ───────────────────────────────────────────────────────────────────
function loadAbout() {
  const manifest = chrome.runtime.getManifest();
  const el = $('about-version');
  if (el) el.textContent = 'Version ' + manifest.version;
}

// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadWhitelist();
  await loadStats();
  loadAbout();
});
