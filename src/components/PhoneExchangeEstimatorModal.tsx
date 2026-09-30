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
  if (!isOpen || !deal) return null;

  const [selectedModel, setSelectedModel] = useState<string>(POPULAR_OLD_PHONES[1].name);
  const [selectedCondition, setSelectedCondition] = useState<string>('good');

  const modelObj = POPULAR_OLD_PHONES.find((m) => m.name === selectedModel) || POPULAR_OLD_PHONES[1];
  const condObj = CONDITIONS.find((c) => c.id === selectedCondition) || CONDITIONS[1];

  const exchangeBaseValue = Math.round(modelObj.baseValue * condObj.multiplier);
  // Special Exchange bonus if deal is flagship (> ₹20k)
  const exchangeBonus = deal.price >= 20000 ? 2500 : 1000;
  const totalExchangeSavings = exchangeBaseValue + exchangeBonus;
  const netUpgradePrice = Math.max(0, deal.price - totalExchangeSavings);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                🔄
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Old Phone Trade-In & Exchange Estimator
                </h2>
                <p className="text-xs text-slate-500">
                  Estimate exchange bonus and upgrade cost for this deal
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

          <div className="p-6 space-y-6">
            {/* Target New Product */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">📱</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">New Device Target:</span>
                <p className="text-xs font-bold text-slate-900 truncate">{deal.title}</p>
                <p className="text-base font-black text-slate-900 mt-0.5">₹{deal.price.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Select Old Model */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
                1. Select Your Current Smartphone
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none"
              >
                {POPULAR_OLD_PHONES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} (Max Value: ₹{m.baseValue.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Picker */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
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
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">{c.label}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Upgrade Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white border border-indigo-200 shadow-xs space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>New Phone Deal Price:</span>
                <span>₹{deal.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-indigo-700">
                <span>Device Residual Trade-in Value:</span>
                <span>-₹{exchangeBaseValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700">
                <span>Festive Upgrade Bonus:</span>
                <span>-₹{exchangeBonus.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-indigo-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Net Upgrade Cost:</span>
                  <span className="text-[11px] text-slate-500">You save ₹{totalExchangeSavings.toLocaleString('en-IN')} total</span>
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
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Exchange & Buy on {deal.store || 'Store'}</span>
              <span>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
