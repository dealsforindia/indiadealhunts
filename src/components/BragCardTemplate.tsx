import React, { forwardRef } from 'react';
import { Sparkles, Zap, Flame, ShieldCheck } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface BragCardTemplateProps {
  deal: PublicDeal | null;
}

export const BragCardTemplate = forwardRef<HTMLDivElement, BragCardTemplateProps>(
  ({ deal }, ref) => {
    if (!deal) return null;

    const discount = deal.discount_pct || 0;
    const savings = (deal.mrp && deal.mrp > (deal.price || 0)) ? deal.mrp - (deal.price || 0) : 0;
    
    // Choose theme based on discount
    const isMegaLoot = discount >= 70;
    const themeGradient = isMegaLoot 
      ? 'from-rose-600 via-purple-600 to-indigo-600'
      : 'from-emerald-600 via-teal-600 to-cyan-600';
      
    const headerText = isMegaLoot ? 'MEGA LOOT SECURED \uD83D\uDCA5' : 'PRICE CRASH \uD83D\uDEA8';

    return (
      <div 
        ref={ref}
        // Mobile story ratio (approx 9:16) for Insta Stories. 
        // We use a fixed size so html2canvas renders perfectly.
        className="fixed top-[-9999px] left-[-9999px] w-[450px] h-[800px] flex flex-col bg-[#070A11] overflow-hidden rounded-3xl"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Background Gradients & Noise */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-20`} />
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 mix-blend-overlay" />
        
        {/* Header */}
        <div className="relative z-10 w-full p-8 pt-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-xl">
            {isMegaLoot ? <Flame className="text-rose-400 w-5 h-5" /> : <Sparkles className="text-emerald-400 w-5 h-5" />}
            <span className="text-white font-black tracking-widest uppercase text-sm">
              {headerText}
            </span>
          </div>
        </div>

        {/* Product Image Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 w-full">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white/5 border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl p-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <img 
              src={getCleanImageUrl(deal.image)} 
              alt="Deal" 
              className="w-full h-full object-contain relative z-0 drop-shadow-2xl"
              crossOrigin="anonymous" // Important for html2canvas
            />
            
            {/* Store Badge Overlaid on Image */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
              {deal.store || 'Verified Store'}
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute bottom-4 right-4 z-20 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-2xl font-black shadow-lg transform rotate-[-5deg] border-2 border-white/20">
                {discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Details & Savings Area */}
        <div className="relative z-10 w-full p-8 pb-12 flex flex-col gap-6 bg-gradient-to-t from-black via-black/90 to-transparent">
          <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2 text-center text-balance drop-shadow-lg">
            {deal.title}
          </h2>

          <div className="flex flex-col gap-3 bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-slate-300 font-medium">Regular Price</span>
              <span className="text-slate-400 font-semibold line-through text-lg">
                ₹{deal.mrp?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-slate-300 font-medium">Loot Price</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black text-3xl">
                ₹{deal.price?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-rose-300 font-bold">Total Saved</span>
              <span className="text-rose-400 font-black text-xl">
                ₹{savings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="flex items-center justify-center gap-2 mt-2 opacity-80">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span className="text-white font-black tracking-wide text-lg">IndiaDealHunts</span>
          </div>
          <p className="text-center text-slate-400 text-xs font-medium tracking-widest uppercase">
            Verified Price Drop â€¢ AI Curated
          </p>
        </div>
      </div>
    );
  }
);

BragCardTemplate.displayName = 'BragCardTemplate';
