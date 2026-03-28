# Usage Guide

Complete guide to using AdBlocker Pro extension across all features and browsers.

## Table of Contents

1. [Installation](#installation)
2. [Popup Interface](#popup-interface)
3. [Settings Page](#settings-page)
4. [Whitelist Management](#whitelist-management)
5. [Statistics](#statistics)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Installation

### Chrome/Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Navigate to the `dist/chrome` folder
5. Open the folder
6. The extension appears with icon in your toolbar

**Pin the extension** (optional):
- Click the Extensions puzzle icon in toolbar
- Find AdBlocker Pro
- Click the pin icon to keep it visible

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Navigate to `dist/firefox/manifest.json`
4. Click it to load
5. Icon appears in the toolbar (note: reloads when browser restarts)

For persistent installation, install from Firefox Add-ons.

### Safari

1. Open Safari Preferences → Extensions
2. Click **+** button → Locate `dist/safari` folder
3. Click **Open**
4. Grant requested permissions
5. Icon appears in Safari menu

---

## Popup Interface

The popup opens when you click the AdBlocker Pro icon. It shows quick stats and controls for the current page.

### Layout

```
┌─────────────────────────────────┐
│  🛡️  AdBlocker Pro   Protected  │  Header: Logo, name, status
├─────────────────────────────────┤
│  📍 example.com     [Allow site] │  Current domain + whitelist button
├─────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌────┐ │  Stats grid
│  │ 127     │ │ 45      │ │ 18 │ │  Page blocked, ads, trackers
│  │ blocked │ │ ads     │ │ads │ │
│  └─────────┘ └─────────┘ └────┘ │
│  ┌─────────┐ ┌─────────┐         │
│  │ 8       │ │ 12      │         │  Threats, pages
│  │ threats │ │ pages   │         │
│  └─────────┘ └─────────┘         │
├─────────────────────────────────┤
│  ☑ Block Ads                    │  Feature toggles
│  ☑ Block Trackers              │
│  ☑ Block Malware & Miners       │
├─────────────────────────────────┤
│  [⚙️ Settings]  [Reset]         │  Actions
└─────────────────────────────────┘
```

### Status Badge

Shows the current protection status:

- **Protected** (blue) — Extension enabled, all selected categories active
- **Paused** (gray) — Extension disabled (master toggle off)
- **Partial** (orange) — Extension enabled but some categories disabled

### Stat Cards

Four cards show real-time request counts:

1. **Blocked on this page** — Requests blocked while on current page (resets on navigation)
2. **Ads blocked** — Total ad network requests blocked (all-time)
3. **Trackers blocked** — Total tracking requests blocked (all-time)
4. **Threats blocked** — Total malware/miner requests blocked (all-time)

Stats update every 1.5 seconds while popup is open.

### Current Domain & Whitelist

Shows the domain of the active tab:
- **Allow site** button → Whitelist the domain (disables all blocking)
- **Allowed ✓** button → Domain is whitelisted; click to remove from whitelist

Note: Whitelisting applies to all subdomains. Whitelisting `example.com` also allows `sub.example.com`, `api.example.com`, etc.

### Feature Toggles

Three independent toggles control blocking categories:

- **Block Ads** — Blocks ad networks (doubleclick, Google Ads, Facebook, Amazon, etc.)
- **Block Trackers** — Blocks analytics, session recorders, social pixels (Google Analytics, Hotjar, Mixpanel, etc.)
- **Block Malware & Miners** — Blocks crypto miners, aggressive popads, exploit scripts

Each toggle immediately updates the extension's behavior on the current and future pages.

### Settings Button

Opens the full **Settings page** with advanced controls:
- Persistent whitelist management
- View/reset statistics
- Enable/disable badge counter
- View extension information

### Reset Button

Clears all-time statistics (cannot be undone):
- Resets total blocked, ads, trackers, threats, and pages protected to 0
- Does NOT clear settings or whitelist

---

## Settings Page

Open via the ⚙️ icon in the popup or manually via extension menu → **Options**.

### General Settings

#### Enable AdBlocker Pro

Master switch. When OFF:
- All blocking pauses
- Badge disappears
- Status shows "Paused"
- Settings are preserved (toggle back to resume)

#### Block Ads

Blocks requests from 60+ ad networks:
- Doubleclick.net, Google Syndication/AdServices/TagServices
- Facebook, Twitter Ads, LinkedIn Ads
- Amazon Product Ads, Criteo, Outbrain, Taboola
- OpenX, PubMatic, Rubicon, Xandr, Media.net
- And 40+ more ad networks

When OFF, users see all ads. When ON, ad requests are blocked before loading (saves bandwidth).

#### Block Trackers

Blocks requests from 61+ analytics and tracking services:
- Google Analytics, Google Tag Manager
- Hotjar (session replay), FullStory, Mouseflow
- Mixpanel, Segment, Amplitude, Heap
- LinkedIn tracking (snap.licdn.com), TikTok Analytics
- Facebook pixel, Comscore, Quantserve
- And 40+ more trackers

Protects privacy by preventing companies from tracking your behavior across sites.

#### Block Malware & Miners

Blocks requests from 25 malware/exploit sources:
- Coinhive, CryptoLoot (crypto miners)
- Popads.net, PopCash (aggressive popups/popovers)
- Adsterra, Exoclick, JuicyAds (aggressive ad networks with malware)
- Various exploit kit domains

Prevents browser slowdown from miners and protects against malicious redirects.

#### Show Block Count Badge

When ON (default):
- Extension icon displays a count badge (e.g., "127" in red)
- Shows total items blocked on the current page
- Updates in real-time as you browse
- Resets when you navigate to a new page

When OFF:
- Badge hides; only the icon shows
- Stats are still counted (visible in popup and settings)
- Slightly cleaner toolbar appearance

#### Save Changes

Click **Save changes** to persist all settings to local storage. A "✓ Saved" message confirms success. Settings are automatically applied to all open tabs.

### Whitelist

Manage domains to bypass blocking entirely.

#### Add to Whitelist

1. Enter a domain (e.g., `example.com`)
2. The input accepts:
   - Plain domains: `example.com`
   - URLs: `https://example.com/path` (extracts domain automatically)
   - Subdomains: `api.example.com` (whitelists that subdomain specifically)
3. Click **Add** or press Enter
4. Domain appears in the list below

#### Domain List

Shows all whitelisted domains:
- Click the **×** button to remove a domain from whitelist
- Domains are case-insensitive (stored as lowercase)
- Exact subdomain matching (whitelisting `api.example.com` does NOT whitelist `example.com`)

#### Validation

- Domains must follow DNS naming rules (alphanumeric + hyphens, 2+ TLD)
- Invalid domains show an error: "Enter a valid domain like 'example.com'"
- Duplicates show: "Domain already whitelisted"

#### Examples

- ✅ `example.com` — Correct
- ✅ `api.example.co.uk` — Correct (subdomain with multi-part TLD)
- ❌ `example` — Invalid (no TLD)
- ❌ `http://example.com` — Invalid format (but URL paste works; domain extracted automatically)
- ✅ `example.com` with `sub.example.com` — Both required for both to work (they're separate entries)

### Statistics

View all-time blocking stats and reset if desired.

#### Stat Cards

- **Total blocked** — Sum of all ads + trackers + threats blocked
- **Ads blocked** — Count of ad network requests blocked
- **Trackers blocked** — Count of tracking requests blocked
- **Threats blocked** — Count of malware/miner requests blocked
- **Pages protected** — Count of unique page loads with extension enabled

Numbers format with suffixes:
- Under 1,000 → plain number (e.g., `127`)
- 1,000–999,999 → `k` suffix (e.g., `45.2k`)
- 1,000,000+ → `M` suffix (e.g., `2.15M`)

#### Reset Statistics

Red button **Reset statistics**. Confirmation dialog required:
- "Reset all lifetime statistics? This cannot be undone."
- Click "OK" to confirm (cannot be reversed)
- All stats reset to 0
- Whitelist and settings are NOT affected

### About

View version info and extension stats.

- **Version** — Extension version (e.g., "Version 1.0.0")
- **Description** — Brief feature summary
- **Rule counts**:
  - 60 ad network rules
  - 61 tracker rules
  - 25 malware rules

---

## Whitelist Management

### When to Use Whitelist

Add domains to whitelist when:
- A site breaks with blocking enabled (whitelist to restore functionality)
- You trust a site with your data (but want blocking on other sites)
- A legitimate tracker is blocking core functionality
- You're testing a site without ad/tracker noise

### Whitelist vs. Toggles

| Action | Effect | Scope |
|--------|--------|-------|
| Toggle "Block Ads" OFF | Disables ad blocking globally | All sites |
| Toggle "Block Ads" OFF for one site | ❌ Not possible (toggles are global) | — |
| Whitelist domain | Disables ALL blocking for that domain | Just that domain |

Use toggles for global control; use whitelist for per-site exceptions.

### Quick Whitelist from Popup

1. Click the AdBlocker Pro icon
2. Read "example.com" in the current domain banner
3. Click **Allow site**
4. Button changes to "Allowed ✓"
5. Page reloads with blocking disabled (may need manual refresh)

### Detailed Whitelist Management

1. Open Settings page (⚙️ in popup)
2. Click **Whitelist** tab
3. View all whitelisted domains
4. Add new domains using the input field
5. Remove domains by clicking the **×** button

### Whitelist Behavior

**Whitelisted domains:**
- All blocking is disabled (ads, trackers, malware)
- Cosmetic filtering (CSS hiding) is also disabled
- Stats are NOT counted for that domain
- All subdomains of whitelisted domain are also whitelisted

Example: Whitelist `example.com` → `api.example.com`, `cdn.example.com`, etc. are also allowed

**To whitelist only a subdomain:**
- Add `api.example.com` separately
- Visiting `example.com` will still be blocked
- Visiting `api.example.com` will be allowed

---

## Statistics

### Real-Time Stats (Popup)

While popup is open, stats update every 1.5 seconds:
- Reflects current page blocks
- Updates as requests are made
- Animated counter transitions

### Historical Stats (Settings)

Settings page shows all-time stats from extension install:
- Total requests blocked across all pages
- Breakdown by category (ads/trackers/threats)
- Pages visited with extension enabled
- Stats persist across browser restarts

### Stat Calculation

**Total blocked** = Ads blocked + Trackers blocked + Threats blocked

**Pages protected** = Number of unique page visits (tracked per tab load, resets on navigation)

### Interpreting Numbers

Example stats: `45.2k ads blocked`

- 45.2k = 45,200 individual ad requests blocked
- These are network requests prevented from loading
- Actual number of "ads" visible is lower (many ads = multiple requests)
- Blocks are cumulative since install (or last reset)

---

## Keyboard Shortcuts

Extension shortcuts vary by browser:

### Chrome/Edge

Press `Ctrl+Shift+Y` (Windows) or `Cmd+Shift+Y` (Mac) to configure:

1. Open `chrome://extensions/shortcuts`
2. Find AdBlocker Pro
3. Set keyboard shortcut to open popup
4. Default: None (click icon instead)

### Firefox

Extensions don't have built-in shortcuts. Use:

1. Add extension to toolbar (click puzzle icon)
2. Click toolbar icon as shortcut
3. Or configure via `about:addons` (limited options)

### Safari

Use macOS keyboard shortcuts:

1. Open Safari Preferences → Extensions → AdBlocker Pro
2. Click "Settings..."
3. Set shortcut (e.g., `Cmd+Shift+A`)

---

## Troubleshooting

### Extension Not Blocking Ads

**Check these:**

1. Is master toggle ON? (Status should be "Protected" not "Paused")
2. Is "Block Ads" toggle ON in popup?
3. Is the site whitelisted? (Check whitelist in Settings)
4. Is the domain in `rules/ads.json`? (Only 60+ known ad networks are blocked)
   - Uncommon ads may not be recognized
   - File a GitHub issue to add new ad networks

**Try:**
- Toggle "Block Ads" off/on
- Close and reopen popup
- Reload the page
- Check browser console (F12 → Console) for errors

### Stats Not Updating

**Possible causes:**

1. Extension disabled or paused
2. Whitelist enabled for the domain
3. Request type not matched in rules (e.g., video ads served via different domain)
4. Page loaded before popup opened (stats are live, not historical)

**Try:**
- Close popup, reopen it (forces refresh)
- Navigate to a new page with many trackers (reddit.com, cnn.com, medium.com)
- Wait 5 seconds for stats to populate

### Whitelist Not Working

**Check:**
- Exact domain format (e.g., `example.com` ≠ `api.example.com`)
- No `http://` or `https://` in domain
- Domain actually appears in whitelist list
- Refreshed the page after adding domain

**Try:**
- Remove from whitelist and re-add
- Check Settings → Whitelist → view list

### Badge Not Showing

**Ensure:**
1. "Show badge" toggle is ON in Settings
2. Page is not whitelisted
3. At least 1 request blocked on page
4. Try reloading page

### Extension Crashes/Not Loading

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Find AdBlocker Pro → "Errors" button (if visible)
3. Read error message
4. Reload extension (circular arrow button)
5. If persists, delete and re-add via "Load unpacked"

**Firefox:**
1. Go to `about:addons`
2. Find AdBlocker Pro → "..." menu → "Report an Issue"
3. Or reload: `about:debugging` → Find extension → Reload

**Safari:**
1. Safari Preferences → Extensions
2. Find AdBlocker Pro → "Uninstall"
3. Reload extension

### Popup Slow/Laggy

**Causes:**
- Many whitelisted domains (> 1,000)
- Many tabs open (each tab tracked separately)
- Stats numbers very large (animation lag)

**Try:**
- Close unused tabs
- Reset statistics
- Use toggle to disable categories temporarily

---

## FAQ

### Q: Does AdBlocker Pro track me?

**A:** No. All data is stored locally on your device in `chrome.storage.local`. The extension makes no network requests and never sends data to external servers. Privacy is the core design principle.

### Q: Will this slow down my browser?

**A:** Minimal impact. The extension uses MV3's declarativeNetRequest API, which operates at the browser level (not JavaScript). Cosmetic filtering (CSS injection) is lightweight. On slower devices, you may notice <100ms delay on initial page load.

### Q: Can I block custom domains?

**A:** Yes, partially:
- Use the whitelist to ALLOW domains (exception)
- For custom BLOCKING, edit `rules/*.json` and rebuild (requires technical knowledge)
- File a GitHub issue to request new domains to block

### Q: What if a site breaks with blocking enabled?

**A:** Whitelist that site:
1. Click AdBlocker Pro popup
2. Click "Allow site"
3. Refresh page

The site will load without any blocking. This usually fixes functionality issues.

### Q: Can I sync settings across devices?

**A:** Not built-in. Extension uses local storage only. To sync:
1. Export whitelist (manual copy from Settings)
2. Import on other device (manual paste)
3. Third-party sync tools may exist (not recommended for privacy)

### Q: How do I report a website that isn't being blocked?

**A:**
1. Go to GitHub: https://github.com/YOUR_USERNAME/AdBlockerExtension
2. Click **Issues** → **New Issue**
3. Title: "Add blocking rule for [domain]"
4. Description: URL of site + screenshot of what's not blocked
5. Submit

The maintainer will evaluate and add if applicable.

### Q: Can I block JavaScript entirely?

**A:** No, this extension only blocks network requests and specific domains. For JavaScript blocking, use:
- Chrome: uMatrix, NoScript extensions
- Firefox: uMatrix, NoScript extensions
- Safari: Web Guard extension

Combining ad blockers with JavaScript blockers provides defense-in-depth.

### Q: Does this block YouTube ads?

**A:** Partially. The extension blocks YouTube ad server requests (some ads). However, YouTube uses sophisticated ads targeting that may bypass network-level blocking. For complete YouTube ad blocking, use a dedicated YouTube ad blocker.

### Q: Why are some ads still visible?

**A:** Several reasons:
1. Ad served from non-blocked domain (add to `rules/ads.json`)
2. Ad generated by first-party JavaScript (not a network request)
3. Ad injected after page loads (cosmetic filters may miss)
4. Blocking category is disabled (check popup toggles)

The extension blocks ~99% of ads from known networks. Remaining 1% requires content-specific or script-based filtering.

### Q: Can I use this with other ad blockers?

**A:** Yes, but not recommended:
- Multiple ad blockers = redundant blocking (wastes resources)
- May cause conflicts or unexpected behavior
- One blocker sufficient for most users

Use AdBlocker Pro alone for best performance.

### Q: How often are block lists updated?

**A:** Check GitHub releases. Currently updated manually when new domains discovered. For auto-updates:
1. Maintainer can enable auto-update from GitHub
2. Users get latest rules on extension update (Chrome: auto; Firefox/Safari: manual)

### Q: Is source code available?

**A:** Yes, fully open-source on GitHub: https://github.com/YOUR_USERNAME/AdBlockerExtension

You can:
- Read the code
- Build yourself
- Modify for personal use
- Contribute improvements

### Q: What's the difference between "rules" and "cosmetic filtering"?

**A:**
- **Rules** (declarativeNetRequest) — Block network requests before they load (fast, privacy-friendly, saves bandwidth)
- **Cosmetic filtering** (CSS + MutationObserver) — Hide ad containers after page loads (catches ads served in-page, uses more CPU)

This extension uses both methods for comprehensive blocking.

### Q: How can I disable the extension temporarily?

**A:** Two ways:
1. Click popup → Master toggle OFF (extension paused, settings preserved)
2. Browser toolbar → Right-click extension icon → "Manage" → Toggle OFF (temporary)

Master toggle is the easiest way to pause/resume.

---

## Getting Help

- **GitHub Issues**: https://github.com/YOUR_USERNAME/AdBlockerExtension/issues
- **Review site privacy policy** before whitelisting
- **Check browser console** (F12) for error messages
- **Verify domain format** in whitelist (common mistake: including protocol like `http://`)

Enjoy privacy-first browsing! 🛡️
