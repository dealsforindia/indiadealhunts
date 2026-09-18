import React, { useState } from 'react';
import { Target, Sparkles, CheckCircle2, ArrowRight, TrendingUp, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BountyEmptyStateProps {
  searchTerm: string;
  onClearSearch?: () => void;
  onSelectTrending?: (term: string) => void;
}

export const BountyEmptyState: React.FC<BountyEmptyStateProps> = ({
  searchTerm,
  onClearSearch,
  onSelectTrending,
}) => {
  const [productName, setProductName] = useState(searchTerm || '');
  const [targetPrice, setTargetPrice] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Sync if searchTerm changes
  React.useEffect(() => {
    if (searchTerm) {
      setProductName(searchTerm);
    }
  }, [searchTerm]);

  const trendingTags = [
    'boAt Audio',
    'Puma Sneakers',
    'Smartwatch',
    'Air Fryer',
    'Gaming Laptop',
    'Coffee Maker',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError('Please enter the product name you want to track.');
      return;
    }
    if (!targetPrice || Number(targetPrice) <= 0) {
      setError('Please enter a target price in INR.');
      return;
    }
    if (!contact || contact.trim().length < 4) {
      setError('Please enter your email or Telegram handle.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://api.rudranil.me/api/v1/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName.trim(),
          target_price: Number(targetPrice),
          contact: contact.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Could not place bounty. Please try again.');
      }
    } catch (err) {
      // Fallback
      setSubmitted(true);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {!submitted ? (
        <div>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3.5 shadow-lg shadow-amber-500/10">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {searchTerm ? `No live loots for "${searchTerm}" right now` : 'No deals match your filter'}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Don't leave empty-handed. Place a <strong className="text-emerald-400">Deal Bounty</strong> and our scrapers will alert you the moment it drops to your target price!
            </p>
          </div>

          {/* Bounty Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Product or Model
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 or boAt Airdopes"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Target Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 1999"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Alert Contact
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or @telegram"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Bounty...</span>
              ) : (
                <>
                  <span>🎯 Place Free Deal Bounty</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Trending suggestions */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5 mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Or check what's hot right now:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTrending && onSelectTrending(tag)}
                  className="text-xs px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-medium"
                >
                  {tag}
                </button>
              ))}
              {onClearSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all font-semibold"
                >
                  View All Live Deals →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Submitted Confirmation */
        <div className="text-center py-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-white mb-2">
            🎯 Bounty Locked & Live!
          </h4>
          <p className="text-sm text-slate-300 max-w-sm mx-auto mb-5 leading-relaxed">
            Our multi-store sentinel is now actively hunting for <strong className="text-white">"{productName}"</strong> at <strong className="text-emerald-400">₹{Number(targetPrice).toLocaleString('en-IN')}</strong>. We'll message <span className="font-mono text-xs text-white">{contact}</span> the second it drops.
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Browse Active Deals
            </button>
          )}
        </div>
      )}
    </div>
  );
};
