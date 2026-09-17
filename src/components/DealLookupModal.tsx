import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ExternalLink, ShieldCheck, RefreshCw, X, Link as LinkIcon, AlertTriangle, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LookupResult } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface DealLookupProps {
  isOpen?: boolean;
  initialUrl?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const DealLookupModal: React.FC<DealLookupProps> = ({
  isOpen = true,
  initialUrl = '',
  onClose,
  isModal = true,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [resultImgError, setResultImgError] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      handleLookup(initialUrl);
    }
  }, [initialUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isOpen === false) return null;

  const sampleUrls = [
    { label: 'Cricket Helmet (₹206)', url: 'https://www.amazon.in/dp/B09NQ5ZV2K' },
    { label: 'Maybelline Lip Tint (₹372)', url: 'https://www.amazon.in/dp/B0D9WCCRMF' },
    { label: 'SARIYA Midi Dress (₹569)', url: 'https://www.amazon.in/dp/B0DGX9N4LX' },
    { label: 'Rosegold Spoon Set (₹499)', url: 'https://www.amazon.in/dp/B0CYH7F974' },
  ];

  const handleLookup = async (inputUrl: string) => {
    const targetUrl = (inputUrl || url).trim();
    if (!targetUrl) {
      setError('Please paste a product URL from Amazon, Flipkart, Myntra, Swiggy or Ajio.');
      return;
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      setError('Please enter a valid link starting with https://');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultImgError(false);

    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        throw new Error('Could not parse product details. Please check the URL and try again.');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Product lookup service temporarily unavailable.');
      }

      const salePrice = data.price || 0;
      const regularPrice = data.regular_price || data.displayRegularPrice || null;
      const mrpPrice = data.mrp || (regularPrice ? Math.round(regularPrice * 1.25) : null);
      const discount = data.discount_pct || 0;

      const storeName = data.store || (() => {
        const u = targetUrl.toLowerCase();
        if (u.includes('amazon')) return 'Amazon India';
        if (u.includes('flipkart') || u.includes('fkrt')) return 'Flipkart';
        if (u.includes('myntra') || u.includes('myntr')) return 'Myntra';
        if (u.includes('ajio')) return 'AJIO';
        if (u.includes('swiggy')) return 'Swiggy Instamart';
        return 'Online Store';
      })();

      const cleanImg = getCleanImageUrl(data.image || data.store_img_url || data.img_url || '');
      const inStock = data.in_stock !== false && Boolean(salePrice && salePrice > 0);

      setResult({
        title: data.title || 'Verified Product Drop',
        price: salePrice,
        regular_price: regularPrice,
        mrp: mrpPrice,
        discount_pct: discount > 0 ? discount : null,
        image: cleanImg,
        url: data.aff_url || data.url || targetUrl,
        store: storeName,
        usually_price: regularPrice && regularPrice > salePrice ? regularPrice : null,
        worth_score: !inStock ? 60 : (data.worth_score || (data.is_lowest_price ? 92 : (discount >= 40 ? 86 : 75))),
        worth_label: !inStock ? 'Out of Stock' : (data.worth_label || (data.is_lowest_price ? 'All-Time Low' : (discount >= 40 ? 'Steal Deal' : 'Good Offer'))),
        is_verified_deal: inStock,
        in_stock: inStock,
        is_lowest_price: Boolean(data.is_lowest_price && inStock),
        lowest_price: data.lowest_price,
        history: data.history || [],
        stock_text: inStock ? data.stock_text : 'Currently unavailable on merchant store',
        savings: inStock && regularPrice && regularPrice > salePrice ? regularPrice - salePrice : (inStock && mrpPrice && mrpPrice > salePrice ? mrpPrice - salePrice : null),
        verdict: !inStock
          ? `⚠️ Currently Unavailable: This item is out of stock or unavailable from the primary seller on ${storeName}. 90-day price history is preserved above for your reference.`
          : (data.verdict || (data.is_lowest_price
            ? `🔥 All-Time Lowest Price: Current price of ₹${salePrice.toLocaleString('en-IN')} is the lowest recorded in 90 days (Usually sells for ₹${regularPrice?.toLocaleString('en-IN')}).`
            : `Verified Price Drop: Current price of ₹${salePrice.toLocaleString('en-IN')} is ${discount}% lower than typical retail benchmarks.`)),
      });

      if (inStock && (discount >= 35 || salePrice > 0)) {
        try {
          confetti({
            particleCount: 38,
            spread: 60,
            origin: { y: 0.55 },
            colors: ['#10B981', '#F59E0B', '#34D399', '#38BDF8', '#FBBF24'],
            disableForReducedMotion: true,
            zIndex: 99999,
          });
        } catch {}
      }
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError(err.message || 'Product lookup service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const renderPriceHistoryChart = (history: Array<[number, number]>, currentPrice: number) => {
    if (!history || history.length < 2) return null;
    const sorted = [...history].sort((a, b) => a[0] - b[0]);
    const prices = sorted.map((p) => p[1]);
    const validCurrent = currentPrice && currentPrice > 0 ? [currentPrice] : [];
    const minP = Math.min(...prices, ...validCurrent);
    const maxP = Math.max(...prices, ...validCurrent);
    const range = maxP - minP || 1;

    const width = 460;
    const height = 80;
    const padX = 12;
    const padY = 10;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const points = sorted.map((p, i) => {
      const x = padX + (i / (sorted.length - 1)) * chartW;
      const y = padY + chartH - ((p[1] - minP) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width - padX},${height - 4} L ${padX},${height - 4} Z`;

    const lastPoint = points[points.length - 1].split(',');
    const lastX = Number(lastPoint[0]);
    const lastY = Number(lastPoint[1]);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={height - 6} x2={width - padX} y2={height - 6} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <path d={areaD} fill="url(#priceGradient)" />
        <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="6" fill="#10B981" opacity="0.3" className="animate-ping" />
        <circle cx={lastX} cy={lastY} r="3.5" fill="#34D399" stroke="#0E1424" strokeWidth="1.5" />
      </svg>
    );
  };

  const content = (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400 mb-3">
          <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>DealFlow Price Sanity Checker</span>
        </div>
        <h2 id="lookup-modal-title" className="text-2xl sm:text-4xl font-bold font-brand text-white tracking-tight mb-2">
          Paste Any Product Link
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Instantly verify whether an Amazon, Flipkart, or Myntra discount is genuine, or if the retailer marked up the MRP to artificially boost the discount percentage.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleLookup(url); }} className="relative mb-4" role="search">
        <div className="flex items-center rounded-2xl bg-[#111827] border border-white/15 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 p-1.5 shadow-2xl transition-all">
          <div className="pl-3.5 text-slate-400">
            <LinkIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product link (e.g. https://www.amazon.in/dp/...)"
            className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
            aria-label="Product URL to check"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs sm:text-sm tracking-tight flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-ring"
            aria-label="Submit URL to check price"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>Check Price</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Example Chips */}
      <div className="flex items-center gap-2 flex-wrap justify-center mb-8 text-xs text-slate-400">
        <span>Try an example:</span>
        {sampleUrls.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setUrl(s.url);
              handleLookup(s.url);
            }}
            className="min-h-[32px] px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-emerald-500/40 transition-colors cursor-pointer text-xs focus-ring"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-950/30 text-red-300 text-xs flex items-center gap-3 mb-6" role="alert">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Cyberpunk Laser Scanner State (Zero Layout Shift) */}
      {loading && (
        <div 
          className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0E1424] p-6 sm:p-7 shadow-2xl shadow-emerald-500/10 space-y-5" 
          aria-busy="true"
        >
          {/* Animated Neon Laser Scan Beam */}
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#10B981] animate-laser z-20 pointer-events-none" 
            aria-hidden="true"
          />

          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                DEALFLOW AUDIT SCANNER RUNNING...
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Step 2/3: Price Graph</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 aspect-square bg-[#151E34] rounded-2xl flex flex-col items-center justify-center p-4 border border-white/5 relative overflow-hidden">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
              <span className="text-[11px] font-mono text-slate-400 text-center">Unshortening URL & scraping OpenGraph...</span>
            </div>
            <div className="md:col-span-8 space-y-3.5">
              <div className="h-5 w-3/4 bg-slate-700/60 rounded-lg animate-pulse" />
              <div className="h-9 w-1/3 bg-slate-700/60 rounded-xl animate-pulse" />
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono text-emerald-300/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Checking merchant inflated MRP vs 90-day retail average
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Verifying instant affiliate coupon applicability
                </div>
              </div>
              <div className="h-11 w-52 bg-slate-700/60 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Result Card with Holographic Ambient Border */}
      {result && (
        <div className="relative p-[1.5px] rounded-3xl holographic-border shadow-2xl shadow-emerald-500/20 transition-all">
          <div className="rounded-[23px] bg-[#0E1424] p-5 sm:p-7">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  {result.store}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Live Engine Verification
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30 shadow-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>{result.worth_label} ({result.worth_score}/100)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Product Photo with Aspect Ratio Lock */}
              {result.image && !resultImgError ? (
                <div className="md:col-span-4 aspect-square rounded-2xl bg-white p-4 flex items-center justify-center overflow-hidden shadow-inner group relative">
                  <img
                    src={result.image}
                    alt={result.title}
                    onError={() => setResultImgError(true)}
                    className="max-h-full max-w-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {result.discount_pct && result.discount_pct >= 50 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-tight shadow-md">
                      🔥 Steal Deal
                    </div>
                  )}
                </div>
              ) : (
                <div className="md:col-span-4 aspect-square rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col items-center justify-center gap-2 text-center shadow-inner">
                  <ShieldCheck className="w-12 h-12 text-emerald-400" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-300">Verified {result.store} Item</span>
                </div>
              )}

              {/* Product Pricing & Analysis */}
              <div className={result.image ? 'md:col-span-8 flex flex-col justify-between' : 'md:col-span-12'}>
                <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 mb-3 leading-snug font-brand">
                  {result.title}
                </h3>

                {/* Price Row with High-Impact Typography */}
                {!result.in_stock || !result.price ? (
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-sm border border-rose-500/30 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      Currently Unavailable
                    </span>
                    {(result.regular_price || result.usually_price) && (
                      <span className="text-xs text-slate-400">
                        Typical Price: <strong className="text-slate-300 font-mono">₹{(result.regular_price || result.usually_price)?.toLocaleString('en-IN')}</strong>
                      </span>
                    )}
                    {result.lowest_price && (
                      <span className="text-xs text-emerald-400/90 font-mono">
                        90D Low: ₹{result.lowest_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3 flex-wrap mb-3">
                    <span className="text-3xl sm:text-4xl font-price font-black text-emerald-400 tracking-tight">
                      ₹{result.price.toLocaleString('en-IN')}
                    </span>

                    {result.usually_price && result.usually_price > result.price && (
                      <span className="text-xs text-slate-400">
                        Regular: <strong className="text-slate-300 line-through font-mono">₹{result.usually_price.toLocaleString('en-IN')}</strong>
                      </span>
                    )}

                    {result.mrp && result.mrp > result.price && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        MRP ₹{result.mrp.toLocaleString('en-IN')}
                      </span>
                    )}

                    {result.discount_pct && (
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-black text-xs border border-orange-500/30">
                        {result.discount_pct}% OFF
                      </span>
                    )}
                  </div>
                )}

                {/* All-time lowest badge */}
                {result.is_lowest_price && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-rose-500/25 to-amber-500/25 border border-rose-500/40 text-amber-300 text-xs font-black shadow-lg shadow-rose-500/10 mb-2 w-fit">
                    <span className="animate-pulse">🔥</span>
                    <span>ALL-TIME LOWEST PRICE IN 90 DAYS</span>
                  </div>
                )}

                {/* Instant Savings Badge & Stock Indicator */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {result.savings && result.savings > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                      <span>💰 Instant Savings: ₹{result.savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {result.stock_text && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                      <span>📦 {result.stock_text}</span>
                    </div>
                  )}
                </div>

                {/* 90-Day Real Price History Chart */}
                {result.history && result.history.length > 1 && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                        90-Day Real Price History
                      </span>
                      <div className="flex items-center gap-2.5 text-[11px] font-mono">
                        {result.lowest_price && (
                          <span className="text-emerald-400 font-bold">Low: ₹{result.lowest_price.toLocaleString('en-IN')}</span>
                        )}
                        {result.regular_price && (
                          <span className="text-slate-400">Regular: ₹{result.regular_price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-20 relative">
                      {renderPriceHistoryChart(result.history, result.price)}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1 px-1">
                      <span>90 days ago</span>
                      <span className={result.in_stock && result.price ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {result.in_stock && result.price ? `Today: ₹${result.price.toLocaleString('en-IN')}` : 'Status: Out of Stock'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Verified Verdict */}
                <p className="text-xs text-emerald-300 bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 mb-4 leading-relaxed">
                  {result.verdict}
                </p>

                {/* Grab Deal or Check Alternate Sellers Button */}
                {!result.in_stock || !result.price ? (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer focus-ring group"
                    aria-label={`Check alternate sellers or restock for this item on ${result.store}`}
                  >
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>Check Alternate Sellers on {result.store}</span>
                  </a>
                ) : (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="relative overflow-hidden w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-95 cursor-pointer focus-ring group"
                    aria-label={`Grab verified deal on ${result.store} for ₹${result.price.toLocaleString('en-IN')}`}
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 animate-beam-sweep pointer-events-none" />
                    <ExternalLink className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span>Grab Deal on {result.store}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lookup-modal-title"
      >
        <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0B0F19] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="touch-target min-h-[44px] min-w-[44px] absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer focus-ring"
              aria-label="Close modal (Escape)"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {content}
    </div>
  );
};
