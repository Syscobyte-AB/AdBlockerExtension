/**
 * AdBlocker Pro - Background Service Worker
 * Handles request counting, whitelist management, and badge updates.
 */

'use strict';

// ─── Domain category map ─────────────────────────────────────────────────────
// Maps root domain → category ('ad' | 'tracker' | 'malware')
const DOMAIN_CATEGORIES = {
  // Ad networks
  'doubleclick.net': 'ad',
  'googlesyndication.com': 'ad',
  'googleadservices.com': 'ad',
  'googletagservices.com': 'ad',
  'adservice.google.com': 'ad',
  'pagead2.googlesyndication.com': 'ad',
  'tpc.googlesyndication.com': 'ad',
  'securepubads.g.doubleclick.net': 'ad',
  'stats.g.doubleclick.net': 'ad',
  'ads.youtube.com': 'ad',
  'connect.facebook.net': 'ad',
  'an.facebook.com': 'ad',
  'audiencenetwork.com': 'ad',
  'ads.twitter.com': 'ad',
  'static.ads-twitter.com': 'ad',
  'ads.x.com': 'ad',
  'amazon-adsystem.com': 'ad',
  'aax.amazon-adsystem.com': 'ad',
  's.amazon-adsystem.com': 'ad',
  'outbrain.com': 'ad',
  'widgets.outbrain.com': 'ad',
  'taboola.com': 'ad',
  'trc.taboola.com': 'ad',
  'cdn.taboola.com': 'ad',
  'criteo.com': 'ad',
  'static.criteo.net': 'ad',
  'dis.criteo.com': 'ad',
  'openx.net': 'ad',
  'delivery.openx.net': 'ad',
  'pubmatic.com': 'ad',
  'ads.pubmatic.com': 'ad',
  'rubiconproject.com': 'ad',
  'fastlane.rubiconproject.com': 'ad',
  'adnxs.com': 'ad',
  'media.net': 'ad',
  'contextual.media.net': 'ad',
  'moatads.com': 'ad',
  'z.moatads.com': 'ad',
  'adroll.com': 'ad',
  'd.adroll.com': 'ad',
  's.adroll.com': 'ad',
  'smartadserver.com': 'ad',
  'yieldmo.com': 'ad',
  'mathtag.com': 'ad',
  'revcontent.com': 'ad',
  'sharethrough.com': 'ad',
  '33across.com': 'ad',
  'advertising.com': 'ad',
  'tremorvideo.com': 'ad',
  'spotxchange.com': 'ad',
  'spotx.tv': 'ad',
  'undertone.com': 'ad',

  // Trackers / analytics
  'google-analytics.com': 'tracker',
  'analytics.google.com': 'tracker',
  'googletagmanager.com': 'tracker',
  'ssl.google-analytics.com': 'tracker',
  'www.google-analytics.com': 'tracker',
  'hotjar.com': 'tracker',
  'static.hotjar.com': 'tracker',
  'script.hotjar.com': 'tracker',
  'vars.hotjar.com': 'tracker',
  'fullstory.com': 'tracker',
  'rs.fullstory.com': 'tracker',
  'edge.fullstory.com': 'tracker',
  'mouseflow.com': 'tracker',
  'cdn.mouseflow.com': 'tracker',
  'mixpanel.com': 'tracker',
  'api.mixpanel.com': 'tracker',
  'cdn.mxpnl.com': 'tracker',
  'segment.io': 'tracker',
  'api.segment.io': 'tracker',
  'cdn.segment.com': 'tracker',
  'api.segment.com': 'tracker',
  'amplitude.com': 'tracker',
  'api.amplitude.com': 'tracker',
  'cdn.amplitude.com': 'tracker',
  'heap.io': 'tracker',
  'heapanalytics.com': 'tracker',
  'cdn.heapanalytics.com': 'tracker',
  'inspectlet.com': 'tracker',
  'quantserve.com': 'tracker',
  'pixel.quantserve.com': 'tracker',
  'scorecardresearch.com': 'tracker',
  'b.scorecardresearch.com': 'tracker',
  'comscore.com': 'tracker',
  'nr-data.net': 'tracker',
  'bam.nr-data.net': 'tracker',
  'js-agent.newrelic.com': 'tracker',
  'kissmetrics.com': 'tracker',
  'hs-analytics.net': 'tracker',
  'pardot.com': 'tracker',
  'cdn.crazyegg.com': 'tracker',
  'addthis.com': 'tracker',
  's7.addthis.com': 'tracker',
  'sharethis.com': 'tracker',
  'platform.sharethis.com': 'tracker',
  'snap.licdn.com': 'tracker',
  'ads.linkedin.com': 'tracker',
  'px.ads.linkedin.com': 'tracker',
  'ads.pinterest.com': 'tracker',
  'ct.pinterest.com': 'tracker',
  'ads.tiktok.com': 'tracker',
  'analytics.tiktok.com': 'tracker',
  'track.hubspot.com': 'tracker',
  'js.hs-scripts.com': 'tracker',

  // Malware / cryptominers / aggressive ad nets
  'coinhive.com': 'malware',
  'coin-hive.com': 'malware',
  'cryptoloot.com': 'malware',
  'jsecoin.com': 'malware',
  'minero.cc': 'malware',
  'webmine.pro': 'malware',
  'monerominer.rocks': 'malware',
  'popads.net': 'malware',
  'popcash.net': 'malware',
  'clicksor.com': 'malware',
  'propellerads.com': 'malware',
  'adsterra.com': 'malware',
  'exoclick.com': 'malware',
  'juicyads.com': 'malware',
  'trafficjunky.net': 'malware',
  'clickadu.com': 'malware',
  'hilltopads.net': 'malware',
  'zedo.com': 'malware',
};

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  enabled: true,
  blockAds: true,
  blockTrackers: true,
  blockMalware: true,
  showBadge: true,
  whitelist: [],
};

