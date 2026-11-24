import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// GitHub Pages is a static host with no SPA rewrite: any path without a real file returns
// 404. This writes a real index.html at every static route so the server answers 200.
// Non-clean routes get the main shell (index.html, with trackers); /clean/* routes get the
// bare clean shell (clean.html, no trackers) so the clean demo stays tracker-free.
// Parameterized routes (accounts/:id, doctors/:id, scripts/:siteId) still fall back to
// 404.html. Route lists mirror src/routes/flavorRoutes.tsx and src/App.tsx.

const dist = 'dist';
const mainShell = readFileSync(join(dist, 'index.html'));
const cleanShell = readFileSync(join(dist, 'clean.html'));

const demos = ['gdpr-demo', 'ccpa-demo', 'us-demo'];

// Non-clean (tracker) trees, served from index.html. Keyed by URL prefix ('' = site root).
const base = {
  '': ['login', 'shop', 'categories', 'cart', 'confirmation', 'about', 'video', 'redirect', 'flavors', ...demos],
  retail: ['', 'login', 'shop', 'categories', 'cart', 'confirmation', 'about', 'video', ...demos],
  insurance: ['', 'login', 'quote', 'plans', 'categories', 'cart', 'confirmation', 'about', ...demos],
  bank: ['', 'login', 'accounts', 'about', ...demos],
  healthcare: ['', 'login', 'doctors', 'book', 'treatments', 'categories', 'cart', 'confirmation', 'about', ...demos],
};

// Clean trees (no video, no demos), served from clean.html, under /clean/<flavor>.
const clean = {
  retail: ['', 'login', 'shop', 'categories', 'cart', 'confirmation', 'about'],
  insurance: ['', 'login', 'quote', 'plans', 'categories', 'cart', 'confirmation', 'about'],
  bank: ['', 'login', 'accounts', 'about'],
  healthcare: ['', 'login', 'doctors', 'book', 'treatments', 'categories', 'cart', 'confirmation', 'about'],
};

const jobs = new Map(); // path -> shell
const add = (prefix, routes, shell) => {
  for (const r of routes) {
    const p = [prefix, r].filter(Boolean).join('/');
    if (p) jobs.set(p, shell);
  }
};

for (const [prefix, routes] of Object.entries(base)) add(prefix, routes, mainShell);
for (const [flavor, routes] of Object.entries(clean)) add(`clean/${flavor}`, routes, cleanShell);

// SPA fallback for every other (e.g. parameterized) path.
writeFileSync(join(dist, '404.html'), mainShell);

for (const [p, shell] of jobs) {
  const out = join(dist, p, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, shell);
}

console.log(`prerender-spa: wrote 404.html + ${jobs.size} route shells (clean routes from clean.html)`);
