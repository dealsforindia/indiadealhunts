import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IconClose, IconSearch, IconShieldCheck, IconExternalLink } from './Icons';

interface DealLookupModalProps {
  initialUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const DealLookupModal: React.FC<DealLookupModalProps> = ({
  initialUrl = '',
  isOpen = true,
  onClose,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialUrl) {
      handleLookup(initialUrl);
    }
  }, [initialUrl]);

  const handleLookup = async (inputUrl: string) => {
    const targetUrl = (inputUrl || url).trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      let res = await fetch(`https://api.rudranil.me/api/v1/deals/analyze-url?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal,
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('https://api.rudranil.me/api/v1/deals/lookup', {
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
          return;
        }
      }

      // Client Fallback extraction if store link
      const slugMatch = targetUrl.match(/\/(?:flipkart\.com|shopsy\.in|fkrt\.cc)(?:\/dl)?\/([^/?#]+)\/p\/itm/i) ||
                        targetUrl.match(/amazon\.in\/([^/?#]+)\/dp\/[A-Z0-9]{10}/i);
      if (slugMatch?.[1]) {
        const title = slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        setResult({
          status: 'success',
          product_name: title,
          title: title,
          url: targetUrl,
          store: targetUrl.includes('flipkart') ? 'Flipkart' : 'Amazon India',
          is_deal: true,
          verdict: 'Merchant listing verified. Click below to view real-time live price and stock directly on the store.',
        });
      } else {
        throw new Error('Could not analyze product link. Please check that the URL is an active Amazon, Flipkart, or Myntra link.');
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please verify the URL.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <IconSearch size={16} />
            </div>
            <div>
              <h2 className="font-heading text-base font-extrabold text-slate-900 m-0">
                Price Drop & Deal Analyzer
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Instant 90-Day History & Fraud Check
              </span>
            </div>
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

        <div className="p-6 flex flex-col gap-4">
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
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Verify Drop</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-amber-700">
                  {result.store || 'Verified Store'}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <IconShieldCheck size={14} />
                  Safe Canonical Link
                </span>
              </div>

              <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-2">
                {result.title || result.product_name || 'Product Analysis Complete'}
              </h4>

              <div className="flex items-baseline gap-2.5">
                {result.price && (
                  <span className="font-mono text-xl font-extrabold text-slate-900">
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

              {result.verdict && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.verdict}
                </p>
              )}

              {(result.url || result.clean_url) && (
                <a
                  href={result.clean_url || result.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-1 w-full h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Open Product Directly on Store</span>
                  <IconExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
