import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PublicDeal } from '../types';
import { PublicDealCard } from './PublicDealCard';
import { DealSkeletonGrid } from './DealSkeleton';

interface WorthScorePageProps {
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

export const WorthScorePage: React.FC<WorthScorePageProps> = ({
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
  const [minScore, setMinScore] = useState<number>(0); // 0 = all, 90, 80, 70
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const sortedDeals = useMemo(() => {
    let list = [...deals].sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));

    if (minScore > 0) {
      list = list.filter((d) => (d.worth_score || 0) >= minScore);
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
  }, [deals, minScore, selectedStore, searchFilter]);

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 md:px-6 pt-6 pb-28 md:pb-12">
      {/* ── Page Header (Mobbin / Apple Inspired) ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border-subtle)]/80 text-[var(--idh-accent)] text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-[var(--idh-action-solid)]" />
          <span>ALGORITHMIC VALUE LEADERBOARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] dark:text-[var(--text-primary)] tracking-tight">
          Highest Worth Score Deals
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] dark:text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Offers ranked by a 0–100 heuristic using the supplied discount, price and store fields. This score is a browsing aid; it does not verify seller credibility, authenticity or a historical low.
        </p>
      </div>

      {/* ── Filters & Controls Toolbar ── */}
      <div className="bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur-md rounded-2xl border border-[var(--border-subtle)]/90 dark:border-white/10 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Worth Score Tier Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1">
            Worth Tier:
          </span>
          {[
            { label: 'All Scores', value: 0 },
            { label: '💎 Score 90+ (God Tier)', value: 90 },
            { label: '🔥 Score 80+ (Great Value)', value: 80 },
            { label: '⚡ Score 70+ (Solid Buy)', value: 70 },
          ].map((tier) => (
            <button
              key={tier.value}
              onClick={() => setMinScore(tier.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                minScore === tier.value
                  ? 'bg-[var(--idh-action-solid)] text-white shadow-xs'
                  : 'bg-[var(--surface-2)] dark:bg-[var(--surface-2)] text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)]/70 dark:bg-[var(--surface-2)]/70 hover:text-[var(--text-primary)] dark:text-[var(--text-primary)]'
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
            placeholder="Search deals..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] dark:bg-[var(--bg)] border border-[var(--border-subtle)] dark:border-white/10 text-xs font-medium text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-subtle)] focus:bg-white dark:bg-[var(--surface)] w-full sm:w-44 transition-all"
          />

          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-[var(--surface)] dark:bg-[var(--bg)] border border-[var(--border-subtle)] dark:border-white/10 text-xs font-semibold text-[var(--text-primary)] dark:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-subtle)] capitalize cursor-pointer"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Stores' : s}
              </option>
            ))}
          </select>

          <div className="hidden sm:flex items-center rounded-full bg-[var(--surface-2)] dark:bg-[var(--surface-2)] p-0.5 border border-[var(--border-subtle)] dark:border-white/10">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-[var(--surface)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-primary)]'
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
                viewMode === 'list' ? 'bg-white dark:bg-[var(--surface)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-primary)]'
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
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-4 px-1">
        <span>
          Showing <strong className="text-[var(--text-primary)] dark:text-[var(--text-primary)] font-semibold">{sortedDeals.length}</strong> top-rated deals
          {minScore > 0 && <span> with Worth Score &ge;{minScore}</span>}
        </span>
        <span className="text-[11px] font-mono text-[var(--idh-accent)] font-semibold">
          💎 Mathematical ROI Ranking
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
              ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5'
              : 'commerce-deal-list flex flex-col gap-3'
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
        <div className="text-center py-16 px-4 bg-white dark:bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] dark:border-white/10">
          <div className="text-4xl mb-3">💎</div>
          <h3 className="text-base font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">No deals match this score tier</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Try selecting All Scores or a different store filter.</p>
          <button
            onClick={() => {
              setMinScore(0);
              setSelectedStore('all');
              setSearchFilter('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-[var(--idh-action-solid)] text-white text-xs font-semibold hover:bg-[var(--idh-action-solid)] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
