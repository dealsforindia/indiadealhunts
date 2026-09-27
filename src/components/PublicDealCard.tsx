import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { BragCardTemplate } from './BragCardTemplate';

interface PublicDealCardProps {
  deal: PublicDeal;
  onOpenImage: (deal: PublicDeal) => void;
  onOpenVideo?: (deal: PublicDeal) => void;
  isEndingSoonView?: boolean;
  isBestWorthView?: boolean;
  activeCards?: string[];
  onOpenCardModal?: () => void;
}

function getRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Just now';
  const ms = timestamp > 1e11 ? timestamp : timestamp * 1000;
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 0 || diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getStoreBadgeColor(store?: string): { bg: string; color: string } {
  const s = (store || '').toLowerCase();
  if (s.includes('amazon'))  return { bg: '#1C1600', color: '#D97706' };
  if (s.includes('flipkart')) return { bg: '#0A1628', color: '#3B82F6' };
  if (s.includes('myntra'))  return { bg: '#1A0610', color: '#EC4899' };
  if (s.includes('ajio'))    return { bg: '#061414', color: '#14B8A6' };
  if (s.includes('swiggy') || s.includes('instamart')) return { bg: '#1C0E00', color: '#F97316' };
  if (s.includes('zepto'))   return { bg: '#130A1E', color: '#A855F7' };
  if (s.includes('blinkit')) return { bg: '#1A1600', color: '#EAB308' };
  return { bg: '#1A1A1A', color: '#A3A3A3' };
}

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
  const [isGenerating, setIsGenerating] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const relativeTime = getRelativeTime(deal.display_ts || deal.posted_at);
  const savings = (deal.mrp && deal.mrp > (deal.price || 0)) ? deal.mrp - (deal.price || 0) : 0;
  const isExpired = Boolean(deal.is_expired || deal.status === 'expired' || deal.is_over);

  const priceVal = deal.price || 0;
  const mrpVal = (deal.mrp && deal.mrp > priceVal) ? deal.mrp : undefined;
  const effectiveDiscount = (deal.discount_pct && deal.discount_pct >= 100 && priceVal > 0)
    ? (mrpVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0)
    : (deal.discount_pct || 0);

  // Clean title: strip emojis and channel handles
  let displayTitle = deal.title
    ? deal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF]+\s*/gu, '').trim() || deal.title
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
    navigator.clipboard.writeText(deal.url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const discStr = effectiveDiscount > 0 ? ` (${effectiveDiscount}% off)` : '';
    const mrpStr = mrpVal ? ` MRP ${mrpVal}` : '';
    const text = `${displayTitle}\n\nPrice: Rs.${priceVal}${mrpStr}${discStr}\nStore: ${deal.store}\n\nDeal: ${deal.url}\n\nVerified via IndiaDealHunts`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleBragShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
  };

  useEffect(() => {
    if (isGenerating && templateRef.current) {
      const timer = setTimeout(async () => {
        if (!templateRef.current) { setIsGenerating(false); return; }
        try {
          const canvas = await html2canvas(templateRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0A0A0A',
            scale: 2,
          });
          const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (imageBlob) {
            const file = new File([imageBlob], `deal-${deal.id}.png`, { type: 'image/png' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
              await navigator.share({ title: 'Deal found on IndiaDealHunts', files: [file] });
            } else {
              const url = URL.createObjectURL(imageBlob);
              const link = document.createElement('a');
              link.download = `deal-${deal.id}.png`;
              link.href = url;
              link.click();
              // Revoke after small delay to allow download
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            }
          }
        } catch (err) {
          console.error('Card generation failed', err);
        } finally {
          setIsGenerating(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, deal.id]);

  const { bg: storeBg, color: storeColor } = getStoreBadgeColor(deal.store);

  return (
    <article
      style={{
        backgroundColor: isExpired ? '#0D0D0D' : '#111111',
        border: `1px solid ${isExpired ? '#1E1E1E' : '#1E1E1E'}`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isExpired ? 0.65 : 1,
      }}
    >
      {/* Image area */}
      <button
        onClick={() => onOpenImage(deal)}
        aria-label={`View image for ${displayTitle}`}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: '#161616',
          border: 'none',
          cursor: 'pointer',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {cleanImageUrl && !imgError ? (
          <img
            src={cleanImageUrl}
            alt={displayTitle}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImgError(true); setImageLoaded(true); }}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 200ms ease',
              filter: isExpired ? 'grayscale(1)' : 'none',
            }}
            loading="lazy"
          />
        ) : (
          <span style={{ fontSize: '11px', color: '#6B6B6B', fontFamily: 'var(--font-mono)' }}>
            {deal.category || 'Product'}
          </span>
        )}

        {/* Discount badge */}
        {effectiveDiscount > 0 && effectiveDiscount < 100 && !isExpired && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            padding: '2px 6px',
            backgroundColor: '#1A1200',
            border: '1px solid #2E2000',
            borderRadius: '2px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: '#F59E0B',
            lineHeight: '16px',
          }}>
            -{effectiveDiscount}%
          </span>
        )}

        {/* Glitch badge */}
        {deal.deal_badges?.some((b: string) => b.toLowerCase().includes('glitch')) && !isExpired && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '2px 6px',
            backgroundColor: '#1F0D0D',
            border: '1px solid #450A0A',
            borderRadius: '2px',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#EF4444',
            lineHeight: '16px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            GLITCH
          </span>
        )}

        {/* Video badge */}
        {(deal.has_video || deal.video_url) && !isExpired && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenVideo) onOpenVideo(deal);
              else onOpenImage(deal);
            }}
            aria-label="Watch video short"
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              padding: '2px 8px',
              backgroundColor: '#0A0A1A',
              border: '1px solid #1E2040',
              borderRadius: '2px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#6366F1',
              cursor: 'pointer',
              lineHeight: '16px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            VIDEO
          </button>
        )}

        {/* Expired overlay */}
        {isExpired && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              padding: '3px 8px',
              backgroundColor: '#1F0D0D',
              border: '1px solid #7F1D1D',
              borderRadius: '2px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#EF4444',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              SOLD OUT
            </span>
          </div>
        )}
      </button>

      {/* Content */}
      <div style={{ padding: '10px 10px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Store + time */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{
            padding: '2px 6px',
            backgroundColor: storeBg,
            borderRadius: '2px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: storeColor,
            lineHeight: '16px',
            flexShrink: 0,
          }}>
            {deal.store || 'Store'}
          </span>

          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: '#6B6B6B',
            marginLeft: 'auto',
            flexShrink: 0,
          }}>
            {relativeTime}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          color: isExpired ? '#6B6B6B' : '#E5E5E5',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
        }}>
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title={displayTitle}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {displayTitle}
          </a>
        </h3>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', borderTop: '1px solid #1E1E1E', paddingTop: '8px' }}>
          <span className="price-num" style={{
            fontSize: '17px',
            fontWeight: 600,
            color: isExpired ? '#6B6B6B' : '#F5F5F5',
            textDecoration: isExpired ? 'line-through' : 'none',
          }}>
            {'\u20B9'}{Math.round(priceVal).toLocaleString('en-IN')}
          </span>
          {mrpVal && (
            <span className="price-num" style={{
              fontSize: '12px',
              color: '#4A4A4A',
              textDecoration: 'line-through',
            }}>
              {'\u20B9'}{Math.round(mrpVal).toLocaleString('en-IN')}
            </span>
          )}
          {savings > 0 && !isExpired && (
            <span className="price-num" style={{
              fontSize: '11px',
              color: '#22C55E',
              marginLeft: 'auto',
              flexShrink: 0,
            }}>
              -{'\u20B9'}{Math.round(savings).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 10px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={isExpired ? `Check stock on ${deal.store}` : `Get deal on ${deal.store}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: isExpired ? '#6B6B6B' : '#0A0A0A',
            backgroundColor: isExpired ? 'transparent' : '#F5F5F5',
            border: `1px solid ${isExpired ? '#262626' : '#F5F5F5'}`,
            borderRadius: '2px',
            textDecoration: 'none',
            lineHeight: '18px',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isExpired) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#D4D4D4';
          }}
          onMouseLeave={(e) => {
            if (!isExpired) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#F5F5F5';
          }}
        >
          {isExpired ? 'Check Stock' : 'Get Deal'}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Share on WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: '1px solid #262626',
            borderRadius: '2px',
            cursor: 'pointer',
            color: '#6B6B6B',
            flexShrink: 0,
            transition: 'color 120ms ease, border-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#22C55E';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#166534';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
          }}
        >
          {/* WhatsApp SVG */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.472 3.528A11.868 11.868 0 0012.02 0C5.436 0 .075 5.36.07 11.945a11.926 11.926 0 001.598 5.983L0 24l6.228-1.635a11.935 11.935 0 005.784 1.474h.005C18.597 23.839 24 18.479 24 11.894a11.863 11.863 0 00-3.528-8.366zm-8.452 18.31h-.004a9.9 9.9 0 01-5.04-1.376l-.362-.215-3.748.983.999-3.651-.236-.375a9.907 9.907 0 01-1.52-5.258c.004-5.472 4.456-9.924 9.936-9.924A9.882 9.882 0 0121.99 11.9c-.004 5.476-4.457 9.937-9.97 9.937zm5.46-7.44c-.298-.15-1.767-.872-2.04-.972-.272-.099-.47-.148-.669.149-.199.297-.771.972-.946 1.17-.174.198-.348.224-.647.075-.298-.15-1.258-.464-2.397-1.48-.886-.79-1.484-1.766-1.658-2.065-.174-.297-.018-.458.13-.607.134-.133.298-.347.447-.52.15-.174.199-.298.299-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.208-.24-.579-.486-.5-.669-.51-.173-.009-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.199 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.57-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        </button>

        {/* Copy link */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Link copied' : 'Copy deal link'}
          title="Copy deal link"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: `1px solid ${copied ? '#166534' : '#262626'}`,
            borderRadius: '2px',
            cursor: 'pointer',
            color: copied ? '#22C55E' : '#6B6B6B',
            flexShrink: 0,
            transition: 'color 120ms ease, border-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
            }
          }}
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 4V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {/* Generate card */}
        <button
          type="button"
          onClick={handleBragShare}
          disabled={isGenerating}
          aria-label="Download deal card image"
          title="Download deal card image"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: '1px solid #262626',
            borderRadius: '2px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            color: '#6B6B6B',
            flexShrink: 0,
            opacity: isGenerating ? 0.5 : 1,
            transition: 'color 120ms ease, border-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
          }}
        >
          {isGenerating ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="14 8"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v7M2 10h8M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mega haul accordion */}
      {deal.is_mega_haul && deal.items && deal.items.length > 0 && (
        <div style={{ borderTop: '1px solid #1E1E1E' }}>
          <button
            type="button"
            onClick={() => setIsHaulExpanded(!isHaulExpanded)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#6B6B6B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-expanded={isHaulExpanded}
          >
            <span>{deal.items.length} more items in this haul</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
              style={{ transform: isHaulExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isHaulExpanded && (
            <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {deal.items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.buy_url || deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 8px',
                    backgroundColor: '#161616',
                    border: '1px solid #1E1E1E',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#A3A3A3', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <span className="price-num" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5', flexShrink: 0 }}>
                    {'\u20B9'}{Math.round(item.sale_price || deal.price || 0).toLocaleString('en-IN')}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden brag card template */}
      {isGenerating && <BragCardTemplate ref={templateRef} deal={deal} />}
    </article>
  );
};
