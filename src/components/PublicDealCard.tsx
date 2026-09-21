import React, { useState } from 'react';
import { ExternalLink, Copy, Check, MessageCircle, AlertTriangle, Bell, Film, ChevronDown } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { Category3DPlaceholder } from './Iconscout3DAssets';
import { MegaHaulCard } from './MegaHaulCard';

interface PublicDealCardProps {
  deal: PublicDeal;
  onOpenImage: (deal: PublicDeal) => void;
  onOpenVideo?: (deal: PublicDeal) => void;
  isEndingSoonView?: boolean;
  isBestWorthView?: boolean;
  activeCards?: string[];
  onOpenCardModal?: () => void;
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

// Compact, crisp store pill
const CompactStoreBadge: React.FC<{ store?: string }> = ({ store = 'Retail' }) => {
  const s = store.toLowerCase();
  if (s.includes('amazon')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#232F3E]/90 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Amazon
      </span>
    );
  }
  if (s.includes('flipkart')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#2874F0]/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
        Flipkart
      </span>
    );
  }
  if (s.includes('myntra')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
        Myntra
      </span>
    );
  }
  if (s.includes('ajio')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        AJIO
      </span>
    );
  }
  if (s.includes('swiggy') || s.includes('instamart')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        Swiggy
      </span>
    );
  }
  if (s.includes('zepto')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        Zepto
      </span>
    );
  }
  if (s.includes('blinkit')) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[10px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Blinkit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300 text-[10px] font-semibold">
      {store}
    </span>
  );
};

