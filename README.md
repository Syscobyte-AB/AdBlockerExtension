# AdBlocker Pro

A fast, privacy-first ad blocker extension for Chrome, Firefox, and Safari. Blocks 100+ ad networks, trackers, and malware scripts using declarativeNetRequest rules and real-time request monitoring.

## Features

- **Network-level blocking**: Blocks ads, trackers, and malware at the request level using Manifest V3's declarativeNetRequest API
- **Real-time stats**: Live counters show blocked requests and protected pages as you browse
- **Cosmetic filtering**: Removes ad containers and tracking pixels from the DOM
- **Whitelist management**: Add domains to allow list for fine-grained control
- **Per-category controls**: Toggle ad blocking, tracker blocking, and malware protection independently
- **Badge counter**: Optional badge on extension icon shows blocked count per page
- **Cross-browser support**: Works on Chrome, Firefox 113+, and Safari
- **Privacy-focused**: All data stored locally; no cloud sync, no tracking

### Block Lists

- **60 ad network rules**: Blocks doubleclick.net, Google Ads, Facebook, Twitter Ads, Amazon, and 50+ more networks
- **61 tracker rules**: Blocks Google Analytics, Hotjar, Mixpanel, Segment, LinkedIn, TikTok Analytics, and more
- **25 malware rules**: Blocks crypto miners, aggressive popads, malicious script sources, and exploit kits

## Installation

### Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/chrome` directory
5. The AdBlocker Pro icon should appear in your extension bar

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `dist/firefox/manifest.json` file
4. The extension will load (temporary; requires reload after browser restart)

