import React, { useState, useMemo } from 'react';
import type { PublicDeal, MegaHaulItem } from '../types';
import { MapPin, ShoppingBag, ExternalLink, Zap, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface MegaHaulCardProps {
  deal: PublicDeal;
}

export const MegaHaulCard: React.FC<MegaHaulCardProps> = ({ deal }) => {
  const items: MegaHaulItem[] = deal.items || [];
  const [selectedPincode, setSelectedPincode] = useState<string>('all');
  const [pincodeQuery, setPincodeQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Group items by pincode/city
  const pincodeOptions = useMemo(() => {
    const map = new Map<string, { pincode: string; city: string; count: number }>();
    items.forEach((item) => {
      const pin = item.pincode || 'general';
      const city = item.city || 'General / All';
      if (!map.has(pin)) {
        map.set(pin, { pincode: pin, city, count: 0 });
      }
      map.get(pin)!.count += 1;
    });
    return Array.from(map.values());
  }, [items]);

  // Filter items based on selected pincode or search input
  const filteredItems = useMemo(() => {
    let list = items;
    if (pincodeQuery.trim().length === 6) {
      const queryMatch = list.filter((it) => it.pincode === pincodeQuery.trim());
      if (queryMatch.length > 0) return queryMatch;
    }
    if (selectedPincode !== 'all') {
      list = list.filter((it) => (it.pincode || 'general') === selectedPincode);
    }
    return list;
  }, [items, selectedPincode, pincodeQuery]);

  const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, 4);

  const minPrice = useMemo(() => {
    const prices = items.map((i) => i.sale_price).filter((p): p is number => p !== null && p > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [items]);

  const maxDiscount = useMemo(() => {
    const discs = items.map((i) => i.discount_pct).filter((d): d is number => d !== null && d > 0);
    return discs.length ? Math.max(...discs) : null;
  }, [items]);

  return (
    <div className="w-full bg-white dark:bg-[#111422] border border-amber-500/40 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 relative overflow-hidden my-2">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-white/[0.08] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            Mega Local Haul
          </span>
          <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold">
            {deal.store || deal.haul_store || 'Quick Commerce'}
          </span>
          {maxDiscount && (
            <span className="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-bold">
              Up to {maxDiscount}% OFF
            </span>
          )}
        </div>

        {minPrice && (
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">Deals Starting At</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">₹{minPrice}</div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        {deal.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Contains {items.length} discounted items across {pincodeOptions.length} delivery locations. Select your city or pincode below:
      </p>

      {/* Pincode Selector & Quick Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center justify-between mb-4 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPincode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPincode === 'all'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All Items ({items.length})
          </button>
          {pincodeOptions.map((opt) => (
            <button
              key={opt.pincode}
              onClick={() => setSelectedPincode(opt.pincode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedPincode === opt.pincode
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <MapPin className="w-3 h-3 shrink-0 opacity-70" />
              <span>{opt.city}</span>
              <span className="opacity-70 text-[10px]">({opt.count})</span>
            </button>
          ))}
        </div>

        {/* Search by Pincode */}
        <div className="relative w-full sm:w-44 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            maxLength={6}
            placeholder="Type Pincode..."
            value={pincodeQuery}
            onChange={(e) => setPincodeQuery(e.target.value.replace(/\D/g, ''))}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Sub-Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50/70 dark:bg-gray-800/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 border border-gray-200/80 dark:border-gray-800 rounded-xl p-3 flex flex-col justify-between transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.city}
                </span>
                {item.discount_pct && (
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                    {item.discount_pct}% OFF
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-2">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
              <div className="flex items-baseline gap-1.5">
                {item.sale_price !== null && (
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    ₹{item.sale_price}
                  </span>
                )}
                {item.mrp !== null && item.mrp > (item.sale_price || 0) && (
                  <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                )}
              </div>

              <a
                href={item.buy_url || deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              >
                <span>Buy Loot</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Expand / Collapse Button */}
      {filteredItems.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View All {filteredItems.length} Deals in this Haul</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
