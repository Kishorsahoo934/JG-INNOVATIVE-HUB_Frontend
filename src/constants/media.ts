/**
 * Brand images live under `public/assets/`. Favicon: `public/favicon.ico` (regenerate when logo changes).
 *
 * **Google Search & browsers cache favicons/OG images aggressively.** When you replace any logo file,
 * bump `BRAND_ASSET_VERSION` so URLs change (`?v=…`) and crawlers fetch the new asset. Optionally
 * request re-indexing of the homepage in Google Search Console.
 */
export const BRAND_ASSET_VERSION = 'ih4';

export const BRAND_LOGO = `/assets/logo.png?v=${BRAND_ASSET_VERSION}`;
/** Square asset — good for OG / Twitter cards and Organization logo in JSON-LD */
export const BRAND_LOGO_SQUARE = `/assets/logo-512.png?v=${BRAND_ASSET_VERSION}`;
export const BRAND_ICON_128 = `/assets/logo-128.png?v=${BRAND_ASSET_VERSION}`;

/** Intrinsic width/height of `public/assets/logo.png` (update if you replace the file). */
export const BRAND_LOGO_WIDTH = 455;
export const BRAND_LOGO_HEIGHT = 538;

export const PLACEHOLDER_IMAGE = '/placeholder.svg';
