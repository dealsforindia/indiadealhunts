import React from 'react';
import { NavTab } from '../types';
import { Sparkles, MessageCircle, Send, Zap, CheckCircle2, Search, PlusCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalDeals: number;
}

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_CHANNEL_URL = 'https://t.me/dealsforindiachannel';

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalDeals,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0B0D13]/90 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none rounded-xl"
              aria-label="Go to IndiaDealHunts Home"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#121522] flex items-center justify-center group-hover:border-emerald-400 transition-all shadow-sm">
                <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-300 font-mono">
                  ID
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    IndiaDealHunts
                  </span>
                  <span className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex items-center gap-2 -mt-0.5">
                  <span className="text-[10.5px] text-slate-400 font-medium hidden sm:block">
                    Verified Deal Discovery
                  </span>
                  <span className="hidden sm:inline text-slate-700 text-[10px]">•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {totalDeals > 0 ? `${totalDeals} drops live` : '27 streams active'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation: Luma / Mobbin Style Segmented Controller */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md" aria-label="Main Navigation">
            <button
              onClick={() => onTabChange('home')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              Latest
            </button>
            <button
              onClick={() => onTabChange('ending_soon')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
                activeTab === 'ending_soon'
                  ? 'bg-amber-500/15 text-amber-300 shadow-sm border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'ending_soon' ? 'page' : undefined}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Most Popular</span>
            </button>
            <button
              onClick={() => onTabChange('best_worth')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
                activeTab === 'best_worth'
                  ? 'bg-emerald-500/15 text-emerald-300 shadow-sm border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'best_worth' ? 'page' : undefined}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Top Rated</span>
            </button>
            <button
              onClick={() => onTabChange('lookup')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
                activeTab === 'lookup'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'lookup' ? 'page' : undefined}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Link Lookup</span>
            </button>
            <button
              onClick={() => onTabChange('submit_deal')}
              className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap rounded-lg flex items-center gap-1.5 ${
                activeTab === 'submit_deal'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
              aria-current={activeTab === 'submit_deal' ? 'page' : undefined}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Submit Deal</span>
            </button>
          </nav>

          {/* Right Action: Clean Telegram & WhatsApp Channels */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-all active:scale-95 shadow-xs"
              aria-label="Join Telegram channel"
            >
              <Send className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Telegram</span>
            </a>

            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Join official IndiaDealHunts WhatsApp Channel"
              aria-label="Join official WhatsApp Channel"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>WhatsApp Channel</span>
            </a>
          </div>
        </div>

        {/* Mobile Segmented Navigation Bar */}
        <nav 
          className="flex md:hidden items-center justify-between gap-1 overflow-x-auto scrollbar-none pb-2 pt-1 border-t border-white/[0.06]"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => onTabChange('home')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'home' ? 'bg-white/10 text-white font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'home' ? 'page' : undefined}
          >
            Latest
          </button>
          <button
            onClick={() => onTabChange('ending_soon')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'ending_soon' ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'ending_soon' ? 'page' : undefined}
          >
            <Zap className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Popular</span>
          </button>
          <button
            onClick={() => onTabChange('best_worth')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'best_worth' ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'best_worth' ? 'page' : undefined}
          >
            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Top Rated</span>
          </button>
          <button
            onClick={() => onTabChange('lookup')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'lookup' ? 'bg-white/10 text-white font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
            aria-current={activeTab === 'lookup' ? 'page' : undefined}
          >
            <Search className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Lookup</span>
          </button>
          <button
            onClick={() => onTabChange('submit_deal')}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'submit_deal' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-300'
            }`}
            aria-current={activeTab === 'submit_deal' ? 'page' : undefined}
          >
            <PlusCircle className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Submit</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
