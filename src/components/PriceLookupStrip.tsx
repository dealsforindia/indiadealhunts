import { ArrowUpRight, ScanLine, TrendingDown } from 'lucide-react';
export const PriceLookupStrip = ({ onOpenLookup }: { onOpenLookup: () => void }) => <section className="idh-lookup-callout" aria-labelledby="lookup-callout-title">
  <div className="idh-lookup-visual" aria-hidden="true"><ScanLine size={28} /><span><TrendingDown size={18} />Price check</span><svg viewBox="0 0 220 70"><path d="M0 12 30 20 53 16 78 36 104 30 132 48 160 42 185 56 220 47" /></svg></div>
  <div className="idh-lookup-copy"><span className="idh-eyebrow">BEFORE YOU CHECK OUT</span><h2 id="lookup-callout-title">A good find deserves<br />a second look.</h2><p>Paste a product link to explore available price observations. Check the evidence behind the offer.</p></div>
  <div className="idh-lookup-action"><button type="button" onClick={onOpenLookup}>Check a product link <ArrowUpRight size={18} /></button><span>History coverage varies by product.<br />Confirm the final price at the store.</span></div>
</section>;
