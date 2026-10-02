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
    url: '/',
    consensus_count: 3,
  },
  {
    id: 'ticker-fb-2',
    title: "POPWINGS Women's Dresses & Crop Tops @ Up to 89% Off",
    price: 149,
    mrp: 1299,
    discount_pct: 89,
    store: 'Amazon',
    badge: '🔥 89% OFF',
    relative_time: '2m ago',
    url: '/',
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
    url: '/',
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
    url: '/',
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
    url: '/',
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
    url: '/',
  },
];

const STORE_THEME: Record<string, { bg: string; text: string; border: string }> = {
  Amazon: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  Flipkart: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Myntra: { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
  AJIO: { bg: '#FEFCE8', text: '#A16207', border: '#FEF08A' },
  Zepto: { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
  Swiggy: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' },
  DesiDime: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
};

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ onSelectDeal, onOpenVerify }) => {
  const [tickerData, setTickerData] = useState<TickerResponse | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const fetchTicker = useCallback(async () => {
    try {
      let res: Response | null = null;
      try {
        res = await fetch(`${API_BASE}/api/v1/deals/ticker`);
      } catch {
        res = null;
      }
      if (!res || !res.ok) {
        try {
          res = await fetch(`${EDGE_API}/deals/ticker`);
        } catch {
          res = null;
        }
      }
      if (res && res.ok) {
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
    <div className="relative w-full z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 overflow-hidden select-none">
      <div className="max-w-[1400px] mx-auto flex items-center h-10 px-2 sm:px-4">
        
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-slate-200 flex-shrink-0">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 uppercase hidden xs:inline">
            Live Radar
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 shadow-2xs">
            {totalDeals.toLocaleString()}+ drops
          </span>
        </div>

        {/* Center Infinite Marquee Strip */}
        <div
          className="flex-1 overflow-hidden relative flex items-center mask-marquee mx-1 sm:mx-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="animate-marquee-drift flex items-center gap-2.5">
            {[...items, ...items].map((item, idx) => {
              const theme = STORE_THEME[item.store] || {
                bg: '#F1F5F9',
                text: '#334155',
                border: '#CBD5E1',
              };

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleCardClick(item)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-left flex-shrink-0 cursor-pointer shadow-2xs group"
                >
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

                  <span className="text-[11px] font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[140px] sm:max-w-[220px]">
                    {item.title}
                  </span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-bold text-emerald-600 font-mono">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-[9px] text-slate-400 line-through font-mono hidden sm:inline">
                        ₹{item.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 24/7 Loot Radar Link */}
        <div className="pl-2 sm:pl-3 border-l border-slate-200 flex-shrink-0">
          <a
            href="https://t.me/dealsforindiachannel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-900 transition-all text-[11px] font-semibold cursor-pointer shadow-2xs"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">24/7 Telegram Alerts</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>

      </div>
    </div>
  );
};
