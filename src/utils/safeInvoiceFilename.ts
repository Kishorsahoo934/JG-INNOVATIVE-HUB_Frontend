/** Matches backend `safeInvoicePdfFilename` — saved file is `{invoiceNumber}.pdf`. */
export function safeInvoicePdfFilename(invoiceNumber: string): string {
  const raw = String(invoiceNumber ?? '').trim();
  const base = (raw || 'order').replace(/[^a-zA-Z0-9-_]/g, '_') || 'order';
  return `${base}.pdf`;
}
