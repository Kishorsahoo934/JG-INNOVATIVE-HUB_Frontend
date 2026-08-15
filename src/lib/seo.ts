/**
 * SEO utilities: base URL, title/description builders, and legacy document head updates.
 * Brand: Innovative Hub | Domain: https://inovative-hub.com
 *
 * Primary route-level meta is rendered via react-helmet-async in <SEO /> (sync with React tree).
 * For true server-rendered HTML (meta in first byte), add SSR/SSG (e.g. Vite SSR + renderToString,
 * or prerender script) — see project docs.
 */

import { BRAND_LOGO_SQUARE } from '@/constants/media';

export const SITE_NAME = 'JG Innovative Hub';
/** Default first segment before " | JG Innovative Hub" for homepage-style titles */
const DEFAULT_PAGE_HEADLINE = 'Robotics, IoT & Embedded Systems Platform in Odisha';
/** Brand-first meta for homepage and default. */
export const DEFAULT_DESCRIPTION =
  "JG Innovative Hub is Odisha's leading platform for robotics, IoT & embedded systems. Components, kits & tutorials for engineering students and makers.";
/** Square brand image for default OG/Twitter when a page has no custom image */
const DEFAULT_OG_IMAGE = BRAND_LOGO_SQUARE;

const SUFFIX = ` | ${SITE_NAME}`;

/** Base URL for canonical and OG (absolute). No trailing slash. */
export function getBaseUrl(): string {
  if (typeof import.meta.env.VITE_APP_URL === 'string' && import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'https://inovative-hub.com';
}

/**
 * Resolve any site path or absolute URL to a full https URL for OG/Twitter images.
 */
export function toAbsoluteUrl(pathOrUrl: string, baseUrl?: string): string {
  const base = baseUrl ?? getBaseUrl();
  const u = pathOrUrl.trim();
  if (!u) return `${base}${DEFAULT_OG_IMAGE.startsWith('/') ? DEFAULT_OG_IMAGE : `/${DEFAULT_OG_IMAGE}`}`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${base}${u.startsWith('/') ? u : `/${u}`}`;
}

/** Browser tab title: always "… | Innovative Hub" */
export function buildDocumentTitle(pageTitle?: string): string {
  const raw = (pageTitle ?? '').trim();
  if (!raw) return `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  if (raw.endsWith(SUFFIX)) return raw;
  if (raw === SITE_NAME) return `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  if (raw.startsWith(`${SITE_NAME} |`)) {
    const rest = raw.slice(SITE_NAME.length + 1).replace(/^\s*\|\s*/, '').trim();
    return rest ? `${rest}${SUFFIX}` : `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  }
  return `${raw}${SUFFIX}`;
}

export function normalizeOgType(ogType: string): string {
  const t = (ogType || 'website').toLowerCase();
  if (t === 'product') return 'product';
  return 'website';
}

/** Strip simple HTML for meta descriptions */
export function stripHtmlForMeta(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Product listing / PDP title segment (before " | Innovative Hub").
 * Example: "Buy Arduino Uno in India | Microcontroller Boards"
 */
export function buildProductSeoTitle(productName: string, category: string): string {
  const cat = (category || 'Electronics components').trim();
  const name = productName.trim();
  return `Buy ${name} in India | ${cat}`;
}

export function buildProductMetaDescription(input: {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  category?: string;
}): string {
  const fromHtml = stripHtmlForMeta(input.shortDescription || input.longDescription || '');
  const cat = (input.category || '').trim();
  let text =
    fromHtml ||
    `Shop ${input.name} online at Innovative Hub${cat ? ` — ${cat}` : ''}. Fast delivery across India. Authentic components for robotics, IoT & embedded projects.`;
  if (text.length > 160) text = `${text.slice(0, 157).trim()}…`;
  return text;
}

export function buildProductKeywords(input: {
  name: string;
  category: string;
  subcategory?: string;
  sku?: string;
}): string {
  const parts = [
    input.name,
    input.category,
    input.subcategory,
    input.sku,
    'buy online India',
    'electronics components',
    'robotics parts',
    'IoT modules',
    SITE_NAME,
    'Bhubaneswar',
    'Odisha',
  ]
    .map((p) => (p != null ? String(p).trim() : ''))
    .filter(Boolean);
  return Array.from(new Set(parts)).slice(0, 24).join(', ');
}

export interface SEOOptions {
  title?: string;
  description?: string;
  /** Comma-separated keywords (legacy; minor engines may use). */
  keywords?: string;
  image?: string;
  /** Path (e.g. /about). Canonical and og:url will be baseUrl + path (+ query if present) */
  path?: string;
  /** Use "product" for product detail pages (Open Graph). */
  ogType?: string;
  /** If true, set robots noindex,nofollow */
  noIndex?: boolean;
  /**
   * JSON-LD strings (e.g. JSON.stringify output), injected as script[type="application/ld+json"].
   * Prefer a single @graph payload per page when combining Product + BreadcrumbList.
   */
  jsonLd?: string[];
}

function ensureMeta(nameOrProperty: string, isProperty: boolean): HTMLMetaElement {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProperty}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(nameOrProperty: string, content: string, isProperty: boolean): void {
  const el = ensureMeta(nameOrProperty, isProperty);
  el.setAttribute('content', content);
}

const INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/**
 * Legacy imperative head update (e.g. non-React scripts). Prefer <SEO /> + react-helmet-async.
 */
export function updateDocumentHead(options: SEOOptions): void {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_OG_IMAGE,
    path = '',
    ogType = 'website',
    noIndex = false,
  } = options;

  const baseUrl = getBaseUrl();
  const pathPart = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const canonicalUrl = pathPart ? `${baseUrl}${pathPart}` : baseUrl;
  const imageUrl = toAbsoluteUrl(image, baseUrl);
  const fullTitle = buildDocumentTitle(title);

  document.title = fullTitle;

  const ogTypeNorm = normalizeOgType(ogType);

  setMeta('description', description, false);
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', ogTypeNorm, true);
  setMeta('og:site_name', SITE_NAME, true);

  setMeta('twitter:card', 'summary_large_image', false);
  setMeta('twitter:title', fullTitle, false);
  setMeta('twitter:description', description, false);
  setMeta('twitter:image', imageUrl, false);
  setMeta('twitter:image:alt', fullTitle, false);

  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonicalUrl;

  if (noIndex) {
    setMeta('robots', 'noindex, nofollow', false);
  } else {
    setMeta('robots', INDEX_ROBOTS, false);
  }
}
