import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSelectCategory?: (category: string) => void;
  onOpenLookup: () => void;
  onOpenSubmit: () => void;
  onFocusSearch?: () => void;
  onOpenCardsModal?: () => void;
  onOpenToolsHub?: () => void;
  onOpenCommandPalette?: () => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
  savedCount?: number;
  feedStatus?: 'live' | 'loading' | 'offline';
}

const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

const CATEGORIES = [
  { id: 'all', label: 'All Deals', icon: '⚡' },
  { id: 'Electronics', label: 'Electronics & Audio', icon: '🎧' },
  { id: 'Fashion', label: 'Fashion & Apparel', icon: '👕' },
  { id: 'Home', label: 'Home & Kitchen', icon: '🍳' },
  { id: 'Grocery', label: 'Grocery & 10-Min', icon: '🥑' },
  { id: 'Beauty', label: 'Beauty & Grooming', icon: '✨' },
  { id: 'Sports', label: 'Fitness & Sports', icon: '🏋️' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onSelectCategory,
  onOpenLookup,
  onOpenSubmit,
  onFocusSearch,
  onOpenCardsModal,
  onOpenToolsHub,
  onOpenCommandPalette,
  isAudioEnabled = true,
  onToggleAudio,
  savedCount = 0,
  feedStatus = 'live',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoriesOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoriesOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    const rail = document.getElementById('deals-section');
    if (rail) {
      rail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full backdrop-blur-xl bg-white/95 border-b border-slate-200/80 transition-all">
      <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between gap-2.5 lg:gap-4">
        {/* ── Left: Mobile Toggle + Apple-Style Brand Logo ── */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <button
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              onTabChange('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="IndiaDealHunts Home"
            className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 text-left group min-w-0 md:w-[176px]"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex-shrink-0 group-hover:bg-blue-600 transition-colors shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[14px] sm:text-[16px] leading-[0.95] tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  INDIA DEAL<br />HUNTS
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                  LIVE
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono font-semibold tracking-[0.08em] text-slate-500 uppercase whitespace-nowrap">
                Verified price drops
              </span>
            </div>
          </button>
        </div>

        {/* ── Center: Clean Navigation Tabs ── */}
        <nav
          className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-0.5 h-full"
          aria-label="Primary navigation"
        >
          {[
            { id: 'home', label: 'Latest Deals' },
            { id: 'ending_soon', label: 'Top Discounts' },
            { id: 'best_worth', label: 'Worth Score' },
            { id: 'saved', label: savedCount ? `Saved (${savedCount})` : 'Saved Loot' },
            { id: 'wall_of_happiness', label: '💖 Wall of Happiness' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`relative px-2.5 lg:px-3 py-1.5 rounded-full text-[11px] lg:text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenLookup}
            aria-label="Price Lookup"
            title="Price Lookup"
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-[11px] lg:text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden 2xl:inline">Price Lookup</span>
          </button>


        </nav>

        {/* ── Right: public feed status, search, audio, submit, Telegram CTA ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`hidden xl:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-[10px] font-mono font-bold whitespace-nowrap ${
              feedStatus === 'live'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : feedStatus === 'loading'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title="Public storefront feed status"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${feedStatus === 'live' ? 'bg-emerald-500' : feedStatus === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
            {feedStatus === 'live' ? 'Public feed live' : feedStatus === 'loading' ? 'Loading feed' : 'Feed offline'}
          </span>

          {(onOpenCommandPalette || onFocusSearch) && (
            <button
              onClick={() => {
                if (onOpenCommandPalette) onOpenCommandPalette();
                else if (onFocusSearch) onFocusSearch();
              }}
              title="Search drops (⌘K / Ctrl+K / /)"
              aria-label="Search drops"
              className="flex items-center gap-2 h-8.5 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="hidden 2xl:inline text-slate-500 font-mono text-[11px]">Quick Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-500 shadow-2xs font-semibold">
                ⌘K
              </kbd>
            </button>
          )}

          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              title={isAudioEnabled ? 'Tactile sound active (click to mute)' : 'Sound muted (click to enable)'}
              aria-label="Toggle sound effects"
              className={`flex items-center justify-center w-8.5 h-8.5 rounded-full border text-xs transition-all cursor-pointer ${
                isAudioEnabled
                  ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{isAudioEnabled ? '🔊' : '🔇'}</span>
            </button>
          )}

          <button
            onClick={onOpenSubmit}
            className="hidden lg:inline-flex items-center gap-1.5 h-8.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all text-[11px] font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>+ Submit</span>
          </button>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Join 45,000+ Hunters on Telegram"
            className="inline-flex items-center gap-2 h-8.5 px-4 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z" />
            </svg>
            <span className="hidden sm:inline">Join Telegram</span>
            <span className="sm:hidden">Join</span>
          </a>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-slate-200 bg-white px-5 py-4 flex flex-col gap-3 shadow-xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { onTabChange('home'); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Latest Verified Deals
              </button>
              <button
                onClick={() => { onTabChange('ending_soon'); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'ending_soon' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Top Discounts
              </button>
              <button
                onClick={() => { onTabChange('best_worth'); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'best_worth' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Worth Score
              </button>
              <button
                onClick={() => { onTabChange('wall_of_happiness'); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'wall_of_happiness' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                💖 Wall of Happiness
              </button>
              <button
                onClick={() => { onOpenLookup(); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                🔍 Price History Lookup
              </button>

              {onToggleAudio && (
                <button
                  onClick={onToggleAudio}
                  className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>🔊 Sound Effects</span>
                  <span className="text-xs font-mono font-bold text-slate-500">{isAudioEnabled ? 'ON' : 'MUTED'}</span>
                </button>
              )}
              <button
                onClick={() => { onOpenSubmit(); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                ✍️ Submit a Deal
              </button>

              <div className="px-3 py-2 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200">
                Public storefront feed • admin tools stay private
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Quick Categories
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 text-left"
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
