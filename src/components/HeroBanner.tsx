import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface HeroBannerProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onOpenLookup?: (url?: string) => void;
}

const POPULAR_SEARCHES = [
  'TWS under 999',
  'iPhone 16',
  'Gaming Laptops',
  'Smart TV 55"',
  "Men's Sneakers",
  'Kitchen Air Fryer',
];

const QUICK_STORES = [
  { name: 'Amazon', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
  { name: 'Flipkart', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { name: 'Myntra', color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { name: 'Zepto / Swiggy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearch,
  onOpenLookup,
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

  const handleChipClick = (query: string) => {
    setInput(query);
    onSearch(query);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white border-b border-slate-200/80">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-10 md:gap-12 items-center">
        {/* ── Left Column: Headline, Search Capsule, Quick Store Filters ── */}
        <div className="flex flex-col gap-5 max-w-2xl">
          {/* Eyebrow Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-bold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>LIVE AI LOOT RADAR · 27 CHANNELS MONITORED</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            India's Steepest{' '}
            <span className="text-blue-600">
              Price Drops & Loot Deals,
            </span>{' '}
            Verified in Real Time.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Scraped instantly from top curator channels and verified against 90-day price trends. Never overpay on Amazon, Flipkart, or Myntra again.
          </p>

          {/* ── Floating White Search Capsule ── */}
          <div className={`relative flex items-center h-14 w-full rounded-2xl bg-white border transition-all duration-200 ${
            isFocused
              ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg'
              : 'border-slate-300/80 hover:border-slate-400 shadow-md'
          }`}>
            <div className="pl-4 pr-2 text-slate-400 flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isFocused ? '#2563EB' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              placeholder="Search 3,350+ drops, products or paste product link..."
              aria-label="Search deals or paste product URL"
              id="hero-search-input"
              className="flex-1 bg-transparent border-0 outline-none text-sm sm:text-base text-slate-900 placeholder:text-slate-400 px-2 min-w-0"
            />

            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  onSearch('');
                }}
                aria-label="Clear search"
                className="px-2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <div className="pr-1.5">
              <button
                type="button"
                onClick={submitSearch}
                className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Find Deals</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Popular Search Tags & Store Filters ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Popular:
              </span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleChipClick(term)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Top Stores:
              </span>
              {QUICK_STORES.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleChipClick(s.name.split(' ')[0])}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${s.color}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Apple-Style #1 Spotlight Deal Card ── */}
        <div className="hidden lg:flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[380px] rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
          >
            {/* Spotlight Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                  ⚡ Spotlight Loot Drop
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Score: 98/100
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="relative aspect-[4/3] rounded-xl bg-slate-50 flex items-center justify-center p-4 my-3 overflow-hidden border border-slate-100">
              <img
                src="https://m.media-amazon.com/images/I/51HBom8xz7L._SL1500_.jpg"
                alt="boAt Airdopes 141 Pro"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-rose-600 text-white shadow-sm">
                -64% OFF
              </span>
              <span className="absolute bottom-2.5 right-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                Amazon India
              </span>
            </div>

            {/* Product Title & Info */}
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                boAt Airdopes 141 Pro True Wireless Earbuds
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-extrabold text-slate-900">
                  ₹899
                </span>
                <span className="font-mono text-xs text-slate-400 line-through">
                  ₹2,499
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 ml-auto">
                  Save ₹1,600
                </span>
              </div>

              {/* Claimed progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-blue-600 h-full w-[72%] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-500">
                <span>72% claimed</span>
                <span className="text-amber-600 font-semibold">⚡ Lightning Deal</span>
              </div>

              {/* CTA Button */}
              <a
                href="https://www.amazon.in/dp/B09N3ZNHTY"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full h-10 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs tracking-wide shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Grab Spotlight Deal</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
