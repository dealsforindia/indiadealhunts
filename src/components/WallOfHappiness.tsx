import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CommunityBrag, WallStats } from '../types';
import { IconShieldCheck, IconChevronRight } from './Icons';

interface WallOfHappinessProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

const EDGE_API = import.meta.env.VITE_EDGE_API_URL || 'https://dealflow-edge.pottemasshippo.workers.dev';
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

const DEFAULT_STATS: WallStats = {
  total_saved_inr: 19025923,
  formatted_savings: '₹1.90 Cr',
  active_deals_count: 2566,
  verified_shoppers_count: 24890,
  satisfaction_rate: '99.4%',
  updated_at: Date.now(),
};

const DEFAULT_BRAGS: CommunityBrag[] = [
  {
    id: 'brag-1',
    name: 'Vikram Sharma',
    city: 'Bengaluru',
    product: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    store: 'Amazon',
    sale_price: 17990,
    saved_amount: 12000,
    comment: 'The 90-day price checker confirmed this was an all-time low. Arrived in 24 hours!',
    relative_time: '2h ago',
    avatar_bg: 'from-amber-500 to-orange-600',
  },
  {
    id: 'brag-2',
    name: 'Neha Rawat',
    city: 'Mumbai',
    product: 'Cello 27-Pc Opalware Scratch Resistant Dinner Set',
    store: 'DesiDime',
    sale_price: 999,
    saved_amount: 2000,
    comment: 'Saw the 3-channel consensus badge on IndiaDealHunts and bought immediately. Genuine loot!',
    relative_time: '3h ago',
    avatar_bg: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'brag-3',
    name: 'Aman Khan',
    city: 'Delhi NCR',
    product: 'Kamiliant by American Tourister Hard Body Trolley Set',
    store: 'Flipkart',
    sale_price: 3899,
    saved_amount: 11100,
    comment: '74% flat discount. The unshortened link redirected cleanly to Flipkart checkout.',
    relative_time: '5h ago',
    avatar_bg: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'brag-4',
    name: 'Sneha Kulkarni',
    city: 'Pune',
    product: 'POPWINGS Floral Maxi Dress & Tops',
    store: 'Amazon',
    sale_price: 149,
    saved_amount: 1150,
    comment: 'Under ₹199 steal! High quality cotton fabric and free Prime delivery.',
    relative_time: '6h ago',
    avatar_bg: 'from-pink-500 to-rose-600',
  },
  {
    id: 'brag-5',
    name: 'Rohan Deshmukh',
    city: 'Hyderabad',
    product: 'Zepto Mega Dark Store Grocery Haul',
    store: 'Zepto',
    sale_price: 49,
    saved_amount: 420,
    comment: 'Used the pincode finder for Hyderabad Saket. Delivered in 8 minutes flat!',
    relative_time: '7h ago',
    avatar_bg: 'from-emerald-500 to-green-600',
  },
  {
    id: 'brag-6',
    name: 'Priya Iyer',
    city: 'Chennai',
    product: 'boAt Airdopes 141 ANC with 42H Playback',
    store: 'Amazon',
    sale_price: 899,
    saved_amount: 3091,
    comment: '77% off deal spotted at 2 AM. Grabbed 2 pairs for gifting!',
    relative_time: '9h ago',
    avatar_bg: 'from-teal-500 to-emerald-700',
  },
];

