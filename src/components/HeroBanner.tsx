import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Search, ShoppingBag, TrendingDown, X } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { selectTickerDeals } from '../utils/publicLinks';
import { openGoogleShoppingModal } from '../utils/googleShopping';

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
      
      {spotlight && spotlightImage ? (
        <div className="hero-spotlight-stage" aria-label="Featured deal spotlight">
          <div className="hero-spotlight-card">
            <div className="hero-spotlight-header">
              <span className="hero-spotlight-pill">🔥 FEATURED LOOT</span>
              <span className="hero-spotlight-store">{spotlight.store}</span>
            </div>
            <div className="hero-spotlight-media">
              <img
                src={spotlightImage}
                alt={spotlight.title}
                onError={() => setFailedImages(previous => new Set([...previous, spotlightImage]))}
              />
              {spotlight.discount_pct ? (
                <span className="hero-spotlight-discount">−{spotlight.discount_pct}%</span>
              ) : null}
            </div>
            <div className="hero-spotlight-body">
              <h2 title={spotlight.title}>{spotlight.title}</h2>
              <div className="hero-spotlight-pricing">
                <strong>₹{spotlight.price.toLocaleString('en-IN')}</strong>
                {reference && <s>₹{reference.toLocaleString('en-IN')}</s>}
              </div>
              <div className="hero-spotlight-actions">
                {onSelectDeal ? (
                  <button type="button" className="hero-spotlight-btn-primary" onClick={() => onSelectDeal(spotlight)}>
                    Explore deal <ArrowRight size={15} />
                  </button>
                ) : (
                  <a href={spotlight.url} target="_blank" rel="noopener noreferrer" className="hero-spotlight-btn-primary">
                    View deal <ArrowUpRight size={15} />
                  </a>
                )}
                {candidates.length > 1 && (
                  <button type="button" className="hero-spotlight-btn-secondary" onClick={reveal} title="Show another find">
                    Next offer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </section>;
};
