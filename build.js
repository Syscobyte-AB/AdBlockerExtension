#!/usr/bin/env node
/**
 * Build script for AdBlocker Pro
 * Produces dist/chrome, dist/firefox, and dist/safari directories
 * Usage: node build.js [chrome|firefox|safari] [--package]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const RULES = path.join(ROOT, 'rules');
const ICONS = path.join(ROOT, 'icons');

const targets = process.argv.slice(2).filter(a => !a.startsWith('--'));
const shouldPackage = process.argv.includes('--package');
const buildTargets = targets.length ? targets : ['chrome', 'firefox', 'safari'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function buildTarget(target) {
  console.log(`\nBuilding ${target}...`);
  const out = path.join(DIST, target);
  ensureDir(out);

  // Copy source files (background, content, popup, options)
  for (const dir of ['background', 'content', 'popup', 'options']) {
    const srcDir = path.join(SRC, dir);
    if (fs.existsSync(srcDir)) copyDir(srcDir, path.join(out, dir));
  }

  // Copy rules
  copyDir(RULES, path.join(out, 'rules'));

  // Copy icons
  if (fs.existsSync(ICONS)) {
    const iconDest = path.join(out, 'icons');
    ensureDir(iconDest);
    for (const f of fs.readdirSync(ICONS)) {
      if (f.endsWith('.png')) copyFile(path.join(ICONS, f), path.join(iconDest, f));
    }
  }

  // Write target-specific manifest
  const manifestSrc = path.join(SRC, 'manifests', `manifest.${target}.json`);
  if (!fs.existsSync(manifestSrc)) {
    console.error(`  ERROR: manifest.${target}.json not found`);
    process.exit(1);
  }
  copyFile(manifestSrc, path.join(out, 'manifest.json'));

  console.log(`  ✓ ${target} → dist/${target}/`);

  if (shouldPackage) packageTarget(target, out);
}

function packageTarget(target, dir) {
  const ext = target === 'firefox' ? 'xpi' : 'zip';
  const outFile = path.join(DIST, `adblocker-pro-${target}.${ext}`);
  try {
    execSync(`cd "${dir}" && zip -r "${outFile}" . -x "*.DS_Store"`, { stdio: 'inherit' });
    console.log(`  ✓ Packaged → ${path.relative(ROOT, outFile)}`);
  } catch (e) {
    console.error(`  Package failed: ${e.message}`);
  }
}

// Run
ensureDir(DIST);
for (const target of buildTargets) buildTarget(target);
console.log('\nBuild complete.\n');