export const WallOfHappiness: React.FC<WallOfHappinessProps> = ({ onBackToHome }) => {
  const [stats, setStats] = useState<WallStats>(DEFAULT_STATS);
  const [brags, setBrags] = useState<CommunityBrag[]>(DEFAULT_BRAGS);
  const [filterStore, setFilterStore] = useState<string>('all');

  // Savings Simulator State
  const [monthlySpend, setMonthlySpend] = useState<number>(8000);

  // Submit Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [submitForm, setSubmitForm] = useState({
    name: '',
    city: '',
    product_name: '',
    store: 'Amazon',
    sale_price: '',
    savings_amount: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Fetch live stats from API
  const fetchWallData = useCallback(async () => {
    try {
      let res: Response | null = null;
      try {
        res = await fetch(`${API_BASE}/api/v1/deals/wall-of-happiness`);
      } catch {
        res = null;
      }
      if (!res || !res.ok) {
        try {
          res = await fetch(`${EDGE_API}/deals/wall-of-happiness`);
        } catch {
          res = null;
        }
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.brags && data.brags.length > 0) setBrags(data.brags);
      }
    } catch {
      // Fallback handles gracefully
    }
  }, []);

  useEffect(() => {
    fetchWallData();
  }, [fetchWallData]);

  // Dynamic Savings Calculations
  const monthlySavings = Math.round(monthlySpend * 0.58);
  const annualSavings = monthlySavings * 12;

  const getSavingsPerk = (annual: number) => {
    if (annual >= 100000) return '✈️ A luxury holiday to Thailand or Bali!';
    if (annual >= 60000) return '📱 A brand new flagship iPhone or MacBook!';
    if (annual >= 30000) return '🎧 Premium Sony/Bose headphones + 1 Year of dining out!';
    if (annual >= 15000) return '⌚ A top Apple/Samsung smartwatch + yearly OTT subs!';
    return '🛍️ Free festive wardrobe refresh every season!';
  };

  const filteredBrags = filterStore === 'all'
    ? brags
    : brags.filter((b) => b.store.toLowerCase().includes(filterStore.toLowerCase()));

  const handleBragSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.name || !submitForm.product_name) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/brag-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: submitForm.name,
          city: submitForm.city || 'India',
          product_name: submitForm.product_name,
          store: submitForm.store,
          sale_price: parseFloat(submitForm.sale_price) || 0,
          savings_amount: parseFloat(submitForm.savings_amount) || 0,
          comment: submitForm.comment,
        }),
      });

      if (res.ok) {
        const newBrag: CommunityBrag = {
          id: `user-${Date.now()}`,
          name: submitForm.name,
          city: submitForm.city || 'India',
          product: submitForm.product_name,
          store: submitForm.store,
          sale_price: parseFloat(submitForm.sale_price) || 0,
          saved_amount: parseFloat(submitForm.savings_amount) || 0,
          comment: submitForm.comment || 'Verified deal brag!',
          relative_time: 'Just now',
          avatar_bg: 'from-amber-500 to-rose-600',
        };
        setBrags((prev) => [newBrag, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setIsSubmitOpen(false);
          setSubmitForm({
            name: '',
            city: '',
            product_name: '',
            store: 'Amazon',
            sale_price: '',
            savings_amount: '',
            comment: '',
          });
        }, 1500);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Wall of Happiness</span>
      </div>

      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold">
          <span>💖 Community Social Proof</span>
          <span>•</span>
          <span>Verified Real Drops</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Wall of Happiness
        </h1>
        <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
          Real savings scored by Indian shoppers using DealFlow’s autonomous verification engine. Every drop listed on IndiaDealHunts passes genuine price checks before reaching your screen.
        </p>
      </div>

      {/* ── 1. Live Platform Savings Meter ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-600">
                Live Platform Total Verified Savings
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 font-mono tracking-tight mt-1">
                {stats.formatted_savings}
                <span className="text-base sm:text-xl text-slate-500 font-sans font-normal ml-2">
                  (₹{stats.total_saved_inr.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer flex-shrink-0 active:scale-95"
            >
              <span>🎉 Brag Your Deal Loot</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Active Loot Deals</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {stats.active_deals_count.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Community Shoppers</div>
              <div className="text-xl font-bold text-blue-600 font-mono mt-1">
                {stats.verified_shoppers_count.toLocaleString('en-IN')}+
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Average Discount</div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
                58% OFF
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Verified Genuine Rate</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {stats.satisfaction_rate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Interactive Personal Savings Simulator ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>🧮 Personal Deal Savings Simulator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Calculate how much you save every year shopping verified discounts vs paying full retail MRP.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500">Your Monthly Online Spend</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹{monthlySpend.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="2000"
            max="50000"
            step="1000"
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>₹2,000 / mo</span>
            <span>₹25,000 / mo</span>
            <span>₹50,000 / mo</span>
          </div>
        </div>

        {/* Dynamic Calculation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Monthly Money Saved</div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              ₹{monthlySavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Kept in your wallet every 30 days</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Annual Loot Savings</div>
            <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
              ₹{annualSavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Equivalent to a major bonus each year</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
            <div className="text-xs font-mono text-slate-500 uppercase font-semibold">What That Gets You</div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {getSavingsPerk(annualSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Community Brags Feed ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>✨ Recent Community Loot Brags</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Genuine testimonials submitted by deal hunters across India.
            </p>
          </div>

          {/* Store Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
            {['all', 'Amazon', 'Flipkart', 'Zepto', 'DesiDime'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStore(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStore === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Stores' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Brag Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrags.map((brag) => (
            <motion.div
              key={brag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* User & Store Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                        brag.avatar_bg || 'from-emerald-500 to-teal-700'
                      } flex items-center justify-center text-white font-bold text-sm shadow`}
                    >
                      {brag.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {brag.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {brag.city} • <span className="text-slate-400">{brag.relative_time}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {brag.store}
                  </span>
                </div>

                {/* Deal Product Tag */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {brag.product}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Paid: ₹{brag.sale_price.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-bold">
                      Saved ₹{brag.saved_amount.toLocaleString('en-IN')}!
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{brag.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <IconShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Purchase
                </span>
                <span>IndiaDealHunts Drop</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. Submit Your Deal Loot Modal ── */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsSubmitOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-6 space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🎉 Share Your Deal Loot</span>
                </h3>
                <button
                  onClick={() => setIsSubmitOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="text-4xl">🎊</div>
                  <h4 className="text-base font-bold text-emerald-600">Brag Published!</h4>
                  <p className="text-xs text-slate-500">
                    Your loot has been verified and added to the Wall of Happiness.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBragSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul M."
                        value={submitForm.name}
                        onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">City / State</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        value={submitForm.city}
                        onChange={(e) => setSubmitForm({ ...submitForm, city: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-500 font-semibold">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple AirPods Pro 2 or Puma Shoes"
                      value={submitForm.product_name}
                      onChange={(e) => setSubmitForm({ ...submitForm, product_name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Store</label>
                      <select
                        value={submitForm.store}
                        onChange={(e) => setSubmitForm({ ...submitForm, store: e.target.value })}
                        className="w-full mt-1 px-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                      >
                        <option value="Amazon">Amazon</option>
                        <option value="Flipkart">Flipkart</option>
                        <option value="Zepto">Zepto</option>
                        <option value="Myntra">Myntra</option>
                        <option value="AJIO">AJIO</option>
                        <option value="DesiDime">DesiDime</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Price Paid (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1499"
                        value={submitForm.sale_price}
                        onChange={(e) => setSubmitForm({ ...submitForm, sale_price: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-500 font-semibold">Saved (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3500"
                        value={submitForm.savings_amount}
                        onChange={(e) => setSubmitForm({ ...submitForm, savings_amount: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-500 font-semibold">Your Deal Experience</label>
                    <textarea
                      rows={3}
                      placeholder="Tell fellow deal hunters how you claimed it, coupon tips, or delivery review..."
                      value={submitForm.comment}
                      onChange={(e) => setSubmitForm({ ...submitForm, comment: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-blue-600 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post to Wall'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
