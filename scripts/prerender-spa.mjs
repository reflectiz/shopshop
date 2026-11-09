import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// GitHub Pages is a static file host with no SPA rewrite: any path without a real file
// returns 404. This writes a copy of the built index.html at every static route so the
// server answers 200 instead of serving 404.html with a 404 status. Parameterized routes
// (accounts/:id, doctors/:id, scripts/:siteId) and anything unlisted still fall back to
// 404.html. Route list mirrors src/routes/flavorRoutes.tsx + demoRoutes + globalRoutes.

const dist = 'dist';
const shell = readFileSync(join(dist, 'index.html'));

const demos = ['gdpr-demo', 'ccpa-demo', 'us-demo'];
const tree = {
  '': ['login', 'shop', 'categories', 'cart', 'confirmation', 'about', 'video', 'redirect', ...demos],
  insurance: ['', 'login', 'quote', 'plans', 'categories', 'cart', 'confirmation', 'about', ...demos],
  bank: ['', 'login', 'accounts', 'about', ...demos],
  healthcare: ['', 'login', 'doctors', 'book', 'treatments', 'categories', 'cart', 'confirmation', 'about', ...demos],
};

const paths = new Set();
for (const [prefix, routes] of Object.entries(tree)) {
  for (const r of routes) {
    const p = [prefix, r].filter(Boolean).join('/');
    if (p) paths.add(p);
  }
}

// SPA fallback for every other (e.g. parameterized) path.
writeFileSync(join(dist, '404.html'), shell);

for (const p of paths) {
  const out = join(dist, p, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, shell);
}

console.log(`prerender-spa: wrote 404.html + ${paths.size} route shells`);
