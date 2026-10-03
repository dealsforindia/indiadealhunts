import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SortOption } from '../types';

interface DealToolbarProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const STORES = [
  { id: 'all', label: 'All Stores' },
  { id: 'Amazon', label: 'Amazon' },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra', label: 'Myntra' },
  { id: 'AJIO', label: 'AJIO' },
  { id: 'DesiDime', label: 'DesiDime' },
  { id: 'Zepto', label: 'Zepto' },
  { id: 'Swiggy', label: 'Swiggy' },
  { id: 'Blinkit', label: 'Blinkit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Mobiles', label: '📱 Mobiles & 5G' },
  { id: 'Electronics', label: '🔌 Electronics' },
  { id: 'Laptops', label: '💻 Laptops' },
  { id: 'Fashion', label: '👗 Fashion' },
  { id: 'Home', label: '🏠 Home' },
  { id: 'Grocery', label: '🍎 Grocery' },
  { id: 'Beauty', label: '💄 Beauty' },
  { id: 'Sports', label: '🏋️ Sports' },
  { id: 'Automotive', label: '🚗 Automotive' },
  { id: 'Travel', label: '✈️ Travel' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '⏰ Sort: Latest Drops' },
  { value: 'discount', label: '🔥 Sort: Highest % Off' },
  { value: 'worth', label: '🏆 Sort: Top Value Score' },
  { value: 'price_low', label: '🏷️ Sort: Price: Low to High' },
  { value: 'price_high', label: '💎 Sort: Price: High to Low' },
];

export const DealToolbar: React.FC<DealToolbarProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalDeals = 1248,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const [storeOpen, setStoreOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [draftStore, setDraftStore] = useState(selectedStore);
  const [draftCat, setDraftCat] = useState(selectedCategory);
  const [draftSort, setDraftSort] = useState(sortBy);

  const storeRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(e.target as Node)) {
        setStoreOpen(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMobileDrawer = () => {
    setDraftStore(selectedStore);
    setDraftCat(selectedCategory);
    setDraftSort(sortBy);
    setMobileDrawerOpen(true);
  };

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const applyMobileDrawer = () => {
    onSelectStore(draftStore);
    onSelectCategory(draftCat);
    onSortChange(draftSort);
    setMobileDrawerOpen(false);
  };

  const desktopStoreLabel = STORES.find((s) => s.id === selectedStore)?.label || 'All Stores';
  const desktopCatLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All Categories';
  const desktopSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Sort: Latest';

  return (
    <>
      <div className="deal-toolbar max-w-[1340px] mx-auto px-4 md:px-6 pt-5 pb-3 flex items-center justify-between gap-3 w-full">
        {/* ── Desktop: Left Filter Popovers ── */}
        <div className="hidden md:flex items-center gap-2.5 flex-wrap">
          {/* Store Dropdown */}
          <div ref={storeRef} className="relative">
            <button
              type="button"
              onClick={() => { setStoreOpen(!storeOpen); setCatOpen(false); setSortOpen(false); }}
              aria-expanded={storeOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                selectedStore !== 'all'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopStoreLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${storeOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {storeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {STORES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { onSelectStore(s.id); setStoreOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        selectedStore === s.id
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                      }`}
                    >
                      <span>{s.label}</span>
                      {selectedStore === s.id && <span className="text-[#0066cc]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Dropdown */}
          <div ref={catRef} className="relative">
            <button
              type="button"
              onClick={() => { setCatOpen(!catOpen); setStoreOpen(false); setSortOpen(false); }}
              aria-expanded={catOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                selectedCategory !== 'all'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopCatLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${catOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { onSelectCategory(c.id); setCatOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        selectedCategory === c.id
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                      }`}
                    >
                      <span>{c.label}</span>
                      {selectedCategory === c.id && <span className="text-[#0066cc]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => { setSortOpen(!sortOpen); setStoreOpen(false); setCatOpen(false); }}
              aria-expanded={sortOpen}
              className={`h-8.5 px-4 rounded-full text-[12.5px] font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                sortBy !== 'newest'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-[#0D1527] hover:bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:border-white/20 shadow-2xs'
              }`}
            >
              <span>{desktopSortLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 shadow-xl z-50"
                >
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { onSortChange(o.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
                        sortBy === o.value
                          ? 'bg-[#0066cc]/10 text-[#0066cc] font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070A11]'
                      }`}
                    >
                      <span>{o.label}</span>
                      {sortBy === o.value && <span className="text-[#0066cc]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Mobile: Filter & Sort Button ── */}
        <div className="flex md:hidden items-center justify-between w-full">
          <button
            type="button"
            onClick={openMobileDrawer}
            className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            <span>Filter & Sort</span>
            <span className="text-slate-400">›</span>
          </button>

          <span className="font-mono text-xs text-slate-500 font-semibold">
            {totalDeals.toLocaleString('en-IN')} drops
          </span>
        </div>

        {/* ── Desktop Right: Deals Count & View Grid/List Toggles ── */}
        <div className="hidden md:flex items-center gap-3.5 ml-auto">
          <span className="font-mono text-xs font-semibold text-slate-500">
            {totalDeals.toLocaleString('en-IN')} live drops
          </span>

          {onViewModeChange && (
            <div className="flex items-center bg-slate-100 dark:bg-[#111C33] rounded-xl p-0.5 gap-0.5 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                title="Grid view"
                aria-label="Grid view"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                title="List view"
                aria-label="List view"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white dark:bg-[#0D1527] text-slate-900 dark:text-[#F1F5F9] shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9]'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="3" y1="5" x2="13" y2="5" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                  <line x1="3" y1="11" x2="13" y2="11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileDrawerOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative bg-white dark:bg-[#0D1527] border-t border-slate-200 dark:border-white/10 rounded-t-3xl max-h-[85vh] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-4 z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-[#F1F5F9]">
                  Filter & Sort Drops
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close filters"
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#111C33] text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9] flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Stores */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-2">
                  Store
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STORES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDraftStore(s.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                        draftStore === s.id
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                          : 'bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 font-bold mb-2">
                  Sort Order
                </label>
                <div className="flex flex-col gap-1.5">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setDraftSort(o.value)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                        draftSort === o.value
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                          : 'bg-slate-50 dark:bg-[#070A11] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <span>{o.label}</span>
                      {draftSort === o.value && <span className="text-blue-600">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={applyMobileDrawer}
                className="mt-2 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wide shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Apply Filters ({totalDeals.toLocaleString('en-IN')} drops)
              </button>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
};
