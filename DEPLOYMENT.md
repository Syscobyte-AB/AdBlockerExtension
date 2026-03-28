# Deployment Guide

This document covers building, testing, and deploying AdBlocker Pro to Chrome Web Store, Firefox Add-ons, and Safari.

## Prerequisites

- Node.js 14+ (for build script)
- Git (for version control)
- Account on target app stores (Chrome Web Store, Mozilla Add-ons, Apple App Store)
- Unpacked extension test environment

## Building

### Generate Icons (One-time Setup)

1. Open `icons/generate-icons.html` in any modern browser
2. Click **Download All Icons**
3. Save all four PNG files to the `icons/` directory:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

Icons are required before building for distribution.

### Build for Distribution

```bash
# Build all targets
npm run build

# Or build specific target
npm run build:chrome
npm run build:firefox
npm run build:safari

# Package as ZIP (for store submission)
npm run build -- --package
```

This creates:
- `dist/chrome/` — Chrome unpacked extension
- `dist/firefox/` — Firefox unpacked extension
- `dist/safari/` — Safari unpacked extension
- `dist/chrome.zip` — Chrome submission package
- `dist/firefox.zip` — Firefox submission package
- `dist/safari.zip` — Safari submission package

## Testing

### Local Testing

#### Chrome (Developer Mode)
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select `dist/chrome`
5. Test all features, verify no console errors

#### Firefox (Temporary Load)
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `dist/firefox/manifest.json`
4. Test all features

Note: Temporary loads expire on browser restart. Use XPI packaging for persistent testing.

#### Firefox (XPI Testing)
1. Build and package: `npm run build:firefox -- --package`
2. Go to `about:addons`
3. Click gear icon → **Install Add-on From File**
4. Select `dist/firefox.zip` (rename to `.xpi` if needed)

#### Safari
1. Go to Safari → Preferences → Extensions
2. Click **+** → Select `dist/safari`
3. Grant permissions
4. Test all features

### Test Checklist

- [ ] Popup opens correctly
- [ ] Settings load and save
- [ ] Whitelist add/remove works
- [ ] Real-time stat counters update
- [ ] Badge shows blocked count
- [ ] Ads are visibly blocked on test sites
  - Try: forbes.com, cnn.com, bbc.com (ads + analytics)
- [ ] Dark mode works
- [ ] No console errors (`F12` → Console tab)
- [ ] No permission warnings

## Chrome Web Store Submission

### Prerequisites
- Google Developer account ($5 one-time registration fee)
- Extension must not contain malware/PUP signatures
- Privacy policy (if collecting data — not needed for this extension)

### Submission Steps

1. **Prepare Package**
   ```bash
   npm run build:chrome -- --package
   ```

2. **Upload to Chrome Web Store**
   - Go to https://chrome.google.com/webstore/devconsole
   - Click **New Item** → Select `dist/chrome.zip`

3. **Fill Extension Details**
   - **Name**: AdBlocker Pro
   - **Description**: "A fast, privacy-first ad blocker for Chrome. Blocks 100+ ad networks, trackers, and malware using declarativeNetRequest."
   - **Category**: Productivity
   - **Content rating**: Select appropriate rating
   - **Primary language**: English
   - **User support email**: (required)

4. **Promotional Assets**
   - **Icon** (128px): `icons/icon128.png`
   - **Screenshots** (1280x800):
     - Popup screenshot
     - Options page screenshot
     - Stats page screenshot
   - **Promotional tile** (440x280, optional): Extension hero image

5. **Content**
   - **Detailed description**: Include features, privacy policy
   - **Support website**: Link to GitHub repo
   - **Privacy policy URL**: https://github.com/YOUR_USERNAME/AdBlockerExtension (or standalone privacy doc)

6. **Distribution**
   - **Target countries**: All countries
   - **Automatic publishing**: Enable to publish immediately on approval

7. **Review & Publish**
   - Submit for review
   - Google reviews within 1 week (typically 24-48 hours)
   - Extension published to Chrome Web Store

### Store Listing Tips

- Use high-quality screenshots showing before/after blocking
- Highlight privacy ("no cloud sync", "local data only")
- Emphasize performance ("lightweight", "fast blocking")
- Link to detailed documentation (GitHub README)

## Firefox Add-ons Submission

### Prerequisites
- Mozilla Developer account (free)
- Extension must be reviewed by Mozilla (3-7 days)
- Privacy policy or explanation (required)

### Submission Steps

1. **Prepare Package**
   ```bash
   npm run build:firefox -- --package
   ```

2. **Create Developer Account**
   - Go to https://addons.mozilla.org
   - Sign in or create account
   - Accept Mozilla's Add-on Developer Agreement

3. **Upload to AMO**
   - Go to https://addons.mozilla.org/developers/
   - Click **Submit a new add-on** → Select `dist/firefox.zip`
   - Add source code URL (GitHub repo)

4. **Fill Extension Details**
   - **Name**: AdBlocker Pro
   - **Summary**: "Fast, privacy-first ad blocker blocking 100+ ad networks and trackers"
   - **Description**: Full feature list (from README)
   - **Category**: Privacy & Security
   - **License**: MIT

