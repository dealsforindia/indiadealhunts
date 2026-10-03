import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';
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

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] p-6 sm:p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] text-slate-500 hover:text-slate-900 dark:text-[#F1F5F9] flex items-center justify-center transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>CREDIT CARD CASHBACK ENGINE</span>
          </div>
          <h2 id="card-modal-title" className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight mb-2">
            Select Your Active Credit Cards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Select the shopping cards in your wallet. We'll automatically compute your exclusive <strong className="text-blue-700">"Effective Card Price"</strong> with 5% to 10% extra cashback on verified loot drops!
          </p>
        </div>

        {/* Quick Bulk Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
            {selectedCards.length} of {SUPPORTED_CREDIT_CARDS.length} cards active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-[#F1F5F9] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#111C33] hover:bg-slate-200 dark:bg-[#172440] transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {SUPPORTED_CREDIT_CARDS.map((card) => {
            const isSelected = selectedCards.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-200 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-[#070A11]/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:bg-[#070A11]'
                }`}
              >
                {/* Card Top: Bank & Checkbox */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {card.bank}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-white/20 bg-white dark:bg-[#0D1527]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Card Name */}
                <div className="font-heading font-extrabold text-slate-900 dark:text-[#F1F5F9] text-sm leading-tight mb-1">
                  {card.name}
                </div>

                {/* Reward Highlight */}
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Zap className={`w-3 h-3 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>{card.rewardText}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Callout */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 mb-5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong className="block mb-0.5">100% Client-Side Privacy</strong>
            Your card preferences are stored solely on your device (`localStorage`). We never request card numbers, CVVs, or financial data.
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Apply Card Discounts & View Feed
        </button>
      </div>
    </div>,
    document.body
  );
};
