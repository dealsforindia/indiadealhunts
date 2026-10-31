import { useModalSurface } from '../utils/useModalSurface';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicDeal } from '../types';

interface ProductSpecCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: PublicDeal[];
  onRemoveDeal: (id: string) => void;
  onClearAll: () => void;
  onBack?: () => void;
}

type ProductDomain = 'phone' | 'laptop' | 'audio' | 'fashion' | 'home' | 'beauty' | 'general';

function detectDomain(deal: PublicDeal): ProductDomain {
  const t = (deal.title || '').toLowerCase();
  const c = (deal.category || '').toLowerCase();

  if (/\b(phone|smartphone|smartphones|iphone|galaxy|oneplus|realme|redmi|iqoo|poco|motorola|vivo|oppo|xiaomi|pixel)\b/i.test(t) || c.includes('mobile')) {
    return 'phone';
  }
  if (/\b(laptop|notebook|macbook|thinkpad|ideapad|vivobook|zenbook|tuf|victus|pavilion|inspiron)\b/i.test(t) || c.includes('laptop')) {
    return 'laptop';
  }
  if (/\b(earbuds|tws|headphones|earphones|neckband|headset|soundbar|speaker)\b/i.test(t) || c.includes('audio')) {
    return 'audio';
  }
  if (/\b(shoes|sneakers|shirt|t-shirt|jeans|trousers|jacket|kurta|watch|smartwatch|dress|kurti|saree|sandals)\b/i.test(t) || c.includes('fashion')) {
    return 'fashion';
  }
  if (/\b(air fryer|cooker|kettle|blender|mixer|pan|carpet|curtain|bedsheet|blanket|purifier|iron)\b/i.test(t) || c.includes('home') || c.includes('kitchen')) {
    return 'home';
  }
  if (/\b(face wash|sunscreen|moisturizer|shampoo|lotion|serum|cream|soap|perfume|deodorant)\b/i.test(t) || c.includes('beauty') || c.includes('grocery')) {
    return 'beauty';
  }
  return 'general';
}

