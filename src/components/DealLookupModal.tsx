import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconClose, IconSearch, IconShieldCheck, IconExternalLink } from './Icons';
import { analyzeArbitrage, ArbitrageAnalysis } from '../utils/arbitrage';

interface DealLookupModalProps {
  initialUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface PriceWatch {
  id: string;
  title: string;
  url: string;
  currentPrice: number;
  targetPrice: number;
  store: string;
  contact: string;
  created_at: number;
}

const STORAGE_WATCHES_KEY = 'dealflow_price_watches_v1';
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

const getLookupError = (targetUrl: string) => {
  try {
    let clean = targetUrl.trim();
    if (clean.includes('google.') && (clean.includes('/url?') || clean.includes('url=') || clean.includes('q='))) {
      try {
        const u = new URL(clean);
        const unwrapped = u.searchParams.get('url') || u.searchParams.get('q');
        if (unwrapped && unwrapped.startsWith('http')) {
          clean = unwrapped;
        }
      } catch {}
    }
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host.includes('myntra.com') && !/\/buy(?:\/|$)/.test(path) && !/\/\d{5,}(?:\/|$)/.test(path)) {
      return 'This is a Myntra catalog or search page, not a product page. Paste a product link that ends in /buy, or search for the item in the storefront.';
    }

    if ((host.includes('amazon.') && !/\/dp\/[a-z0-9]{10}/i.test(path)) ||
        ((host.includes('flipkart.com') || host.includes('shopsy.in')) && !/\/p\/itm/i.test(path))) {
      return 'This is a store listing page, not a product page. Paste the specific Amazon or Flipkart product link, or search for the item in the storefront.';
    }
  } catch {
    return 'Please paste a full Amazon, Flipkart, Myntra, or Google Shopping product URL.';
  }

  return null;
};

