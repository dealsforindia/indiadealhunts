import { useModalSurface } from '../utils/useModalSurface';
import { publicShareUrl, publicStoreUrl } from '../utils/publicLinks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';
import { DealActionIcon } from './DealActionIcon';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { ProductPriceHistory } from './ProductPriceHistory';
import { ProductReviews } from './ProductReviews';
import { couponOffer } from '../utils/couponOffer';
import { analyzeArbitrage } from '../utils/arbitrage';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import { copyDealLink } from '../utils/shareDeal';
import { isDealSaved, toggleSavedDealId } from '../utils/savedDeals';
import {
  extractAmazonAsin,
  buildAmazonCartUrl,
  buildMultiAsinCartUrl,
  generateSubId,
  openSmartStoreLink,
  getRecommendedBundle,
  useIsMobile,
} from '../utils/affiliateEngine';

interface DealDetailModalProps {
  deal: PublicDeal | null;
  onClose: () => void;
  onOpenImage?: (deal: PublicDeal) => void;
  onShowToast?: (msg: string) => void;
  onToggleSave?: (deal: PublicDeal) => void;
  onOpenTool?: (toolId: string) => void;
}

function getStoreDisplayName(store?: string): string {
  const s = (store || '').trim();
  const low = s.toLowerCase();
  if (!s || ['store', 'retail deal', 'unknown', 'deals', 'none'].includes(low)) {
    return 'Verified Store';
  }
  if (low === 'amazon' || low === 'amazon india') return 'Amazon India';
  if (low === 'flipkart') return 'Flipkart';
  if (low === 'myntra') return 'Myntra';
  if (low === 'ajio') return 'AJIO';
  if (low === 'blinkit') return 'Blinkit';
  if (low === 'swiggy') return 'Swiggy Instamart';
  if (low === 'zepto') return 'Zepto';
  return s;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onOpenImage,
  onShowToast,
  onToggleSave,
  onOpenTool,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copyLink, setCopyLink] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [includeBundle, setIncludeBundle] = useState(false);

  const isAmazon = (deal?.store || '').toLowerCase().includes('amazon');
  const asin = isAmazon && deal ? extractAmazonAsin(deal.url || deal.id) : null;
  const subId = deal ? generateSubId('modal', deal.id) : '';
  const bundle = asin && deal ? getRecommendedBundle(deal.category, deal.price || 0) : null;

  const handleLockInCart = () => {
    if (!asin || !deal) return;
    const cartUrl = includeBundle && bundle
      ? buildMultiAsinCartUrl(asin, bundle.asin, undefined, subId)
      : buildAmazonCartUrl(asin, undefined, subId);
    openSmartStoreLink(cartUrl, 'amazon', asin, true, subId);
  };

  const handleOpenStore = () => {
    if (!deal) return;
    openSmartStoreLink(deal.url, deal.store || 'Store', asin || undefined, false, subId);
  };
  const isMobile = useIsMobile();

  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(() => (deal ? isDealSaved(deal.id) : false));
  const [survivalData, setSurvivalData] = useState<any>(null);

  const arbitrage = useMemo(() => (deal ? analyzeArbitrage(deal) : null), [deal]);

  useEffect(() => {
    if (deal) {
      setImgLoaded(false);
      setImgError(false);
      setCopiedCoupon(false);
      setCopyLink(false);
      setReportSent(false);
      setSaved(isDealSaved(deal.id));
      // Small delay for entrance animation
      requestAnimationFrame(() => setVisible(true));

      // Fetch live Weibull survival analysis for deal
      const controller = new AbortController();
      fetch(`https://api.rudranil.me/api/v1/deals/${deal.id}/survival`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.survival) setSurvivalData(data.survival);
        })
        .catch(() => {});
      return () => controller.abort();
    } else {
      setVisible(false);
      setSurvivalData(null);
    }
  }, [deal]);

  const handleToggleFavorite = () => {
    if (!deal) return;
    if (onToggleSave) {
      onToggleSave(deal);
      setSaved(isDealSaved(deal.id));
    } else {
      const { isSaved: next } = toggleSavedDealId(deal.id, deal);
      setSaved(next);
      onShowToast?.(next ? 'Saved to Loot Bookmarks!' : 'Removed from saved deals');
    }
  };

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const dialogRef = useModalSurface(!!deal, handleClose);

  if (!deal) return null;

  const cleanImage = getCleanImageUrl(deal.image);
  const price = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const rawMrp = deal.mrp ?? deal.prices?.mrp;
  const mrp = (rawMrp && rawMrp > price) ? rawMrp : undefined;
  const discount = deal.discount_pct || (mrp ? Math.round((mrp - price) / mrp * 100) : 0);
  const savings = mrp ? mrp - price : 0;
  const storeName = getStoreDisplayName(deal.store);
  const coupon = couponOffer(deal);

  const gstItcAmount = price > 0 ? Math.round(price - price / 1.18) : 0;

  const catLower = (deal.category || '').toLowerCase();
  const titleLower = (deal.title || '').toLowerCase();
  const isTechOrAppliance =
    catLower.includes('electron') ||
    catLower.includes('mobile') ||
    catLower.includes('laptop') ||
    catLower.includes('appliance') ||
    /\b(phone|smartphone|smartphones|laptop|macbook|monitor|printer|tablet|ipad|ac|refrigerator|washing machine|smartwatch)\b/i.test(titleLower);
  const isB2BEligible = isTechOrAppliance && price >= 1500;
  const isFashion = catLower.includes('fashion') || /\b(shoes|sneakers|shirt|t-shirt|jeans|dress|saree|kurta|trousers|sandals|handbag|jacket)\b/i.test(titleLower);
  const isGroceryBeauty = catLower.includes('grocery') || catLower.includes('beauty') || /\b(face wash|cream|shampoo|soap|atta|oil|tea|coffee|biscuit|dry fruits)\b/i.test(titleLower);

  // Filter and sanitize multi_items to ensure only real, valid product purchase links with clean labels
  const validMultiItems = (deal.multi_items || [])
    .map((item, idx) => {
      let label = (item.label || '').trim();
      label = label.replace(/[\[\]\(\)\*\_~`]/g, '').trim();
      label = label.replace(/^[:\-–—\s]+|[:\-–—\s]+$/g, '').trim();

      const rawUrl = (item.url || '').trim();
      const url = rawUrl.replace(/\)\*\*.*$/, '').replace(/[\)\*\_~`]+$/, '').trim();
      const isPreviewOrAsset = /preview\?token|ambhedeal|static-assets|\.(png|jpg|jpeg|webp|gif)($|\?)/i.test(url);

      if (!label || /^Option\s*\d+$/i.test(label) || label === '[' || label === ']') {
        label = `Option ${idx + 1}`;
      }

      return {
        ...item,
        label,
        url,
        isPreviewOrAsset,
      };
    })
    .filter(item => Boolean(item.url) && !item.isPreviewOrAsset && item.label !== '[' && item.label !== ']');

  const hasValidMultiDeals = Boolean(deal.is_multi_deal && validMultiItems.length >= 2);

  const handleCopyCoupon = () => {
    if (coupon?.kind !== 'code') return;
    if (!navigator.clipboard?.writeText) { onShowToast?.('Clipboard unavailable. Select and copy the code.'); return; }
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
      onShowToast?.('Coupon copied!');
    }).catch(() => onShowToast?.('Could not copy the coupon. Select and copy the code.'));
  };

  const handleShare = () => {
    const text = `${deal.title}\n₹${price.toLocaleString('en-IN')} on ${storeName}\n${publicShareUrl(deal.url)}`;
    if (navigator.share) {
      navigator.share({ title: deal.title, text, url: publicShareUrl(deal.url) }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicShareUrl(deal.url)).then(() => {
        setCopyLink(true);
        setTimeout(() => setCopyLink(false), 2000);
        onShowToast?.('Deal link copied!');
      }).catch(() => {});
    }
  };

  const handleReportExpired = () => {
    setReportSent(true);
    onShowToast?.('Marked as expired in this view. Confirm availability with the store.');
  };

  return createPortal(
    <div
      className="deal-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Deal details: ${deal.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: visible ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        transition: 'background-color 200ms ease',
      }}
    >
      <motion.div
        ref={dialogRef}
        className="pro-card deal-detail-sheet"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: 'min(92vh, calc(100dvh - 1.5rem))',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Header */}
        <div className="deal-detail-sheet-head" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#2563EB',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {storeName}
            </span>
            {(() => {
              const cat = deal.category?.trim();
              if (!cat) return null;
              const sLower = storeName.toLowerCase().replace(/india|in|\.com|\.in/g, '').trim();
              const cLower = cat.toLowerCase();
              if (cLower === sLower || cLower.includes(sLower) || sLower.includes(cLower)) return null;
              return (
                <>
                  <span style={{ color: '#94A3B8', fontSize: '11.5px' }}>›</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {cat}
                  </span>
                </>
              );
            })()}
            <span className="deal-source-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#059669',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 12l4 4L19 6"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </svg>
              Directory offer
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" className="detail-icon-control detail-scan-control" onClick={() => openGoogleShoppingModal(deal.title)} title="Scan other stores" aria-label="Scan other stores for this product"><DealActionIcon kind="scan" /></button>

            <button type="button" className="detail-icon-control" onClick={handleToggleFavorite} title={saved ? 'Saved in Loot Bookmarks' : 'Save deal'} aria-label={saved ? 'Remove from bookmarks' : 'Save deal to bookmarks'} aria-pressed={saved}><svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" /></svg></button>

            <button type="button" className="detail-icon-control" onClick={handleClose} aria-label="Close deal details"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
          </div>
        </div>

        {/* Body: Two-column with scrollable container */}
        <div className="deal-detail-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 260px) 1fr',
          gap: '0',
          flex: 1,
          minHeight: 0,
          touchAction: 'pan-y',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}>
          {/* Left: Sticky Image & Quick Highlights Column */}
          <div style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-2)',
          }}>
            <button
              onClick={() => onOpenImage && onOpenImage(deal)}
              className="deal-detail-media"
              aria-label={onOpenImage ? "Click to zoom" : "Product image"}
              style={{
                aspectRatio: '4 / 3',
                backgroundColor: 'var(--surface-2)',
                border: 'none',
                cursor: onOpenImage ? 'zoom-in' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                position: 'relative',
              }}
            >
              {!imgError && cleanImage ? (
                <img
                  src={cleanImage}
                  alt={deal.title}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 150ms ease',
                  }}
                />
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94A3B8' }}>
                  {deal.store}
                </span>
              )}
              {onOpenImage && (
                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#94A3B8',
                  letterSpacing: '0.04em',
                }}>
                  <DealActionIcon kind="zoom" /> Click to zoom
                </span>
              )}
            </button>
            {/* Quick Trust Highlights on Left Column */}
            <div className="hidden sm:flex" style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-subtle)',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 650 }}>
                <DealActionIcon kind="shield" />
                <span>Verified {storeName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <DealActionIcon kind="bolt" />
                <span>Direct merchant drop</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber, #D97706)', fontWeight: 650 }}>
                  <DealActionIcon kind="tag" />
                  <span>{discount}% off MRP</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full title */}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: 1.4,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              {deal.title}
            </h2>

            {/* Brand & Ratings Metadata */}
            {(deal.brand || deal.rating != null) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {deal.brand && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {deal.brand}
                  </span>
                )}
                {deal.rating != null && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '6px',
                    color: '#92400E',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                    <span>{deal.rating.toFixed(1)}</span>
                    {(deal.rating_count != null || deal.review_count != null) && (
                      <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 500 }}>
                        ({(deal.rating_count ?? deal.review_count)?.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Price matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {mrp && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '13px',
                    color: '#94A3B8',
                    textDecoration: 'line-through',
                  }}>
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && discount < 100 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#DC2626',
                    padding: '2px 8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                  }}>
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#059669',
                }}>
                  Savings vs MRP: ₹{savings.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Weibull Survival Analysis & Flash Loot Urgency Indicator */}
            {survivalData && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: survivalData.urgency_score >= 80 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${survivalData.urgency_score >= 80 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                transition: 'all 200ms ease',
              }}>
                <span style={{ fontSize: '16px' }}>{survivalData.urgency_score >= 80 ? '⚡' : '⏱️'}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-heading)',
                      color: survivalData.urgency_score >= 80 ? '#DC2626' : '#059669',
                      letterSpacing: '0.02em',
                    }}>
                      {survivalData.urgency_badge}
                    </span>
                    <span style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}>
                      Est. Half-Life: {survivalData.half_life_minutes} mins
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Stock Expectancy: <strong style={{ color: 'var(--text-primary)' }}>{survivalData.estimated_remaining_text}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Key Features & Highlights */}
            {deal.highlights && deal.highlights.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-2, #F8FAFC)',
                border: '1px solid var(--border-subtle, #E2E8F0)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary, #64748B)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <Sparkles size={13} color="#2563EB" /> Key Highlights
                </span>
                <ul style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}>
                  {deal.highlights.slice(0, 4).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coupon code */}
            {coupon && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  {coupon.kind === 'code' ? 'PROMO CODE' : 'STORE COUPON'}
                </span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#EFF6FF',
                  border: '1px dashed #3B82F6',
                  borderRadius: '8px',
                  width: 'fit-content',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1D4ED8',
                    letterSpacing: '0.08em',
                  }}>
                    {coupon.label}
                  </span>
                  {coupon.kind === 'code' && <button
                    onClick={handleCopyCoupon}
                    aria-label={`Copy coupon ${deal.coupon}`}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: copiedCoupon ? '#ECFDF5' : '#FFFFFF',
                      border: `1px solid ${copiedCoupon ? '#A7F3D0' : '#CBD5E1'}`,
                      borderRadius: '6px',
                      color: copiedCoupon ? '#059669' : '#0F172A',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {copiedCoupon ? 'COPIED ✓' : 'COPY CODE'}
                  </button>}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {coupon.kind === 'activation' ? 'Collect or apply the coupon on the product page. Confirm eligibility and the final price at checkout.' : 'Apply this code at checkout. Confirm its terms and the final price at the store.'}
                </span>
              </div>
            )}

            {/* Universal Multi-Deal Options Deck */}
            {hasValidMultiDeals && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: 'var(--accent-blue, #3b82f6)' }}>
                    📦 MULTIPLE DEALS INSIDE ({validMultiItems.length} ITEMS)
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue, #3b82f6)' }}>
                    Direct Links
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  This curated drop includes multiple direct purchase options. Pick any item below to shop with verified discounts:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {validMultiItems.map((item, idx) => {
                    const isStepOrPromo = /^(step|add|buy|get|free|coupon|click|claim|apply|order)/i.test(item.label.trim());
                    const buttonLabel = isStepOrPromo
                      ? (item.price ? `Shop · ₹${item.price.toLocaleString('en-IN')}` : 'View Offer ↗')
                      : (item.price ? `Buy · ₹${item.price.toLocaleString('en-IN')}` : 'Shop Now ↗');
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-surface-elevated, var(--bg-surface, #ffffff))',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isStepOrPromo && (
                              <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                                STEP {idx + 1}
                              </span>
                            )}
                          <div style={{ fontWeight: 650, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                            {item.label}
                          </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            {item.price ? (
                              <span style={{ fontWeight: 700, color: 'var(--accent-blue, #3b82f6)', fontSize: '12.5px' }}>
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                            ) : null}
                            {item.discount ? (
                              <span style={{ fontSize: '12px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald, #10b981)' }}>
                                Listed {item.discount}% OFF
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '7px 12px',
                            borderRadius: '7px',
                            background: 'linear-gradient(135deg, #0066cc, #2563eb)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '12.5px',
                            fontWeight: 650,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => openSmartStoreLink(item.url, deal.store || 'Store', undefined, false, subId)}
                        >
                          <DealActionIcon kind="store" /><span>{buttonLabel}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step-by-Step Trick Offer Checklist */}
            {deal.trick_steps && deal.trick_steps.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎯</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      How to Avail This Trick ({deal.trick_steps.length} Steps)
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#D97706',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}>
                    Loot Trick
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {deal.trick_steps.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guaranteed Cash Buyback Arbitrage Flip Guide */}
            {deal.is_arbitrage && deal.arbitrage && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.04))',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>💰</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Guaranteed Cash Arbitrage Opportunity
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Instant Buyback on {deal.arbitrage.buyback_platform || 'Cashify / CeX India'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}>
                    +{deal.arbitrage.roi_pct}% ROI
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Buy Price</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{Number(deal.arbitrage.sale_price || price).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Buyback Quote</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                      ₹{Number(deal.arbitrage.buyback_price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Net Cash Profit</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
                      +₹{Number(deal.arbitrage.net_profit || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {deal.arbitrage.flip_guide && (
                  <div style={{
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    color: 'var(--text-primary)',
                    border: '1px dashed rgba(16, 185, 129, 0.3)',
                  }}>
                    ⚡ <strong>Flip Strategy:</strong> {deal.arbitrage.flip_guide}
                  </div>
                )}
              </div>
            )}

            {/* Verified Multi-Store Price History & Trends Graph */}
            <ProductPriceHistory url={deal.url} dealId={deal.fp_hash || deal.id} currentPrice={price} mrp={mrp} />
            <ProductReviews url={deal.url} id={deal.id} />

            {/* Multi-Store Real-Time Live Check Matrix */}
            {arbitrage && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Compare store listings
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    Store links
                  </span>
                </div>

                {/* Store Quotes Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {arbitrage.quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="deal-compare-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: q.isVerifiedDeal ? '#FFFFFF' : '#F1F5F9',
                        border: `1px solid ${q.isVerifiedDeal ? '#A7F3D0' : '#E2E8F0'}`,
                        boxShadow: q.isVerifiedDeal ? '0 1px 2px rgba(16, 185, 129, 0.1)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {q.store}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: q.isVerifiedDeal ? '#065F46' : '#475569',
                          backgroundColor: q.isVerifiedDeal ? '#ECFDF5' : '#E2E8F0',
                          border: `1px solid ${q.isVerifiedDeal ? '#A7F3D0' : '#CBD5E1'}`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}>
                          {q.badge}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {q.price !== undefined ? (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#059669',
                          }}>
                            ₹{q.price.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                        {q.store === 'Google Shopping' ? (
                          <button
                            type="button"
                            onClick={() => openGoogleShoppingModal(deal?.title || '')}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{q.actionText}</span>
                            <span style={{ fontSize: '11px', backgroundColor: '#DBEAFE', padding: '1px 4px', borderRadius: '4px' }}>IN-APP</span>
                          </button>
                        ) : (
                          <a
                            href={publicStoreUrl(q.url) || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: q.isVerifiedDeal ? '#059669' : '#2563EB',
                              textDecoration: 'none',
                              backgroundColor: q.isVerifiedDeal ? '#F0FDF4' : '#EFF6FF',
                              border: `1px solid ${q.isVerifiedDeal ? '#BBF7D0' : '#DBEAFE'}`,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            {q.actionText}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-secondary)',
                  margin: '2px 0 0',
                  lineHeight: 1.4,
                }}>
                  {arbitrage.verdict}
                </p>
              </div>
            )}

            {/* ── Apple Verified Deal Authenticity Card ── */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#0066CC',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Check before buying
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0066CC',
                }}>
                  {storeName}
                </span>
              </div>

              <div style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
              }}>
                {savings > 0 ? (
                  <span>
                    You save <strong style={{ color: '#0066CC' }}>₹{savings.toLocaleString('en-IN')}</strong> ({discount}% below MRP). MRP is a merchant reference; inspect recorded history separately.
                  </span>
                ) : (
                  <span>
                    This directory offer links to the merchant. Confirm price and availability before buying.
                  </span>
                )}
              </div>
            </div>

            {isMobile && (
              <div className="deal-detail-secondary-actions">
                {asin && <button type="button" className="detail-action detail-action-primary" onClick={handleLockInCart} title="Add to Amazon cart; confirm the final price there"><DealActionIcon kind="cart" /><span>{includeBundle ? 'Add bundle to cart' : 'Add to Amazon cart'}</span></button>}
                {bundle && <label><input type="checkbox" checked={includeBundle} onChange={e => setIncludeBundle(e.target.checked)} /> Include accessory · Check price</label>}
                <button type="button" className="detail-action detail-scan-control" onClick={() => openGoogleShoppingModal(deal.title)}><DealActionIcon kind="scan" />Compare stores</button>
                <button type="button" className="detail-action" onClick={handleShare}><DealActionIcon kind="copy" /><span>{copyLink ? 'Copied!' : 'Copy link'}</span></button>
                <button type="button" className="detail-action detail-action-quiet" onClick={handleReportExpired} disabled={reportSent}><DealActionIcon kind="expired" /><span>{reportSent ? 'Marked expired' : 'Mark expired here'}</span></button>
              </div>
            )}

            {/* Editorial verification note */}
            <p style={{
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
            }}>
              Source-reported offer from {storeName}. Prices, stock and delivery costs may change.
            </p>
          </div>
        </div>

        {isMobile && <div className="deal-detail-mobile-buy"><button type="button" className="detail-action detail-action-primary" onClick={handleOpenStore}><DealActionIcon kind="store" /><span>{isMobile ? `Open ${storeName} app` : `View at ${storeName}`}</span></button></div>}
        {/* Desktop actions */}
        <div className="deal-detail-desktop-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px max(14px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-2)',
          flexWrap: 'wrap',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
        }}>
          {asin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {bundle && (
                <button
                  type="button"
                  onClick={() => setIncludeBundle(!includeBundle)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0 12px',
                    height: '42px',
                    backgroundColor: includeBundle ? '#FEF08A' : '#FEFCE8',
                    border: `1px solid ${includeBundle ? '#EAB308' : '#FEF08A'}`,
                    borderRadius: '9999px',
                    color: '#854D0E',
                    fontSize: '11.5px',
                    fontWeight: includeBundle ? 700 : 500,
                    cursor: 'pointer',
                  }}
                  title="Add accessory bundle or delivery saver"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" />{includeBundle && <path d="m8 12 3 3 5-6" />}</svg>
                  <span>Optional accessory · Check price</span>
                </button>
              )}
              <button type="button" className="detail-action detail-action-primary" onClick={handleLockInCart} title="Add to Amazon cart; confirm the final price there"><DealActionIcon kind="cart" /><span>{includeBundle ? 'Add bundle to cart' : 'Add to Amazon cart'}</span></button>
              <button type="button" className="detail-action detail-action-primary" onClick={handleOpenStore}><DealActionIcon kind="store" /><span>{isMobile ? `Open ${storeName} app` : `View at ${storeName}`}</span></button>
            </div>
          ) : (
            <button type="button" className="detail-action detail-action-primary" onClick={handleOpenStore}><DealActionIcon kind="store" /><span>{isMobile ? `Open ${storeName} app` : `View at ${storeName}`}</span></button>
          )}

          <button type="button" className="detail-action detail-scan-control" onClick={() => openGoogleShoppingModal(deal.title)} title="Scan all Indian stores on Google Shopping Radar"><DealActionIcon kind="scan" /><span>Scan stores</span></button>

          <button type="button" className="detail-action" onClick={handleShare}><DealActionIcon kind="copy" /><span>{copyLink ? 'Copied!' : 'Copy link'}</span></button>

          <button type="button" className="detail-action detail-action-quiet" onClick={handleReportExpired} disabled={reportSent}><DealActionIcon kind="expired" /><span>{reportSent ? 'Marked expired' : 'Mark expired here'}</span></button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
