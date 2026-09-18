import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Zap, ShieldCheck } from 'lucide-react';
import { PublicDeal } from '../types';

interface LootPulseProps {
  deals: PublicDeal[];
}

export const LootPulse: React.FC<LootPulseProps> = ({ deals }) => {
  const [currentDeal, setCurrentDeal] = useState<PublicDeal | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (dismissed || !deals || deals.length === 0) return;

    // Filter deals with valid title, price, and image
    const validDeals = deals.filter(
      (d) => !d.is_over && !d.is_expired && (d.price || 0) > 0 && d.image
    );
    if (validDeals.length === 0) return;

    let index = 0;

    const interval = setInterval(() => {
      // Pick next deal
      const next = validDeals[index % validDeals.length];
      setCurrentDeal(next);
      setVisible(true);

      // Hide after 6 seconds
      const hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 6000);

      index += 1;

      return () => clearTimeout(hideTimeout);
    }, 14000);

    // Initial delay of 4 seconds before first pulse
    const initialTimer = setTimeout(() => {
      const first = validDeals[Math.floor(Math.random() * Math.min(5, validDeals.length))];
      setCurrentDeal(first);
      setVisible(true);
      setTimeout(() => setVisible(false), 6000);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [deals, dismissed]);

  if (dismissed || !currentDeal || !visible) return null;

  const displayTitle = currentDeal.title
    ? currentDeal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF👉⚡🔥✅🎁📦🚨📢🏷️💎⏰‼️💥]+\s*/gu, '').trim() || currentDeal.title
    : 'Verified Drop';

  return (
    <aside
      aria-live="polite"
      aria-label="Recent Shopper Activity Notification"
      className="fixed bottom-20 left-4 z-40 max-w-xs md:max-w-sm w-full transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-5 fade-in"
    >
      <div className="relative p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-black/80 flex items-center gap-3 text-slate-100 group">
        
        {/* Glow accent */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 rounded-2xl blur-xs -z-10 pointer-events-none" />

        {/* Thumbnail */}
        {currentDeal.image && (
          <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={currentDeal.image}
              alt={displayTitle}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-emerald-400" />
              Verified Claim
            </span>
            <span className="text-[10px] text-slate-400 font-mono">• Just now</span>
          </div>

          <p className="text-xs font-semibold text-white line-clamp-1 leading-snug">
            {displayTitle}
          </p>

          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs font-black text-emerald-400 font-mono">
              ₹{Math.round(currentDeal.price || 0).toLocaleString('en-IN')}
            </span>
            {currentDeal.discount_pct && currentDeal.discount_pct > 0 && (
              <span className="text-[10px] text-amber-400 font-bold">
                {currentDeal.discount_pct}% OFF
              </span>
            )}
            <span className="text-[10px] text-slate-400">on {currentDeal.store}</span>
          </div>
        </div>

        {/* Action button */}
        <a
          href={currentDeal.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30 transition-all shrink-0"
          title="View Deal"
          aria-label="View Deal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors shadow-sm"
          title="Dismiss pulse alerts"
          aria-label="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
