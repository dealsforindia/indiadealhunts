import React from 'react';

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
}

interface ExternalSearchResultsProps {
  query: string;
  deals: ExternalSearchDeal[];
  loading: boolean;
  error?: string | null;
  onCheckHistory?: (url: string) => void;
}

const STORE_LINKS = [
  { name: 'Amazon', url: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`, tone: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100' },
  { name: 'Flipkart', url: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`, tone: 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100' },
  { name: 'Myntra', url: (q: string) => `https://www.myntra.com/search?q=${encodeURIComponent(q)}`, tone: 'border-pink-200 bg-pink-50 text-pink-900 hover:bg-pink-100' },
  { name: 'Google Shopping', url: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`, tone: 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100' },
];

const money = (value: number | null) => value == null || value <= 0 ? 'Price unavailable' : `₹${Math.round(value).toLocaleString('en-IN')}`;

export const ExternalSearchResults: React.FC<ExternalSearchResultsProps> = ({ query, deals, loading, error, onCheckHistory }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-sm" aria-label="Live store search results">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900">Live Multi-Store Deals</h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">LIVE CRAWLED</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Real-time live catalog matches for “{cleanQuery}” with transformed affiliate discounts and 90-day price history validation.</p>
        </div>
        {deals.length > 0 && <span className="font-mono text-xs font-bold text-slate-500">{deals.length} live matches</span>}
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading live store matches">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : deals.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {deals.map((deal) => {
            const isFk = deal.store?.toLowerCase().includes('flipkart');
            const isAmz = deal.store?.toLowerCase().includes('amazon');
            const storeBadgeClass = isFk
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : isAmz
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <article key={deal.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                <div>
                  <div className="relative flex h-36 items-center justify-center bg-slate-50 p-3">
                    {deal.image ? (
                      <img src={deal.image} alt="" loading="lazy" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    ) : <span className="text-3xl" aria-hidden="true">🔎</span>}
                    {deal.discount_pct && deal.discount_pct > 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
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
                      <span className="text-base font-black text-slate-900">{money(deal.price)}</span>
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
                      className="block rounded-xl bg-slate-900 hover:bg-emerald-600 px-3 py-2 text-center text-[11px] font-bold text-white transition shadow-xs"
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
          {error || 'No live store result was returned. Try one of the direct catalog searches below.'}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STORE_LINKS.map((store) => (
          <a key={store.name} href={store.url(cleanQuery)} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition ${store.tone}`}>
            <span className="truncate">Search {store.name}</span><span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
};

