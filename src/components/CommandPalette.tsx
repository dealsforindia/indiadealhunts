import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  deals: PublicDeal[];
  onSelectDeal: (deal: PublicDeal) => void;
  onSearchSubmit: (query: string) => void;
}

const TRENDING_KEYWORDS = [
  'TWS Earbuds under 999',
  'iPhone 16',
  'Smart TV 55',
  'Air Fryer',
  'Gaming Laptops',
  'Puma Sneakers',
  'Power Bank 20000mAh',
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  deals,
  onSelectDeal,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        if (filteredResults[selectedIndex]) {
          e.preventDefault();
          onSelectDeal(filteredResults[selectedIndex]);
          onClose();
        } else if (query.trim()) {
          e.preventDefault();
          onSearchSubmit(query.trim());
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return deals
      .filter((d) => {
        if (selectedStore !== 'all' && !d.store.toLowerCase().includes(selectedStore.toLowerCase())) {
          return false;
        }
        if (!q) return true;
        return (
          d.title.toLowerCase().includes(q) ||
          d.store.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [deals, query, selectedStore]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search deals, products, or stores (e.g. iPhone, Puma, Shoes)..."
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded shadow-2xs hidden sm:inline-block">
            ESC
          </span>
        </div>

        {/* Quick Store Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto text-xs">
          <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase mr-1">
            Store:
          </span>
          {['all', 'Amazon', 'Flipkart', 'Myntra'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStore(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedStore === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'All Stores' : s}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredResults.length > 0 ? (
            filteredResults.map((deal, idx) => {
              const isHighlighted = idx === selectedIndex;
              const imgUrl = getCleanImageUrl(deal.image);
              return (
                <div
                  key={deal.id}
                  onClick={() => {
                    onSelectDeal(deal);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={deal.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-base">🛍️</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                          {deal.store}
                        </span>
                        {deal.discount_pct && deal.discount_pct > 0 && (
                          <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {deal.discount_pct}% OFF
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {deal.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-extrabold text-slate-900">
                      ₹{deal.price ? Number(deal.price).toLocaleString('en-IN') : 'Deal'}
                    </span>
                    <span className="text-xs text-blue-600 font-bold hidden sm:inline">
                      View →
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              No matching deals found for "{query}".
            </div>
          )}
        </div>

        {/* Trending Searches Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase">
            Trending:
          </span>
          {TRENDING_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => {
                setQuery(kw);
                onSearchSubmit(kw);
                onClose();
              }}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-medium cursor-pointer transition-colors text-[11px]"
            >
              {kw}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