const DEFAULT_STATS = {
  totalBlocked: 0,
  adsBlocked: 0,
  trackersBlocked: 0,
  malwareBlocked: 0,
  pagesProtected: 0,
};

// In-memory cache (refreshed from storage on startup)
let settings = { ...DEFAULT_SETTINGS };
let globalStats = { ...DEFAULT_STATS };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rootDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}

function getDomainCategory(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    // Exact match first
    if (DOMAIN_CATEGORIES[hostname]) return DOMAIN_CATEGORIES[hostname];
    // Root domain match
    const root = rootDomain(hostname);
    return DOMAIN_CATEGORIES[root] || null;
  } catch {
    return null;
  }
}

function isWhitelisted(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return settings.whitelist.some(entry => {
      const clean = entry.toLowerCase().replace(/^www\./, '');
      return hostname === clean || hostname.endsWith('.' + clean);
    });
  } catch {
    return false;
  }
}

function isCategoryEnabled(category) {
  if (!settings.enabled) return false;
  if (category === 'ad') return settings.blockAds;
  if (category === 'tracker') return settings.blockTrackers;
  if (category === 'malware') return settings.blockMalware;
  return false;
}

async function persistStats() {
  await chrome.storage.local.set({ globalStats });
}

async function updateBadge(tabId) {
  if (!settings.showBadge || tabId < 0) return;
  const result = await chrome.storage.local.get('tabStats');
  const tabStats = result.tabStats || {};
  const count = tabStats[tabId] || 0;
  const text = count > 999 ? '999+' : count > 0 ? String(count) : '';
  try {
    await chrome.action.setBadgeText({ text, tabId });
    if (count > 0) {
      await chrome.action.setBadgeBackgroundColor({ color: '#e74c3c', tabId });
    }
  } catch {
    // Tab may have been closed
  }
}

// ─── webRequest observer (count-only, no blocking) ───────────────────────────

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (!settings.enabled) return;
    if (isWhitelisted(details.url)) return;

    const category = getDomainCategory(details.url);
    if (!category || !isCategoryEnabled(category)) return;

    // Increment global stats
    globalStats.totalBlocked++;
    if (category === 'ad') globalStats.adsBlocked++;
    else if (category === 'tracker') globalStats.trackersBlocked++;
    else if (category === 'malware') globalStats.malwareBlocked++;

    // Increment per-tab stats
    const result = await chrome.storage.local.get('tabStats');
    const tabStats = result.tabStats || {};
    tabStats[details.tabId] = (tabStats[details.tabId] || 0) + 1;
    await chrome.storage.local.set({ tabStats, globalStats });

    if (details.tabId > 0) {
      updateBadge(details.tabId);
    }
  },
  { urls: ['<all_urls>'] }
);

