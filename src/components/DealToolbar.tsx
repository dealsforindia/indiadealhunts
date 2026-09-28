import React, { useState, useRef, useEffect } from 'react';
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
  { id: 'Electronics', label: 'Electronics' },
  { id: 'Fashion', label: 'Fashion' },
  { id: 'Home', label: 'Home' },
  { id: 'Grocery', label: 'Grocery' },
  { id: 'Beauty', label: 'Beauty' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Automotive', label: 'Automotive' },
  { id: 'Travel', label: 'Travel' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Sort: Latest' },
  { value: 'discount', label: 'Sort: Highest Discount' },
  { value: 'worth', label: 'Sort: Top Value' },
  { value: 'price_low', label: 'Sort: Price: Low to High' },
  { value: 'price_high', label: 'Sort: Price: High to Low' },
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

  // Temporary drawer state for mobile apply
  const [draftStore, setDraftStore] = useState(selectedStore);
  const [draftCat, setDraftCat] = useState(selectedCategory);
  const [draftSort, setDraftSort] = useState(sortBy);

  const storeRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close desktop popovers on click outside
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
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '16px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* ── Desktop: Left Filter Popovers ── */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Store Dropdown */}
          <div ref={storeRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { setStoreOpen(!storeOpen); setCatOpen(false); setSortOpen(false); }}
              aria-expanded={storeOpen}
              style={{
                height: '36px',
                padding: '0 12px',
                backgroundColor: 'var(--surface)',
                border: `1px solid ${selectedStore !== 'all' ? '#F59E0B' : 'var(--border)'}`,
                borderRadius: '4px',
                color: selectedStore !== 'all' ? '#F59E0B' : '#F5F7FA',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color 120ms ease',
              }}
            >
              <span>{desktopStoreLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {storeOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '160px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  zIndex: 60,
                }}
              >
                {STORES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { onSelectStore(s.id); setStoreOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      color: selectedStore === s.id ? '#F59E0B' : '#F5F7FA',
                      backgroundColor: selectedStore === s.id ? 'var(--surface-2)' : 'transparent',
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {s.label}
                    {selectedStore === s.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div ref={catRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { setCatOpen(!catOpen); setStoreOpen(false); setSortOpen(false); }}
              aria-expanded={catOpen}
              style={{
                height: '36px',
                padding: '0 12px',
                backgroundColor: 'var(--surface)',
                border: `1px solid ${selectedCategory !== 'all' ? '#F59E0B' : 'var(--border)'}`,
                borderRadius: '4px',
                color: selectedCategory !== 'all' ? '#F59E0B' : '#F5F7FA',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color 120ms ease',
              }}
            >
              <span>{desktopCatLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {catOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '170px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  zIndex: 60,
                }}
              >
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectCategory(c.id); setCatOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      color: selectedCategory === c.id ? '#F59E0B' : '#F5F7FA',
                      backgroundColor: selectedCategory === c.id ? 'var(--surface-2)' : 'transparent',
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {c.label}
                    {selectedCategory === c.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => { setSortOpen(!sortOpen); setStoreOpen(false); setCatOpen(false); }}
              aria-expanded={sortOpen}
              style={{
                height: '36px',
                padding: '0 12px',
                backgroundColor: 'var(--surface)',
                border: `1px solid ${sortBy !== 'newest' ? '#F59E0B' : 'var(--border)'}`,
                borderRadius: '4px',
                color: sortBy !== 'newest' ? '#F59E0B' : '#F5F7FA',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color 120ms ease',
              }}
            >
              <span>{desktopSortLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {sortOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '180px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  zIndex: 60,
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { onSortChange(o.value); setSortOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      color: sortBy === o.value ? '#F59E0B' : '#F5F7FA',
                      backgroundColor: sortBy === o.value ? 'var(--surface-2)' : 'transparent',
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {o.label}
                    {sortBy === o.value && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile: Full-width Filter & Sort Button ── */}
        <div className="flex sm:hidden" style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={openMobileDrawer}
            style={{
              height: '40px',
              padding: '0 16px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: '#F5F7FA',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filter &amp; Sort</span>
            <span style={{ color: '#9099A6' }}>›</span>
          </motion.button>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#9099A6',
            }}
          >
            {totalDeals.toLocaleString('en-IN')} deals
          </span>
        </div>

        {/* ── Desktop Right: Count & View Toggles ── */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: '#9099A6',
              whiteSpace: 'nowrap',
            }}
          >
            {totalDeals.toLocaleString('en-IN')} deals
          </span>

          {onViewModeChange && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                title="Grid view"
                aria-label="Grid view"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'grid' ? '#F59E0B' : 'transparent',
                  color: viewMode === 'grid' ? '#090A0C' : '#9099A6',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 100ms ease, color 100ms ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                title="Compact list view"
                aria-label="List view"
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  backgroundColor: viewMode === 'list' ? '#F59E0B' : 'transparent',
                  color: viewMode === 'list' ? '#090A0C' : '#9099A6',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 100ms ease, color 100ms ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <line x1="3" y1="5" x2="13" y2="5" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                  <line x1="3" y1="11" x2="13" y2="11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter & Sort Drawer (Bottom Sheet) ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'relative',
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderRadius: '16px 16px 0 0',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                zIndex: 95,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#F5F7FA', fontFamily: 'var(--font-heading)' }}>
                    Filter &amp; Sort
                  </h3>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#9099A6' }}>
                    ({totalDeals.toLocaleString('en-IN')} deals)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9099A6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Stores Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#9099A6', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Store
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {STORES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDraftStore(s.id)}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontSize: '13px',
                        borderRadius: '4px',
                        border: `1px solid ${draftStore === s.id ? '#F59E0B' : 'var(--border)'}`,
                        backgroundColor: draftStore === s.id ? 'var(--surface-2)' : 'transparent',
                        color: draftStore === s.id ? '#F59E0B' : '#F5F7FA',
                        fontFamily: 'var(--font-body)',
                        fontWeight: draftStore === s.id ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#9099A6', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Sort Order
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setDraftSort(o.value)}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontSize: '13px',
                        borderRadius: '4px',
                        border: `1px solid ${draftSort === o.value ? '#F59E0B' : 'var(--border)'}`,
                        backgroundColor: draftSort === o.value ? 'var(--surface-2)' : 'transparent',
                        color: draftSort === o.value ? '#F59E0B' : '#F5F7FA',
                        fontFamily: 'var(--font-body)',
                        fontWeight: draftSort === o.value ? 700 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{o.label}</span>
                      {draftSort === o.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={applyMobileDrawer}
                style={{
                  height: '44px',
                  backgroundColor: '#F59E0B',
                  color: '#090A0C',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Apply Filters ({totalDeals.toLocaleString('en-IN')} deals)
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
