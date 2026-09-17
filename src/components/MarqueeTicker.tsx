import React from 'react';
import { Sparkles, Flame, ShieldCheck, Zap } from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const items = [
    { 
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />, 
      badge: 'LIVE STREAMS',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      text: '1,060+ Verified Deals Streaming Live Across 27 Indian Retail Channels' 
    },
    { 
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />, 
      badge: 'COMMUNITY LOOT',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      text: '48+ Shoppers Grabbed boAt & Puma Price Drops in the Last Hour' 
    },
    { 
      icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />, 
      badge: 'GENUINE RETAIL',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      text: 'Zero Inflated MRPs • Official Store Images & Direct Affiliate Checkout' 
    },
    { 
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />, 
      badge: 'INSTANT LOOKUP',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      text: 'Paste any Amazon, Flipkart or Myntra link into the search bar for instant verification' 
    },
  ];

  return (
    <div className="w-full bg-[#090B10]/95 border-b border-white/[0.06] backdrop-blur-md overflow-hidden py-1.5 text-[11px] text-slate-300 select-none relative z-40">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {items.concat(items).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mx-6 shrink-0">
            {item.icon}
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
              {item.badge}
            </span>
            <span className="text-slate-300 font-medium">{item.text}</span>
            <span className="text-slate-700 ml-4 font-mono">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