function getProductAttributes(deal: PublicDeal) {
  const domain = detectDomain(deal);
  const t = (deal.title || '').toLowerCase();

  // Price calculations
  const cleanPrice = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const cardCashback = Math.round(cleanPrice * 0.05);
  const netCardPrice = Math.max(0, cleanPrice - cardCashback);

  const isB2BEligible = ['phone', 'laptop', 'audio'].includes(domain) && cleanPrice >= 1500;
  const gstItc = isB2BEligible ? Math.round(cleanPrice - cleanPrice / 1.18) : 0;
  const netGstPrice = isB2BEligible ? Math.max(0, cleanPrice - gstItc) : cleanPrice;

  let specRow1Label = 'Category';
  let specRow1Value = 'General Retail';
  let specRow2Label = 'Key Feature';
  let specRow2Value = 'Not supplied';

  if (domain === 'phone') {
    specRow1Label = 'RAM & Storage';
    const ram = deal.title.match(/(\d+)\s*(?:gb|mb)\s*ram/i) || deal.title.match(/(\d+)\s*\+\s*\d+\s*(?:gb)?/i);
    const storage = deal.title.match(/(\d+)\s*(?:gb|tb)\s*(?:rom|storage|ssd)?/i) || deal.title.match(/\d+\s*\+\s*(\d+)\s*gb/i);
    if (ram && storage) {
      specRow1Value = `${ram[0].toUpperCase()} · ${storage[0].toUpperCase()}`;
    } else if (storage) {
      specRow1Value = `${storage[0].toUpperCase()} Storage`;
    } else {
      specRow1Value = 'Not supplied';
    }

    specRow2Label = 'Network & Connectivity';
    specRow2Value = t.includes('5g') ? '✅ 5G High-Speed' : 'Not supplied';
  } else if (domain === 'laptop') {
    specRow1Label = 'Processor & RAM';
    const cpu = deal.title.match(/(i[3579]|ryzen\s*[3579]|m[123]|snapdragon)/i);
    const ram = deal.title.match(/(\d+)\s*gb\s*ram/i);
    specRow1Value = `${cpu ? cpu[0].toUpperCase() : 'Processor not supplied'} · ${ram ? ram[0].toUpperCase() : 'RAM not supplied'}`;

    specRow2Label = 'Storage & OS';
    const ssd = deal.title.match(/(\d+)\s*(?:gb|tb)\s*ssd/i);
    specRow2Value = ssd ? `${ssd[0].toUpperCase()} Fast SSD` : 'Not supplied';
  } else if (domain === 'audio') {
    specRow1Label = 'Audio Type';
    if (t.includes('tws') || t.includes('earbuds')) specRow1Value = 'True Wireless (TWS)';
    else if (t.includes('neckband')) specRow1Value = 'Wireless Neckband';
    else if (t.includes('headphones')) specRow1Value = 'Over-Ear Headphones';
    else if (t.includes('soundbar')) specRow1Value = 'Home Audio Soundbar';
    else specRow1Value = 'Not supplied';

    specRow2Label = 'Special Feature';
    if (/\banc\b|active noise cancellation/i.test(t)) specRow2Value = 'Title mentions ANC · confirm specification';
    else if (t.includes('bass')) specRow2Value = '🔊 Deep Bass Boost';
    else specRow2Value = 'Not supplied';
  } else if (domain === 'fashion') {
    specRow1Label = 'Style & Apparel';
    if (t.includes('sneaker') || t.includes('shoes')) specRow1Value = '👟 Footwear / Sneakers';
    else if (t.includes('shirt') || t.includes('t-shirt')) specRow1Value = '👕 Casual Apparel';
    else if (t.includes('watch')) specRow1Value = '⌚ Wristwatch / Tracker';
    else specRow1Value = 'Fashion Lifestyle';

    specRow2Label = 'Brand & Quality';
    specRow2Value = 'Authenticity not independently checked';
  } else if (domain === 'home') {
    specRow1Label = 'Appliance Type';
    specRow1Value = 'Home & Kitchen Utility';
    specRow2Label = 'Power & Warranty';
    specRow2Value = 'Warranty details not supplied';
  } else if (domain === 'beauty') {
    specRow1Label = 'Product Category';
    specRow1Value = 'Beauty & Personal Care';
    specRow2Label = 'Authenticity';
    specRow2Value = 'Authenticity not independently checked';
  }

  return {
    domain,
    specRow1Label,
    specRow1Value,
    specRow2Label,
    specRow2Value,
    isB2BEligible,
    cardCashback,
    netCardPrice,
    gstItc,
    netGstPrice,
  };
}

