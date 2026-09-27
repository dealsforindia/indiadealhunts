import React, { useState, useEffect, useMemo } from 'react';
import { PublicDeal } from '../types';
import { parseNaturalQuery } from '../utils/semanticSearch';

const QUICK_TAGS = [
  'TWS Earbuds under 999',
  'Sneakers 70% off',
  'Smartwatches',
  'boAt Audio',
  'Backpacks',
  'Laptops',
] as const;

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickSearch: (q: string) => void;
  dealCount: number;
  spotlightDeal: PublicDeal | null;
  showcaseDeals?: PublicDeal[];
  onSelectDeal?: (deal: PublicDeal) => void;
  onOpenLookup?: (url?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onQuickSearch,
  dealCount,
  onOpenLookup,
}) => {
  const [inputVal, setInputVal] = useState(searchQuery);

  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  const liveParsed = useMemo(() => {
    if (!inputVal.trim()) return null;
    return parseNaturalQuery(inputVal);
  }, [inputVal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (
      (val.startsWith('http://') || val.startsWith('https://') ||
       val.includes('amzn.') || val.includes('flipkart.') || val.includes('myntra.')) &&
      onOpenLookup
    ) {
      onOpenLookup(val);
      return;
    }
    onSearchChange(inputVal);
  };

  const handleClear = () => {
    setInputVal('');
    onSearchChange('');
  };

  return (
    <section
      style={{
        borderBottom: '1px solid #262626',
        backgroundColor: '#0A0A0A',
        padding: '32px 16px 24px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>


        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(22px, 4vw, 32px)',
          fontWeight: 700,
          color: '#F5F5F5',
          lineHeight: 1.2,
          letterSpacing: '-0.025em',
          marginBottom: '8px',
        }}>
          Verified Deals &amp; Price Drops
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6B6B6B',
          lineHeight: 1.6,
          marginBottom: '20px',
          maxWidth: '480px',
        }}>
          Real-time price intelligence across Amazon, Flipkart, Myntra and 27 Indian retail channels.
          Verified with genuine merchant data.
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} role="search" style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            border: '1px solid #262626',
            borderRadius: '4px',
            backgroundColor: '#111111',
            overflow: 'hidden',
          }}>
            {/* Search icon — inline SVG, no Lucide */}
            <span style={{ padding: '0 12px', color: '#6B6B6B', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Search deals or paste a product link..."
              aria-label="Search deals or paste product URL"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '11px 0',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                color: '#F5F5F5',
                minWidth: 0,
              }}
            />
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                style={{
                  padding: '0 10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B6B6B',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: '0 18px',
                height: '44px',
                backgroundColor: '#D47A10',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: '#0A0A0A',
                letterSpacing: '-0.01em',
                flexShrink: 0,
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B86A0C'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D47A10'; }}
            >
              Search
            </button>
          </div>
        </form>

        {/* AI parse preview */}
        {liveParsed && liveParsed.activeBadges.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            backgroundColor: '#111111',
            border: '1px solid #262626',
            borderRadius: '4px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '11px', color: '#6B6B6B', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              Filters:
            </span>
            {liveParsed.activeBadges.map((badge, idx) => (
              <span
                key={idx}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#1A1200',
                  border: '1px solid #2E2000',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#F59E0B',
                }}
              >
                {badge}
              </span>
            ))}
            {liveParsed.cleanQuery && (
              <span style={{ fontSize: '11px', color: '#6B6B6B', fontFamily: 'var(--font-mono)' }}>
                &ldquo;{liveParsed.cleanQuery}&rdquo;
              </span>
            )}
          </div>
        )}

        {/* Quick tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#6B6B6B', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            Popular:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setInputVal(tag);
                onQuickSearch(tag);
              }}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: '#A3A3A3',
                backgroundColor: 'transparent',
                border: '1px solid #262626',
                borderRadius: '2px',
                cursor: 'pointer',
                lineHeight: '18px',
                transition: 'color 120ms ease, border-color 120ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#A3A3A3';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
              }}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
