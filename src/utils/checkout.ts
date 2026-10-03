export interface CheckoutInputs {
  delivery: number | null;
  instantDiscount: number;
  cashback: number;
  eligibilityConfirmed: boolean;
}

/** A shopper scenario, never a claim that a merchant will honor an offer. */
export function calculateCheckout(price: number | null, input: CheckoutInputs) {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  if (![input.instantDiscount, input.cashback].every(n => Number.isFinite(n) && n >= 0)) return null;
  if (input.delivery !== null && (!Number.isFinite(input.delivery) || input.delivery < 0)) return null;
  const discount = input.eligibilityConfirmed ? Math.min(price, input.instantDiscount) : 0;
  const subtotal = Math.round((price - discount) * 100) / 100;
  const payNow = input.delivery === null ? null : Math.round((subtotal + input.delivery) * 100) / 100;
  // Cashback is delayed and never reduces the amount due at checkout.
  const cashback = input.eligibilityConfirmed ? Math.min(subtotal, input.cashback) : 0;
  const afterCashback = payNow === null ? null : Math.round((payNow - cashback) * 100) / 100;
  return { subtotal, payNow, cashback, afterCashback, discount, capped: input.eligibilityConfirmed && (input.instantDiscount > price || input.cashback > subtotal) };
}

export function checkoutAmount(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return NaN;
  return Number(value);
}
