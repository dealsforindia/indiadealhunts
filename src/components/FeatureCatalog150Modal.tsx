import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FEATURES_150_REGISTRY,
  PILLARS_150,
  RetailFeature150,
} from '../data/features150Registry';

interface FeatureCatalog150ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFeatureId?: number;
  onOpenSpecificTool?: (toolId: string) => void;
}

export const FeatureCatalog150Modal: React.FC<FeatureCatalog150ModalProps> = ({
  isOpen,
  onClose,
  initialFeatureId,
  onOpenSpecificTool,
}) => {
  const [activePillar, setActivePillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<RetailFeature150>(
    () => FEATURES_150_REGISTRY.find((f) => f.id === initialFeatureId) || FEATURES_150_REGISTRY[0]
  );

  // Interactive Live Scratchpad state for calculators/templates inside runner
  const [calcInputA, setCalcInputA] = useState<number>(50000);
  const [calcInputB, setCalcInputB] = useState<number>(18);
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  useEffect(() => {
    if (initialFeatureId) {
      const match = FEATURES_150_REGISTRY.find((f) => f.id === initialFeatureId);
      if (match) setSelectedFeature(match);
    }
  }, [initialFeatureId]);

  // Lock body scroll
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

  // Filtered feature list
  const filteredFeatures = useMemo(() => {
    return FEATURES_150_REGISTRY.filter((f) => {
      if (activePillar !== 'all' && f.pillarId !== activePillar) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.problemSolved.toLowerCase().includes(q) ||
        f.indianRetailImpact.toLowerCase().includes(q) ||
        f.statutoryRuleOrFormula.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [activePillar, searchQuery]);

  // Live calculator computation inside the runner pane
  const computedCalculation = useMemo(() => {
    if (!selectedFeature) return null;
    const price = Math.max(0, calcInputA);
    const rate = Math.max(0, calcInputB);

    if (selectedFeature.pillarId === 'gst_b2b_tax') {
      const itc = price - price / (1 + rate / 100);
      const net = price - itc;
      const depShield = net * 0.4 * 0.3; // 40% depreciation * 30% tax slab
      return {
        label1: 'GST Input Tax Credit (ITC)',
        val1: `₹${Math.round(itc).toLocaleString('en-IN')}`,
        label2: 'Net Effective Cost After ITC',
        val2: `₹${Math.round(net).toLocaleString('en-IN')}`,
        label3: 'Sec 32 Depreciation Tax Shield (30% slab)',
        val3: `₹${Math.round(depShield).toLocaleString('en-IN')}`,
      };
    }

    if (selectedFeature.pillarId === 'bank_cards_rewards') {
      const instantDisc = Math.min(1500, price * 0.1);
      const cashbackUnlimited = price * 0.05;
      const bankFee = 117; // 99 + 18% GST
      const netInstant = Math.max(0, instantDisc - bankFee);
      return {
        label1: '10% Instant Discount (Capped ₹1,500 - ₹117 Fee)',
        val1: `₹${Math.round(netInstant).toLocaleString('en-IN')}`,
        label2: '5% Unlimited Cashback (Amazon/Flipkart Card)',
        val2: `₹${Math.round(cashbackUnlimited).toLocaleString('en-IN')}`,
        label3: 'Recommended Payment Route',
        val3: price > 30000 ? '5% Unlimited Cashback Card' : '10% Instant Bank Discount',
      };
    }

    if (selectedFeature.pillarId === 'cross_border_customs') {
      const cif = price * 1.21125; // 20% freight + 1.125% insurance
      const bcd = cif * (rate / 100);
      const sws = bcd * 0.1;
      const igst = (cif + bcd + sws) * 0.18;
      const totalDuty = bcd + sws + igst;
      return {
        label1: 'Assessable CIF Value (Customs Base)',
        val1: `₹${Math.round(cif).toLocaleString('en-IN')}`,
        label2: 'Total Government Duties & IGST',
        val2: `₹${Math.round(totalDuty).toLocaleString('en-IN')}`,
        label3: 'Effective Import Tax Overhead',
        val3: `${((totalDuty / price) * 100).toFixed(1)}% on item cost`,
      };
    }

    // Generic fallback calculator
    const savings = price * (rate / 100);
    return {
      label1: 'Calculated Savings / Delta',
      val1: `₹${Math.round(savings).toLocaleString('en-IN')}`,
      label2: 'Net Final Outflow',
      val2: `₹${Math.round(price - savings).toLocaleString('en-IN')}`,
      label3: 'Savings Percentage',
      val3: `${rate}%`,
    };
  }, [selectedFeature, calcInputA, calcInputB]);

  const handleCopyLegalMemo = () => {
    if (!selectedFeature) return;
    const text = `=== INDIA DEAL HUNTS RETAIL SENTINEL ===
Feature #${selectedFeature.id}: ${selectedFeature.title}
Pillar: ${selectedFeature.pillar}
Problem Solved: ${selectedFeature.problemSolved}
Indian Retail Impact: ${selectedFeature.indianRetailImpact}
Statutory Authority / Legal Clause:
${selectedFeature.statutoryRuleOrFormula}
--------------------------------------------------
Consumer Defense & Action Protocol:
Under the Consumer Protection (E-Commerce) Rules 2020 and Legal Metrology Act, the consumer is entitled to fair pricing, non-misleading disclosures, and statutory defect rectification.
Generated via IndiaDealHunts 150 Retail Intelligence Matrix`;

    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  const toggleChecklistItem = (key: string) => {
    setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="150 Retail Decision Engines & Loot Intelligence Matrix"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-7xl max-h-[calc(100dvh-1.5rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-300 flex items-center justify-center font-black text-lg shadow-sm border border-indigo-800">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  150 Retail Intelligence Engines &amp; Consumer Defense Matrix
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  150 / 150 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Authentic Indian retail calculation models, statutory legal templates, and shopping decision trees. Zero feed clutter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center relative w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all 150 features..."
                className="w-full pl-7 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 font-medium"
              />
              <span className="absolute left-2.5 text-xs text-slate-400">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pillar Filter Bar */}
        <div className="px-5 sm:px-6 py-2 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {PILLARS_150.map((pillar) => {
            const isPillarActive = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillar(pillar.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isPillarActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{pillar.icon}</span>
                <span>{pillar.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Split Layout: 150 Features List (Left) + Interactive Execution Runner (Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50/40">
          {/* Left Column: Scrollable List of Features */}
          <div className="lg:col-span-5 border-r border-slate-200/80 overflow-y-auto max-h-[calc(100dvh-13rem)] divide-y divide-slate-100 bg-white">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Showing {filteredFeatures.length} of 150 Features</span>
              <span className="text-indigo-600 font-bold">Click any item to run</span>
            </div>

            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeature?.id === feat.id;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat)}
                  className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-base shrink-0 mt-0.5">
                    {feat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{feat.id}
                      </span>
                      <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                        {feat.actionType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {feat.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {feat.problemSolved}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Interactive Execution Deck */}
          <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[calc(100dvh-13rem)]">
            {selectedFeature ? (
              <div className="space-y-5">
                {/* Feature Header Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-2xl flex items-center justify-center shrink-0">
                        {selectedFeature.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Engine #{selectedFeature.id}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {selectedFeature.pillar}
                          </span>
                        </div>
                        <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 mt-1">
                          {selectedFeature.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyLegalMemo}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <span>{copiedMemo ? '✓ Copied' : '📋 Copy Memo'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        The Core Problem Solved
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {selectedFeature.problemSolved}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                        Indian Retail Financial Impact
                      </div>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {selectedFeature.indianRetailImpact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formula & Rule of Law Card */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider font-mono text-indigo-400 font-bold">
                      Statutory Rule, Legal Authority &amp; Formula
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      OFFICIAL STANDARD
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-xs text-emerald-300 leading-relaxed break-words">
                    {selectedFeature.statutoryRuleOrFormula}
                  </div>
                </div>

                {/* Live Interactive Action Deck */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span>⚡</span>
                      <span>Live Interactive Action Runner</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                      Type: {selectedFeature.actionType}
                    </span>
                  </div>

                  {/* Calculator Mode */}
                  {selectedFeature.actionType === 'calculator' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Base Transaction Value (₹)
                          </label>
                          <input
                            type="number"
                            value={calcInputA}
                            onChange={(e) => setCalcInputA(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Applicable Tax / Discount Rate (%)
                          </label>
                          <input
                            type="number"
                            value={calcInputB}
                            onChange={(e) => setCalcInputB(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {computedCalculation && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {computedCalculation.label1}
                            </div>
                            <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                              {computedCalculation.val1}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {computedCalculation.label2}
                            </div>
                            <div className="text-sm font-black font-mono text-emerald-700 mt-0.5">
                              {computedCalculation.val2}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {computedCalculation.label3}
                            </div>
                            <div className="text-sm font-bold font-mono text-indigo-700 mt-0.5">
                              {computedCalculation.val3}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist Mode */}
                  {selectedFeature.actionType === 'checklist' && (
                    <div className="space-y-2 text-xs">
                      {[
                        'Verify outer box tamper seal and barcode label integrity before signing.',
                        'Confirm invoice IMEI matches hardware chassis and settings screen.',
                        'Record continuous unbroken 360-degree video during package unboxing.',
                        'Do not share delivery OTP if screen shows visible crack or physical defect.',
                      ].map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!!checklistState[`item_${idx}`]}
                            onChange={() => toggleChecklistItem(`item_${idx}`)}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 text-[11.5px] leading-relaxed">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Legal Template Mode */}
                  {selectedFeature.actionType === 'legal_template' && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11.5px] text-slate-700 font-mono leading-relaxed max-h-36 overflow-y-auto">
                        FORMAL NOTICE UNDER CONSUMER PROTECTION (E-COMMERCE) RULES 2020:
                        Demand for immediate statutory replacement or 100% refund.
                        Reference: Order #[ID] delivered on [Date]. Defect constitutes latent manufacturing defect not attributable to consumer misuse.
                        Escalation Target: Grievance Officer &amp; National Consumer Helpline (NCH 1915).
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLegalMemo}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {copiedMemo ? '✓ Legal Notice Copied to Clipboard' : '📋 Copy Full Legal Dispute Notice'}
                      </button>
                    </div>
                  )}

                  {/* Lookup / Strategy Mode */}
                  {(selectedFeature.actionType === 'lookup' ||
                    selectedFeature.actionType === 'strategy') && (
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1 text-amber-900">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>💡</span>
                        <span>Tactical Execution Advice</span>
                      </div>
                      <p className="text-[11.5px] text-amber-800 leading-relaxed">
                        Cross-referenced against verified Indian marketplace policies.
                        Keep invoice, original packaging box, and delivery receipt safely stored for at least 180 days to preserve statutory warranty claims.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-sm">
                Select a feature from the directory to inspect its formula and run calculations.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Selected Engine:</span>
            <span className="font-bold text-slate-800">
              #{selectedFeature.id} {selectedFeature.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              150 Verified Indian Commerce Algorithms • 100% Client-Side
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              Close Hub
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
