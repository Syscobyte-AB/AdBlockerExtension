/**
 * AdBlocker Pro - Popup Controller
 * Fetches live state from the background and wires all UI interactions.
 */

'use strict';

// ─── DOM references ───────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const app           = $('app');
const masterToggle  = $('master-toggle');
const statusLabel   = $('status-label');
const siteDomain    = $('site-domain');
const whitelistBtn  = $('whitelist-btn');
const statPage      = $('stat-page');
const statAds       = $('stat-ads');
const statTrackers  = $('stat-trackers');
const statMalware   = $('stat-malware');
const toggleAds     = $('toggle-ads');
const toggleTrackers = $('toggle-trackers');
const toggleMalware = $('toggle-malware');
const btnSettings   = $('btn-settings');
const btnReset      = $('btn-reset');

// ─── State ─────────────────────────────────────────────────────────────────
let currentSettings = {};
let currentTab = null;
let currentDomain = '';

// ─── Helpers ──────────────────────────────────────────────────────────────
function sendMsg(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (resp) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(resp);
    });
  });
}

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

function animateValue(el, from, to, duration = 300) {
  if (from === to) return;
  const start = performance.now();
  const range = to - from;
  function step(now) {
    const pct = Math.min((now - start) / duration, 1);
    el.textContent = formatCount(Math.round(from + range * pct));
    if (pct < 1) requestAnimationFrame(step);
    else el.textContent = formatCount(to);
  }
  requestAnimationFrame(step);
}

// ─── UI Render ────────────────────────────────────────────────────────────
function applySettings(s) {
  // Master toggle
  masterToggle.checked = s.enabled;
  app.classList.toggle('app-disabled', !s.enabled);

  // Status badge
  if (!s.enabled) {
    statusLabel.textContent = 'Paused';
    statusLabel.className = 'status-badge status-off';
  } else if (!s.blockAds && !s.blockTrackers && !s.blockMalware) {
    statusLabel.textContent = 'Partial';
    statusLabel.className = 'status-badge status-partial';
  } else {
    statusLabel.textContent = 'Protected';
    statusLabel.className = 'status-badge status-on';
  }

  // Feature toggles
  toggleAds.checked      = s.blockAds;
  toggleTrackers.checked = s.blockTrackers;
  toggleMalware.checked  = s.blockMalware;

  // Whitelist button
  const whitelisted = s.whitelist && s.whitelist.includes(currentDomain);
  whitelistBtn.textContent = whitelisted ? 'Allowed ✓' : 'Allow site';
  whitelistBtn.className   = 'chip ' + (whitelisted ? 'chip-allowed' : 'chip-allow');
}

function applyStats(globalStats, tabBlocked) {
  const prev = {
    page:     parseInt(statPage.textContent.replace(/[k M]/g,'')) || 0,
    ads:      parseInt(statAds.textContent.replace(/[k M]/g,'')) || 0,
    trackers: parseInt(statTrackers.textContent.replace(/[k M]/g,'')) || 0,
    malware:  parseInt(statMalware.textContent.replace(/[k M]/g,'')) || 0,
  };
  animateValue(statPage,     prev.page,     tabBlocked              || 0);
  animateValue(statAds,      prev.ads,      globalStats.adsBlocked  || 0);
  animateValue(statTrackers, prev.trackers, globalStats.trackersBlocked || 0);
  animateValue(statMalware,  prev.malware,  globalStats.malwareBlocked  || 0);
}

// ─── Load state ───────────────────────────────────────────────────────────
async function loadState() {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  currentDomain = tab ? getDomain(tab.url) : '';

  // Update site banner
  siteDomain.textContent = currentDomain || 'unknown';
  whitelistBtn.style.display = currentDomain ? '' : 'none';

  // Fetch state from background
  try {
    const state = await sendMsg({ type: 'GET_STATE', tabId: tab?.id });
    currentSettings = state.settings;
    applySettings(state.settings);
    applyStats(state.globalStats, state.tabBlocked);
  } catch (e) {
    console.error('[Popup] GET_STATE failed:', e);
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────
masterToggle.addEventListener('change', async () => {
  const enabled = masterToggle.checked;
  currentSettings.enabled = enabled;
  applySettings(currentSettings);
  await sendMsg({ type: 'SET_SETTINGS', settings: { enabled } });
});

toggleAds.addEventListener('change', async () => {
  currentSettings.blockAds = toggleAds.checked;
  applySettings(currentSettings);
  await sendMsg({ type: 'SET_SETTINGS', settings: { blockAds: toggleAds.checked } });
});

toggleTrackers.addEventListener('change', async () => {
  currentSettings.blockTrackers = toggleTrackers.checked;
  applySettings(currentSettings);
  await sendMsg({ type: 'SET_SETTINGS', settings: { blockTrackers: toggleTrackers.checked } });
});

toggleMalware.addEventListener('change', async () => {
  currentSettings.blockMalware = toggleMalware.checked;
  applySettings(currentSettings);
  await sendMsg({ type: 'SET_SETTINGS', settings: { blockMalware: toggleMalware.checked } });
});

whitelistBtn.addEventListener('click', async () => {
  if (!currentDomain) return;
  const whitelist = currentSettings.whitelist || [];
  const isListed  = whitelist.includes(currentDomain);

  if (isListed) {
    await sendMsg({ type: 'REMOVE_WHITELIST', domain: currentDomain });
    currentSettings.whitelist = whitelist.filter(d => d !== currentDomain);
  } else {
    await sendMsg({ type: 'ADD_WHITELIST', domain: currentDomain });
    currentSettings.whitelist = [...whitelist, currentDomain];
  }
  applySettings(currentSettings);
});

btnSettings.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

btnReset.addEventListener('click', async () => {
  if (!confirm('Reset all statistics?')) return;
  await sendMsg({ type: 'RESET_STATS' });
  applyStats({ adsBlocked: 0, trackersBlocked: 0, malwareBlocked: 0 }, 0);
});

// ─── Live polling (updates badge stats while popup is open) ───────────────
let pollTimer = null;

function startPolling() {
  pollTimer = setInterval(async () => {
    if (!currentTab) return;
    try {
      const state = await sendMsg({ type: 'GET_STATE', tabId: currentTab.id });
      applyStats(state.globalStats, state.tabBlocked);
    } catch {
      clearInterval(pollTimer);
    }
  }, 1500);
}

// ─── Boot ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState().then(startPolling);
});

window.addEventListener('unload', () => {
  clearInterval(pollTimer);
});
