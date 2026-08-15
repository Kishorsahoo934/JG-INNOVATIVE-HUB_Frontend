/**
 * Generates public/sitemap.xml with static routes, category listing URLs, and product URLs.
 * Uses VITE_APP_URL and VITE_API_URL from .env when present.
 * Run before build: node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const sitemapPath = path.join(root, 'public', 'sitemap.xml');
const robotsPath = path.join(root, 'public', 'robots.txt');
const productCachePath = path.join(root, 'public', 'sitemap-products-cache.json');

const FALLBACK_SITE = 'https://inovative-hub.com';
const FALLBACK_API = 'http://127.0.0.1:5000';

function loadEnvFile() {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Mirrors frontend/src/utils/products.ts STATIC_CATEGORIES slugs */
const CATEGORY_SLUGS = [
  'electronics-components',
  'microcontroller-boards',
  'electronic-modules',
  'displays',
  '3d-printing-service',
  'battery-charger',
  'iot-wireless-boards',
  'sensors',
  'power-supply',
  'mic-speaker',
  'motors-motor-drivers',
  'relays',
  'drone-parts',
  'equipment',
  'engineering-zone',
  'innovation-zone',
  'miscellaneous',
];

/** User-requested defaults: changefreq weekly, priority 0.8 (homepage 1.0). */
const STATIC_ENTRIES = [
  ['/', 'weekly', '1.0'],
  ['/eshop', 'weekly', '0.8'],
  ['/eshop/products', 'weekly', '0.8'],
  ['/about', 'weekly', '0.8'],
  ['/contact', 'weekly', '0.8'],
  ['/faq', 'weekly', '0.8'],
  ['/order-tracking', 'weekly', '0.8'],
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urlEl(loc, changefreq, priority, lastmod) {
  const lm = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
  return `  <url><loc>${escapeXml(loc)}</loc>${lm}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function loadCachedProductIds() {
  if (!fs.existsSync(productCachePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(productCachePath, 'utf8'));
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => String(x || '').trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function saveCachedProductIds(ids) {
  fs.writeFileSync(productCachePath, JSON.stringify(Array.from(new Set(ids)), null, 2), 'utf8');
}

async function fetchAllProductIds(apiBase) {
  const ids = [];
  const limit = 100;
  let skip = 0;
  for (;;) {
    const u = new URL('/api/products', apiBase);
    u.searchParams.set('skip', String(skip));
    u.searchParams.set('limit', String(limit));
    const res = await fetch(u.href, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`GET ${u.href} → ${res.status}`);
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    for (const row of data) {
      const id = row._id != null ? String(row._id) : row.id != null ? String(row.id) : '';
      if (id) ids.push(id);
    }
    if (data.length < limit) break;
    skip += limit;
  }
  return ids;
}

async function main() {
  const env = loadEnvFile();
  const site = (env.VITE_APP_URL || FALLBACK_SITE).replace(/\/$/, '');
  const api = (env.VITE_API_URL || env.SITEMAP_API_URL || FALLBACK_API).replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  const seen = new Set();
  const pushUrl = (loc, freq, pri, lm) => {
    if (seen.has(loc)) return;
    seen.add(loc);
    lines.push(urlEl(loc, freq, pri, lm));
  };

  for (const [p, freq, pri] of STATIC_ENTRIES) {
    pushUrl(`${site}${p}`, freq, pri, lastmod);
  }

  for (const slug of CATEGORY_SLUGS) {
    const loc = `${site}/eshop/products?category=${encodeURIComponent(slug)}`;
    pushUrl(loc, 'weekly', '0.8', lastmod);
  }

  try {
    const productIds = await fetchAllProductIds(api);
    saveCachedProductIds(productIds);
    for (const id of productIds) {
      pushUrl(`${site}/product/${encodeURIComponent(id)}`, 'weekly', '0.8', lastmod);
    }
    console.log('Sitemap: added', productIds.length, 'product URLs from', api);
  } catch (e) {
    const cachedIds = loadCachedProductIds();
    for (const id of cachedIds) {
      pushUrl(`${site}/product/${encodeURIComponent(id)}`, 'weekly', '0.8', lastmod);
    }
    console.warn('Sitemap: product fetch skipped —', e.message || e);
    if (cachedIds.length > 0) {
      console.log('Sitemap: used', cachedIds.length, 'cached product URLs');
    }
  }

  lines.push('</urlset>');
  fs.writeFileSync(sitemapPath, lines.join('\n'), 'utf8');
  console.log('Wrote', sitemapPath, '— site base:', site);

  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /private
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /wishlist
Disallow: /login
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /order-success
Disallow: /order/

Sitemap: ${site}/sitemap.xml
`;
  fs.writeFileSync(robotsPath, robots, 'utf8');
  console.log('Wrote', robotsPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
