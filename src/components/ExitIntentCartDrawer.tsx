import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Zap, X, ShieldCheck } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import {
  extractAmazonAsin,
  buildAmazonCartUrl,
  generateSubId,
  openSmartStoreLink,
  useIsMobile,
} from '../utils/affiliateEngine';

interface ExitIntentCartDrawerProps {
  topDeal: PublicDeal | null;
  onShowToast?: (msg: string) => void;
}

const FREQUENCY_CAP_HOURS = 4;
const STORAGE_KEY = 'idh_exit_cart_drawer_last_ts';

export const ExitIntentCartDrawer: React.FC<ExitIntentCartDrawerProps> = ({ topDeal, onShowToast }) => {
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const maxScrollY = useRef(0);

  const shouldTrigger = (): boolean => {
    if (typeof window === 'undefined' || !topDeal) return false;
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const elapsedHours = (Date.now() - Number(lastShown)) / (1000 * 60 * 60);
        if (elapsedHours < FREQUENCY_CAP_HOURS) {
          return false;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return true;
  };

  const markShown = () => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  };

  useEffect(() => {
    if (!topDeal) return;

    // 1. Desktop Exit Intent: Mouse leaves window near top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && shouldTrigger()) {
        markShown();
        setIsOpen(true);
      }
    };

    // 2. Mobile Exit Intent: Rapid upward swipe after scrolling down into deals
    const handleScroll = () => {
      const currentY = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastScrollTime.current;

      if (currentY > maxScrollY.current) {
        maxScrollY.current = currentY;
      }

      // If user has scrolled down at least 350px and suddenly scrolls up rapidly (> 200px in under 150ms)
      if (maxScrollY.current > 350 && timeDelta > 0 && timeDelta < 200) {
        const scrollDelta = lastScrollY.current - currentY;
        if (scrollDelta > 150 && currentY < 200 && shouldTrigger()) {
          markShown();
          setIsOpen(true);
        }
      }

      lastScrollY.current = currentY;
      lastScrollTime.current = currentTime;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [topDeal]);

  // Escape key handler to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !topDeal) return null;

  const asin = extractAmazonAsin(topDeal.url || topDeal.id);
  const subId = generateSubId('exit_drawer', topDeal.id);
  const cartUrl = asin ? buildAmazonCartUrl(asin, undefined, subId) : topDeal.url;
  const cleanImage = getCleanImageUrl(topDeal.image);
  const price = topDeal.price || 0;
  const mrp = topDeal.mrp && topDeal.mrp > price ? topDeal.mrp : undefined;

  const handleLockInCart = () => {
    markShown();
    setIsOpen(false);
    openSmartStoreLink(cartUrl, 'amazon', asin || undefined, true, subId);
    onShowToast?.('Cart Lock activated — price held for 90 days!');
  };

  const handleOpenApp = () => {
    markShown();
    setIsOpen(false);
    openSmartStoreLink(topDeal.url, 'amazon', asin || undefined, false, subId);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0D1527] p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
              <ShieldCheck size={14} className="text-amber-600" />
              90-DAY PRICE GUARANTEE
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-500 flex items-center justify-center transition cursor-pointer"
              aria-label="Close retention modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Heading and value proposition */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F1F5F9] leading-snug">
              Before you leave — Lock today's loot price for 90 Days!
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Amazon flash drops and discount coupons expire quickly. Placing this verified loot into your Amazon shopping cart reserves today's price and protects you against price increases for up to 90 days.
            </p>
          </div>

          {/* Product Spotlight Row */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-white/5">
            {cleanImage && (
              <img
                src={cleanImage}
                alt={topDeal.title}
                className="h-16 w-16 rounded-xl object-contain bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-1 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] line-clamp-2 leading-snug">
                {topDeal.title}
              </h4>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-base font-black text-slate-900 dark:text-[#F1F5F9] font-mono">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp && (
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {topDeal.discount_pct && topDeal.discount_pct > 0 && (
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    -{topDeal.discount_pct}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleLockInCart}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-heading text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              <ShoppingCart size={16} />
              <span>🛒 Lock in Amazon Cart (90 Days)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenApp}
              className="min-h-[44px] px-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-800 dark:text-[#F8FAFC] font-heading text-xs font-bold active:scale-[0.98] transition cursor-pointer"
            >
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              <span>{isMobile ? "⚡ Open App" : "View on Amazon ↗"}</span>
            </button>
          </div>

          {/* Dismiss Text */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:text-slate-400 font-medium transition cursor-pointer"
            >
              No thanks, I will risk paying full price later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
