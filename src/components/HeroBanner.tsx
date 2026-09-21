import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, ExternalLink, Tag, CheckCircle2, X, Flame } from 'lucide-react';
import { PublicDeal } from '../types';
import { calculateWorthScore } from '../utils/worthScore';
import { getCleanImageUrl } from '../utils/imageUrl';
import { Store3DBadge, SavingsPill3D, Category3DPlaceholder } from './Iconscout3DAssets';
import { parseNaturalQuery } from '../utils/semanticSearch';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickSearch: (q: string) => void;
  dealCount: number;
  spotlightDeal: PublicDeal | null;
  showcaseDeals?: PublicDeal[];
  onSelectDeal?: (deal: PublicDeal) => void;
  onOpenLookup?: (url?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onQuickSearch,
  dealCount,
  spotlightDeal,
  showcaseDeals = [],
  onOpenLookup,
}) => {
  const quickTags = [
    'TWS Earbuds under 999',
    'Sneakers 70% off',
    'Smartwatches under 1500',
    'boAt Audio',
    'Backpacks under 500',
    'Laptops',
    'Dinner Sets',
  ];

  const [inputVal, setInputVal] = useState(searchQuery);

  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  const liveParsed = useMemo(() => {
    if (!inputVal.trim()) return null;
    return parseNaturalQuery(inputVal);
  }, [inputVal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.includes('amzn.') ||
      val.includes('flipkart.') ||
      val.includes('myntra.')
    ) {
      if (onOpenLookup) {
        onOpenLookup(val);
        return;
      }
    }
    onSearchChange(inputVal);
  };

  const handleClear = () => {
    setInputVal('');
    onSearchChange('');
  };

  const cleanTitle = (raw?: string) => {
    if (!raw) return 'Verified Retail Deal';
    const cleaned = raw.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF👉⚡🔥✅🎁📦🚨📢🏷️💎⏰‼️💥]+\s*/gu, '').trim() || raw;
    const cLower = cleaned.toLowerCase().trim();
    const channelHandles = ['smagnetdeals', 'lootdealsapp', 'technicalsheikh', 'glamhauldiaries', 'offerzone', 'dealztrendz', 'freekart', 'extrape', 'realearnkaro', 'desidime', 'bblbblp'];
    if (channelHandles.some((h) => cLower.includes(h)) || (cLower.endsWith('deals') && !cLower.includes(' '))) {
      return 'Verified Retail Deal';
    }
    return cleaned;
  };

  // Top 3 Showcase Deals (Fall back to spotlightDeal if showcaseDeals is empty)
  const topShowcase = showcaseDeals.length > 0 
    ? showcaseDeals.slice(0, 3) 
    : spotlightDeal ? [spotlightDeal] : [];

  return (
    <section className="relative pt-3 sm:pt-7 pb-4 sm:pb-6 border-b border-white/[0.06] overflow-hidden">
      {/* Subtle Dark Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Top Header & Search Area */}
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Live Telemetry Radar */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300 mb-2 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider">LIVE DEAL DISCOVERY</span>
            <span className="text-white/25">•</span>
            <span className="text-slate-300 font-normal">{dealCount > 0 ? `${dealCount} drops live` : '27 streams active'}</span>
          </div>

          {/* Clean, Refined Headline */}
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white mb-1 font-brand">
            Verified Deals, Discounts & Price Drops
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-3 leading-relaxed hidden sm:block">
            Real-time price crash intelligence across Amazon, Flipkart, Myntra & top brands. Verified with genuine merchant photos.
          </p>

          {/* Search & URL Input Box */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-2" role="search">
            <div className="relative flex items-center rounded-xl border border-white/12 bg-[#121522]/95 p-1 sm:p-1.5 shadow-lg backdrop-blur-md focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
              <div className="pl-2.5 pr-2 text-slate-400">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  onSearchChange(e.target.value);
                }}
                placeholder="Search deals (e.g. sneakers, boAt) or paste link..."
                className="w-full bg-transparent py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                aria-label="Search deals or paste product URL"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors mr-1 shrink-0"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Live AI Intent Preview */}
          {liveParsed && liveParsed.activeBadges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5 px-3 py-1 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 max-w-xl mx-auto backdrop-blur-md animate-fadeIn">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-400">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>AI Filter:</span>
              </span>
              {liveParsed.activeBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10.5px] font-mono font-medium border border-emerald-500/30"
                >
                  {badge}
                </span>
              ))}
              {liveParsed.cleanQuery && (
                <span className="text-[10.5px] text-slate-400 font-mono">
                  &ldquo;{liveParsed.cleanQuery}&rdquo;
                </span>
              )}
            </div>
          )}

          {/* Popular Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-slate-400 pt-0.5">
            <span className="text-slate-500 text-[10.5px] font-medium mr-1 flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-emerald-400" /> Popular:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setInputVal(tag);
                  onQuickSearch(tag);
                }}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] hover:text-white text-slate-300 text-[10.5px] border border-white/[0.06] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