// ─── Reset per-tab counter on new page navigation ────────────────────────────

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return; // main frame only
  chrome.storage.local.get('tabStats', (result) => {
    const tabStats = result.tabStats || {};
    tabStats[details.tabId] = 0;
    chrome.storage.local.set({ tabStats });
    chrome.action.setBadgeText({ text: '', tabId: details.tabId }).catch(() => {});
  });

  // Count protected pages
  globalStats.pagesProtected++;
  persistStats();
});

// ─── Cleanup on tab close ────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get('tabStats', (result) => {
    const tabStats = result.tabStats || {};
    delete tabStats[tabId];
    chrome.storage.local.set({ tabStats });
  });
});

// ─── Apply ruleset enable/disable ────────────────────────────────────────────

async function applyRulesets(s) {
  const enable = [];
  const disable = [];

  const map = { ads: s.blockAds && s.enabled, privacy: s.blockTrackers && s.enabled, malware: s.blockMalware && s.enabled };
  for (const [id, on] of Object.entries(map)) {
    (on ? enable : disable).push(id);
  }

  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enable,
      disableRulesetIds: disable,
    });
  } catch (e) {
    console.warn('[AdBlocker] updateEnabledRulesets failed:', e.message);
  }
}

// ─── Message bus ─────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'GET_STATE': {
      chrome.storage.local.get(['tabStats'], (result) => {
        const tabStats = result.tabStats || {};
        sendResponse({
          settings,
          globalStats,
          tabBlocked: tabStats[msg.tabId] || 0,
        });
      });
      return true;
    }

    case 'SET_SETTINGS': {
      settings = { ...settings, ...msg.settings };
      chrome.storage.local.set({ settings }, async () => {
        await applyRulesets(settings);
        sendResponse({ ok: true });
      });
      return true;
    }

    case 'RESET_STATS': {
      globalStats = { ...DEFAULT_STATS };
      chrome.storage.local.set({ globalStats, tabStats: {} }, () => {
        sendResponse({ ok: true });
      });
      return true;
    }

    case 'ADD_WHITELIST': {
      if (!settings.whitelist.includes(msg.domain)) {
        settings.whitelist.push(msg.domain);
        chrome.storage.local.set({ settings }, () => sendResponse({ ok: true }));
      } else {
        sendResponse({ ok: true });
      }
      return true;
    }

    case 'REMOVE_WHITELIST': {
      settings.whitelist = settings.whitelist.filter(d => d !== msg.domain);
      chrome.storage.local.set({ settings }, () => sendResponse({ ok: true }));
      return true;
    }

    case 'GET_DOMAIN_CATEGORY': {
      sendResponse({ category: getDomainCategory(msg.url) });
      return false;
    }
  }
});

// ─── Startup / install ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  const result = await chrome.storage.local.get(['settings', 'globalStats']);

  if (!result.settings) {
    settings = { ...DEFAULT_SETTINGS };
    await chrome.storage.local.set({ settings });
  } else {
    settings = { ...DEFAULT_SETTINGS, ...result.settings };
  }

  if (!result.globalStats) {
    globalStats = { ...DEFAULT_STATS };
    await chrome.storage.local.set({ globalStats });
  } else {
    globalStats = { ...DEFAULT_STATS, ...result.globalStats };
  }

  await applyRulesets(settings);

  if (details.reason === 'install') {
    console.log('[AdBlocker] Installed — welcome!');
  } else if (details.reason === 'update') {
    console.log('[AdBlocker] Updated to', chrome.runtime.getManifest().version);
  }
});

// Load settings on service worker wake-up
(async () => {
  const result = await chrome.storage.local.get(['settings', 'globalStats']);
  if (result.settings) settings = { ...DEFAULT_SETTINGS, ...result.settings };
  if (result.globalStats) globalStats = { ...DEFAULT_STATS, ...result.globalStats };
})();
