import type { Product } from './products';

/** Clamp cart line quantity to valid range; 0 means remove line. Respects stock when stock is greater than zero. */
export function clampCartQuantity(product: Product, quantity: number): number {
  const q = Math.floor(quantity);
  if (q < 1) return 0;
  const stock = product.stock;
  if (stock > 0) return Math.min(q, stock);
  return 0;
}