For permanent installation, package as XPI and submit to [addons.mozilla.org](https://addons.mozilla.org)

### Safari

1. Go to Safari → Preferences → Extensions
2. Click the **+** button and select the `dist/safari` directory
3. Grant the required permissions
4. The extension will appear in Safari's menu bar

## Usage

### Quick Start

1. **Master Toggle**: Turn the extension on/off from the popup
2. **Block Categories**: Toggle ad blocking, tracker blocking, and malware protection
3. **View Stats**: See real-time counts of blocked items and protected pages
4. **Whitelist Sites**: Click "Allow site" to disable blocking on specific domains
5. **Open Settings**: Click the gear icon to manage detailed options and statistics

### Popup Interface

- **Status Badge**: Shows "Protected" (active), "Paused" (disabled), or "Partial" (some categories off)
- **Site Domain**: Current website — use "Allow site" button to whitelist
- **Stats Cards**: Live counters for this page, total ads, trackers, and threats
- **Feature Toggles**: Enable/disable specific block categories
- **Settings**: Open the full options page for whitelist and statistics management

### Settings Page

#### General
- **Enable AdBlocker Pro**: Master switch to pause all blocking
- **Block Ads**: Toggle ad network blocking (60 rule sets)
- **Block Trackers**: Toggle analytics, session recorders, social pixels
- **Block Malware & Miners**: Toggle crypto miners, aggressive popads, malicious scripts
- **Show badge**: Display blocked count on extension icon

#### Whitelist
- Add domains to bypass all blocking
- Enter root domain (e.g., `example.com`, not `www.example.com`)
- Accepts URLs — automatically extracts domain

#### Statistics
- **Total blocked**: All-time request blocks
- **Ads blocked**: Ad network requests blocked
- **Trackers blocked**: Tracking requests blocked
- **Threats blocked**: Malware/miner requests blocked
- **Pages protected**: Number of pages visited with extension enabled
- **Reset**: Clear all statistics (cannot be undone)

#### About
- Version number and extension description
- View rule set counts

## Development

### Project Structure

```
AdBlockerExtension/
├── src/
│   ├── background/          # Service Worker (background.js)
│   ├── content/             # Content script (cosmetic filtering)
│   ├── popup/               # Popup UI (HTML/CSS/JS)
│   ├── options/             # Settings page
│   └── manifests/           # Browser-specific manifests
├── rules/                   # Blocking rule sets (JSON)
│   ├── ads.json
│   ├── privacy.json
│   └── malware.json
├── icons/                   # Extension icons (16, 32, 48, 128px PNGs)
├── dist/                    # Built extensions (generated)
├── build.js                 # Build script
├── package.json
├── README.md
├── DEPLOYMENT.md
└── USAGE.md
```

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/AdBlockerExtension.git
cd AdBlockerExtension

# Install dependencies (optional — build.js is standalone)
npm install

# Generate icons (if needed)
# Open icons/generate-icons.html in a browser, click "Download All Icons",
# save PNGs to icons/
```

### Building

```bash
# Build for all targets
npm run build

# Build specific targets
npm run build:chrome
npm run build:firefox
npm run build:safari

# Package as ZIP
npm run build -- --package
```

Built extensions are in `dist/chrome`, `dist/firefox`, and `dist/safari`.

### Key Files

- **src/background/background.js**: Message handlers, rule toggling, statistics tracking
- **src/content/content.js**: CSS injection and MutationObserver for ad removal
- **src/popup/popup.js**: Real-time stats and quick controls
- **src/options/options.js**: Settings persistence and whitelist management
- **rules/*.json**: Declarative net request rule sets
- **build.js**: Copies source to dist, applies browser-specific manifest

## How It Works

### Blocking Mechanism

1. **Declarative Net Request**: Rules in `rules/*.json` block matching requests at the network level (MV3 standard)
2. **Request Monitoring**: `chrome.webRequest.onBeforeRequest` (observation-only) counts blocked requests in real-time
3. **Domain Classification**: Internal `DOMAIN_CATEGORIES` map categorizes requests (ad/tracker/malware) for statistics
4. **Cosmetic Filtering**: Content script injects CSS hiding ad containers and removes dynamic ads via MutationObserver

### Rule Format

Rules use Manifest V3 declarativeNetRequest syntax:

```json
{
  "id": 1,
  "priority": 1,
  "condition": {
    "urlFilter": "doubleclick.net",
    "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
  },
  "action": { "type": "block" }
}
```

### Data Storage

- **settings**: User-configured options (enabled, blockAds, blockTrackers, blockMalware, showBadge, whitelist)
- **globalStats**: Lifetime statistics (totalBlocked, adsBlocked, trackersBlocked, malwareBlocked, pagesProtected)
- **tabStats**: Per-tab request counts (cleared on navigation)

All stored in `chrome.storage.local` (encrypted by browser, never synced to cloud).

## Browser Compatibility

| Browser | Version | Manifest | Status |
|---------|---------|----------|--------|
| Chrome | 88+ | MV3 | ✅ Full support |
| Firefox | 113+ | MV3 | ✅ Full support |
| Safari | 15.2+ | MV3 | ✅ Full support |
| Edge | 88+ | MV3 | ✅ Compatible (Chromium-based) |

## Known Limitations

- **Cosmetic filtering**: Limited to CSS-based hiding; complex JavaScript-based ads may not be removed
- **WebSocket blocking**: Limited in some browsers due to MV3 restrictions
- **Encrypted traffic**: Cannot inspect HTTPS payloads (by design, for privacy)
- **Updates**: Requires manual reload or browser restart (except Chrome with update check)

## Contributing

Contributions welcome! Areas to improve:

- Expand block lists (ads, trackers, malware)
- Improve cosmetic filters
- Add more statistics (breakdown by site, time of day)
- Internationalization
- Performance optimization

## License

MIT License — see LICENSE file

## Support

- **Issues**: Report bugs at https://github.com/YOUR_USERNAME/AdBlockerExtension/issues
- **Privacy**: All data stored locally; extension makes no network requests
- **Feedback**: Feature requests welcome via GitHub issues

---

Built with privacy and performance in mind. No tracking, no ads, just blocking.
