import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { PublicDealCard } from './PublicDealCard';
import { DealSkeletonGrid } from './DealSkeleton';

interface TopDiscountsPageProps {
  deals: PublicDeal[];
  loading: boolean;
  onSelectDeal: (deal: PublicDeal) => void;
  onToggleSaveDeal: (deal: PublicDeal) => void;
  savedDealIds: string[];
  onToggleCompare: (deal: PublicDeal) => void;
  compareDeals: PublicDeal[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onShowToast?: (msg: string) => void;
}

const STORES = ['all', 'amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zepto'];

export const TopDiscountsPage: React.FC<TopDiscountsPageProps> = ({
  deals,
  loading,
  onSelectDeal,
  onToggleSaveDeal,
  savedDealIds,
  onToggleCompare,
  compareDeals,
  viewMode,
  onViewModeChange,
  onShowToast,
}) => {
  const [discountThreshold, setDiscountThreshold] = useState<number>(0); // 0 = all, 80, 70, 50
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const sortedDeals = useMemo(() => {
    let list = [...deals].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));

    if (discountThreshold > 0) {
      list = list.filter((d) => (d.discount_pct || 0) >= discountThreshold);
    }

    if (selectedStore !== 'all') {
      list = list.filter((d) => d.store?.toLowerCase().includes(selectedStore.toLowerCase()));
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.store?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [deals, discountThreshold, selectedStore, searchFilter]);

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      {/* ── Page Header (Mobbin / Apple Inspired) ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>STEEPEST PRICE DROPS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Top Discounts & Flash Loots
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Verified drops ranked by discount depth. Every single deal has been validated against real historical price baselines.
        </p>
      </div>

      {/* ── Filters & Controls Toolbar ── */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Discount Threshold Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Min Discount:
          </span>
          {[
            { label: 'All Discounts', value: 0 },
            { label: '🔥 80%+ OFF', value: 80 },
            { label: '⚡ 70%+ OFF', value: 70 },
            { label: '🏷️ 50%+ OFF', value: 50 },
          ].map((tier) => (
            <button
              key={tier.value}
              onClick={() => setDiscountThreshold(tier.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                discountThreshold === tier.value
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Right: Search + Store Filter + View Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Filter discounts..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white w-full sm:w-44 transition-all"
          />

          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 capitalize cursor-pointer"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Stores' : s}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{sortedDeals.length}</strong> verified drops
          {discountThreshold > 0 && <span> with &ge;{discountThreshold}% off</span>}
        </span>
        <span className="text-[11px] font-mono text-emerald-600 font-semibold">
          ⚡ 24/7 Live Feed
        </span>
      </div>

      {/* ── Deal Grid ── */}
      {loading && sortedDeals.length === 0 ? (
        <DealSkeletonGrid count={8} />
      ) : sortedDeals.length > 0 ? (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'
              : 'flex flex-col gap-3'
          }
        >
          {sortedDeals.map((deal, idx) => (
            <PublicDealCard
              key={deal.id}
              deal={deal}
              index={idx}
              onSelectDeal={onSelectDeal}
              onToggleSave={onToggleSaveDeal}
              isSaved={savedDealIds.includes(deal.id)}
              onToggleCompare={onToggleCompare}
              isComparing={compareDeals.some((d) => d.id === deal.id)}
              onShowToast={onShowToast}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
          <div className="text-4xl mb-3">🏷️</div>
          <h3 className="text-base font-bold text-slate-800">No deals match this discount filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try lowering the minimum discount threshold or selecting All Stores.</p>
          <button
            onClick={() => {
              setDiscountThreshold(0);
              setSelectedStore('all');
              setSearchFilter('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
