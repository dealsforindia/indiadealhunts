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
    <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-12 border-b border-white/[0.07] overflow-hidden">
      {/* Subtle Luma Dark Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Header & Search Area */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          
          {/* Live Telemetry Radar */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-300 mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">LIVE DEAL DISCOVERY</span>
            <span className="text-white/25">•</span>
            <span className="text-slate-300 font-normal">{dealCount > 0 ? `${dealCount} verified drops` : '27 streams active'}</span>
          </div>

          {/* Clean, Refined Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 font-brand">
            Verified Deals, Discounts & Price Drops
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
            Real-time price crash intelligence across Amazon, Flipkart, Myntra, and top brands. Scraped, unshortened & verified with genuine merchant photos.
          </p>

          {/* Search & URL Input Box */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-3" role="search">
            <div className="relative flex items-center rounded-xl border border-white/12 bg-[#121522]/90 p-1.5 shadow-lg backdrop-blur-md focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  onSearchChange(e.target.value);
                }}
                placeholder="Search deals (e.g. sneakers, TV, boAt) or paste product link..."
                className="w-full bg-transparent py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                aria-label="Search deals or paste product URL"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors mr-1"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Live AI Intent Preview */}
          {liveParsed && liveParsed.activeBadges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 max-w-xl mx-auto backdrop-blur-md animate-fadeIn">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>AI Filter:</span>
              </span>
              {liveParsed.activeBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-medium border border-emerald-500/30"
                >
                  {badge}
                </span>
              ))}
              {liveParsed.cleanQuery && (
                <span className="text-[11px] text-slate-400 font-mono">
                  &ldquo;{liveParsed.cleanQuery}&rdquo;
                </span>
              )}
            </div>
          )}

          {/* Popular Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
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
                className="px-2.5 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] hover:text-white text-slate-300 text-[11px] border border-white/[0.06] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Top 3 Curated Drops Showcase (Replaces single giant block) ─── */}
        {topShowcase.length > 0 && !searchQuery && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Today's Top Verified Drops
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                ⚡ Handpicked Loots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topShowcase.map((deal, idx) => {
                const displayTitle = cleanTitle(deal.title);
                const worth = calculateWorthScore(deal);
                const savings = (deal.mrp && deal.mrp > (deal.price || 0)) ? deal.mrp - (deal.price || 0) : 0;
                
                return (
                  <div
                    key={deal.id || idx}
                    className="group relative rounded-2xl bg-[#121522] border border-white/[0.08] hover:border-emerald-500/40 p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5"
                  >
                    {/* Top Meta: Store 3D Badge + Rank Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <Store3DBadge store={deal.store || 'Retail'} />
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                        #{idx + 1} Spotlight
                      </span>
                    </div>

                    {/* Image Stage: Dark Obsidian Stage */}
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="relative aspect-[16/10] bg-[#141828] rounded-xl mb-3 p-3 flex items-center justify-center overflow-hidden border border-white/[0.05] group-hover:border-white/[0.12] transition-colors"
                    >
                      {deal.image ? (
                        <img
                          src={getCleanImageUrl(deal.image)}
                          alt={displayTitle}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <Category3DPlaceholder category={deal.category || deal.store || 'Shopping'} />
                      )}

                      {deal.discount_pct && deal.discount_pct > 0 && deal.discount_pct < 100 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-[10px] font-black shadow-sm">
                          {deal.discount_pct}% OFF
                        </span>
                      )}

                      {worth && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-emerald-400 text-[10px] font-bold border border-white/10">
                          ⭐ {worth.score}
                        </span>
                      )}
                    </a>

                    {/* Title */}
                    <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      <a href={deal.url} target="_blank" rel="noopener noreferrer sponsored">
                        {displayTitle}
                      </a>
                    </h3>

                    {/* Price & Savings */}
                    <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-white/[0.06] mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-emerald-400 font-mono">
                          ₹{Math.round(deal.price || 0).toLocaleString('en-IN')}
                        </span>
                        {deal.mrp && deal.mrp > (deal.price || 0) && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ₹{Math.round(deal.mrp).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <SavingsPill3D amount={savings} />
                      )}
                    </div>

                    {/* Action Button */}
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="w-full py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/[0.08] hover:border-emerald-400 transition-all active:scale-[0.98]"
                    >
                      <span>Claim on {deal.store}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
