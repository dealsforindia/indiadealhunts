import React from 'react';
import { NavTab } from '../types';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenLookup: () => void;
  onOpenSubmit: () => void;
  onFocusSearch: () => void;
  savedCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenLookup,
  onOpenSubmit,
  onFocusSearch,
  savedCount = 0,
}) => {
  return (
    <nav
      className="grid md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Bottom Navigation"
      style={{
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        gridTemplateColumns: 'repeat(5, 1fr)',
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
        <svg width="19" height="19" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[9.5px] font-heading">
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
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-[9.5px] font-heading">
          Search
        </span>
      </button>

      {/* 3. Saved Loot */}
      <button
        type="button"
        onClick={() => onTabChange('saved')}
        aria-label="Saved Loot Bookmarks"
        className={`relative flex flex-col items-center justify-center gap-1 h-full cursor-pointer transition-colors ${
          activeTab === 'saved' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <svg width="19" height="19" viewBox="0 0 24 24" fill={activeTab === 'saved' ? '#D97706' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] font-mono font-bold flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </div>
        <span className="text-[9.5px] font-heading">
          Saved
        </span>
      </button>

      {/* 4. Price Lookup */}
      <button
        type="button"
        onClick={onOpenLookup}
        aria-label="Price Lookup Tool"
        className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <span className="text-[9.5px] font-heading">
          Price Track
        </span>
      </button>

      {/* 5. Submit */}
      <button
        type="button"
        onClick={onOpenSubmit}
        aria-label="Submit a deal"
        className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-[9.5px] font-heading">
          Submit
        </span>
      </button>
    </nav>
  );
};
