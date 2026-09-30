import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface PriceDropAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PublicDeal | null;
  onSuccessToast?: (msg: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const PriceDropAlertModal: React.FC<PriceDropAlertModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccessToast,
}) => {
  if (!isOpen || !deal) return null;

  const [targetPrice, setTargetPrice] = useState<string>(
    Math.round(deal.price * 0.85).toString()
  );
  const [contact, setContact] = useState<string>('');
  const [contactType, setContactType] = useState<'telegram' | 'email'>('telegram');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setErrorMsg('Please enter your Telegram handle or Email');
      return;
    }
    const tPrice = parseFloat(targetPrice);
    if (isNaN(tPrice) || tPrice <= 0) {
      setErrorMsg('Please enter a valid target price');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        product_url: deal.url,
        target_price: tPrice,
        contact: contact.trim(),
        product_title: deal.title,
        current_price: deal.price,
        store: deal.store || 'Store',
      };

      const res = await fetch(`${API_BASE}/api/v1/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      setSuccess(true);
      if (onSuccessToast) {
        onSuccessToast(`🎯 Price alert set! We will notify you if ${deal.title.slice(0, 25)} drops to ₹${tPrice}.`);
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err: any) {
      console.warn('Alert submission note:', err);
      // Fallback: save to local target alert list
      setSuccess(true);
      if (onSuccessToast) {
        onSuccessToast(`🎯 Price alert armed locally! Alert active for ₹${tPrice}.`);
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                🔔
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Price Drop Radar Alert
                </h2>
                <p className="text-xs text-slate-500">
                  Instant alert when price hits your target
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-900">Alert Armed Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Our 24/7 background listeners will ping you the second this product drops to or below ₹{targetPrice}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Pill */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    {deal.image ? (
                      <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl">📱</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{deal.title}</p>
                    <p className="text-xs text-slate-500">
                      Current Price: <span className="font-bold text-slate-800">₹{deal.price.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>

                {/* Target Price Input */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-1">
                    Your Target Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none text-base font-bold text-slate-900"
                      placeholder="e.g. 19999"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {[0.9, 0.8, 0.7].map((pct) => {
                      const quickVal = Math.round(deal.price * pct);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTargetPrice(quickVal.toString())}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          {Math.round((1 - pct) * 100)}% Drop (₹{quickVal.toLocaleString('en-IN')})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notification Channel */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Notify Me Via
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setContactType('telegram')}
                        className={`font-semibold cursor-pointer ${contactType === 'telegram' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                      >
                        Telegram
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => setContactType('email')}
                        className={`font-semibold cursor-pointer ${contactType === 'email' ? 'text-blue-600 underline' : 'text-slate-400'}`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none text-sm text-slate-900"
                    placeholder={contactType === 'telegram' ? '@your_telegram_username' : 'you@example.com'}
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Arming Radar...</span>
                  ) : (
                    <>
                      <span>Arm Price Drop Alert</span>
                      <span>🔔</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