5. **Privacy & Security**
   - Confirm: No data collection, no external requests, no tracking
   - Privacy policy: "This extension stores all data locally. No information is transmitted to external servers."
   - Permissions justification:
     - `storage` → "Store user settings and statistics locally"
     - `tabs` → "Access current tab domain for whitelist checking"
     - `webRequest` → "Monitor network requests for statistics"
     - `declarativeNetRequest` → "Block ad and tracking requests"

6. **Promotional Assets**
   - **Icon** (64x64): Resized `icons/icon128.png`
   - **Screenshots** (1280x800, 2 required):
     - Popup interface
     - Settings/whitelist page
   - **Support email**: Your email

7. **Review & Publish**
   - Submit for review
   - Mozilla review team evaluates (3-7 days)
   - Automatic approval for subsequent updates (if compliant)
   - Published to Firefox Add-ons

### AMO Review Notes

- Ensure no `eval()` or dynamic code execution
- Manifest must match uploaded source code
- Test with minimum Firefox version (113)
- Avoid performance issues (AMO tests startup time)

## Safari App Store Submission

### Prerequisites
- Apple Developer account ($99/year)
- Safari extensions require native app wrapper
- macOS development environment (Xcode)
- Notarization (code signing)

### Submission Steps

1. **Create Native App Wrapper**

   Safari requires extensions to be bundled in a native Swift/Objective-C app. This is more complex:

   - Use Xcode to create a macOS app project
   - Add Safari Web Extension target
   - Link `dist/safari/` as the web extension
   - Code-sign and notarize the app

2. **Prepare for App Store**
   - Complete Xcode project with proper bundle identifiers
   - Create app icons, screenshots
   - Write app description (extension functionality)
   - Set appropriate app category (Productivity)

3. **Submit to App Store**
   - Open Xcode → Product → Archive
   - Validate archive
   - Submit via Xcode or Transporter
   - Provide metadata (description, keywords, screenshots, support URL)

4. **App Review**
   - Apple reviews the app (24-48 hours typically)
   - Ensure:
     - No malware or PUP
     - Extension works as described
     - Privacy policy compliance
     - No app crashes or hangs

### Safari Considerations

- Safari 15.2+ required (check in manifest)
- Extension limited to 200MB bundle size
- No remote code execution allowed
- Cosmetic filtering works but may be slower than Chrome/Firefox
- MV3 support in Safari may lag other browsers (check Apple's latest docs)

## Version Management

### Versioning

Use semantic versioning: `MAJOR.MINOR.PATCH`

- Update `manifest.json` version in all manifests before each build
- Tag release in Git: `git tag v1.0.0`
- Update `CHANGELOG.md` with changes

```bash
# Example: bump to v1.0.1
# 1. Update src/manifests/manifest.*.json (version: "1.0.1")
# 2. Commit: git commit -am "chore: bump to v1.0.1"
# 3. Tag: git tag v1.0.1
# 4. Push: git push --tags
# 5. Build and upload
npm run build -- --package
```

### Update Notifications

- Chrome Web Store: Automatic distribution within 24h
- Firefox Add-ons: Automatic approval for minor updates (usually)
- Safari App Store: Requires new app version submission

## Monitoring & Updates

### Post-Launch

1. **Monitor Reviews**: Check store listings for user feedback
2. **Error Tracking**: Monitor browser console for extension errors
3. **Rule Updates**: Periodically update block lists in `rules/*.json`
4. **Security**: Watch for zero-days in block list domains

### Common Metrics to Track

- Active user count (via store dashboard)
- Average rating (target: 4.5+)
- Common issues (review feedback)
- Performance (install size, startup time)

### Update Cadence

- **Security fixes**: Release immediately
- **Bug fixes**: Group into biweekly releases
- **New features**: Quarterly releases
- **Rule updates**: Monthly refresh (high priority)

## Rollback

If a critical bug is discovered:

```bash
# Revert to previous version
git revert <commit-hash>
git push

# Rebuild and resubmit to stores
npm run build -- --package
```

Notify store moderators via submission comments if emergency fix needed.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid manifest" | Check all `manifest.json` files for syntax errors |
| Store rejects package | Ensure ZIP contains only `manifest.json`, no duplicate folders |
| Icons missing | Regenerate with `generate-icons.html`; ensure 4 PNGs in `icons/` |
| Permissions denied | Remove unused permissions from manifest; add justification in store |
| Extension doesn't load | Check browser console for errors; verify manifest version matches |
| Slow performance | Profile with DevTools; check for heavy MutationObserver usage |
| Rules not blocking | Verify `urlFilter` patterns with actual network traffic; test with DevTools |

## Helpful Resources

- Chrome Web Store: https://developer.chrome.com/docs/webstore/
- Firefox Add-ons: https://extensionworkshop.com/
- Safari Extensions: https://developer.apple.com/safari/web-extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/

---

For questions or issues during submission, file an issue on GitHub: https://github.com/YOUR_USERNAME/AdBlockerExtension/issues
