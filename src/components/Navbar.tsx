import { Heart } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab } from '../types';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

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
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
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
    <header className="premium-navbar sticky top-0 z-50 h-16 w-full backdrop-blur-xl bg-white/95 dark:bg-[#0D1527]/95 border-b border-slate-200/80 dark:border-white/10 transition-all">
      <div className="max-w-[1480px] mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between gap-2.5 lg:gap-4">
        {/* ── Left: Mobile Toggle + Apple-Style Brand Logo ── */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <button
            className="flex xl:hidden items-center justify-center w-11 h-11 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-700 dark:text-slate-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="storefront-navigation"
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
            className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 text-left group min-w-0 xl:w-[176px]"
          >
            <BrandMark />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-[14px] sm:text-[16px] leading-[0.95] tracking-tight text-slate-900 dark:text-[#F1F5F9] group-hover:text-blue-600 transition-colors">
                  INDIA DEAL<br />HUNTS
                </span>

              </div>
              <span className="hidden sm:block text-[8px] sm:text-[9px] font-mono font-semibold tracking-[0.08em] text-slate-500 uppercase whitespace-nowrap">
                Find more. Spend wiser.
              </span>
            </div>
          </button>
        </div>

        {/* ── Center: Clean Navigation Tabs ── */}
        <nav
          className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-0.5 h-full"
          aria-label="Primary navigation"
        >
          {[
            { id: 'home', label: 'Latest Deals' },
            { id: 'ending_soon', label: 'Top Discounts' },
            { id: 'best_worth', label: 'Worth Score' },
            { id: 'saved', label: savedCount ? `Saved (${savedCount})` : 'Saved Loot' },
            { id: 'wall_of_happiness', label: 'Wall of Happiness' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`relative px-2.5 lg:px-3 min-h-11 py-2 rounded-full text-[11px] lg:text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                <span className="premium-nav-label">{tab.id === 'wall_of_happiness' && <Heart size={13} aria-hidden="true" />}{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenLookup}
            aria-label="Price Lookup"
            title="Price Lookup"
            className="flex items-center gap-1.5 px-2.5 lg:px-3 min-h-11 py-2 rounded-full text-[11px] lg:text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] hover:bg-slate-100 dark:bg-[#111C33] transition-all cursor-pointer whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden 2xl:inline">Price Lookup</span>
          </button>


        </nav>

        {/* ── Right: search, audio, submit, Telegram CTA ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(onOpenCommandPalette || onFocusSearch) && (
            <button
              onClick={() => {
                if (onOpenCommandPalette) onOpenCommandPalette();
                else if (onFocusSearch) onFocusSearch();
              }}
              title="Search drops (⌘K / Ctrl+K / /)"
              aria-label="Search drops"
              className="flex items-center gap-2 h-11 w-11 sm:w-auto px-0 sm:px-3.5 justify-center rounded-full bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] transition-all text-xs cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="hidden 2xl:inline text-slate-500 font-mono text-[11px]">Quick Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-500 shadow-2xs font-semibold">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Theme Mode Toggle (System / Light / Dark) */}
          <ThemeToggle className="flex items-center" />

          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              title={isAudioEnabled ? 'Tactile sound active (click to mute)' : 'Sound muted (click to enable)'}
              aria-label="Toggle sound effects"
              className={`hidden sm:flex items-center justify-center w-11 h-11 rounded-full border text-xs transition-all cursor-pointer ${
                isAudioEnabled
                  ? 'bg-slate-100 dark:bg-[#111C33] border-slate-200 dark:border-white/10 text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-200 dark:bg-[#172440]'
                  : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{isAudioEnabled ? '🔊' : '🔇'}</span>
            </button>
          )}

          <button
            onClick={onOpenSubmit}
            className="hidden lg:inline-flex items-center gap-1.5 h-11 px-3 rounded-full bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:text-[#F1F5F9] transition-all text-[11px] font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>+ Submit</span>
          </button>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Join IndiaDealHunts on Telegram"
            className="inline-flex items-center gap-2 h-11 min-w-11 px-3 sm:px-4 justify-center rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z" />
            </svg>
            <span className="hidden sm:inline">Join Telegram</span>
            <span className="sr-only sm:hidden">Join Telegram</span>
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
            id="storefront-navigation"
            className="xl:hidden border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] px-5 py-4 flex flex-col gap-3 shadow-xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { onTabChange('home'); setMobileMenuOpen(false); }}
                className={`text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'home' ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                Latest Verified Deals
              </button>
              <button
                onClick={() => { onTabChange('ending_soon'); setMobileMenuOpen(false); }}
                className={`text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'ending_soon' ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                Top Discounts
              </button>
              <button
                onClick={() => { onTabChange('best_worth'); setMobileMenuOpen(false); }}
                className={`text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'best_worth' ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                Worth Score
              </button>
              <button
                onClick={() => { onTabChange('saved'); setMobileMenuOpen(false); }}
                className={`text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold ${activeTab === 'saved' ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]'}`}
              >
                Saved Loot{savedCount ? ` (${savedCount})` : ''}
              </button>
              <button
                onClick={() => { onTabChange('wall_of_happiness'); setMobileMenuOpen(false); }}
                className={`text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'wall_of_happiness' ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]'
                }`}
              >
                💖 Wall of Happiness
              </button>
              <button
                onClick={() => { onOpenLookup(); setMobileMenuOpen(false); }}
                className="text-left px-3 min-h-11 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]"
              >
                🔍 Price History Lookup
              </button>

              {onToggleAudio && (
                <button
                  onClick={onToggleAudio}
                  className="text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33] flex items-center justify-between"
                >
                  <span>🔊 Sound Effects</span>
                  <span className="text-xs font-mono font-bold text-slate-500">{isAudioEnabled ? 'ON' : 'MUTED'}</span>
                </button>
              )}
              <button
                onClick={() => { onOpenSubmit(); setMobileMenuOpen(false); }}
                className="text-left px-3 min-h-11 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-[#111C33]"
              >
                ✍️ Submit a Deal
              </button>

              {/* Mobile Theme Mode */}
              <div className="pt-2 mt-1 border-t border-slate-200 dark:border-white/10">
                <ThemeToggle variant="expanded" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Quick Categories
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070A11] hover:bg-slate-100 dark:bg-[#111C33] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 text-left"
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
