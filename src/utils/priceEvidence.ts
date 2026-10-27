/** Retrieval time is not observation time. Only dated merchant evidence is current. */
export function priceFreshness(data: { price_verified?: boolean; price_source?: string; last_checked_at?: number }, now = Date.now()) {
  const raw = Number(data.last_checked_at);
  const checked = Number.isFinite(raw) && raw > 0 ? (raw < 1e11 ? raw * 1000 : raw) : (data.price_verified ? now : null);
  const verified = data.price_verified === true || data.price_source === 'merchant_product_page' || data.price_source === 'merchant_live_scrape';
  if (!verified || !checked || checked <= 0 || checked > now + 60000) return { current: false, checked: null, label: 'Current price unconfirmed' };
  if (now - checked > 15 * 60000) return { current: false, checked, label: 'Earlier merchant observation' };
  return { current: true, checked, label: 'Recently checked merchant price' };
}

export function normalizeLookup(data: Record<string, any>): Record<string, any> {
  const evidence = priceFreshness(data);
  const number = Number(data.price);
  const rawPrice = Number.isFinite(number) && number > 0 ? number : null;
  const isAvailable = Boolean(rawPrice && (evidence.current || data.price_verified === true));
  const verifiedPrice = isAvailable ? rawPrice : null;
  const verifiedMrp = isAvailable ? data.mrp : null;
  const verifiedDiscount = isAvailable ? data.discount_pct : null;

  return {
    ...data,
    reported_price: rawPrice,
    price: verifiedPrice,
    pendingLivePrice: !isAvailable,
    price_evidence_label: evidence.label,
    price_verified: isAvailable,
    last_checked_at: evidence.checked ?? undefined,
    mrp: verifiedMrp,
    discount_pct: verifiedDiscount,
  };
}
