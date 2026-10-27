export interface CheckoutInputs {
  delivery: number | null;
  instantDiscount: number;
  cashback: number;
  eligibilityConfirmed: boolean;
}

export function calculateCheckout(price: number | null, input: CheckoutInputs) {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  if (![input.instantDiscount, input.cashback].every(n => Number.isFinite(n) && n >= 0)) return null;
  if (input.delivery !== null && (!Number.isFinite(input.delivery) || input.delivery < 0)) return null;
  const eligible = !!input.eligibilityConfirmed;
  const discount = eligible ? Math.min(price, input.instantDiscount) : 0;
  const subtotal = Math.round((price - discount) * 100) / 100;
  const hasDelivery = input.delivery !== null;
  const payNow = hasDelivery ? Math.round((subtotal + input.delivery!) * 100) / 100 : null;
  // Cashback is delayed and never reduces the amount due at checkout.
  const cashback = eligible ? Math.min(subtotal, input.cashback) : 0;
  const afterCashback = payNow !== null ? Math.round((payNow - cashback) * 100) / 100 : null;
  return { subtotal, payNow, cashback, afterCashback, discount, capped: eligible && (input.instantDiscount > price || input.cashback > subtotal) };
}

export function checkoutAmount(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return NaN;
  return Number(value);
}
