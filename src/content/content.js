/**
 * AdBlocker Pro - Content Script
 * Cosmetic ad removal via CSS injection and DOM mutation observer.
 * Runs at document_start in all frames.
 */

'use strict';

(function () {
  // Prevent double-injection
  if (window.__adBlockerProInjected) return;
  window.__adBlockerProInjected = true;

  // ─── Cosmetic CSS selectors ─────────────────────────────────────────────────
  const AD_SELECTORS = [
    // Google AdSense / Display
    'ins.adsbygoogle',
    '.adsbygoogle',
    '.google-auto-placed',
    '.google-revshare',
    '#google_ads_frame',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="googleadservices.com"]',

    // Generic ad containers
    '[class*="ad-banner"]',
    '[class*="ad-block"]',
    '[class*="ad-box"]',
    '[class*="ad-container"]',
    '[class*="ad-frame"]',
    '[class*="ad-slot"]',
    '[class*="ad-unit"]',
    '[class*="ad-wrapper"]',
    '[class*="ads-banner"]',
    '[class*="ads-block"]',
    '[class*="ads-container"]',
    '[class*="ads-slot"]',
    '[id*="ad-banner"]',
    '[id*="ad-block"]',
    '[id*="ad-box"]',
    '[id*="ad-container"]',
    '[id*="ad-slot"]',
    '[id*="ad-unit"]',
    '[id*="ad-wrapper"]',
    '[id*="google-ad"]',
    '[id*="google_ad"]',

    // Sponsored / advertisement labels
    '.advertisement',
    '#advertisement',
    '[class*="advertisement"]',
    '[class*="sponsored-content"]',
    '[class*="sponsor-content"]',
    '[class*="sponsored-post"]',
    '[aria-label="Advertisement"]',
    '[aria-label="Sponsored"]',
    '[data-ad-unit]',
    '[data-ad-slot]',
    '[data-google-query-id]',

    // DFP / GPT slots
    '.dfp-ad',
    '.dfp-slot',
    '[class*="dfp-"]',
    '.gpt-ad',
    '[id*="div-gpt-ad"]',

    // Outbrain / Taboola
    '.OUTBRAIN',
    '#outbrain_widget',
    '[data-widget-id*="AR_"]',
    '.trc_rbox_outer',
    '#taboola-below-article-thumbnails',
    '[id*="taboola"]',
    '[class*="taboola"]',
    '[data-taboola-event]',

    // Criteo
    '[id*="criteo"]',
    '[class*="criteo"]',

    // Social media trackers (1x1 pixels)
    'img[width="1"][height="1"]',
    'img[src*="facebook.com/tr"]',
    'img[src*="doubleclick.net"]',

    // Cookie consent (tracking-related)
    // NOTE: Not blocking all cookie banners — only tracking ones
    'iframe[src*="adsterra.com"]',
    'iframe[src*="exoclick.com"]',
    'iframe[src*="propellerads.com"]',
    'iframe[src*="popads.net"]',
    'iframe[src*="popcash.net"]',

    // Amazon ads
    '[id*="amzn-native-ad"]',
    '[class*="amazon-ad"]',
    'iframe[src*="amazon-adsystem.com"]',
  ];

  // ─── Inject cosmetic CSS ────────────────────────────────────────────────────
  function injectCSS() {
    const style = document.createElement('style');
    style.id = '__adBlockerProStyles';
    style.textContent = AD_SELECTORS.join(',\n') + ' { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }';
    const target = document.head || document.documentElement;
    if (target) target.appendChild(style);
  }

  // ─── Remove matched elements from the DOM ──────────────────────────────────
  function removeAdElements(root) {
    const selector = AD_SELECTORS.join(',');
    try {
      const nodes = root.querySelectorAll(selector);
      nodes.forEach(node => {
        // Replace with an empty div to preserve layout in some cases
        node.style.cssText = 'display:none!important;height:0!important;overflow:hidden!important;';
      });
    } catch {
      // querySelectorAll may fail in some sandboxed frames
    }
  }

  // ─── Observe DOM mutations for dynamically inserted ads ────────────────────
  let observer = null;

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            removeAdElements(node);
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ─── Handle Google AdSense lazy-loaded units ────────────────────────────────
  function collapseEmptyIframes() {
    document.querySelectorAll('iframe').forEach(iframe => {
      if (!iframe.src) return;
      const src = iframe.src.toLowerCase();
      const adDomains = ['doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
        'outbrain.com', 'taboola.com', 'adnxs.com', 'openx.net', 'pubmatic.com',
        'amazon-adsystem.com', 'adsterra.com', 'exoclick.com', 'propellerads.com'];
      if (adDomains.some(d => src.includes(d))) {
        iframe.style.cssText = 'display:none!important;height:0!important;overflow:hidden!important;';
      }
    });
  }

  // ─── Main ───────────────────────────────────────────────────────────────────
  injectCSS();
  startObserver();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeAdElements(document);
      collapseEmptyIframes();
    });
  } else {
    removeAdElements(document);
    collapseEmptyIframes();
  }

  window.addEventListener('load', () => {
    removeAdElements(document);
    collapseEmptyIframes();
  }, { once: true });

})();