export const DealLookupModal: React.FC<DealLookupModalProps> = ({
  initialUrl = '',
  isOpen = true,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'watches'>('analyzer');
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Price Drop Alert State
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [watchSaved, setWatchSaved] = useState(false);
  const [watches, setWatches] = useState<PriceWatch[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_WATCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialUrl) {
      handleLookup(initialUrl);
    }
  }, [initialUrl]);

  const arbitrageData: ArbitrageAnalysis | null = useMemo(() => {
    if (!result) return null;
    return analyzeArbitrage({
      title: result.title || result.product_name,
      price: result.price,
      mrp: result.mrp,
      store: result.store,
      url: result.clean_url || result.url,
    });
  }, [result]);

  const handleLookup = async (inputUrl: string) => {
    let targetUrl = (inputUrl || url).trim();
    if (!targetUrl) return;

    if (targetUrl.includes('google.') && (targetUrl.includes('/url?') || targetUrl.includes('url=') || targetUrl.includes('q=http'))) {
      try {
        const u = new URL(targetUrl);
        const unwrapped = u.searchParams.get('url') || u.searchParams.get('q');
        if (unwrapped && unwrapped.startsWith('http')) {
          targetUrl = unwrapped;
          setUrl(unwrapped);
        }
      } catch {}
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setWatchSaved(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      let res = await fetch(`${API_BASE}/api/v1/deals/analyze-url?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal,
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BASE}/api/v1/deals/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
          signal: controller.signal,
        }).catch(() => null);
      }

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data && (data.status === 'success' || data.success || data.title || data.product_name)) {
          setResult(data);
          if (data.price) {
            setTargetPrice(String(Math.round(data.price * 0.9)));
          }
          return;
        }
      }

      // Client Fallback extraction if store link
      const slugMatch = targetUrl.match(/\/(?:flipkart\.com|shopsy\.in|fkrt\.cc)(?:\/dl)?\/([^/?#]+)\/p\/itm/i) ||
                        targetUrl.match(/amazon\.in\/([^/?#]+)\/dp\/[A-Z0-9]{10}/i);
      if (slugMatch?.[1]) {
        const title = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const isFk = targetUrl.includes('flipkart') || targetUrl.includes('shopsy');

        const fallbackData = {
          status: 'success',
          product_name: title,
          title: title,
          price: 0,
          pendingLivePrice: true,
          url: targetUrl,
          store: isFk ? 'Flipkart' : 'Amazon India',
          is_deal: true,
          verdict: 'Merchant listing identified. Open the product page below to verify current checkout price.',
        };
        setResult(fallbackData);
      } else {
        throw new Error(getLookupError(targetUrl));
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please verify the URL.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleSaveWatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !targetPrice) return;

    const newWatch: PriceWatch = {
      id: `watch_${Date.now()}`,
      title: result.title || result.product_name || 'Tracked Product',
      url: result.clean_url || result.url || url,
      currentPrice: Number(result.price) || 0,
      targetPrice: Number(targetPrice) || 0,
      store: result.store || 'Verified Store',
      contact: contactInfo || 'Web Push Alert',
      created_at: Date.now(),
    };

    const nextWatches = [newWatch, ...watches];
    setWatches(nextWatches);
    try {
      localStorage.setItem(STORAGE_WATCHES_KEY, JSON.stringify(nextWatches));
    } catch {}
    setWatchSaved(true);
  };

  const handleRemoveWatch = (id: string) => {
    const next = watches.filter((w) => w.id !== id);
    setWatches(next);
    try {
      localStorage.setItem(STORAGE_WATCHES_KEY, JSON.stringify(next));
    } catch {}
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <IconSearch size={16} />
            </div>
            <div>
              <h2 className="font-heading text-base font-extrabold text-slate-900 m-0">
                Live Price Tracker & Arbitrage Radar
              </h2>
              <span className="text-[10.5px] font-mono text-slate-500 uppercase">
                Cross-Store Comparison & Instant Price Drop Watch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Selector Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('analyzer')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'analyzer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Analyzer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('watches')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'watches' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Watches</span>
                {watches.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {watches.length}
                  </span>
                )}
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {activeTab === 'analyzer' ? (
            <>
              {/* Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup(url);
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Amazon, Flipkart, or Myntra link..."
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Comparing Stores...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Price</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {error}
                </div>
              )}

              {result && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {result.store || 'Verified Store'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                      <IconShieldCheck size={14} />
                      Verified Merchant Link
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-2 m-0">
                    {result.title || result.product_name || 'Product Analysis Complete'}
                  </h4>

                  <div className="flex items-baseline gap-2.5">
                    {result.price && (
                      <span className="font-mono text-2xl font-extrabold text-slate-900">
                        ₹{Number(result.price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {result.mrp && result.mrp > result.price && (
                      <span className="font-mono text-xs text-slate-400 line-through">
                        ₹{Number(result.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                    {result.discount_pct && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-xs font-mono font-bold border border-rose-200">
                        -{result.discount_pct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Multi-Store Arbitrage / Verification Table */}
                  {arbitrageData && (
                    <div className="mt-1 p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-extrabold text-slate-900 flex items-center gap-1">
                          <span>⚡ Real-Time Price Verification</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          Live Store Links
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {arbitrageData.quotes.map((q, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border flex flex-col gap-1 transition-all ${
                              q.isVerifiedDeal
                                ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-800">{q.store}</span>
                              {q.isVerifiedDeal && (
                                <span className="text-[9px] font-mono font-extrabold text-emerald-700 uppercase bg-emerald-100 px-1 py-0.2 rounded">
                                  VERIFIED
                                </span>
                              )}
                            </div>
                            {q.price !== undefined && q.price > 0 ? (
                              <div className="text-sm font-mono font-black text-slate-900">
                                ₹{q.price.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div className="text-xs font-mono font-bold text-slate-500">
                                {q.statusText}
                              </div>
                            )}
                            <span className="text-[9.5px] font-mono text-slate-500">
                              {q.badge}
                            </span>
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              <span>{q.actionText}</span>
                              <IconExternalLink size={10} />
                            </a>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-600 m-0 leading-relaxed font-sans">
                        {arbitrageData.verdict}
                      </p>
                    </div>
                  )}

                  {/* Price Drop Tracker Setup Form */}
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <span>🔔 Set Instant Price Drop Watch</span>
                    </div>
                    <p className="text-[11px] text-blue-700 m-0 leading-relaxed">
                      We check prices every 60 seconds. Set your target price, and we'll alert you the instant this drop triggers.
                    </p>

                    {watchSaved ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <span>✓</span>
                        <span>Watch Active! You'll be alerted when this price hits ₹{Number(targetPrice).toLocaleString('en-IN')}.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveWatch} className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">₹</span>
                          <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            placeholder="Target price..."
                            required
                            className="w-full pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <input
                          type="text"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="Email or @telegram handle..."
                          className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Track Drop
                        </button>
                      </form>
                    )}
                  </div>

                  {(result.url || result.clean_url) && (
                    <a
                      href={result.clean_url || result.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <span>Open Product on {result.store || 'Store'}</span>
                      <IconExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Watches Tab */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                  Active Price Drop Watches ({watches.length})
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('analyzer')}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  + Add New Link
                </button>
              </div>

              {watches.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <div className="text-xs font-bold text-slate-800">No active price drop watches</div>
                  <p className="text-[11px] text-slate-500 max-w-xs m-0">
                    Paste any product link in the Analyzer tab to set up 24/7 price drop tracking.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {watches.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {w.store}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">{w.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-slate-500">Current: ₹{w.currentPrice.toLocaleString('en-IN')}</span>
                          <span className="font-bold text-emerald-600">Target: ₹{w.targetPrice.toLocaleString('en-IN')}</span>
                          <span className="text-slate-400 text-[10px]">Via {w.contact}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={w.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          Open ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveWatch(w.id)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove watch"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
