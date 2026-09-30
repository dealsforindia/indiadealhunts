import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconShieldCheck, IconExternalLink } from './Icons';

interface HowDealsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFullPage?: () => void;
}

interface PipelineStep {
  id: string;
  number: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  description: string;
  telemetry: {
    latency: string;
    action: string;
    rejectionRule: string;
  };
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'ingestion',
    number: '01',
    title: 'Multi-Channel Stream Ingestion',
    badge: 'Ingestion Layer',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    icon: '📡',
    description:
      'Scrapes drops 24/7 across 27 Telegram deal channels and DesiDime discussion threads in sub-second event loops. Captures raw markdown, product images, and tracking links.',
    telemetry: {
      latency: '< 150ms per drop',
      action: '27 channels monitored in real time',
      rejectionRule: 'Drops from paused or unverified channels discarded immediately',
    },
  },
  {
    id: 'unshorten',
    number: '02',
    title: 'Deep Unshortener & Canonical Extraction',
    badge: 'Link Layer',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: '🔗',
    description:
      'Recursively follows up to 5 redirect hops across 25+ shortlink domains (e.g. fpkrt.cc, amzn.to, wishlink, lehlah). Extracts canonical product identifiers (Amazon ASIN, Flipkart PID) and strips tracking cookies.',
    telemetry: {
      latency: '220ms median',
      action: 'Pure canonical destination resolved',
      rejectionRule: 'Broken redirects or non-product landing pages rejected',
    },
  },
  {
    id: 'consensus',
    number: '03',
    title: 'Consensus Clustering & Anti-Duplication',
    badge: 'Consensus Engine',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: '🔥',
    description:
      'Clusters simultaneous sightings across channels using normalized product keys. When 3+ independent channels post the same drop within 10 minutes, a golden "Spotted by N Channels" consensus badge is awarded.',
    telemetry: {
      latency: '< 50ms (in-memory lookup)',
      action: 'Multiple sightings merged into 1 card',
      rejectionRule: 'Identical product postings within 12h deduplicated into 1 thread',
    },
  },
  {
    id: 'ai_gate',
    number: '04',
    title: 'AI Copywriter & Price Sanity Gate',
    badge: 'Quality Gate',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: '🤖',
    description:
      'Multi-LLM cascade (Cerebras → Groq → Gemini) cleans promotional noise, formats clean specs, and benchmarks the current price against 90-day historic pricing. Fake pre-inflated discounts and credit card referral schemes are purged.',
    telemetry: {
      latency: '850ms multi-LLM run',
      action: 'Clean specs, verified MRP, emoji formatting',
      rejectionRule: 'Credit card promotions, loans, and missing-image items held in review',
    },
  },
  {
    id: 'sentinel',
    number: '05',
    title: '300s Stock & Price Sentinel Loop',
    badge: 'Telemetry Sentinel',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    icon: '⚡',
    description:
      'Our background sentinel daemon sweeps live retailer pages every 5 minutes (300 seconds). If a deal goes out-of-stock or the price jumps by 15%+, live broadcasts on Telegram and IndiaDealHunts are automatically labeled Expired with strikethrough pricing.',
    telemetry: {
      latency: 'Rolling 300s automated sweep',
      action: 'Auto-edits Telegram posts & updates website',
      rejectionRule: 'Sold-out products marked with instant "Sold Out" red badge',
    },
  },
];

export const HowDealsWorkModal: React.FC<HowDealsWorkModalProps> = ({
  isOpen,
  onClose,
  onViewFullPage,
}) => {
  const [selectedStep, setSelectedStep] = useState<string>('ingestion');

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

  const currentStep = PIPELINE_STEPS.find((s) => s.id === selectedStep) || PIPELINE_STEPS[0];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-10 overscroll-contain"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  How IndiaDealHunts Verifies Deals
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Autonomous Pipeline
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Every drop is audited through our 5-stage automated pipeline to filter inflated MRPs, dead links, and spam.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-lg font-mono leading-none"
            >
              ✕
            </button>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 bg-slate-50/80 overflow-x-auto scrollbar-none">
            {PIPELINE_STEPS.map((step) => {
              const isActive = step.id === selectedStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-white text-slate-900 border-slate-300 shadow-xs font-bold'
                      : 'bg-transparent text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{step.number}</span>
                  <span>{step.icon}</span>
                  <span>{step.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Step Detail Card Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentStep.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      STAGE {currentStep.number} OF 05
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${currentStep.badgeColor}`}
                    >
                      {currentStep.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 text-sm text-slate-600 leading-relaxed">
              {currentStep.description}
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Processing Speed
                </div>
                <div className="text-sm font-bold text-emerald-600 font-mono mt-1">
                  {currentStep.telemetry.latency}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Verification Action
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {currentStep.telemetry.action}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Rejection Gate
                </div>
                <div className="text-xs font-semibold text-rose-600 mt-1">
                  {currentStep.telemetry.rejectionRule}
                </div>
              </div>
            </div>

            {/* Live Pipeline Flow Graphic Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>📡 Ingestion</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-slate-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>🔗 Unshorten</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-amber-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>🔥 Dedup</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-purple-600 flex items-center gap-1 flex-shrink-0 font-medium">
                <span>🤖 AI Gate</span>
              </span>
              <span className="text-slate-400 px-2 flex-shrink-0">➔</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1 flex-shrink-0">
                <span>⚡ Storefront Feed</span>
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-400 hidden sm:inline">
              100% Free & Transparent • Powered by DealFlow Autonomous Workers
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {onViewFullPage && (
                <button
                  onClick={() => {
                    onClose();
                    onViewFullPage();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read Full Methodology</span>
                  <IconExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
