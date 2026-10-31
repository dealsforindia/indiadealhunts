import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Search, ShoppingBag, TrendingDown, X } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { selectTickerDeals } from '../utils/publicLinks';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import { DealOrb } from './DealOrb';

interface HeroBannerProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchMode?: 'db' | 'live';
  onSearchModeChange?: (mode: 'db' | 'live') => void;
  onOpenLookup?: (url?: string) => void;
  highDiscountCount?: number;
  onFilterFlashLoot?: () => void;
  spotlightDeal?: PublicDeal | null;
  spotlightAlternatives?: PublicDeal[];
  onSelectDeal?: (deal: PublicDeal) => void;
}
const SEARCHES = ['iPhone', 'Mobiles under 20k', 'Laptops', 'Earbuds & TWS', 'Smartwatch', 'Sneakers'];

export const HeroBanner: React.FC<HeroBannerProps> = ({ searchQuery, onSearch, onOpenLookup, highDiscountCount, onFilterFlashLoot, spotlightDeal, spotlightAlternatives = [], onSelectDeal }) => {
  const [input, setInput] = useState(searchQuery);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [revealedId, setRevealedId] = useState<string | null>(null);
  useEffect(() => { setInput(searchQuery); }, [searchQuery]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if ((/^https?:\/\//i.test(value) || /amzn\.|flipkart\.|myntra\./i.test(value)) && onOpenLookup) { onOpenLookup(value); return; }
    onSearch(value);
  }
  const candidates = selectTickerDeals([spotlightDeal, ...spotlightAlternatives].filter((offer): offer is PublicDeal => !!offer && !!getCleanImageUrl(offer.image) && !failedImages.has(getCleanImageUrl(offer.image) || '')));
  const spotlight = candidates.find(offer => offer.id === revealedId) || candidates[0];
  const reveal = () => {
    if (!candidates.length) return;
    const index = revealedId ? (candidates.findIndex(offer => offer.id === revealedId) + 1) % candidates.length : 0;
    setRevealedId(candidates[index].id);
  };
  const spotlightImage = spotlight ? getCleanImageUrl(spotlight.image) : null;
  const reference = spotlight?.mrp && spotlight.mrp > spotlight.price ? spotlight.mrp : null;
  return <section className="premium-hero" aria-label="Discover your next deal">
    <div className={`premium-hero-frame${!spotlight ? ' has-no-spotlight' : ''}`}>
      <div className="premium-hero-copy">
        <div className="premium-kicker"><span aria-hidden="true" />SMALL FINDS. GOOD DAYS.</div>
        <h1>Great finds.<br /><span>Smarter savings.</span></h1>
        <p className="premium-hero-description">Find your next favourite.<br />Compare offers. Keep the good ones.</p>
        <form className="premium-search" onSubmit={submit} role="search" aria-label="Search the deal directory and stores">
          <Search size={21} aria-hidden="true" />
          <input id="hero-search-input" aria-label="Search deals or paste product URL" placeholder="Search products or paste a link" value={input} onChange={event => setInput(event.target.value)} type="search" />
          {input && <button type="button" className="premium-search-clear" aria-label="Clear search" onClick={() => { setInput(''); onSearch(''); document.getElementById('hero-search-input')?.focus(); }}><X size={17} aria-hidden="true" /></button>}
          <button className="premium-search-submit" type="submit" aria-label="Find deals"><span>Find deals</span><ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <div className="premium-popular" aria-label="Popular product searches"><span className="premium-popular-label">Explore</span>
          <button type="button" className="premium-flash-search premium-radar-search" onClick={() => openGoogleShoppingModal(input.trim() || 'trending deals')} title="Search available external store listings"><ShoppingBag size={15} />Price Radar <ArrowRight size={13} /></button>
          {!!highDiscountCount && onFilterFlashLoot && <button type="button" className="premium-flash-search" onClick={onFilterFlashLoot}><TrendingDown size={15} />{highDiscountCount} big drops</button>}
          {SEARCHES.map(term => <button type="button" key={term} onClick={() => { setInput(term); onSearch(term); }}>{term}</button>)}
        </div>
        <div className="premium-store-line"><span>Find offers from</span><strong>amazon</strong><i aria-hidden="true" /><strong>Flipkart</strong><i aria-hidden="true" /><strong>Myntra</strong></div>
      </div>
      <div className="hero-orb-stage">
        <div className="hero-orb-orbit" aria-hidden="true" />
        <DealOrb onReveal={reveal} disabled={!candidates.length} />
      </div>
    </div>
      {revealedId && spotlight && spotlightImage && <aside className="orb-reveal" aria-label="Your surprise offer" aria-live="polite">
        <button className="orb-reveal-close" type="button" aria-label="Close surprise offer" onClick={() => setRevealedId(null)}><X size={18} /></button>
        <img src={spotlightImage} alt="" onError={() => setFailedImages(previous => new Set([...previous, spotlightImage]))} />
        <div><span className="orb-reveal-label">A FIND FOR YOU · {spotlight.store}</span><h2>{spotlight.title}</h2>
          <div className="orb-reveal-price"><strong>₹{spotlight.price.toLocaleString('en-IN')}</strong>{reference && <s>₹{reference.toLocaleString('en-IN')}</s>}</div>
          <small>Confirm price at checkout</small>
          <div className="orb-reveal-actions">{onSelectDeal ? <button type="button" onClick={() => onSelectDeal(spotlight)}>Explore deal <ArrowRight size={16} /></button> : <a href={spotlight.url} target="_blank" rel="noopener noreferrer">View deal <ArrowUpRight size={16} /></a>}<button type="button" onClick={reveal}>Another find</button></div>
        </div>
      </aside>}
  </section>;
};
