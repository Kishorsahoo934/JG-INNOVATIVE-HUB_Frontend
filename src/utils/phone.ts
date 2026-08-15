/** Normalize to 10-digit Indian mobile (no country code). */
export function normalizeIndianMobile10(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('91')) {
    return digits.slice(-10);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return '';
}

export function isValidIndianMobile10(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}
