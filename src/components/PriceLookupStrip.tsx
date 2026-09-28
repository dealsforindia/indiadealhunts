import React from 'react';

interface PriceLookupStripProps {
  onOpenLookup: () => void;
}

export const PriceLookupStrip: React.FC<PriceLookupStripProps> = ({ onOpenLookup }) => {
  return (
    <div
      style={{
        maxWidth: '1320px',
        margin: '36px auto 0',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Icon + Text description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', maxWidth: '720px' }}>
          {/* Circular Search Icon badge */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1.5px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 700,
                color: '#F5F7FA',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Can't find the right deal?
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: '#9099A6',
                margin: '4px 0 0',
                lineHeight: 1.4,
              }}
            >
              Use our Price Lookup tool to check the real price history and best time to buy.
            </p>
          </div>
        </div>

        {/* Right: Button action */}
        <button
          type="button"
          onClick={onOpenLookup}
          style={{
            height: '42px',
            padding: '0 22px',
            backgroundColor: '#F59E0B',
            color: '#0B0D10',
            borderRadius: '4px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFB126';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F59E0B';
          }}
        >
          Open Price Lookup →
        </button>
      </div>
    </div>
  );
};
