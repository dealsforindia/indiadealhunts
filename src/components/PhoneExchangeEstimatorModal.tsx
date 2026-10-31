import { useModalSurface } from '../utils/useModalSurface';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface PhoneExchangeEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PublicDeal | null;
}

interface OldPhoneModel {
  name: string;
  brand: string;
  baseValue: number;
}

const POPULAR_OLD_PHONES: OldPhoneModel[] = [
  { name: 'iPhone 14 (128GB)', brand: 'Apple', baseValue: 28500 },
  { name: 'iPhone 13 (128GB)', brand: 'Apple', baseValue: 22000 },
  { name: 'iPhone 12 (64GB)', brand: 'Apple', baseValue: 14500 },
  { name: 'iPhone 11 (64GB)', brand: 'Apple', baseValue: 9500 },
  { name: 'Samsung Galaxy S22 5G', brand: 'Samsung', baseValue: 19000 },
  { name: 'Samsung Galaxy S21 FE', brand: 'Samsung', baseValue: 12500 },
  { name: 'Samsung Galaxy A53 5G', brand: 'Samsung', baseValue: 8000 },
  { name: 'OnePlus 11R 5G', brand: 'OnePlus', baseValue: 16500 },
  { name: 'OnePlus Nord CE 3', brand: 'OnePlus', baseValue: 9000 },
  { name: 'Redmi Note 12 Pro 5G', brand: 'Xiaomi', baseValue: 7500 },
  { name: 'Redmi Note 11 (64GB)', brand: 'Xiaomi', baseValue: 4500 },
  { name: 'Realme 11 Pro 5G', brand: 'Realme', baseValue: 8000 },
];

const CONDITIONS = [
  { id: 'flawless', label: 'Flawless / Like New', multiplier: 1.0, desc: 'Zero scratches, 100% functional, box & bill present' },
  { id: 'good', label: 'Good / Minor Wear', multiplier: 0.85, desc: 'Light pocket scuffs, screen intact, battery health good' },
  { id: 'average', label: 'Heavy Usage', multiplier: 0.65, desc: 'Dent on body or worn edges, fully functional screen' },
  { id: 'cracked', label: 'Cracked Screen / Body', multiplier: 0.35, desc: 'Display glass cracked but touch works' },
];

export const PhoneExchangeEstimatorModal: React.FC<PhoneExchangeEstimatorModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(POPULAR_OLD_PHONES[1].name);
  const [selectedCondition, setSelectedCondition] = useState<string>('good');

  const [tradeQuote, setTradeQuote] = useState('0');
  const [bonusQuote, setBonusQuote] = useState('0');
  const modalSurface = useModalSurface(isOpen && !!deal, onClose);
  if (!isOpen || !deal) return null;

  const modelObj = POPULAR_OLD_PHONES.find((m) => m.name === selectedModel) || POPULAR_OLD_PHONES[1];
  const condObj = CONDITIONS.find((c) => c.id === selectedCondition) || CONDITIONS[1];

  const exchangeBaseValue = Math.max(0, Number(tradeQuote) || 0);
  // Special Exchange bonus if deal is flagship (> ₹20k)
  const exchangeBonus = Math.max(0, Number(bonusQuote) || 0);
  const totalExchangeSavings = exchangeBaseValue + exchangeBonus;
  const cleanDealPrice = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const netUpgradePrice = Math.max(0, cleanDealPrice - totalExchangeSavings);

  return (
    <AnimatePresence>
      <div ref={modalSurface} role="dialog" aria-modal="true" aria-label="Exchange cost planner" className="shopper-tool-modal fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[var(--surface)]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] dark:border-white/5 bg-[var(--surface)]/80 dark:bg-[var(--bg)]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                🔄
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                  Old Phone Trade-In & Exchange Estimator
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Plan using your merchant’s confirmed exchange quote
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog" className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)]/60 dark:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Target New Product */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[var(--surface)] dark:bg-[var(--bg)] border border-[var(--border-subtle)] dark:border-white/10">
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-[var(--surface)] border border-[var(--border-subtle)] dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">📱</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">Purchase target:</span>
                <p className="text-xs font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] truncate">{deal.title}</p>
                <p className="text-base font-black text-[var(--text-primary)] dark:text-[var(--text-primary)] mt-0.5">{cleanDealPrice > 0 ? `₹${cleanDealPrice.toLocaleString('en-IN')}` : 'Check store'}</p>
              </div>
            </div>

            {/* Select Old Model */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] font-semibold mb-2">
                1. Select Your Current Smartphone
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] dark:border-white/20 text-sm font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)] bg-white dark:bg-[var(--surface)] focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none"
              >
                {POPULAR_OLD_PHONES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} 
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Picker */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)] font-semibold mb-2">
                2. Select Cosmetic & Functional Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((c) => {
                  const isSel = c.id === selectedCondition;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCondition(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-100 shadow-2xs'
                          : 'bg-white dark:bg-[var(--surface)] border-[var(--border-subtle)] dark:border-white/10 hover:bg-[var(--surface)] dark:bg-[var(--bg)]'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{c.label}</span>
                      <span className="block text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="commerce-filter-field">Confirmed trade-in value (₹)<input type="number" min="0" value={tradeQuote} onChange={event => setTradeQuote(event.target.value)} /></label>
              <label className="commerce-filter-field">Confirmed exchange bonus (₹)<input type="number" min="0" value={bonusQuote} onChange={event => setBonusQuote(event.target.value)} /></label>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Enter a quote obtained from your merchant. Selecting a model or condition does not create a quote. Eligibility, inspection and final value depend on the merchant.</p>
            {/* Price Upgrade Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white border border-indigo-200 shadow-xs space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
                <span>Listed product price:</span>
                <span>{cleanDealPrice > 0 ? `₹${cleanDealPrice.toLocaleString('en-IN')}` : 'Check store'}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-indigo-700">
                <span>Entered trade-in quote:</span>
                <span>-₹{exchangeBaseValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700">
                <span>Entered exchange bonus:</span>
                <span>-₹{exchangeBonus.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-indigo-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] block">Scenario upgrade cost:</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">You save ₹{totalExchangeSavings.toLocaleString('en-IN')} total</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-900">
                    ₹{netUpgradePrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Buy Button with Exchange */}
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-[var(--idh-action-solid)] hover:bg-[var(--idh-action-solid)] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Check exchange terms at {deal.store || 'Store'}</span>
              <span>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};



