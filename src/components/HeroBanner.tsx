import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface HeroBannerProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onOpenLookup?: (url?: string) => void;
}

const POPULAR_SEARCHES = [
  'TWS under 999',
  'iPhone 16',
  'Laptop deals',
  'Smart TV',
  "Men's shoes",
  'Kitchen appliances',
];

const MOBILE_SEARCHES = [
  'TWS 999',
  'iPhone',
  'Laptops',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearch,
  onOpenLookup,
}) => {
  const [input, setInput] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external search query changes to internal input
  useEffect(() => {
    setInput(searchQuery);
  }, [searchQuery]);

  // Submit search without per-keystroke API spam
  const submitSearch = () => {
    const trimmed = input.trim();
    if (
      (trimmed.startsWith('http://') || trimmed.startsWith('https://') ||
       trimmed.includes('amzn.') || trimmed.includes('flipkart.') || trimmed.includes('myntra.')) &&
      onOpenLookup
    ) {
      onOpenLookup(trimmed);
      return;
    }
    onSearch(trimmed);
  };

  const handleChipClick = (query: string) => {
    setInput(query);
    onSearch(query);
  };

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div
        className="px-3 md:px-5 w-full lg:grid-cols-[1.15fr_0.85fr]"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '64px', /* More breathing room for 2026 layouts */
          paddingBottom: '64px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        {/* ── Left Content: Eyebrow, Headline, Subheadline, Search, Popular Pills ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
          {/* Eyebrow Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#D97706',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span className="hidden sm:inline">VERIFIED · DEALS · REAL DISCOUNTS · NO SPAM</span>
              <span className="sm:hidden">VERIFIED DEALS · NO SPAM</span>
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              margin: 0,
            }}
          >
            {/* Desktop Headline */}
            <div className="hidden sm:block" style={{ fontSize: 'clamp(36px, 4vw, 54px)', fontWeight: 800 }}>
              <span style={{ color: '#F8FAFC', display: 'block' }}>Best Deals in India,</span>
              <span className="gradient-text" style={{ display: 'block' }}>All in One Place.</span>
            </div>

            {/* Mobile Headline */}
            <div className="sm:hidden" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.06 }}>
              <span style={{ color: '#F8FAFC', display: 'block' }}>Best Deals</span>
              <span className="gradient-text" style={{ display: 'block' }}>in India.</span>
            </div>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: '#9099A6',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '520px',
            }}
          >
            Handpicked deals, price drops and offers from Amazon, Flipkart and top stores. Save time. Save money.
          </p>

          {/* ── Search Bar (52px height) ── */}
          <motion.div
            animate={{
              borderColor: isFocused ? 'var(--text-primary)' : 'var(--border-strong)',
            }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '52px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              overflow: 'hidden',
              marginTop: '4px',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {/* Search Icon with subtle 2px shift on focus */}
            <motion.span
              animate={{ x: isFocused ? 2 : 0, color: isFocused ? '#F59E0B' : '#687482' }}
              transition={{ duration: 0.15 }}
              style={{
                paddingLeft: '16px',
                paddingRight: '10px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </motion.span>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch();
              }}
              placeholder="Search products or paste URL..."
              aria-label="Search deals or paste product URL"
              id="hero-search-input"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                color: '#F5F7FA',
                minWidth: 0,
              }}
            />

            {/* Clear button if input has text */}
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  onSearch('');
                }}
                aria-label="Clear search"
                style={{
                  padding: '0 8px',
                  color: '#687482',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            {/* Amber Search Submit Button (52px width) */}
            <motion.button
              type="button"
              className="btn-primary"
              whileTap={{ scale: 0.96 }}
              onClick={submitSearch}
              aria-label="Submit search"
              style={{
                width: '52px',
                height: '52px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                borderRadius: '0 6px 6px 0',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </motion.div>

          {/* ── Popular Search Pills (Desktop) ── */}
          <div className="hidden sm:flex" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleChipClick(term)}
                style={{
                  padding: '5px 11px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--muted)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 120ms ease, border-color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Mobile pills (3 compact pills) */}
          <div className="flex sm:hidden" style={{ flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
            {MOBILE_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleChipClick(term)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--muted)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Content: One Restrained Featured Visual (No 3D tilt, no infinite float) ── */}
        <div
          className="hidden lg:flex"
          style={{
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
              filter: 'blur(32px)',
              pointerEvents: 'none',
            }}
          />

          {/* Framed Featured Deal Spotlight Card */}
          <motion.div
            className="pro-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '320px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
          >
            {/* Spotlight Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#F59E0B' }}>⚡</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#F59E0B',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Featured Spotlight
                </span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#22C55E',
                }}
              >
                <span>✓</span> Verified Drop
              </span>
            </div>

            {/* Product Image Stage (4:3) */}
            <div
              style={{
                position: 'relative',
                height: '145px',
                backgroundColor: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
              }}
            >
              <img
                src="https://m.media-amazon.com/images/I/51HBom8xz7L._SL1500_.jpg"
                alt="boAt Airdopes 141 Pro"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#3A1714',
                  color: '#FF6B5F',
                  letterSpacing: '0.02em',
                }}
              >
                -64%
              </span>
            </div>

            {/* Product Details */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#F59E0B',
                    textTransform: 'uppercase',
                  }}
                >
                  Amazon India
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#687482',
                  }}
                >
                  1h ago
                </span>
              </div>

              <div
                className="pro-title"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                boAt Airdopes 141 Pro TWS Earbuds
              </div>

              {/* Price & Savings */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span
                  className="pro-price"
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#F4F4F7',
                    lineHeight: 1,
                  }}
                >
                  ₹899
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#687482',
                    textDecoration: 'line-through',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  ₹2,499
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    color: '#22C55E',
                    marginLeft: 'auto',
                  }}
                >
                  Save ₹1,600
                </span>
              </div>

              {/* Action Button */}
              <a
                href="https://www.amazon.in/dp/B09N3ZNHTY"
                target="_blank"
                rel="noopener noreferrer"
                className="glow-pill-amber"
                style={{
                  height: '34px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  marginTop: '4px',
                }}
              >
                <span>Get Deal</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
