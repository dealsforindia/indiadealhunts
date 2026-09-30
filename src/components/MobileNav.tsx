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
      className="grid md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Bottom Navigation"
      style={{
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
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
        className={`flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${
          activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-800'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px] font-heading">
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
        className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-[10px] font-heading">
          Search
        </span>
      </button>

      {/* 3. Price Lookup */}
      <button
        type="button"
        onClick={onOpenLookup}
        aria-label="Price Lookup Tool"
        className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <span className="text-[10px] font-heading">
          Price Track
        </span>
      </button>

      {/* 4. Submit */}
      <button
        type="button"
        onClick={onOpenSubmit}
        aria-label="Submit a deal"
        className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-[10px] font-heading">
          Submit
        </span>
      </button>
    </nav>
  );
};
