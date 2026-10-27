import { useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { calculateCheckout, checkoutAmount } from '../utils/checkout';
import { IntelligenceOffer } from '../utils/shoppingIntelligence';

const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export function CheckoutPlanner({ offer }: { offer: IntelligenceOffer }) {
  const [delivery, setDelivery] = useState('');
  const [discount, setDiscount] = useState('');
  const [cashback, setCashback] = useState('');
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const id = useId();
  const result = calculateCheckout(offer.price, {
    delivery: checkoutAmount(delivery), instantDiscount: checkoutAmount(discount) ?? 0,
    cashback: checkoutAmount(cashback) ?? 0, eligibilityConfirmed,
  });
  const missingPrice = offer.price == null || !Number.isFinite(offer.price) || offer.price <= 0;
  return <details className="mine-checkout">
    <summary><span><Calculator size={16} /> Calculate your checkout</span><ChevronDown size={16} /></summary>
    <div className="mine-checkout-body">
      <p>Estimate your final savings with coupon codes, bank cards, and delivery fees.</p>
      {offer.coupon && <p>Detected coupon: <strong>{offer.coupon}</strong></p>}
      <div className="mine-checkout-inputs">
        <label htmlFor={`${id}-discount`}>Instant discount (₹)<input id={`${id}-discount`} inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="e.g. 500 (card/coupon)" /></label>
        <label htmlFor={`${id}-delivery`}>Delivery fee (₹)<input id={`${id}-delivery`} inputMode="decimal" value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="0 if free delivery" /></label>
        <label htmlFor={`${id}-cashback`}>Cashback / rewards (₹)<input id={`${id}-cashback`} inputMode="decimal" value={cashback} onChange={e => setCashback(e.target.value)} placeholder="e.g. 200 Amazon Pay" /></label>
      </div>
      <label htmlFor={`${id}-eligibility`}><input id={`${id}-eligibility`} type="checkbox" checked={eligibilityConfirmed} onChange={e => setEligibilityConfirmed(e.target.checked)} /> I confirmed I qualify for these discounts and cashback at the store.</label>
      <div className="mine-checkout-total" aria-live="polite">
        {!result ? <p>{missingPrice ? 'Confirm listed price at store to calculate checkout.' : 'Enter valid positive numbers.'}</p> : <>
          <div><span>{result.payNow === null ? 'Subtotal before delivery' : 'Estimated pay at checkout'}</span><strong>{money(result.payNow ?? result.subtotal)}</strong></div>
          {result.payNow === null && <p>Enter the delivery fee (0 if confirmed free) to estimate the checkout total.</p>}
          {!eligibilityConfirmed && (Number(discount) > 0 || Number(cashback) > 0) && <p>Discounts and cashback are excluded until you confirm eligibility.</p>}
          {result.discount > 0 && <p className="text-emerald-500 font-medium">Estimated instant discount: {money(result.discount)}.</p>}
          {result.cashback > 0 && <p>{money(result.cashback)} possible post-purchase cashback{result.afterCashback !== null && <> (Estimated effective cost: <strong>{money(result.afterCashback)}</strong>)</>}</p>}
        </>}
      </div>
    </div>
  </details>;
}
