import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface HeroBannerProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchMode?: 'db' | 'live';
  onSearchModeChange?: (mode: 'db' | 'live') => void;
  onOpenLookup?: (url?: string) => void;
  highDiscountCount?: number;
  onFilterFlashLoot?: () => void;
  spotlightDeal?: PublicDeal | null;
}

const TRENDING_SEARCHES = [
  'iPhone',
  'Mobiles under 20k',
  'Laptops',
  'Earbuds & TWS',
  'Smartwatch',
  'Sneakers',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearch,
  onOpenLookup,
  highDiscountCount,
  onFilterFlashLoot,
  spotlightDeal,
}) => {
  const [input, setInput] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(searchQuery);
  }, [searchQuery]);

  const submitSearch = () => {
    const trimmed = input.trim();
    if (
      (trimmed.startsWith('http://') || trimmed.startsWith('https://') ||
       trimmed.includes('amzn.') || trimmed.includes('flipkart.') || trimmed.includes('myntra.')) &&
      onOpenLookup
    ) {
      onOpenLookup(trimmed);
      return;
    }
    onSearch(trimmed);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:py-16 bg-[#fafafc] border-b border-[#e5e5e7]">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-14 items-center">
        {/* ── Left Column: Apple-Style Typography & Clean Search ── */}
        <div className="flex flex-col gap-5 max-w-2xl">
          {/* Eyebrow Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5e5e7] text-[#1d1d1f] text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>24/7 Verified Loot Drops across India</span>
            </span>

            {onFilterFlashLoot && highDiscountCount && highDiscountCount > 0 ? (
              <button
                type="button"
                onClick={onFilterFlashLoot}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <span>🔥 {highDiscountCount} Drops at 70%+ OFF →</span>
              </button>
            ) : null}
          </div>

          {/* Main Headline (Apple Style: Tight negative tracking, high weight contrast) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1d1d1f] leading-[1.08]">
            India's Steepest Price Drops.{' '}
            <span className="text-[#0066cc]">Verified in Real Time.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#86868b] text-sm sm:text-base leading-relaxed max-w-xl">
            Real-time price drop detection across Amazon, Flipkart, Myntra, Swiggy, and Zepto. Discounts are cross-checked against price history before publication.
          </p>

          {/* ── Apple-Grade Search Capsule ── */}
          <div
            className={`relative flex items-center h-13 w-full rounded-full bg-white border transition-all duration-200 ${
              isFocused
                ? 'border-[#0066cc] ring-3 ring-[#0066cc]/15 shadow-sm'
                : 'border-[#d2d2d7] hover:border-[#86868b] shadow-2xs'
            }`}
          >
            <div className="pl-4 pr-2 text-[#86868b] flex items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isFocused ? '#0066cc' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch();
              }}
              placeholder="Search verified deals or paste Amazon / Flipkart link..."
              aria-label="Search deals or paste product URL"
              id="hero-search-input"
              className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-[#1d1d1f] placeholder:text-[#86868b] px-2 min-w-0"
            />

            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  onSearch('');
                }}
                aria-label="Clear search"
                className="px-2 text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <div className="pr-1.5">
              <button
                type="button"
                onClick={submitSearch}
                className="h-10 px-5 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold text-xs tracking-wide shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Find Deals</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* ── Single Clean Trending Searches Row ── */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Trending:
            </span>
            {TRENDING_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInput(term);
                  onSearch(term);
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  input.toLowerCase().includes(term.toLowerCase())
                    ? 'bg-[#0066cc] text-white font-semibold shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-[#1d1d1f] border border-[#e5e5e7]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Column: Apple-Style #1 Spotlight Deal Card ── */}
        <div className="hidden lg:flex items-center justify-center">
          {(() => {
            const activeSpotlight = spotlightDeal;
            if (!activeSpotlight || !activeSpotlight.image) return null;
            const spotPrice = activeSpotlight.price || 0;
            const spotMrp = activeSpotlight.mrp && activeSpotlight.mrp > spotPrice ? activeSpotlight.mrp : undefined;
            const spotSavings = spotMrp ? spotMrp - spotPrice : 0;
            const spotDiscount = activeSpotlight.discount_pct || (spotMrp ? Math.round(((spotMrp - spotPrice) / spotMrp) * 100) : 0);
            const spotImage = getCleanImageUrl(activeSpotlight.image);
            if (!spotImage) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[360px] rounded-3xl bg-white border border-[#e5e5e7] p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f5f5f7]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d1d1f]">
                      Spotlight Loot Drop
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>

                {/* Product Photo Stage */}
                <div className="relative aspect-[4/3] rounded-2xl bg-[#f5f5f7] flex items-center justify-center p-5 my-3 overflow-hidden border border-[#ebebeb]">
                  <img
                    src={spotImage}
                    alt={activeSpotlight.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {spotDiscount > 0 && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-600 text-white shadow-2xs">
                      {spotDiscount}% OFF
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#1d1d1f] border border-[#e5e5e7] shadow-2xs">
                    {activeSpotlight.store || 'Verified Store'}
                  </span>
                </div>

                {/* Info & Pricing */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] line-clamp-1 group-hover:text-[#0066cc] transition-colors">
                    {activeSpotlight.title}
                  </h3>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1d1d1f]">
                      ₹{spotPrice.toLocaleString('en-IN')}
                    </span>
                    {spotMrp && (
                      <span className="text-xs text-[#86868b] line-through">
                        ₹{spotMrp.toLocaleString('en-IN')}
                      </span>
                    )}
                    {spotSavings > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 ml-auto">
                        Save ₹{spotSavings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Clean CTA */}
                  <a
                    href={activeSpotlight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full h-10 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold text-xs tracking-wide shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Claim Spotlight Deal</span>
                    <span>→</span>
                  </a>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};
