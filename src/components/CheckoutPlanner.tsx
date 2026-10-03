import { useId, useState } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { calculateCheckout, checkoutAmount } from '../utils/checkout';
import { IntelligenceOffer } from '../utils/shoppingIntelligence';

const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export function CheckoutPlanner({ offer }: { offer: IntelligenceOffer }) {
  const [delivery, setDelivery] = useState('');
  const [discount, setDiscount] = useState('');
  const [cashback, setCashback] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const id = useId();
  const result = calculateCheckout(offer.price, {
    delivery: checkoutAmount(delivery), instantDiscount: checkoutAmount(discount) ?? 0,
    cashback: checkoutAmount(cashback) ?? 0, eligibilityConfirmed: confirmed,
  });
  const missingPrice = offer.price == null || !Number.isFinite(offer.price) || offer.price <= 0;
  return <details className="mine-checkout">
    <summary><span><Calculator size={16} /> Calculate your checkout</span><ChevronDown size={16} /></summary>
    <div className="mine-checkout-body">
      <p>Build your own scenario using the listed price. Confirm discounts and cashback terms with the store.</p>
      {offer.in_stock === false && <p className="mine-checkout-warning">The source reports this offer out of stock. This calculation does not confirm availability.</p>}
      {offer.coupon && <p>Source coupon: <strong>{offer.coupon}</strong>. Enter its eligible saving below; it is not deducted automatically.</p>}
      {offer.effective_price != null && offer.effective_price > 0 && <p>Source-reported conditional price: {money(offer.effective_price)}. The calculation starts at the listed price to avoid counting a discount twice.</p>}
      <div className="mine-checkout-inputs">
        <label htmlFor={`${id}-delivery`}>Delivery charge (₹)<input id={`${id}-delivery`} inputMode="decimal" value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="Unknown · enter 0 if free" /></label>
        <label htmlFor={`${id}-discount`}>Instant discounts (₹)<input id={`${id}-discount`} inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Coupon + bank discount" /></label>
        <label htmlFor={`${id}-cashback`}>Later cashback (₹)<input id={`${id}-cashback`} inputMode="decimal" value={cashback} onChange={e => setCashback(e.target.value)} placeholder="Eligible cashback only" /></label>
      </div>
      <label className="mine-checkout-confirm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I've checked that these discounts and cashback apply to me.</label>
      {!confirmed && (discount || cashback) && <p>Discounts and cashback are excluded until you confirm eligibility.</p>}
      <div className="mine-checkout-total" aria-live="polite">
        {!result ? <p>{missingPrice ? 'A current listed price is needed to calculate checkout.' : 'Enter valid amounts of zero or more, with up to two decimal places.'}</p> : <>
          <div><span>{result.payNow === null ? 'Before delivery' : 'Pay at checkout'}</span><strong>{money(result.payNow ?? result.subtotal)}</strong></div>
          {result.payNow === null && <p>Delivery is unknown. Enter the charge to calculate a complete total.</p>}
          {result.cashback > 0 && <p>{money(result.cashback)} potential later cashback{result.afterCashback !== null ? ` · ${money(result.afterCashback)} after cashback` : ''}. Subject to the merchant's payout terms.</p>}
          {result.capped && <p>Discounts are capped at the item price and cashback at the remaining item cost. Recheck the amounts entered.</p>}
        </>}
      </div>
      <small>Your estimate · not a live merchant quote. Additional checkout fees may apply.</small>
    </div>
  </details>;
}
