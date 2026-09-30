import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EMICalculatorTool } from './EMICalculatorTool';
import { UnitPricingCalculatorTool } from './UnitPricingCalculatorTool';
import { ApplianceEnergyCostCalculatorTool } from './ApplianceEnergyCostCalculatorTool';
import { WarrantyExpiryTrackerTool } from './WarrantyExpiryTrackerTool';
import { SaleBudgetPlannerTool } from './SaleBudgetPlannerTool';

export type ToolId = 'emi' | 'unit_price' | 'energy' | 'warranty' | 'budget';

interface ToolMeta {
  id: ToolId;
  title: string;
  shortName: string;
  tagline: string;
  icon: string;
  badge: string;
}

const TOOLS_CATALOG: ToolMeta[] = [
  {
    id: 'emi',
    title: 'No-Cost EMI & Hidden Cost Analyzer',
    shortName: 'EMI Reality Check',
    tagline: 'Calculates 18% GST on interest & bank processing fees hidden in "0% Interest" schemes',
    icon: '💳',
    badge: 'BANKING',
  },
  {
    id: 'unit_price',
    title: 'Grocery Unit Price & Shrinkflation Detective',
    shortName: 'FMCG Unit Rates',
    tagline: 'Compare Blinkit, Zepto & Amazon pack sizes to find the true cheapest cost per 100g',
    icon: '⚖️',
    badge: 'QUICK COMMERCE',
  },
  {
    id: 'energy',
    title: 'Appliance 5-Year Electricity & BEE Payback',
    shortName: '5-Year Power Cost',
    tagline: 'Determine if paying ₹7,000 more for a 5-Star AC recovers its cost in electricity bills',
    icon: '⚡',
    badge: 'APPLIANCES',
  },
  {
    id: 'warranty',
    title: 'Gadget & Appliance Warranty Vault',
    shortName: 'Warranty Tracker',
    tagline: 'Track purchase dates, invoice numbers & official Indian service support directories',
    icon: '🛡️',
    badge: 'POST-PURCHASE',
  },
  {
    id: 'budget',
    title: 'Festival Sale Budget & Anti-FOMO Planner',
    shortName: 'Sale Budgeting',
    tagline: 'Allocate your Diwali / BBD budget and evaluate impulse regret risk score before buying',
    icon: '🎯',
    badge: 'FINANCIAL HEALTH',
  },
];

interface ToolsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToolId?: ToolId;
}

export const ToolsHubModal: React.FC<ToolsHubModalProps> = ({
  isOpen,
  onClose,
  initialToolId = 'emi',
}) => {
  const [activeToolId, setActiveToolId] = useState<ToolId>(initialToolId);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialToolId) {
      setActiveToolId(initialToolId);
    }
  }, [initialToolId]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS_CATALOG.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q);
  });

  const activeTool = TOOLS_CATALOG.find((t) => t.id === activeToolId) || TOOLS_CATALOG[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Utilities & Tools Hub"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
              🧰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">
                  Shopping Utilities &amp; Loot Lab
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  5 INDEPENDENT ENGINES
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                High-utility calculators and tools engineered specifically for Indian retail shoppers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tool Navigation Pill Strip */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {TOOLS_CATALOG.map((tool) => {
            const isActive = tool.id === activeToolId;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolId(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm">{tool.icon}</span>
                <span>{tool.shortName}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tool Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeToolId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeToolId === 'emi' && <EMICalculatorTool />}
              {activeToolId === 'unit_price' && <UnitPricingCalculatorTool />}
              {activeToolId === 'energy' && <ApplianceEnergyCostCalculatorTool />}
              {activeToolId === 'warranty' && <WarrantyExpiryTrackerTool />}
              {activeToolId === 'budget' && <SaleBudgetPlannerTool />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Status Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Engine:</span>
            <span className="font-bold text-slate-800">{activeTool.title}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {activeTool.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              100% Client-Side • Zero Data Stored on Servers
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
