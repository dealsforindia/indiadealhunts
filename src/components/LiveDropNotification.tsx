import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface LiveDropNotificationProps {
  deal: PublicDeal | null;
  onClose: () => void;
  onViewDeal: (deal: PublicDeal) => void;
}

export const LiveDropNotification: React.FC<LiveDropNotificationProps> = ({
  deal,
  onClose,
  onViewDeal,
}) => {
  useEffect(() => {
    if (!deal) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [deal, onClose]);

  if (!deal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-20 right-4 md:right-8 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 text-white rounded-2xl p-3.5 shadow-2xl overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {deal.image ? (
              <img
                src={deal.image}
                alt=""
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl">🛍️</span>
            )}
            {deal.discount_pct && (
              <span className="absolute bottom-0 right-0 bg-rose-600 text-white text-[9px] font-extrabold px-1 rounded-tl-md">
                {deal.discount_pct}%
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              <span className="animate-pulse">⚡</span>
              <span>Live Drop from DealFlow</span>
            </div>
            <h5 className="text-xs font-semibold text-white leading-snug line-clamp-2 mt-0.5">
              {deal.title}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold font-mono text-emerald-400">
                ₹{(deal.price ?? 0).toLocaleString('en-IN')}
              </span>
              {deal.mrp && deal.mrp > (deal.price ?? 0) && (
                <span className="text-[10px] text-slate-400 line-through font-mono">
                  ₹{deal.mrp.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                {deal.store}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-800">
          <button
            onClick={() => {
              onViewDeal(deal);
              onClose();
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs text-center cursor-pointer"
          >
            View Loot Details
          </button>
          <button
            onClick={() => {
              const text = deal.original_text || deal.aff_text || '';
              const couponMatch = text.match(/\b([A-Z0-9]{5,12})\b/g);
              const possibleCoupon = couponMatch ? couponMatch.find(c => c.length >= 5 && !/^\d+$/.test(c) && !['HTTP', 'HTTPS', 'PRICE', 'DISCOUNT'].includes(c)) : null;
              if (possibleCoupon && navigator.clipboard) {
                navigator.clipboard.writeText(possibleCoupon).catch(() => {});
              }
              window.open(`https://api.rudranil.me/r/${deal.fp_hash || deal.id}`, '_blank', 'noopener,noreferrer');
              onClose();
            }}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors text-center"
          >
            Open Store ↗
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
