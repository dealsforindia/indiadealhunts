import React from 'react';
import { NavTab } from '../types';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenLookup: () => void;
  onOpenSubmit: () => void;
  onFocusSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenLookup,
  onOpenSubmit,
  onFocusSearch,
}) => {
  return (
    <nav
      className="grid md:hidden"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#0D0E11',
        borderTop: '1px solid #23262F',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        zIndex: 45,
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => {
          onTabChange('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Home deals feed"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          height: '56px',
          color: activeTab === 'home' ? '#F59E0B' : '#9099A6',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Home
        </span>
      </button>

      {/* 2. Search */}
      <button
        type="button"
        onClick={() => {
          onFocusSearch();
          const searchEl = document.getElementById('hero-search-input');
          if (searchEl) {
            searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => searchEl.focus(), 300);
          }
        }}
        aria-label="Search deals"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          height: '56px',
          color: '#9099A6',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Search
        </span>
      </button>

      {/* 3. Price Lookup */}
      <button
        type="button"
        onClick={onOpenLookup}
        aria-label="Price Lookup Tool"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          height: '56px',
          color: '#9099A6',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Price Lookup
        </span>
      </button>

      {/* 4. Submit */}
      <button
        type="button"
        onClick={onOpenSubmit}
        aria-label="Submit a deal"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          height: '56px',
          color: '#9099A6',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Submit
        </span>
      </button>
    </nav>
  );
};
