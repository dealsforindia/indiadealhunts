import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface CardEmiSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PublicDeal | null;
}

interface BankCard {
  id: string;
  name: string;
  bank: string;
  discountType: 'flat' | 'percent';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  badge: string;
}

const BANK_CARDS: BankCard[] = [
  {
    id: 'hdfc_cc',
    name: 'HDFC Bank Credit Card',
    bank: 'HDFC',
    discountType: 'percent',
    value: 10,
    maxDiscount: 1500,
    minPurchase: 5000,
    badge: '10% Instant Off (Max ₹1,500)',
  },
  {
    id: 'icici_cc',
    name: 'ICICI Bank Credit Card',
    bank: 'ICICI',
    discountType: 'flat',
    value: 1250,
    minPurchase: 7500,
    badge: 'Flat ₹1,250 Instant Off',
  },
  {
    id: 'fk_axis',
    name: 'Flipkart Axis Bank Card',
    bank: 'Axis',
    discountType: 'percent',
    value: 5,
    badge: '5% Unlimited Cashback',
  },
  {
    id: 'amz_icici',
    name: 'Amazon Pay ICICI Card',
    bank: 'ICICI',
    discountType: 'percent',
    value: 5,
    badge: '5% Cashback for Prime',
  },
  {
    id: 'sbi_cc',
    name: 'SBI Credit Card',
    bank: 'SBI',
    discountType: 'flat',
    value: 1000,
    minPurchase: 5000,
    badge: 'Flat ₹1,000 Instant Off',
  },
];

export const CardEmiSimulatorModal: React.FC<CardEmiSimulatorModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  if (!isOpen || !deal) return null;

  const [selectedCardId, setSelectedCardId] = useState<string>('hdfc_cc');
  const [emiTenure, setEmiTenure] = useState<number>(3); // 3, 6, 9, 12 months

  const card = BANK_CARDS.find((c) => c.id === selectedCardId) || BANK_CARDS[0];

  // Calculate card discount
  let cardDiscount = 0;
  if (!card.minPurchase || deal.price >= card.minPurchase) {
    if (card.discountType === 'flat') {
      cardDiscount = card.value;
    } else {
      const pctVal = Math.round(deal.price * (card.value / 100));
      cardDiscount = card.maxDiscount ? Math.min(pctVal, card.maxDiscount) : pctVal;
    }
  }

  const priceAfterCard = Math.max(0, deal.price - cardDiscount);

  // EMI calculation (Assuming standard No-Cost EMI discount absorbs interest)
  const monthlyEmi = Math.round(priceAfterCard / emiTenure);

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
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                💳
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bank Card & EMI Simulator
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time net effective price after bank offers & no-cost EMI
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
            {/* Product Snapshot */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">📱</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{deal.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-black text-slate-900">₹{deal.price.toLocaleString('en-IN')}</span>
                  {deal.mrp && deal.mrp > deal.price && (
                    <span className="text-xs text-slate-400 line-through">₹{deal.mrp.toLocaleString('en-IN')}</span>
                  )}
                  {deal.discount_pct && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {deal.discount_pct}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Select Bank Card */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
                1. Select Your Payment Card
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BANK_CARDS.map((c) => {
                  const isSelected = c.id === selectedCardId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCardId(c.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 mt-1">{c.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* No-Cost EMI Tenure */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
                2. Choose No-Cost EMI Tenure
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 9, 12].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setEmiTenure(months)}
                    className={`py-2 px-3 rounded-xl text-center border transition-all cursor-pointer ${
                      emiTenure === months
                        ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent font-medium text-xs'
                    }`}
                  >
                    <span className="block text-sm font-bold">{months}M</span>
                    <span className="text-[10px] opacity-80">₹{Math.round(priceAfterCard / months).toLocaleString('en-IN')}/mo</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown Calculation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Original Deal Price:</span>
                <span>₹{deal.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700">
                <span>Card Instant Discount ({card.bank}):</span>
                <span>-₹{cardDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Final Net Price:</span>
                  <span className="text-[11px] text-slate-500">Payable in {emiTenure} installments</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{priceAfterCard.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-xs font-bold text-slate-600">
                    Just ₹{monthlyEmi.toLocaleString('en-IN')} / month
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Buy Button */}
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Apply Offer on {deal.store || 'Store'}</span>
              <span>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
