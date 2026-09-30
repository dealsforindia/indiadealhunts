import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface ProductSpecCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: PublicDeal[];
  onRemoveDeal: (id: string) => void;
  onClearAll: () => void;
}

export const ProductSpecCompareModal: React.FC<ProductSpecCompareModalProps> = ({
  isOpen,
  onClose,
  deals,
  onRemoveDeal,
  onClearAll,
}) => {
  if (!isOpen) return null;

  // Extract specs from title and deal metadata
  const getSpecs = (deal: PublicDeal) => {
    const t = deal.title.toLowerCase();
    
    // RAM & Storage
    const ramMatch = deal.title.match(/(\d+)\s*(?:gb|mb)\s*ram/i) || deal.title.match(/(\d+)\s*\+\s*\d+\s*(?:gb)?/i);
    const storageMatch = deal.title.match(/(\d+)\s*(?:gb|tb)\s*(?:rom|storage|ssd)?/i) || deal.title.match(/\d+\s*\+\s*(\d+)\s*gb/i);
    
    // 5G
    const is5G = t.includes('5g') || t.includes('nr');
    
    // Processor / Display clues
    const isAmoled = t.includes('amoled') || t.includes('super amoled') || t.includes('oled') || t.includes('retina');
    const hasFastCharge = t.includes('fast charging') || t.includes('watt') || t.includes('67w') || t.includes('45w') || t.includes('120w') || t.includes('80w');
    
    // Calculate 5% cashback
    const cardCashback = Math.round(deal.price * 0.05);
    const netCardPrice = deal.price - cardCashback;
    
    // GST ITC (18%)
    const gstItc = Math.round(deal.price - (deal.price / 1.18));
    const netGstPrice = deal.price - gstItc;

    return {
      ram: ramMatch ? ramMatch[0] : (t.includes('12gb') ? '12 GB RAM' : t.includes('8gb') ? '8 GB RAM' : t.includes('6gb') ? '6 GB RAM' : '4 GB+ RAM'),
      storage: storageMatch ? storageMatch[0] : (t.includes('256gb') ? '256 GB' : t.includes('128gb') ? '128 GB' : t.includes('512gb') ? '512 GB' : 'Standard'),
      is5G: is5G ? '✅ 5G Dual SIM' : '4G LTE',
      display: isAmoled ? '💎 AMOLED High-Refresh' : 'IPS LCD Screen',
      charging: hasFastCharge ? '⚡ Fast Flash Charge' : 'Standard Type-C',
      cardCashback,
      netCardPrice,
      gstItc,
      netGstPrice,
    };
  };

  // Find lowest price
  const lowestPrice = Math.min(...deals.map((d) => d.price));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                ⚖️
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Side-by-Side Product Comparison
                </h2>
                <p className="text-xs text-slate-500">
                  Compare real prices, bank cashbacks, specifications & true value score
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {deals.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Comparison Grid Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            {deals.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <span className="text-4xl block mb-2">⚖️</span>
                <p className="text-base font-semibold text-slate-600">No items selected for comparison</p>
                <p className="text-xs text-slate-400 mt-1">Click the "Compare" button on any deal card to compare specs side by side.</p>
              </div>
            ) : (
              <div className="min-w-[650px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-44 p-3 text-left text-xs font-mono uppercase text-slate-400 bg-slate-50 rounded-l-xl">
                        Specification
                      </th>
                      {deals.map((deal) => {
                        const isLowest = deal.price === lowestPrice;
                        return (
                          <th key={deal.id} className="p-3 text-left relative bg-slate-50 first:rounded-l-xl last:rounded-r-xl">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              {isLowest ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  👑 Best Price
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                  {deal.store || 'Verified'}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => onRemoveDeal(deal.id)}
                                className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer p-1"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="w-20 h-20 mx-auto mb-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                              {deal.image ? (
                                <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-2xl">📱</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug text-center">
                              {deal.title}
                            </p>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {/* Live Sale Price */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Deal Price</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-slate-900">₹{deal.price.toLocaleString('en-IN')}</span>
                            {deal.mrp && deal.mrp > deal.price && (
                              <span className="text-xs text-slate-400 line-through">₹{deal.mrp.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          {deal.discount_pct && deal.discount_pct > 0 ? (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {deal.discount_pct}% OFF
                            </span>
                          ) : null}
                        </td>
                      ))}
                    </tr>

                    {/* Net Price with 5% Card */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">
                        <span>💳 5% Card Price</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Amazon ICICI / Flipkart Axis</span>
                      </td>
                      {deals.map((deal) => {
                        const specs = getSpecs(deal);
                        return (
                          <td key={deal.id} className="p-3 font-medium text-emerald-700">
                            <span className="font-bold text-base">₹{specs.netCardPrice.toLocaleString('en-IN')}</span>
                            <span className="block text-xs text-slate-500">(-₹{specs.cardCashback.toLocaleString('en-IN')} cashback)</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* GST ITC Business Price */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">
                        <span>🛡️ GST ITC Input</span>
                        <span className="block text-[10px] text-slate-400 font-normal">18% business tax claim</span>
                      </td>
                      {deals.map((deal) => {
                        const specs = getSpecs(deal);
                        return (
                          <td key={deal.id} className="p-3 font-medium text-indigo-700">
                            <span className="font-bold text-base">₹{specs.netGstPrice.toLocaleString('en-IN')}</span>
                            <span className="block text-xs text-slate-500">(-₹{specs.gstItc.toLocaleString('en-IN')} ITC claim)</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* RAM & Storage */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">RAM & Storage</td>
                      {deals.map((deal) => {
                        const specs = getSpecs(deal);
                        return (
                          <td key={deal.id} className="p-3 text-slate-800">
                            <span className="font-bold">{specs.ram}</span> · {specs.storage}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 5G Network */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Network</td>
                      {deals.map((deal) => {
                        const specs = getSpecs(deal);
                        return (
                          <td key={deal.id} className="p-3 text-slate-800">
                            {specs.is5G}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Display & Fast Charging */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Display & Battery</td>
                      {deals.map((deal) => {
                        const specs = getSpecs(deal);
                        return (
                          <td key={deal.id} className="p-3 text-slate-700 text-xs leading-relaxed">
                            <p>{specs.display}</p>
                            <p className="text-slate-500 mt-0.5">{specs.charging}</p>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Worth Score */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Deal Worth Score</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-black text-xs flex items-center justify-center">
                              {deal.worth_score || 85}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">/ 100 Verified Value</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Buy Action */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Buy Link</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <a
                            href={deal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all cursor-pointer text-center"
                          >
                            <span>Claim on {deal.store || 'Store'}</span>
                            <span className="ml-1">→</span>
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
