import React, { useState, useMemo } from 'react';

export interface ExternalSearchDeal {
  id: string;
  title: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  store: string;
  image: string | null;
  url: string;
  raw_url?: string;
  has_price_history?: boolean;
  is_lowest_price?: boolean;
}

interface ExternalSearchResultsProps {
  query: string;
  deals: ExternalSearchDeal[];
  loading: boolean;
  error?: string | null;
  onCheckHistory?: (url: string) => void;
}

const STORE_LINKS = [
  { name: 'Google Shopping', url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}&udm=28#ip=1`, tone: 'border-slate-300 bg-slate-900 text-white hover:bg-black', icon: '🔍' },
  { name: 'Amazon India', url: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`, tone: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100', icon: '📦' },
  { name: 'Flipkart', url: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`, tone: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100', icon: '🛍️' },
  { name: 'Myntra', url: (q: string) => `https://www.myntra.com/search?q=${encodeURIComponent(q)}`, tone: 'border-pink-200 bg-pink-50 text-pink-900 hover:bg-pink-100', icon: '👗' },
];

const money = (value: number | null) => value == null || value <= 0 ? 'Price unavailable' : `₹${Math.round(value).toLocaleString('en-IN')}`;

export const ExternalSearchResults: React.FC<ExternalSearchResultsProps> = ({ query, deals, loading, error, onCheckHistory }) => {
  const cleanQuery = query.trim();
  const [pastedUrl, setPastedUrl] = useState('');

  const [storeFilter, setStoreFilter] = useState<'all' | 'lowest' | 'flipkart' | 'amazon' | 'google_shopping'>('all');

  // Find lowest price deal across all stores
  const { minPriceDeal, maxPriceDeal, priceSpread } = useMemo(() => {
    const valid = deals.filter((d) => d.price && d.price > 0);
    if (!valid.length) return { minPriceDeal: null, maxPriceDeal: null, priceSpread: 0 };
    const sorted = [...valid].sort((a, b) => (a.price || 0) - (b.price || 0));
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return {
      minPriceDeal: min,
      maxPriceDeal: max,
      priceSpread: Math.max(0, (max.price || 0) - (min.price || 0)),
    };
  }, [deals]);

  // Filtered deals based on store pill
  const filteredDeals = useMemo(() => {
    if (storeFilter === 'lowest') {
      return deals.filter((d) => d.is_lowest_price || (minPriceDeal && d.id === minPriceDeal.id));
    }
    if (storeFilter === 'flipkart') {
      return deals.filter((d) => d.store?.toLowerCase().includes('flipkart'));
    }
    if (storeFilter === 'amazon') {
      return deals.filter((d) => d.store?.toLowerCase().includes('amazon'));
    }
    if (storeFilter === 'google_shopping') {
      return deals.filter((d) => !d.store?.toLowerCase().includes('flipkart') && !d.store?.toLowerCase().includes('amazon'));
    }
    return deals;
  }, [deals, storeFilter, minPriceDeal]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = pastedUrl.trim();
    if (!target) return;
    onCheckHistory?.(target);
    setPastedUrl('');
  };

  if (!cleanQuery) return null;

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-sm" aria-label="Live store search results">
      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900">Unified Multi-Store & Google Shopping Radar</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">LIVE COMPARISON</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time price comparison across Our Verified Directory, Google Shopping, Amazon & Flipkart for “{cleanQuery}”. We find the absolute lowest price with direct affiliate cash savings so you never need to search anywhere else.
          </p>
        </div>
        {deals.length > 0 && <span className="font-mono text-xs font-bold text-slate-500">{deals.length} offers verified</span>}
      </div>

      {/* ── Cross-Store Lowest Price Arbitrage Banner ── */}
      {minPriceDeal && minPriceDeal.price && deals.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-xs">
              🏆
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Absolute Lowest Price Detected</span>
                <span className="rounded-full bg-emerald-200/80 px-2 py-0.2 text-[10px] font-bold text-emerald-900">
                  {minPriceDeal.store}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                Found for <span className="font-black text-emerald-700">{money(minPriceDeal.price)}</span>
                {priceSpread > 0 && (
                  <span className="text-slate-600"> — save up to <span className="font-black text-emerald-700">₹{Math.round(priceSpread).toLocaleString('en-IN')}</span> vs other store prices!</span>
                )}
              </p>
            </div>
          </div>
          {minPriceDeal.url && (
            <a
              href={minPriceDeal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
            >
              <span>Get Lowest Price ({money(minPriceDeal.price)})</span>
              <span>↗</span>
            </a>
          )}
        </div>
      )}

      {/* ── Filter Pills: All / Lowest Price / Flipkart / Amazon / Google Shopping ── */}
      {deals.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStoreFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              storeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Offers ({deals.length})
          </button>
          <button
            type="button"
            onClick={() => setStoreFilter('lowest')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              storeFilter === 'lowest'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>🏆</span>
            <span>Lowest Price Deals</span>
          </button>
          {deals.some((d) => d.store?.toLowerCase().includes('flipkart')) && (
            <button
              type="button"
              onClick={() => setStoreFilter('flipkart')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                storeFilter === 'flipkart'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <span>🛍️</span>
              <span>Flipkart ({deals.filter((d) => d.store?.toLowerCase().includes('flipkart')).length})</span>
            </button>
          )}
          {deals.some((d) => d.store?.toLowerCase().includes('amazon')) && (
            <button
              type="button"
              onClick={() => setStoreFilter('amazon')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                storeFilter === 'amazon'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>📦</span>
              <span>Amazon ({deals.filter((d) => d.store?.toLowerCase().includes('amazon')).length})</span>
            </button>
          )}
          {deals.some((d) => !d.store?.toLowerCase().includes('flipkart') && !d.store?.toLowerCase().includes('amazon')) && (
            <button
              type="button"
              onClick={() => setStoreFilter('google_shopping')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                storeFilter === 'google_shopping'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <span>🌐</span>
              <span>Google Shopping & More ({deals.filter((d) => !d.store?.toLowerCase().includes('flipkart') && !d.store?.toLowerCase().includes('amazon')).length})</span>
            </button>
          )}
        </div>
      )}

      {/* ── Deals Grid ── */}
      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading live store matches">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredDeals.map((deal) => {
            const isLowest = Boolean(deal.is_lowest_price || (minPriceDeal && deal.id === minPriceDeal.id));
            const sLower = deal.store?.toLowerCase() || '';
            const isFk = sLower.includes('flipkart');
            const isAmz = sLower.includes('amazon');
            const isGShop = sLower.includes('google');
            const isJio = sLower.includes('jio');
            const isCroma = sLower.includes('croma');
            
            const storeBadgeClass = isFk
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : isAmz
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : isGShop
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : isJio
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : isCroma
              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
              : 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <article
                key={deal.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md ${
                  isLowest
                    ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="relative flex h-36 items-center justify-center bg-slate-50 p-3">
                    {deal.image ? (
                      <img src={deal.image} alt="" loading="lazy" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    ) : <span className="text-3xl" aria-hidden="true">🔎</span>}
                    
                    {isLowest ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs flex items-center gap-1">
                        <span>🏆</span> LOWEST
                      </span>
                    ) : deal.discount_pct && deal.discount_pct > 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                        {deal.discount_pct}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${storeBadgeClass}`}>
                        {deal.store || 'Store'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        In Stock
                      </span>
                    </div>

                    <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-slate-900" title={deal.title}>
                      {deal.title}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className={`text-base font-black ${isLowest ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {money(deal.price)}
                      </span>
                      {deal.mrp && deal.mrp > (deal.price || 0) ? (
                        <span className="text-[10px] text-slate-400 line-through">{money(deal.mrp)}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 space-y-1.5">
                  {onCheckHistory && (deal.raw_url || deal.url) && (
                    <button
                      type="button"
                      onClick={() => onCheckHistory(deal.raw_url || deal.url)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 py-1.5 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                      title="Inspect 90-day price trends and check for fake MRP inflation"
                    >
                      <span>📊</span>
                      <span>90-Day History</span>
                    </button>
                  )}
                  {deal.url ? (
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block rounded-xl px-3 py-2 text-center text-[11px] font-bold text-white transition shadow-xs ${
                        isLowest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-emerald-600'
                      }`}
                    >
                      Buy at {deal.store || 'store'} ↗
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          {error || 'No live store result was returned. Use the direct store searches below.'}
        </div>
      )}

      {/* ── Google Shopping Price Match & Affiliate Transformer ── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <div>
              <h4 className="text-xs font-black text-slate-900">Found Cheaper on Google Shopping or Any Store?</h4>
              <p className="text-[11px] text-slate-500">Paste any Google Shopping or merchant link below. We verify authentic 90-day price trends and unlock affiliate cash discounts.</p>
            </div>
          </div>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&udm=28#ip=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition shadow-2xs"
          >
            <span>Scan Google Shopping Live</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <form onSubmit={handlePasteSubmit} className="mt-3 flex gap-2">
          <input
            type="url"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="Paste Google Shopping, Amazon, Flipkart, or store link to verify & unlock..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!pastedUrl.trim()}
            className="rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-xs font-bold text-white transition cursor-pointer shrink-0 shadow-2xs"
          >
            Verify Price
          </button>
        </form>
      </div>

      {/* ── Quick Store Outbound Searches ── */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STORE_LINKS.map((store) => (
          <a
            key={store.name}
            href={store.url(cleanQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition ${store.tone}`}
          >
            <span className="truncate flex items-center gap-1.5">
              <span>{store.icon}</span>
              <span>{store.name}</span>
            </span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
};


