import type { Product } from './products';

export const normalizeCategory = (value: string) =>
  (value || '').toLowerCase().replace(/\s+/g, ' ').trim();

export const is3dPrintingCategory = (product: Product) => {
  const category = normalizeCategory(product.category);
  return category === '3d printing service' || category === '3d printing services';
};

export const isCustom3dProduct = (product: Product) => {
  if (!is3dPrintingCategory(product)) return false;
  const haystack = `${product.name} ${product.shortDescription} ${product.subcategory}`.toLowerCase();
  return haystack.includes('custom') || haystack.includes('variable');
};

/** 3D Printing SKU prefix: IN3D-<number/variable>. All 3D printing products use this format. */
export const IN3D_SKU_PREFIX = 'IN3D-';

/** SKU of the "Contact Us" / pay-to-unlock product. Create this in admin with your own data (e.g. IN3D-001). */
export const CONTACT_US_3D_SKU = 'IN3D-001';

export const is3dPrintingSku = (sku: string) =>
  (sku || '').toUpperCase().startsWith(IN3D_SKU_PREFIX);

/** True if this product is the Contact Us pay product (exact SKU) or any IN3D- product for post-payment redirect. */
export const isContactUs3dProduct = (product: Product) =>
  is3dPrintingSku(product.sku || '');
