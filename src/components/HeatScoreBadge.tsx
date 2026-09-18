import React from 'react';
import { Flame, Zap, Gem, Check } from 'lucide-react';

interface HeatScoreBadgeProps {
  score?: number;
  showScore?: boolean;
}

export const HeatScoreBadge: React.FC<HeatScoreBadgeProps> = ({ score = 50, showScore = true }) => {
  const numScore = Math.round(Number(score) || 50);

  if (numScore >= 80) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20">
        <Flame className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
        <span>HOT LOOT</span>
        {showScore && <span className="font-mono text-rose-400 ml-0.5">{numScore}</span>}
      </span>
    );
  }

  if (numScore >= 60) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span>Trending</span>
        {showScore && <span className="font-mono text-amber-400 ml-0.5">{numScore}</span>}
      </span>
    );
  }

  if (numScore >= 40) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
        <Gem className="w-3 h-3 text-emerald-400" />
        <span>Great Deal</span>
        {showScore && <span className="font-mono text-emerald-400 ml-0.5">{numScore}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700">
      <Check className="w-3 h-3 text-slate-400" />
      <span>Verified</span>
    </span>
  );
};
