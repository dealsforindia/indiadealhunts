import React, { useState } from 'react';
import { X, CreditCard, Sparkles, Check, Info, ShieldCheck, Zap } from 'lucide-react';
import { SUPPORTED_CREDIT_CARDS, getSavedCards, saveSelectedCards } from '../utils/cardSavings';

interface CardCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardsUpdated?: (cards: string[]) => void;
}

export const CardCalculatorModal: React.FC<CardCalculatorModalProps> = ({
  isOpen,
  onClose,
  onCardsUpdated,
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>(() => getSavedCards());

  if (!isOpen) return null;

  const toggleCard = (id: string) => {
    const updated = selectedCards.includes(id)
      ? selectedCards.filter((c) => c !== id)
      : [...selectedCards, id];
    setSelectedCards(updated);
    saveSelectedCards(updated);
    if (onCardsUpdated) onCardsUpdated(updated);
  };

  const handleSelectAll = () => {
    const all = SUPPORTED_CREDIT_CARDS.map((c) => c.id);
    setSelectedCards(all);
    saveSelectedCards(all);
    if (onCardsUpdated) onCardsUpdated(all);
  };

  const handleClearAll = () => {
    setSelectedCards([]);
    saveSelectedCards([]);
    if (onCardsUpdated) onCardsUpdated([]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B0F19] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="touch-target min-h-[44px] min-w-[44px] absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer focus-ring"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-bold text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Personalized Cashback Engine</span>
          </div>
          <h2 id="card-modal-title" className="text-2xl sm:text-3xl font-bold font-brand text-white tracking-tight mb-2">
            Select Your Credit Cards
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Choose the cards you own. We'll automatically calculate your exclusive <strong className="text-emerald-400">"Your Price"</strong> with 2% to 10% instant cashback on every single loot drop!
          </p>
        </div>

        {/* Quick Bulk Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-400">
            {selectedCards.length} of {SUPPORTED_CREDIT_CARDS.length} cards active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-slate-300 font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {SUPPORTED_CREDIT_CARDS.map((card) => {
            const isSelected = selectedCards.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between min-h-[115px] ${
                  isSelected
                    ? `bg-gradient-to-br ${card.colorGradient} ${card.borderColor} shadow-lg shadow-black/40 ring-1 ring-white/20`
                    : 'bg-[#111625] border-white/[0.08] hover:border-white/20 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Card Top: Chip & Checkbox */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${isSelected ? card.accentColor : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {card.bank}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 bg-black/40'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Card Name */}
                <div className="font-brand font-bold text-white text-sm sm:text-base leading-tight mb-1">
                  {card.name}
                </div>

                {/* Reward Highlight */}
                <div className="text-[11.5px] font-semibold text-slate-300 flex items-center gap-1">
                  <Zap className={`w-3 h-3 ${isSelected ? card.accentColor : 'text-slate-500'}`} />
                  <span>{card.rewardText}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Callout */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200/90 leading-relaxed">
            <strong className="text-white block mb-0.5">Privacy First Guarantee</strong>
            Your card choices are strictly saved on your own device (`localStorage`). We never ask for card numbers, OTPs, or financial accounts.
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-black text-sm tracking-tight flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Apply Card Discounts & View Deals</span>
        </button>
      </div>
    </div>
  );
};
