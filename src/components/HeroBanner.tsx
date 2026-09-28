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
        background: 'radial-gradient(circle at 75% 45%, rgba(217, 119, 6, 0.12), transparent 32%), var(--bg)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '36px 20px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          alignItems: 'center',
        }}
        className="lg:grid-cols-[1.15fr_0.85fr]"
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
              VERIFIED · DEALS · REAL DISCOUNTS · NO SPAM
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
              <span style={{ color: '#F5F7FA', display: 'block' }}>Best Deals in India,</span>
              <span style={{ color: '#F59E0B', display: 'block' }}>All in One Place.</span>
            </div>

            {/* Mobile Headline (matches user mockup: "Best Deals \n in India.") */}
            <div className="sm:hidden" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.06 }}>
              <span style={{ color: '#F5F7FA', display: 'block' }}>Best Deals</span>
              <span style={{ color: '#F59E0B', display: 'block' }}>in India.</span>
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

          {/* ── Search Bar (52px height, with smooth focus micro-interaction) ── */}
          <motion.div
            animate={{
              borderColor: isFocused ? '#F59E0B' : '#303845',
              boxShadow: isFocused
                ? '0 0 0 3px rgba(245,158,11,.08)'
                : '0 0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '52px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              overflow: 'hidden',
              marginTop: '4px',
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
              placeholder='Search for products, e.g. "TWS under 999", "iPhone 16", "laptop deals"'
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
              whileTap={{ scale: 0.96 }}
              onClick={submitSearch}
              aria-label="Submit search"
              style={{
                width: '52px',
                height: '52px',
                backgroundColor: '#F59E0B',
                color: '#0B0D10',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFB126';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F59E0B';
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

        {/* ── Right Content: Visual Showcase (Desktop Artwork with Subtle 5s Float) ── */}
        <div
          className="hidden lg:flex"
          style={{
            position: 'relative',
            height: '290px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              width: '340px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
              filter: 'blur(36px)',
              pointerEvents: 'none',
            }}
          />

          {/* Laptop Mockup Box with subtle slow float */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'relative',
              width: '320px',
              height: '195px',
              backgroundColor: '#11141A',
              border: '2px solid #2E3846',
              borderRadius: '8px 8px 0 0',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
              transform: 'perspective(900px) rotateY(-8deg) rotateX(4deg)',
            }}
          >
            {/* Screen Wallpaper */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at 70% 30%, #F59E0B 0%, #D97706 35%, #451A03 70%, #0D0E11 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '130px',
                  height: '90px',
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, rgba(217, 119, 6, 0.2) 60%, transparent 100%)',
                  filter: 'blur(14px)',
                }}
              />
            </div>
            {/* Screen border reflection */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.25)',
              }}
            />
          </motion.div>

          {/* Floating Pill: Top Deals / Up to 70% Off */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '6px 12px',
              backgroundColor: '#161B22',
              border: '1px solid #F59E0B',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
              zIndex: 3,
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 800, color: '#F59E0B' }}>
              Top Deals
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9099A6' }}>
              Up to 70% Off →
            </span>
          </div>

          {/* Floating TWS Earbuds Showcase */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '40px',
              width: '135px',
              height: '145px',
              backgroundColor: '#161B22',
              border: '1px solid #28313D',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
              transform: 'translateY(10px)',
              zIndex: 4,
            }}
          >
            <img
              src="https://m.media-amazon.com/images/I/51HBom8xz7L._SL1500_.jpg"
              alt="boAt Airdopes"
              style={{
                width: '76px',
                height: '76px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
              }}
            />
            <span
              style={{
                marginTop: '6px',
                padding: '2px 8px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                color: '#F59E0B',
              }}
            >
              Up to 70% Off
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
