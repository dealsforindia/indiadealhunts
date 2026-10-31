import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Search, SlidersHorizontal, LayoutGrid, List, X, Tag } from 'lucide-react';
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
      const q = searchFilter.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.store?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [deals, discountThreshold, selectedStore, searchFilter]);

  const reduced = useReducedMotion();
  const stores = useMemo(() => [...new Set(deals.map(d => d.store?.trim()).filter((s): s is string => Boolean(s)))].sort(), [deals]);
  const tiers = [0, 50, 70, 80];
  const counts = tiers.map(t => deals.filter(d => (d.discount_pct || 0) >= t).length);
  const reset = () => { setDiscountThreshold(0); setSelectedStore('all'); setSearchFilter(''); };
  const filtered = discountThreshold > 0 || selectedStore !== 'all' || Boolean(searchFilter.trim());
  return <section className="discount-studio">
    <header className="discount-intro">
      <div className="discount-intro-copy"><span className="discount-eyebrow"><ArrowDownRight size={16} /> THE DISCOUNT EDIT</span>
        <h1>A little less.<br /><span>A lot to discover.</span></h1>
        <p>Explore offers by their listed reduction from MRP. Find your range, then check the price story.</p>
        <span className="discount-footnote">Listed discounts are not verified price drops.</span>
      </div>
      <div className="discount-lens" aria-label="Browse minimum listed discount">
        <div className="discount-lens-heading"><span>Your discount lens</span><SlidersHorizontal size={17} /></div>
        <div className="discount-bands">{tiers.map((tier, i) => <button type="button" key={tier} aria-pressed={discountThreshold === tier} onClick={() => setDiscountThreshold(tier)}>
          <span className="discount-band-top"><span>{tier ? 'AT LEAST' : 'THE FULL EDIT'}</span><ArrowUpRight size={16} /></span>
          <strong>{tier ? <>{tier}<small>%</small></> : 'All'}</strong>
          <span className="discount-band-track"><span style={{ width: `${counts[0] ? counts[i] / counts[0] * 100 : 0}%` }} /></span>
          <span className="discount-band-count">{loading && !deals.length ? 'Loading…' : `${counts[i]} offers`}</span>
        </button>)}</div>
        <p>Based on the offers currently loaded. Final prices may change.</p>
      </div>
    </header>
    <div className="discount-controls">
      <label className="discount-search"><Search size={18} /><span className="sr-only">Search discount offers</span><input type="search" placeholder="A brand, a product, a little inspiration…" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} /></label>
      <label className="discount-store"><span>Store</span><select aria-label="Filter by store" value={selectedStore} onChange={e => setSelectedStore(e.target.value)}><option value="all">All stores</option>{stores.map(store => <option key={store} value={store}>{store}</option>)}</select></label>
      <div className="discount-view" role="group" aria-label="Offer layout">{(['grid','list'] as const).map(mode => <button type="button" key={mode} aria-label={`${mode} view`} aria-pressed={viewMode === mode} onClick={() => onViewModeChange(mode)}>{mode === 'grid' ? <LayoutGrid size={18} /> : <List size={18} />}</button>)}</div>
    </div>
    <div className="discount-results-heading"><div><h2>{discountThreshold ? `${discountThreshold}% and beyond` : 'The latest edit'}</h2><span role="status" aria-live="polite">{sortedDeals.length} matching offers · highest listed discount first</span></div>{filtered && <button className="discount-reset" type="button" onClick={reset}><X size={14} />Clear filters</button>}</div>
    {loading && !sortedDeals.length ? <DealSkeletonGrid count={8} /> : sortedDeals.length ? <motion.div layout={!reduced} className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5' : 'commerce-deal-list flex flex-col gap-3'}>
      {sortedDeals.map((deal, idx) => <PublicDealCard key={deal.id} deal={deal} index={idx} onSelectDeal={onSelectDeal} onToggleSave={onToggleSaveDeal} isSaved={savedDealIds.includes(deal.id)} onToggleCompare={onToggleCompare} isComparing={compareDeals.some(d => d.id === deal.id)} onShowToast={onShowToast} />)}
    </motion.div> : <div className="discount-empty"><Tag size={32} /><h2>A different lens, perhaps?</h2><p>No offers match this combination. Try another store or widen your discount range.</p><button type="button" onClick={reset}>Explore all offers <ArrowUpRight size={16} /></button></div>}
    <p className="discount-evidence-note">A large MRP discount is a starting point. Inspect recorded price history where available, and confirm eligibility and the final price with the store.</p>
  </section>;
};