export const ProductSpecCompareModal: React.FC<ProductSpecCompareModalProps> = ({
  isOpen,
  onClose,
  deals,
  onRemoveDeal,
  onClearAll,
  onBack,
}) => {
  const modalSurface = useModalSurface(isOpen, onClose);
  if (!isOpen) return null;

  const lowestPrice = deals.length > 0 ? Math.min(...deals.map((d) => Number(d.price ?? d.sale_price ?? d.prices?.sale) || 0)) : 0;
  const anyPhone = deals.some((d) => detectDomain(d) === 'phone');
  const anyLaptop = deals.some((d) => detectDomain(d) === 'laptop');

  return (
    <AnimatePresence>
      <div ref={modalSurface} role="dialog" aria-modal="true" aria-label="Compare product specifications" className="shopper-tool-modal fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-[var(--surface)]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] dark:border-white/5 bg-[var(--surface)]/80 dark:bg-[var(--bg)]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--idh-action-solid)] text-white flex items-center justify-center text-lg font-bold shadow-sm">
                ⚖️
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                  Side-by-Side Product Comparison
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Listed prices, supplied specifications and source scores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onBack && <button type="button" onClick={onBack} className="min-h-11 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-bold">Offer prices</button>}
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
                aria-label="Close dialog" className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)]/60 dark:bg-[var(--surface-2)]/60 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Comparison Grid Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
            {deals.length === 0 ? (
              <div className="py-16 text-center text-[var(--text-secondary)]">
                <span className="text-4xl block mb-2">⚖️</span>
                <p className="text-base font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">No items selected for comparison</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Click the "Compare" button on any deal card to compare specs side by side.</p>
              </div>
            ) : (
              <div className="min-w-[650px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-44 p-3 text-left text-xs font-mono uppercase text-[var(--text-secondary)] bg-[var(--surface)] dark:bg-[var(--bg)] rounded-l-xl">
                        Product Details
                      </th>
                      {deals.map((deal) => {
                        const isLowest = deal.price === lowestPrice;
                        return (
                          <th key={deal.id} className="p-3 text-left relative bg-[var(--surface)] dark:bg-[var(--bg)] first:rounded-l-xl last:rounded-r-xl">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              {isLowest ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  👑 Best Price
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-2)] dark:bg-[var(--surface-2)] text-[var(--text-primary)] dark:text-[var(--text-secondary)]">
                                  {deal.store || 'Verified'}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => onRemoveDeal(deal.id)}
                                className="text-[var(--text-secondary)] hover:text-rose-600 text-xs cursor-pointer p-1"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="w-20 h-20 mx-auto mb-2 rounded-xl bg-white dark:bg-[var(--surface)] border border-[var(--border-subtle)] dark:border-white/10 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                              {deal.image ? (
                                <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] line-clamp-2 leading-snug text-center">
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
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">Deal Price</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <div className="flex items-baseline gap-2">
                            {(() => {
                            const p = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
                            return <span className="text-lg font-black text-[var(--text-primary)] dark:text-[var(--text-primary)]">{p > 0 ? `₹${p.toLocaleString('en-IN')}` : 'Check store'}</span>;
                          })()}
                            {deal.mrp && deal.mrp > deal.price && (
                              <span className="text-xs text-[var(--text-secondary)] line-through">₹{deal.mrp.toLocaleString('en-IN')}</span>
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

                    {/* Deal Price */}

                    {/* Real Product Specification Row 1 */}
                    <tr>
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">
                        Specifications
                      </td>
                      {deals.map((deal) => {
                        const attrs = getProductAttributes(deal);
                        return (
                          <td key={deal.id} className="p-3 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                            <span className="font-bold text-xs block text-[var(--text-secondary)] uppercase">{attrs.specRow1Label}</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{attrs.specRow1Value}</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Real Product Specification Row 2 */}
                    <tr>
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">
                        Feature / Highlights
                      </td>
                      {deals.map((deal) => {
                        const attrs = getProductAttributes(deal);
                        return (
                          <td key={deal.id} className="p-3 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                            <span className="font-bold text-xs block text-[var(--text-secondary)] uppercase">{attrs.specRow2Label}</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] dark:text-[var(--text-secondary)]">{attrs.specRow2Value}</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Store & Authenticity */}
                    <tr>
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">Retailer & Source</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3 text-xs">
                          <span className="font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)]">{deal.store || 'Verified Store'}</span>
                          <span className="block text-[var(--text-secondary)] font-semibold mt-0.5">Confirm seller and authenticity at the store</span>
                        </td>
                      ))}
                    </tr>

                    {/* Worth Score */}
                    <tr>
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">Deal Worth Score</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--idh-accent)] font-black text-xs flex items-center justify-center">
                              {deal.worth_score ?? '—'}
                            </div>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">{deal.worth_score != null ? '/ 100 · source score' : 'Not supplied'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Buy Action */}
                    <tr>
                      <td className="p-3 font-semibold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] bg-[var(--surface)]/50 dark:bg-[var(--bg)]/50">Buy Link</td>
                      {deals.map((deal) => (
                        <td key={deal.id} className="p-3">
                          <a
                            href={deal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-[var(--idh-action-solid)] hover:bg-[var(--idh-action-solid)] text-white font-bold text-xs tracking-wide shadow-sm transition-all cursor-pointer text-center"
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

export default ProductSpecCompareModal;



