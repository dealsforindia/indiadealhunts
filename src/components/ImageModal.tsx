import { useModalSurface } from '../utils/useModalSurface';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Tag, ShoppingBag } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface ImageModalProps {
  deal: PublicDeal | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ deal, onClose }) => {
  const [imageError, setImageError] = React.useState(false);

  useEffect(() => {
    setImageError(false);
  }, [deal?.id, deal?.image]);

  const modalSurface = useModalSurface(!!deal, onClose);

  if (!deal) return null;

  return createPortal(
    <div ref={modalSurface}
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-[var(--surface)]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative max-w-2xl w-full bg-white dark:bg-[var(--surface)] rounded-3xl border border-[var(--border-subtle)] dark:border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[calc(100dvh-2rem)] overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button with >= 44x44px Hit Target */}
        <button
          onClick={onClose}
          className="touch-target min-h-[44px] min-w-[44px] absolute top-4 right-4 p-2.5 rounded-full bg-[var(--surface-2)] dark:bg-[var(--surface-2)] hover:bg-[var(--surface-2)] dark:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-primary)] transition cursor-pointer"
          aria-label="Close photo modal (Escape)"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          
          {/* Image */}
          <div className="w-full md:w-1/2 aspect-square bg-[var(--surface)] dark:bg-[var(--bg)] rounded-2xl p-4 flex items-center justify-center border border-[var(--border-subtle)]/80 dark:border-white/10 overflow-hidden shadow-inner">
            {deal.image && !imageError ? (
              <img
                src={getCleanImageUrl(deal.image)}
                alt={deal.title}
                onError={() => setImageError(true)}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            ) : (
              <div className="text-[var(--text-secondary)] flex flex-col items-center gap-2 p-4 text-center">
                <ShoppingBag className="w-12 h-12 text-[var(--idh-accent)]" aria-hidden="true" />
                <span className="text-xs font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{deal.store} listing · Offer Preview</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--idh-accent)] border border-[var(--border-subtle)] font-mono">
                  {deal.store}
                </span>
                {deal.discount_pct && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                    {deal.discount_pct}% OFF
                  </span>
                )}
              </div>

              <h2 id="image-modal-title" className="text-base font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] line-clamp-3 leading-snug">
                {deal.title}
              </h2>
            </div>

            {/* Pricing */}
            <div className="bg-[var(--surface)] dark:bg-[var(--bg)] p-4 rounded-2xl border border-[var(--border-subtle)]/80 dark:border-white/10">
              <div className="flex items-baseline gap-2">
                {deal.price ? (
                  <span className="text-2xl font-mono font-extrabold text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                    ₹{deal.price.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-secondary)]">Price on Store</span>
                )}

                {deal.mrp && deal.mrp > (deal.price || 0) && (
                  <span className="text-sm text-[var(--text-secondary)] line-through font-mono">
                    ₹{deal.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {deal.coupon && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg inline-flex items-center gap-1 font-mono">
                  <Tag className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>Coupon: {deal.coupon}</span>
                </div>
              )}
            </div>

            {/* CTA Button with 44px Touch Target */}
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-[var(--idh-action-solid)] hover:bg-[var(--idh-action-solid)] text-white font-bold text-xs tracking-wider uppercase text-center shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              aria-label={`Claim deal on ${deal.store}`}
            >
              <span>Buy on {deal.store}</span>
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
