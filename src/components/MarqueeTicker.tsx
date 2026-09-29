import React, { useState, useEffect, useCallback } from 'react';
import type { TickerItem, TickerResponse, PublicDeal } from '../types';
import { IconShieldCheck, IconExternalLink, IconChevronRight } from './Icons';

interface MarqueeTickerProps {
  onSelectDeal?: (deal: Partial<PublicDeal>) => void;
  onOpenVerify?: () => void;
}

const EDGE_API = import.meta.env.VITE_EDGE_API_URL || 'https://dealflow-edge.pottemasshippo.workers.dev';
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

// High-confidence fallback ticker items to ensure immediate zero-latency render
const FALLBACK_TICKER_ITEMS: TickerItem[] = [
  {
    id: 'ticker-fb-1',
    title: 'Zepto Mega Grocery & Grooming Haul (Multiple Pincodes)',
    price: 19,
    mrp: 399,
    discount_pct: 95,
    store: 'Zepto',
    badge: '⚡ 95% LOOT',
    relative_time: 'Just now',
    url: 'https://api.rudranil.me/api/v1/deals/public',
    consensus_count: 3,
  },
  {
    id: 'ticker-fb-2',
    title: 'POPWINGS Women’s Dresses & Crop Tops @ Up to 89% Off',
    price: 149,
    mrp: 1299,
    discount_pct: 89,
    store: 'Amazon',
    badge: '🔥 89% OFF',
    relative_time: '2m ago',
    url: 'https://api.rudranil.me/api/v1/deals/public',
  },
  {
    id: 'ticker-fb-3',
    title: 'Kamiliant by American Tourister Hard Body Luggage',
    price: 3899,
    mrp: 14999,
    discount_pct: 74,
    store: 'Flipkart',
    badge: '💎 74% OFF',
    relative_time: '5m ago',
    url: 'https://api.rudranil.me/api/v1/deals/public',
  },
  {
    id: 'ticker-fb-4',
    title: 'boAt Airdopes 141 ANC True Wireless Earbuds',
    price: 899,
    mrp: 3990,
    discount_pct: 77,
    store: 'Amazon',
    badge: '⚡ FLASH LOOT',
    relative_time: '8m ago',
    url: 'https://api.rudranil.me/api/v1/deals/public',
  },
  {
    id: 'ticker-fb-5',
    title: 'Cello 27-Pcs Opalware Dinner Set (Scratch Resistant)',
    price: 999,
    mrp: 2999,
    discount_pct: 67,
    store: 'DesiDime',
    badge: '🔥 3 CHANNELS',
    relative_time: '12m ago',
    url: 'https://api.rudranil.me/api/v1/deals/public',
  },
  {
    id: 'ticker-fb-6',
    title: 'Noise ColorFit Pulse 3 Smartwatch (1.96" TFT Display)',
    price: 1199,
    mrp: 4999,
    discount_pct: 76,
    store: 'Myntra',
    badge: '⚡ 76% OFF',
    relative_time: '14m ago',
    url: 'https://api.rudranil.me/api/v1/deals/public',
  },
];

const STORE_THEME: Record<string, { bg: string; text: string; border: string }> = {
  Amazon: { bg: 'rgba(255, 153, 0, 0.12)', text: '#FF9900', border: 'rgba(255, 153, 0, 0.3)' },
  Flipkart: { bg: 'rgba(40, 116, 240, 0.12)', text: '#3B82F6', border: 'rgba(40, 116, 240, 0.3)' },
  Myntra: { bg: 'rgba(255, 63, 108, 0.12)', text: '#FF3F6C', border: 'rgba(255, 63, 108, 0.3)' },
  AJIO: { bg: 'rgba(203, 163, 91, 0.12)', text: '#EAB308', border: 'rgba(203, 163, 91, 0.3)' },
  Zepto: { bg: 'rgba(168, 85, 247, 0.14)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  Swiggy: { bg: 'rgba(249, 115, 22, 0.12)', text: '#F97316', border: 'rgba(249, 115, 22, 0.3)' },
  DesiDime: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
};

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ onSelectDeal, onOpenVerify }) => {
  const [tickerData, setTickerData] = useState<TickerResponse | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const fetchTicker = useCallback(async () => {
    try {
      let res = await fetch(`${EDGE_API}/deals/ticker`);
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/v1/deals/ticker`);
      }
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setTickerData(data);
        }
      }
    } catch {
      // Fallback handles gracefully
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 45000); // Poll every 45s
    return () => clearInterval(interval);
  }, [fetchTicker]);

  const items = (tickerData?.items && tickerData.items.length > 0)
    ? tickerData.items
    : FALLBACK_TICKER_ITEMS;

  const totalDeals = tickerData?.stats?.total_live_deals || 3288;
  const todayDrops = tickerData?.stats?.today_drops || 122;

  const handleCardClick = (item: TickerItem) => {
    if (onSelectDeal) {
      onSelectDeal({
        id: item.id,
        title: item.title,
        price: item.price,
        mrp: item.mrp,
        discount_pct: item.discount_pct,
        store: item.store,
        image: item.image || null,
        url: item.url,
        category: 'Flash Deal',
        posted_at: Date.now() / 1000,
        deal_badges: [item.badge || 'Verified'],
      });
    } else if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full z-20 bg-black/70 backdrop-blur-md border-b border-white/[0.08] overflow-hidden select-none">
      <div className="max-w-[1400px] mx-auto flex items-center h-10 px-2 sm:px-4">
        
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-white/[0.08] flex-shrink-0">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase hidden xs:inline">
            Live Radar
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold border border-white/[0.05]">
            {totalDeals.toLocaleString()}+ drops
          </span>
        </div>

        {/* Center Infinite Marquee Strip */}
        <div
          className="flex-1 overflow-hidden relative flex items-center mask-marquee mx-1 sm:mx-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="animate-marquee-drift flex items-center gap-3">
            {/* Render 2x array for seamless infinite looping */}
            {[...items, ...items].map((item, idx) => {
              const theme = STORE_THEME[item.store] || {
                bg: 'rgba(255, 255, 255, 0.08)',
                text: '#E4E4E7',
                border: 'rgba(255, 255, 255, 0.15)',
              };

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleCardClick(item)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 transition-all text-left flex-shrink-0 cursor-pointer group"
                >
                  {/* Store Badge */}
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    {item.store}
                  </span>

                  {/* Title */}
                  <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white transition-colors truncate max-w-[140px] sm:max-w-[220px]">
                    {item.title}
                  </span>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-[9px] text-zinc-500 line-through font-mono hidden sm:inline">
                        ₹{item.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Discount / Badge */}
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Relative time */}
                  {item.relative_time && (
                    <span className="text-[9px] font-mono text-zinc-500 hidden md:inline">
                      {item.relative_time}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Verify Button */}
        {onOpenVerify && (
          <div className="pl-2 sm:pl-3 border-l border-white/[0.08] flex-shrink-0">
            <button
              onClick={onOpenVerify}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all text-[11px] font-medium cursor-pointer"
              title="Learn how our automated multi-layer pipeline verifies genuine deals"
            >
              <IconShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">How We Verify</span>
              <IconChevronRight className="w-2.5 h-2.5 text-zinc-500" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