export const PublicDealCard: React.FC<PublicDealCardProps> = ({
  deal,
  onOpenImage,
  onOpenVideo,
  onOpenCardModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHaulExpanded, setIsHaulExpanded] = useState(false);

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const relativeTime = getRelativeTime(deal.display_ts || deal.posted_at);
  const savings = (deal.mrp && deal.mrp > (deal.price || 0)) ? deal.mrp - (deal.price || 0) : 0;
  const isExpired = Boolean(deal.is_expired || deal.status === 'expired' || deal.is_over);

  const priceVal = deal.price || 0;
  const mrpVal = (deal.mrp && deal.mrp > priceVal) ? deal.mrp : undefined;
  const effectiveDiscount = (deal.discount_pct && deal.discount_pct >= 100 && priceVal > 0)
    ? (mrpVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0)
    : (deal.discount_pct || 0);

  let displayTitle = deal.title
    ? deal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF👉⚡🔥✅🎁📦🚨📢🏷️💎⏰‼️💥]+\s*/gu, '').trim() || deal.title
    : 'Verified Retail Deal';

  const tLower = displayTitle.toLowerCase().trim();
  const channelHandles = ['smagnetdeals', 'lootdealsapp', 'technicalsheikh', 'glamhauldiaries', 'offerzone', 'dealztrendz', 'freekart', 'extrape', 'realearnkaro', 'desidime', 'bblbblp'];
  const isChannelHandle = channelHandles.some((h) => tLower.includes(h)) ||
    (tLower.startsWith('@') || ((tLower.endsWith('deals') || tLower.endsWith('dealsx') || tLower.endsWith('loot')) && !tLower.includes(' ')));

  if (['products', 'product', 'item store online', 'store online', 'deal', 'loot', 'item'].includes(tLower) || isChannelHandle || displayTitle.length < 5) {
    const slugMatch = deal.url?.match(/\/(?:flipkart\.com|shopsy\.in|fkrt\.cc)(?:\/dl)?\/([^/?#]+)\/p\/itm/i) ||
      deal.url?.match(/amazon\.in\/([^/?#]+)\/dp\/[A-Z0-9]{10}/i);
    if (slugMatch && slugMatch[1]) {
      displayTitle = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (deal.category && deal.category !== 'Special Deal') {
      displayTitle = `${deal.store} ${deal.category} Deal`;
    } else {
      displayTitle = `${deal.store} Verified Deal`;
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(deal.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const discStr = effectiveDiscount > 0 ? ` (${effectiveDiscount}% OFF)` : '';
    const mrpStr = mrpVal ? ` ~₹${mrpVal}~` : '';
    const text = `🔥 *${displayTitle}*\n\n💰 *Price:* ₹${priceVal}${mrpStr}${discStr}\n🛒 *Store:* ${deal.store}\n\n👉 *Claim Deal:* ${deal.url}\n\n⚡ Verified via IndiaDealHunts`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <article className={`group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border transition-all duration-150 p-2.5 sm:p-3.5 select-none ${
      isExpired
        ? 'bg-[#0E111C] border-rose-900/30 opacity-70'
        : 'bg-[#111422] border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#131828] active:scale-[0.98]'
    }`}>
      
      <div>
        {/* 1. Header: Store Badge + Cities + Relative Time */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex flex-wrap items-center gap-1">
            <CompactStoreBadge store={deal.store} />
            {deal.cities && deal.cities.length > 0 && deal.cities.slice(0, 2).map((city, idx) => (
              <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                📍 {city}
              </span>
            ))}
            {deal.cities && deal.cities.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                +{deal.cities.length - 2}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
            {!isExpired && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {relativeTime}
          </span>
        </div>

        {/* 2. Image Stage: Square on mobile, 4/3 on desktop */}
        <div
          className="relative w-full aspect-square sm:aspect-[4/3] bg-[#151928] rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-center overflow-hidden cursor-pointer border border-white/[0.04] mb-2"
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
              className={`max-h-full max-w-full object-contain filter drop-shadow-sm transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isExpired ? 'grayscale' : ''}`}
              loading="lazy"
            />
          ) : (
            <Category3DPlaceholder category={deal.category || deal.store || 'Shopping'} />
          )}

          {/* Discount Pill */}
          {effectiveDiscount > 0 && effectiveDiscount < 100 && !isExpired && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono text-[9.5px] sm:text-[10.5px] font-black shadow-xs z-10">
              {effectiveDiscount}% OFF
            </span>
          )}

          {/* Glitch Anomaly Badge */}
          {deal.deal_badges?.some((b: string) => b.toLowerCase().includes('glitch')) && !isExpired && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider shadow-sm z-10">
              🚨 GLITCH
            </span>
          )}

          {/* 15s Video Short Badge */}
          {(deal.has_video || deal.video_url) && !isExpired && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenVideo) {
                  onOpenVideo(deal);
                } else {
                  onOpenImage(deal);
                }
              }}
              className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-indigo-600/90 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 z-10 cursor-pointer"
              title="Watch 15s Short"
            >
              <Film className="w-2.5 h-2.5" />
              <span>Short</span>
            </button>
          )}

          {/* Sold out overlay */}
          {isExpired && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[10px] font-black tracking-wider uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* 3. Product Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-2 mb-1.5 leading-snug group-hover:text-emerald-300 transition-colors">
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
        {/* 4. Price & Savings Bar */}
        <div className="flex items-baseline justify-between gap-1 pt-1.5 border-t border-white/[0.06] mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-base sm:text-lg font-bold font-mono ${isExpired ? 'text-slate-400 line-through' : 'text-emerald-400'}`}>
              ₹{Math.round(deal.price || 0).toLocaleString('en-IN')}
            </span>
            {mrpVal && (
              <span className="text-[11px] sm:text-xs text-slate-500 line-through font-mono">
                ₹{Math.round(mrpVal).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {savings > 0 && !isExpired && (
            <span className="text-[9.5px] sm:text-[10px] font-mono font-medium text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[80px] sm:max-w-none">
              Save ₹{Math.round(savings).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* 5. Mobile-Optimized Action Bar */}
        <div className="flex items-center gap-1.5">
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer ${
              isExpired
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-400'
            }`}
            aria-label={isExpired ? `Check ${deal.store}` : `Claim on ${deal.store}`}
          >
            <span>{isExpired ? 'Check Stock' : 'Get Deal'}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>

          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.08] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Share deal on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Copy deal link"
            aria-label="Copy deal link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mega Haul Accordion */}
      {deal.is_mega_haul && deal.items && deal.items.length > 0 && (
        <div className="mt-3 border-t border-white/[0.06] pt-2">
          <button
            type="button"
            onClick={() => setIsHaulExpanded(!isHaulExpanded)}
            className="w-full flex items-center justify-between text-[11px] sm:text-xs text-indigo-300 hover:text-indigo-200 font-medium py-1.5 transition-colors cursor-pointer"
          >
            <span>View {deal.items.length} more deals in this location...</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isHaulExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHaulExpanded ? 'max-h-[500px] opacity-100 mt-2 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-2 pb-1">
              {deal.items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.buy_url || deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/[0.04] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all group/item"
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-[11px] sm:text-xs text-slate-200 font-medium truncate group-hover/item:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                    {item.city && (
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        📍 {item.city}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ₹{Math.round(item.sale_price || deal.price || 0).toLocaleString('en-IN')}
                    </span>
                    {(item.discount_pct && item.discount_pct > 0) ? (
                      <span className="text-[9px] text-amber-400 font-black font-mono">
                        {item.discount_pct}% OFF
                      </span>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

    </article>
  );
};
