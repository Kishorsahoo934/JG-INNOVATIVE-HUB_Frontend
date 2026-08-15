/**
 * Product JSON-LD (schema.org Product + Offer) for Helmet and tooling.
 */
import { getBaseUrl } from '@/lib/seo';
import { BRAND_LOGO } from '@/constants/media';
import { buildBreadcrumbListNode } from '@/lib/breadcrumbJsonLd';

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  const u = pathOrUrl.trim();
  if (!u) return `${baseUrl}${BRAND_LOGO.startsWith('/') ? BRAND_LOGO : `/${BRAND_LOGO}`}`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${baseUrl}${u.startsWith('/') ? u : `/${u}`}`;
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ProductJsonLdReview {
  authorName?: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  priceCurrency?: string;
  stock: number;
  path: string;
  /** Prefer real SKU; falls back to productId when empty */
  sku?: string;
  /** Mongo _id — used as sku/mpn fallback */
  productId?: string;
  category?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: ProductJsonLdReview[];
}

function priceValidUntilIso(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** Approved or legacy reviews without status (treat as public). */
export function filterApprovedReviews<T extends { status?: string }>(list: T[]): T[] {
  if (!Array.isArray(list)) return [];
  return list.filter((r) => (r as { status?: string }).status === 'approved' || !(r as { status?: string }).status);
}

export interface ReviewLike {
  rating?: number;
  userName?: string;
  comment?: string;
  pros?: string;
  cons?: string;
  status?: string;
}

/** Maps API reviews to aggregateRating + Review nodes for JSON-LD. */
export function mapReviewsForProductJsonLd(reviews: ReviewLike[]): Pick<ProductJsonLdInput, 'aggregateRating' | 'reviews'> {
  const approved = filterApprovedReviews(reviews);
  if (!approved.length) return {};

  let sum = 0;
  let count = 0;
  approved.forEach((r) => {
    const n = Number(r.rating);
    if (n >= 1 && n <= 5) {
      sum += n;
      count += 1;
    }
  });

  const reviewsOut: ProductJsonLdReview[] = approved.slice(0, 5).map((r) => {
    const body = [r.comment, r.pros, r.cons]
      .map((x) => (x || '').trim())
      .filter(Boolean)
      .join(' ')
      .trim();
    const rating = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0) || 1));
    return {
      authorName: r.userName?.trim() || 'Verified buyer',
      reviewBody: body || `Customer rated this product ${rating} out of 5.`,
      ratingValue: rating,
    };
  });

  const out: Pick<ProductJsonLdInput, 'aggregateRating' | 'reviews'> = {};
  if (count > 0) {
    out.aggregateRating = {
      ratingValue: Math.round((sum / count) * 10) / 10,
      reviewCount: count,
    };
  }
  if (reviewsOut.length) out.reviews = reviewsOut;
  return out;
}

/**
 * Builds schema.org Product object (no @context — use inside @graph or add context at root).
 */
export function buildProductJsonLdObject(input: ProductJsonLdInput): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const desc = stripHtml(input.description).slice(0, 5000);
  const rawImages = Array.isArray(input.image) ? input.image : [input.image];
  const images = rawImages.filter(Boolean).map((u) => toAbsoluteUrl(u, baseUrl));
  const primaryImage = images[0] || toAbsoluteUrl(BRAND_LOGO, baseUrl);
  const availability =
    input.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const productPageUrl = `${baseUrl}${path}`;
  const skuVal = (input.sku || '').trim() || (input.productId || '').trim();

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: productPageUrl,
    priceCurrency: input.priceCurrency ?? 'INR',
    price: String(input.price),
    availability,
    priceValidUntil: priceValidUntilIso(),
    itemCondition: 'https://schema.org/NewCondition',
  };

  const schema: Record<string, unknown> = {
    '@type': 'Product',
    name: input.name,
    url: productPageUrl,
    image: images.length <= 1 ? primaryImage : images,
    description: desc || input.name,
    brand: {
      '@type': 'Brand',
      name: 'Innovative Hub',
    },
    offers: offer,
  };

  if (skuVal) {
    schema.sku = skuVal;
    schema.mpn = skuVal;
    schema.productID = skuVal;
  }

  if (input.category?.trim()) {
    schema.category = input.category.trim();
  }

  const agg = input.aggregateRating;
  const usePlaceholderRating =
    import.meta.env.VITE_SEO_USE_PLACEHOLDER_RATINGS === 'true' &&
    !agg &&
    (!input.reviews || input.reviews.length === 0);

  if (agg && agg.reviewCount > 0 && agg.ratingValue > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(Math.min(5, Math.max(1, agg.ratingValue))),
      reviewCount: String(Math.floor(agg.reviewCount)),
    };
  } else if (usePlaceholderRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '12',
    };
  }

  if (input.reviews && input.reviews.length > 0) {
    schema.review = input.reviews.map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.authorName || 'Verified buyer',
      },
      reviewBody: r.reviewBody.slice(0, 5000),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Math.min(5, Math.max(1, r.ratingValue)),
        bestRating: r.bestRating ?? 5,
      },
    }));
  }

  return schema;
}

export function buildProductDetailJsonLdGraphString(
  productInput: ProductJsonLdInput,
  breadcrumbItems: { name: string; path: string }[]
): string {
  const productNode = buildProductJsonLdObject(productInput);
  const crumbNode = buildBreadcrumbListNode(breadcrumbItems);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [productNode, crumbNode],
  });
}
