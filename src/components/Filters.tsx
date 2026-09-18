import React from 'react';
import { SortOption } from '../types';
import { Store, Layers, ArrowUpDown, Smartphone, Shirt, Home, Utensils, Apple, Sparkles, Flame } from 'lucide-react';

interface FiltersProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals: number;
  onlyConsensus?: boolean;
  onToggleConsensus?: () => void;
}

const STORES = [
  { id: 'all', label: 'All Stores' },
  { id: 'Amazon', label: 'Amazon' },
  { id: 'Flipkart', label: 'Flipkart' },
  { id: 'Myntra', label: 'Myntra' },
  { id: 'AJIO', label: 'AJIO' },
  { id: 'Zepto', label: 'Zepto' },
  { id: 'Swiggy', label: 'Swiggy' },
  { id: 'Croma', label: 'Croma' },
  { id: 'Blinkit', label: 'Blinkit' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Home', label: 'Home & Living', icon: Home },
  { id: 'Kitchen', label: 'Kitchenware', icon: Utensils },
  { id: 'Grocery', label: 'Grocery', icon: Apple },
  { id: 'Beauty', label: 'Beauty', icon: Sparkles },
];

export const Filters: React.FC<FiltersProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalDeals,
  onlyConsensus = false,
  onToggleConsensus,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 space-y-3" role="region" aria-label="Deal Filters and Sorting">
      
      {/* Top Filter Bar: Store Pills + Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        
        {/* Store Pills */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none"
          role="group"
          aria-label="Filter by Store"
        >
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Store className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Stores:
          </span>
          {STORES.map((s) => {
            const isSelected = selectedStore.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => onSelectStore(s.id)}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none ${
                  isSelected
                    ? 'bg-white/10 text-white border-white/20 font-bold shadow-xs'
                    : 'bg-[#121522] text-slate-400 border-white/[0.06] hover:border-white/15 hover:text-white hover:bg-white/[0.04]'
                }`}
                aria-pressed={isSelected}
              >
                {s.label}
              </button>
            );
          })}
          {onToggleConsensus && (
            <button
              onClick={onToggleConsensus}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer select-none flex items-center gap-1.5 shrink-0 ${
                onlyConsensus
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#121522] text-slate-400 border-white/[0.06] hover:border-amber-500/30 hover:text-amber-300'
              }`}
              title="Filter deals confirmed by 2 or more independent Telegram channels"
              aria-pressed={onlyConsensus}
            >
              <Flame className={`w-3.5 h-3.5 ${onlyConsensus ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span>Consensus (2+ Channels)</span>
            </button>
          )}
        </div>

        {/* Right Sort Controls & Live Count Badge */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto shrink-0">
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{totalDeals} Drops</span>
          </span>

          <div className="flex items-center gap-1.5 bg-[#121522] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort deals"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="newest" className="bg-[#121522] text-white font-bold">
                ⚡ Newest Deals First (Just Dropped)
              </option>
              <option value="discount" className="bg-[#121522] text-white">
                🔥 Biggest Discounts (% Off)
              </option>
              <option value="worth" className="bg-[#121522] text-white">
                ⭐ Top Rated (Best Value)
              </option>
              <option value="price_low" className="bg-[#121522] text-white">
                🏷️ Cheapest Price First (Under ₹499)
              </option>
              <option value="price_high" className="bg-[#121522] text-white">
                💎 Highest Price First (Premium)
              </option>
            </select>
          </div>
        </div>

      </div>

      {/* Category Pills Bar */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1"
        role="group"
        aria-label="Filter by Category"
      >
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Categories:
        </span>
        {CATEGORIES.map((c) => {
          const isSelected = selectedCategory.toLowerCase() === c.id.toLowerCase();
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer select-none ${
                isSelected
                  ? 'bg-white/10 text-white border-white/20 font-bold shadow-xs'
                  : 'bg-[#121522] text-slate-400 border-white/[0.06] hover:border-white/15 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
