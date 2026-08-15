import { Helmet } from 'react-helmet-async';
import {
  buildDocumentTitle,
  getBaseUrl,
  toAbsoluteUrl,
  type SEOOptions,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  normalizeOgType,
} from '@/lib/seo';

const INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

interface SEOProps extends SEOOptions {}

/**
 * Route-level SEO: title, meta, Open Graph, Twitter, canonical.
 * Uses react-helmet-async so tags are tied to the React render (better than useEffect-only crawlers).
 * For meta in the first HTML byte, add SSR/SSG or hosting-level prerender.
 */
export default function SEO(props: SEOProps) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    image,
    path = '',
    ogType = 'website',
    noIndex = false,
    jsonLd,
  } = props;

  const baseUrl = getBaseUrl();
  const pathPart = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const canonicalUrl = pathPart ? `${baseUrl}${pathPart}` : baseUrl;
  const imageUrl = toAbsoluteUrl(image ?? '', baseUrl);
  const fullTitle = buildDocumentTitle(title);
  const ogTypeNorm = normalizeOgType(ogType);

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}

      <link rel="canonical" href={canonicalUrl} />

      <meta name="robots" content={noIndex ? 'noindex, nofollow' : INDEX_ROBOTS} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogTypeNorm} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@InnovativeHub" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {jsonLd?.map((raw, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: raw }}
        />
      ))}
    </Helmet>
  );
}
