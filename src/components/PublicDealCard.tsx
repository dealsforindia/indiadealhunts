import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { isDealSaved, toggleSavedDealId } from '../utils/savedDeals';
import { shareToWhatsApp, shareToTelegram, copyDealLink } from '../utils/shareDeal';

interface PublicDealCardProps {
  deal: PublicDeal;
  index?: number;
  isSaved?: boolean;
  onOpenImage?: (deal: PublicDeal) => void;
  onSelectDeal?: (deal: PublicDeal) => void;
  onToggleSave?: (deal: PublicDeal) => void;
  onShowToast?: (msg: string) => void;
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

function cleanTitle(deal: PublicDeal): string {
  let title = deal.title
    ? deal.title.replace(/^[\s\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2011-\u26FF\uFE0E-\uFE0F\u00A0-\u00BF]+\s*/gu, '').trim() || deal.title
    : 'Verified Retail Deal';

  const tLower = title.toLowerCase().trim();
  const channelHandles = ['smagnetdeals', 'lootdealsapp', 'technicalsheikh', 'glamhauldiaries', 'offerzone', 'dealztrendz', 'freekart', 'extrape', 'realearnkaro', 'desidime', 'bblbblp'];
  const isChannelHandle = channelHandles.some((h) => tLower.includes(h)) ||
    (tLower.startsWith('@') || ((tLower.endsWith('deals') || tLower.endsWith('dealsx') || tLower.endsWith('loot')) && !tLower.includes(' ')));

  if (['products', 'product', 'item store online', 'store online', 'deal', 'loot', 'item'].includes(tLower) || isChannelHandle || title.length < 5) {
    const slugMatch = deal.url?.match(/\/(?:flipkart\.com|shopsy\.in|fkrt\.cc)(?:\/dl)?\/([^/?#]+)\/p\/itm/i) ||
      deal.url?.match(/amazon\.in\/([^/?#]+)\/dp\/[A-Z0-9]{10}/i);
    if (slugMatch?.[1]) {
      title = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (deal.category && deal.category !== 'Special Deal') {
      title = `${deal.store} ${deal.category} Deal`;
    } else {
      title = `${deal.store} Verified Deal`;
    }
  }
  return title;
}

function getStoreBadge(store?: string) {
  const s = (store || '').toLowerCase();
  if (s.includes('amazon')) {
    return { name: 'Amazon', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: '🛒' };
  }
  if (s.includes('flipkart')) {
    return { name: 'Flipkart', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD', icon: '🛍️' };
  }
  if (s.includes('myntra')) {
    return { name: 'Myntra', color: '#BE185D', bg: '#FCE7F3', border: '#FBCFE8', icon: '👗' };
  }
  if (s.includes('ajio')) {
    return { name: 'AJIO', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE', icon: '🏷️' };
  }
  if (s.includes('desidime')) {
    return { name: 'DesiDime', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', icon: '🔥' };
  }
  if (s.includes('swiggy') || s.includes('instamart')) {
    return { name: 'Swiggy', color: '#C2410C', bg: '#FFEDD5', border: '#FED7AA', icon: '⚡' };
  }
  return { name: store || 'Store', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0', icon: '✓' };
}

export const PublicDealCard: React.FC<PublicDealCardProps> = ({
  deal,
  index = 0,
  isSaved: propIsSaved,
  onOpenImage,
  onSelectDeal,
  onToggleSave,
  onShowToast,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [localSaved, setLocalSaved] = useState(() => isDealSaved(deal.id));
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const isSaved = propIsSaved !== undefined ? propIsSaved : localSaved;

  useEffect(() => {
    if (!shareOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpen]);

  const cleanImageUrl = getCleanImageUrl(deal.image);
  const displayTitle = cleanTitle(deal);
  const isExpired = Boolean(deal.is_expired || deal.status === 'expired' || deal.is_over);

  const price = deal.price || 0;
  const mrp = deal.mrp && deal.mrp > price ? deal.mrp : undefined;
  const discount =
    deal.discount_pct && deal.discount_pct >= 100 && price > 0 && mrp
      ? Math.round(((mrp - price) / mrp) * 100)
      : deal.discount_pct || 0;

  const savings = mrp && price > 0 ? mrp - price : 0;
  const relativeTime = getRelativeTime(deal.display_ts || deal.posted_at);
  const storeBadge = getStoreBadge(deal.store);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(deal);
    } else {
      const { isSaved: nextSaved } = toggleSavedDealId(deal.id);
      setLocalSaved(nextSaved);
      onShowToast?.(nextSaved ? 'Saved to Loot Bookmarks!' : 'Removed from saved deals');
    }
  };

  const handleCardClick = () => {
    if (onSelectDeal) {
      onSelectDeal(deal);
    } else if (onOpenImage) {
      onOpenImage(deal);
    }
  };

  return (
    <motion.article
      onClick={handleCardClick}
      className="deal-card-premium group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{
        duration: 0.25,
        ease: 'easeOut',
        delay: (index % 12) * 0.025,
      }}
      layout="position"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* ── Top Bar: Store Pill + Time + Save Heart ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          zIndex: 2,
        }}
      >
        {/* Store Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: storeBadge.color,
              backgroundColor: storeBadge.bg,
              border: `1px solid ${storeBadge.border}`,
              letterSpacing: '0.01em',
            }}
          >
            <span>{storeBadge.icon}</span>
            <span>{storeBadge.name}</span>
          </span>

          {discount > 0 && (
            <span className={discount >= 50 ? 'badge-discount-fire' : 'badge-discount-emerald'}>
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Right: Timestamp & Favorite Heart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#94A3B8',
              fontWeight: 500,
            }}
          >
            {relativeTime}
          </span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={handleToggleFavorite}
            title={isSaved ? 'Saved to favorites' : 'Save to favorites'}
            aria-label="Save to favorites"
            style={{
              background: isSaved ? '#FEF3C7' : 'none',
              border: isSaved ? '1px solid #FDE68A' : 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              color: isSaved ? '#D97706' : '#94A3B8',
              transition: 'all 0.15s ease',
            }}
          >
            {isSaved ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#D97706">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Product Media Stage (4:3 Ratio with Zoom on Hover) ── */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          borderBottom: '1px solid #F1F5F9',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {!imgError && cleanImageUrl ? (
          <>
            {!imgLoaded && (
              <div
                className="skeleton"
                style={{ position: 'absolute', inset: 0, borderRadius: 0 }}
              />
            )}
            <motion.img
              src={cleanImageUrl}
              alt={displayTitle}
              loading="lazy"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.25s ease',
              }}
            />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#64748B',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {deal.store || 'Verified Deal'}
            </span>
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#E11D48',
                backgroundColor: '#FFE4E6',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #FECDD3',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.15)',
              }}
            >
              OFFER EXPIRED
            </span>
          </div>
        )}
      </div>

      {/* ── Content Body ── */}
      <div
        style={{
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '10px',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Title */}
        <h3
          title={displayTitle}
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#0F172A',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '39px',
          }}
        >
          {displayTitle}
        </h3>

        {/* Pricing Row */}
        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Check Price'}
            </span>

            {mrp && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#94A3B8',
                  textDecoration: 'line-through',
                }}
              >
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {savings > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  marginLeft: 'auto',
                }}
              >
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Arbitrage Advantage Callout */}
          {savings > 200 && (
            <div
              style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#1D4ED8',
              }}
            >
              <span>⚡</span>
              <span>Lower than other major stores by ₹{savings.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Sparkline Vector & Action Links (Breakdown + Share) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            {/* Embedded Mini Sparkline with emerald trend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="54" height="15" viewBox="0 0 54 15" fill="none">
                <path
                  d="M2 13 L18 8 L34 11 L52 3"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="52" cy="3" r="2.5" fill="#2563EB" />
              </svg>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                }}
              >
                {discount >= 20 ? `↓ ${discount}% drop` : 'Verified loot'}
              </span>
            </div>

            {/* Actions: Breakdown + 1-Click Share Popover */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Share Popover */}
              <div ref={shareRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareOpen(!shareOpen);
                  }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: shareOpen ? '#1D4ED8' : '#64748B',
                    background: shareOpen ? '#EFF6FF' : 'none',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title="Share verified deal"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Share</span>
                </button>

                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 'calc(100% + 6px)',
                        minWidth: '148px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
                        border: '1px solid #E2E8F0',
                        padding: '4px',
                        zIndex: 40,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          shareToWhatsApp(deal);
                          setShareOpen(false);
                          onShowToast?.('Opening WhatsApp share...');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#065F46',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ECFDF5';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>💬</span>
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          shareToTelegram(deal);
                          setShareOpen(false);
                          onShowToast?.('Opening Telegram share...');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#1E40AF',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>✈️</span>
                        <span>Telegram</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyDealLink(deal);
                          setShareOpen(false);
                          if (ok) onShowToast?.('Deal link copied to clipboard!');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F1F5F9';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>📋</span>
                        <span>Copy Link</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Breakdown Modal trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectDeal) onSelectDeal(deal);
                }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
                }}
              >
                Breakdown ↗
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button: ⚡ GRAB DEAL → */}
        <motion.a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-loot"
          whileTap={{ scale: 0.97 }}
          aria-label={`Get deal for ${displayTitle} on ${deal.store}`}
          style={{
            height: '40px',
            width: '100%',
            borderRadius: '10px',
            fontSize: '13px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
            marginTop: '8px',
            cursor: 'pointer',
          }}
        >
          <span>⚡ Grab Deal</span>
          <span>→</span>
        </motion.a>
      </div>
    </motion.article>
  );
};
