/**
 * BreadcrumbList JSON-LD (schema.org) for product and listing pages.
 */
import { getBaseUrl } from '@/lib/seo';

function toLoc(path: string, baseUrl: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

export interface BreadcrumbItem {
  name: string;
  /** Site path including leading slash, e.g. /eshop/products */
  path: string;
}

/** BreadcrumbList node for use inside @graph (no @context). */
export function buildBreadcrumbListNode(items: BreadcrumbItem[]): Record<string, unknown> {
  if (!items.length) {
    return { '@type': 'BreadcrumbList', itemListElement: [] };
  }
  const baseUrl = getBaseUrl();
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toLoc(item.path, baseUrl),
  }));

  return {
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function buildBreadcrumbJsonLdString(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...buildBreadcrumbListNode(items),
  });
}
