import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface PublicDealCardProps {
  deal: PublicDeal;
  index?: number;
  onOpenImage?: (deal: PublicDeal) => void;
  onSelectDeal?: (deal: PublicDeal) => void;
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

export const PublicDealCard: React.FC<PublicDealCardProps> = ({
  deal,
  index = 0,
  onOpenImage,
  onSelectDeal,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleCardClick = () => {
    if (onSelectDeal) {
      onSelectDeal(deal);
    } else if (onOpenImage) {
      onOpenImage(deal);
    }
  };

  // Discount badge styling: Red when >= 50%, Green when < 50%
  const isHighDiscount = discount >= 50;

  return (
    <motion.article
      onClick={handleCardClick}
      className="glass-panel"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{
        duration: 0.35,
        ease: 'easeOut',
        delay: (index % 12) * 0.035,
      }}
      layout="position"
      style={{
        minHeight: '440px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* ── Top Bar: Discount Badge + Favorite Heart Button ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px 6px',
          zIndex: 2,
        }}
      >
        {discount > 0 ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.25 }}
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: isHighDiscount ? '#3A1714' : '#123322',
              color: isHighDiscount ? '#FF6B5F' : '#4ADE80',
              letterSpacing: '0.02em',
            }}
          >
            -{discount}%
          </motion.span>
        ) : (
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#1B222C',
              color: '#9099A6',
            }}
          >
            DEAL
          </span>
        )}

        {/* Favorite Heart Button ♡ / ♥ */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          animate={{ scale: isSaved ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          title={isSaved ? 'Saved to favorites' : 'Save to favorites'}
          aria-label="Toggle favorite"
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? '#F59E0B' : '#9099A6',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            borderRadius: '4px',
            transition: 'color 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isSaved) (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA';
          }}
          onMouseLeave={(e) => {
            if (!isSaved) (e.currentTarget as HTMLButtonElement).style.color = '#9099A6';
          }}
        >
          {isSaved ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* ── Product Image: 4:3 Aspect Ratio Container ── */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--bg)',
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
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 1.03 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
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
              color: '#687482',
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

        {isExpired && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(13, 14, 17, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#EF4444',
                backgroundColor: '#3A1714',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #7F1D1D',
              }}
            >
              OFFER EXPIRED
            </span>
          </div>
        )}
      </div>

      {/* ── Content Stage ── */}
      <div
        style={{
          padding: '12px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '8px',
        }}
      >
        {/* Store & Relative Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {deal.store?.toLowerCase().includes('amazon') ? (
              <span style={{ color: '#F59E0B', fontSize: '13px' }}>🛒</span>
            ) : deal.store?.toLowerCase().includes('flipkart') ? (
              <span style={{ color: '#38BDF8', fontSize: '13px' }}>🛍️</span>
            ) : (
              <span style={{ color: '#10B981', fontSize: '13px' }}>🏷️</span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: deal.store?.toLowerCase().includes('amazon') ? '#F59E0B' : '#9099A6',
                letterSpacing: '0.04em',
              }}
            >
              {deal.store || 'Store'}
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#687482',
            }}
          >
            {relativeTime}
          </span>
        </div>

        {/* Title (2 lines clamped) */}
        <h3
          title={displayTitle}
          style={{
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: '#F5F7FA',
            fontFamily: 'var(--font-body)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '39px',
          }}
        >
          {displayTitle}
        </h3>

        {/* Pricing & Savings Block */}
        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="price-num"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
                fontWeight: 800,
                color: '#F5F7FA',
                lineHeight: 1,
              }}
            >
              {price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'See price'}
            </span>
            {mrp && (
              <span
                className="price-num"
                style={{
                  fontSize: '12px',
                  color: '#687482',
                  textDecoration: 'line-through',
                }}
              >
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Savings Callout & Optional Tiny Price-Drop Signal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', flexWrap: 'wrap', marginTop: '3px' }}>
            {savings > 0 ? (
              <div
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  color: '#22C55E',
                  whiteSpace: 'nowrap',
                }}
              >
                Save ₹{savings.toLocaleString('en-IN')}
              </div>
            ) : <div />}

            {discount >= 25 && (
              <div
                className="hidden sm:inline-flex"
                style={{
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#38BDF8',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M1 3l4 4 2.5-2.5L11 8M11 8H7.5M11 8V4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Price Drop</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary CTA Button: GET DEAL → */}
        <motion.a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          onClick={(e) => e.stopPropagation()}
          whileTap={{ scale: 0.98 }}
          aria-label={`Get deal for ${displayTitle} on ${deal.store}`}
          style={{
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            textDecoration: 'none',
            marginTop: '8px',
          }}
        >
          <span>Get Deal</span>
          <motion.span
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
            style={{ display: 'inline-block' }}
          >
            →
          </motion.span>
        </motion.a>
      </div>
    </motion.article>
  );
};
