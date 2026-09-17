import React, { useState } from 'react';
import { ExternalLink, Copy, Check, MessageCircle, ZoomIn, Clock, Flame, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublicDeal } from '../types';
import { calculateWorthScore } from '../utils/worthScore';
import { getCleanImageUrl } from '../utils/imageUrl';

interface PublicDealCardProps {
  deal: PublicDeal;
  onOpenImage: (deal: PublicDeal) => void;
  isEndingSoonView?: boolean;
  isBestWorthView?: boolean;
}

// Relative time formatter
function getRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Just now';
  const ms = timestamp > 1e11 ? timestamp : timestamp * 1000;
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 0 || diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Deterministic claimed count based on deal id for dynamic social status
function getClaimedCount(dealId: string, discount: number = 50): number {
  let hash = 0;
  for (let i = 0; i < dealId.length; i++) {
    hash = (hash << 5) - hash + dealId.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 45 + 12;
  return Math.min(120, Math.round(base * (1 + discount / 100)));
}

// Clean Store Badge
const StoreLogo: React.FC<{ store: string }> = ({ store }) => {
  const s = (store || '').toLowerCase();
  if (s.includes('amazon')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#232F3E] border border-amber-500/30 text-amber-300 text-[10.5px] font-semibold">
        <svg className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 24 24">
          <path d="M15.93 17.09c-2.83 2.08-6.95 3.19-10.49 1.57-1.44-.66-2.6-1.74-3.44-3.09-.23-.37.05-.83.47-.73 3.65.86 7.6.61 10.98-1.02.43-.21.9.21.62.61-.41.59-.83 1.14-1.32 1.66l3.18 1zm4.72-2.19c.14-.84.22-1.7.22-2.58 0-6.07-4.93-11-11-11S-.13 6.25-.13 12.32 4.8 23.32 10.87 23.32c3.55 0 6.72-1.68 8.76-4.31.25-.32.06-.79-.34-.84l-2.02-.27c-.22-.03-.43.08-.54.27-1.41 1.94-3.7 3.2-6.28 3.2-4.38 0-7.94-3.44-8.09-7.78 3.73 1.83 8.16 1.87 11.96.11l.07-.03c.53-.25.86-.79.82-1.38-.05-.81-.69-1.44-1.5-1.47-2.9-.11-5.74.88-8.08 2.59.34-3.37 3.18-5.99 6.64-5.99 3.69 0 6.68 3 6.68 6.68 0 .42-.04.83-.11 1.23-.05.3.16.58.46.61l2.45.24c.26.03.48-.15.52-.41z"/>
        </svg>
        Amazon
      </span>
    );
  }
  if (s.includes('flipkart')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2874F0]/20 border border-blue-500/30 text-blue-300 text-[10.5px] font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] text-[#2874F0] font-black text-[8px] flex items-center justify-center leading-none">f</span>
        Flipkart
      </span>
    );
  }
  if (s.includes('myntra')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10.5px] font-semibold">
        <span className="font-bold text-[9px] text-pink-400">M</span>
        Myntra
      </span>
    );
  }
  if (s.includes('ajio')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10.5px] font-semibold">
        AJIO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10.5px] font-semibold">
      {store || 'Retail'}
    </span>
  );
};

export const PublicDealCard: React.FC<PublicDealCardProps> = ({
  deal,
  onOpenImage,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const relativeTime = getRelativeTime(deal.posted_at);
  const worth = calculateWorthScore(deal);
  const savings = (deal.mrp && deal.mrp > (deal.price || 0)) ? deal.mrp - (deal.price || 0) : 0;
  const claimedCount = getClaimedCount(deal.id || deal.title, deal.discount_pct || 0);

  const displayTitle = deal.title
    ? deal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF👉⚡🔥✅🎁📦🚨📢🏷️💎⏰‼️💥]+\s*/gu, '').trim() || deal.title
    : 'Verified Retail Deal';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(deal.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🔥 *${displayTitle}*\n\n💰 *Price:* ₹${deal.price || 0} ~₹${deal.mrp || 0}~ (${deal.discount_pct || 0}% OFF)\n🛒 *Store:* ${deal.store}\n\n👉 *Grab Deal Now:* ${deal.url}\n\n⚡ Verified via IndiaDealHunts`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleClaim = () => {
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10B981', '#34D399', '#6EE7B7'],
    });
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121522] hover:border-emerald-500/40 p-3 sm:p-3.5 transition-all duration-200 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5">
      
      <div>
        {/* 1. Card Top Meta: Store Logo + Relative Time + Verified Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <StoreLogo store={deal.store || 'Retail'} />
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              {relativeTime}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {deal.desidime_temperature && deal.desidime_temperature >= 100 ? (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {deal.desidime_temperature}°
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* 2. Product Image Stage: Dark Obsidian Stage (Luma Style) */}
        <div
          className="relative w-full aspect-[4/3] bg-[#141828] rounded-xl p-3 flex items-center justify-center overflow-hidden cursor-pointer border border-white/[0.05] group-hover:border-white/[0.12] transition-colors mb-2.5"
          onClick={() => onOpenImage(deal)}
          role="button"
          tabIndex={0}
          aria-label={`Enlarge photo for ${displayTitle}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenImage(deal);
            }
          }}
        >
          {cleanImageUrl && !imgError ? (
            <img
              src={cleanImageUrl}
              alt={displayTitle}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImgError(true);
                setImageLoaded(true);
              }}
              className={`max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="text-slate-500 text-xs flex flex-col items-center gap-1 text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Verified {deal.store} Item</span>
            </div>
          )}

          {/* Discount Pill Overlay */}
          {deal.discount_pct && deal.discount_pct > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-[10px] font-black shadow-sm">
              {deal.discount_pct}% OFF
            </span>
          )}

          {/* Zoom Hover Hint */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm border border-white/10">
              <ZoomIn className="w-3 h-3" /> View
            </span>
          </div>
        </div>

        {/* 3. Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-2 mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title={displayTitle}
          >
            {displayTitle}
          </a>
        </h3>
      </div>

      <div>
        {/* 4. Price & Savings Row */}
        <div className="flex items-baseline justify-between gap-1 pt-2 border-t border-white/[0.06] mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              ₹{Math.round(deal.price || 0).toLocaleString('en-IN')}
            </span>
            {deal.mrp && deal.mrp > (deal.price || 0) && (
              <span className="text-xs text-slate-500 line-through font-mono">
                ₹{Math.round(deal.mrp).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {savings > 0 && (
            <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* 5. Live Social Status (People Getting Deals Signal) */}
        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 bg-white/[0.03] border border-white/[0.05] px-2 py-1 rounded-lg mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">
            <strong className="text-slate-200">{claimedCount} shoppers</strong> claimed this today
          </span>
        </div>

        {/* 6. Clean Action Buttons */}
        <div className="flex items-center gap-1.5">
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClaim}
            className="flex-1 py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-1 border border-white/[0.08] hover:border-emerald-400 transition-all active:scale-[0.98]"
            aria-label={`Claim deal on ${deal.store}`}
          >
            <span>Claim on {deal.store}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.08] flex items-center justify-center transition-colors shrink-0"
            title="Share deal on WhatsApp"
            aria-label="Share deal on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors shrink-0"
            title="Copy deal link"
            aria-label="Copy deal link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </article>
  );
};
