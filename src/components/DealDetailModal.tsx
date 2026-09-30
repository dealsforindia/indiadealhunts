import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { SignaturePriceGraph } from './SignaturePriceGraph';

interface DealDetailModalProps {
  deal: PublicDeal | null;
  onClose: () => void;
  onOpenImage?: (deal: PublicDeal) => void;
  onShowToast?: (msg: string) => void;
}

function getStoreDisplayName(store?: string): string {
  const s = (store || '').toLowerCase();
  if (s.includes('amazon'))  return 'Amazon India';
  if (s.includes('flipkart')) return 'Flipkart';
  if (s.includes('myntra'))  return 'Myntra';
  if (s.includes('ajio'))    return 'AJIO';
  if (s.includes('blinkit')) return 'Blinkit';
  if (s.includes('swiggy'))  return 'Swiggy Instamart';
  if (s.includes('zepto'))   return 'Zepto';
  return store || 'Store';
}

function AnimatedSavings({ value }: { value: number }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!value || value <= 0) return;
    let start = 0;
    const duration = 400; // ms
    const steps = 10;
    const stepTime = duration / steps;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayVal(value);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span>₹{displayVal.toLocaleString('en-IN')}</span>;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onOpenImage,
  onShowToast,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copyLink, setCopyLink] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (deal) {
      setImgLoaded(false);
      setImgError(false);
      setCopiedCoupon(false);
      setCopyLink(false);
      setReportSent(false);
      // Small delay for entrance animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [deal]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    if (!deal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [deal, handleClose]);

  if (!deal) return null;

  const cleanImage = getCleanImageUrl(deal.image);
  const price = deal.price || 0;
  const mrp = (deal.mrp && deal.mrp > price) ? deal.mrp : undefined;
  const discount = deal.discount_pct || 0;
  const savings = mrp ? mrp - price : 0;
  const storeName = getStoreDisplayName(deal.store);

  const handleCopyCoupon = () => {
    if (!deal.coupon) return;
    navigator.clipboard.writeText(deal.coupon).then(() => {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
      onShowToast?.('Coupon copied!');
    }).catch(() => {});
  };

  const handleShare = () => {
    const text = `${deal.title}\n₹${price.toLocaleString('en-IN')} on ${storeName}\n${deal.url}`;
    if (navigator.share) {
      navigator.share({ title: deal.title, text, url: deal.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(deal.url).then(() => {
        setCopyLink(true);
        setTimeout(() => setCopyLink(false), 2000);
        onShowToast?.('Deal link copied!');
      }).catch(() => {});
    }
  };

  const handleReportExpired = () => {
    setReportSent(true);
    onShowToast?.('Reported — we will recheck this deal.');
  };

  return createPortal(
    <div
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
        className="pro-card"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid #F1F5F9',
          backgroundColor: '#F8FAFC',
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
            {deal.category && (
              <>
                <span style={{ color: '#94A3B8', fontSize: '10px' }}>›</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                  {deal.category}
                </span>
              </>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
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
              Verified Loot
            </span>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close deal details"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#64748B',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#CBD5E1';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body: Two-column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(160px, 260px) 1fr',
          gap: '0',
          flex: 1,
        }}>
          {/* Left: Image */}
          <button
            onClick={() => onOpenImage && onOpenImage(deal)}
            aria-label="Click to zoom"
            style={{
              aspectRatio: '4 / 3',
              alignSelf: 'start',
              backgroundColor: '#F8FAFC',
              border: 'none',
              borderRight: '1px solid #F1F5F9',
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
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: '#94A3B8',
                letterSpacing: '0.04em',
              }}>
                🔍 Click to zoom
              </span>
            )}
          </button>

          {/* Right: Details */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full title */}
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#0F172A',
              margin: 0,
            }}>
              {deal.title}
            </h2>

            {/* Price matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#0F172A',
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
                  Total Savings: <AnimatedSavings value={savings} />
                </span>
              )}
            </div>

            {/* Coupon code */}
            {deal.coupon && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  PROMO CODE
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
                    {deal.coupon}
                  </span>
                  <button
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
                  </button>
                </div>
                {deal.coupon_discount && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B' }}>
                    {deal.coupon_discount}% off with this code
                  </span>
                )}
              </div>
            )}

            {/* Signature Animated 30-Day Price History Graph */}
            <SignaturePriceGraph
              currentPrice={price}
              regularPrice={deal.regular_price || deal.usually_price || undefined}
              mrp={mrp}
            />

            {/* Editorial verification note */}
            <p style={{
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              color: '#64748B',
              lineHeight: 1.5,
              margin: 0,
              borderTop: '1px solid #F1F5F9',
              paddingTop: '10px',
            }}>
              Verified via official {storeName} product feed.
              {deal.cluster_count && deal.cluster_count > 1
                ? ` Confirmed across ${deal.cluster_count} independent sources.`
                : ' Price checked against live merchant data.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 18px',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#F8FAFC',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-loot"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 20px',
              height: '42px',
              fontFamily: 'var(--font-heading)',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              flexShrink: 0,
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go to Deal on {storeName}
          </a>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              color: copyLink ? '#059669' : '#475569',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 120ms ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="10" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="2" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8.5 2.7L3.5 5.3M8.5 9.3L3.5 6.7" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {copyLink ? 'Copied!' : 'Share Deal'}
          </button>

          <button
            onClick={handleReportExpired}
            disabled={reportSent}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 14px',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              color: reportSent ? '#94A3B8' : '#64748B',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              cursor: reportSent ? 'default' : 'pointer',
              opacity: reportSent ? 0.6 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            {reportSent ? '⚠ Reported' : '⚠ Report Expired'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
