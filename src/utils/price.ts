export const formatPrice = (value: number) => {
  const safe = Number.isFinite(value) ? value : 0;
  const rounded = Math.round(safe * 100) / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
};

export const GST_RATE = 0.18;

export const calculateGstBreakdown = (subtotal: number) => {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const gstAmount = Math.round(safeSubtotal * GST_RATE * 100) / 100;
  const total = Math.round((safeSubtotal + gstAmount) * 100) / 100;
  return { subtotal: safeSubtotal, gstAmount, total };
};
