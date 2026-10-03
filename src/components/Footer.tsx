import React from 'react';
import { NavTab } from '../types';
import { BrandMark } from './BrandMark';
import { LegalDocType } from './LegalModal';
import { ThemeToggle } from './ThemeToggle';

interface FooterProps {
  onTabChange?: (tab: NavTab) => void;
  onOpenLegal?: (type: LegalDocType) => void;
  onOpenLookup?: () => void;
  onOpenSubmit?: () => void;
  onSelectCategory?: (category: string) => void;
}

const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

export const Footer: React.FC<FooterProps> = ({
  onTabChange,
  onOpenLegal,
  onOpenLookup,
  onOpenSubmit,
}) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="premium-footer mt-20 bg-slate-50 dark:bg-[#070A11] border-t border-slate-200 dark:border-white/10 py-14 px-4 md:px-6 text-slate-500">
      <div className="max-w-[1340px] mx-auto flex flex-col gap-10">
        {/* ── Main 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-200 dark:border-white/10">
          {/* 1. Brand Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                IndiaDealHunts
              </span>
            </div>

            <div className="font-mono text-xs text-blue-600 font-bold uppercase tracking-wider">
              Real Deals · Real Savings · Real Time
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Find offers across your favourite stores, inspect available price history, and build a shortlist worth coming back to.
            </p>

            {/* Social Icons row */}
            <div className="flex items-center gap-2.5 mt-2">
              {/* Telegram */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Join Telegram"
                aria-label="Telegram"
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#0D1527] hover:bg-blue-50 border border-slate-200 dark:border-white/10 hover:border-blue-300 text-blue-600 flex items-center justify-center transition-all shadow-xs"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z"/>
                </svg>
              </a>


            </div>
          </div>

          {/* 2. Explore Column */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider">
              Explore
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => handleLinkClick('home')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Latest Verified Deals
              </button>
              <button
                onClick={() => handleLinkClick('ending_soon')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Top Percentage Discounts
              </button>
              <button
                onClick={() => handleLinkClick('best_worth')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Top Worth Score Deals
              </button>
              <button
                onClick={() => handleLinkClick('wall_of_happiness')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                💖 Wall of Happiness
              </button>
              <button
                onClick={() => {
                  const rail = document.getElementById('category-rail');
                  if (rail) rail.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Category Directory
              </button>
            </div>
          </div>

          {/* 3. Tools Column */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider">
              Tools & Verification
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {onOpenLookup && (
                <button
                  onClick={onOpenLookup}
                  className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  🔍 Price History Analyzer
                </button>
              )}
              {onOpenSubmit && (
                <button
                  onClick={onOpenSubmit}
                  className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  ✍️ Submit a Deal
                </button>
              )}
              <button
                onClick={() => handleLinkClick('how_we_verify')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                🛡️ How We Verify Deals
              </button>
              <button
                onClick={() => handleLinkClick('about')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                📖 About IndiaDealHunts
              </button>
            </div>
          </div>

          {/* 4. Legal Column */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider">
              Legal & Disclosures
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleLinkClick('contact')}
                className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Contact & Support
              </button>
              <p className="text-[11px] text-slate-400 mt-2 leading-normal">
                IndiaDealHunts is a participant in affiliate advertising programs including Amazon and EarnKaro designed to provide a means for sites to earn advertising fees.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Line ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <span>© {currentYear} IndiaDealHunts. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-sans font-medium">Theme:</span>
            <ThemeToggle showLabels />
          </div>
          <span className="text-slate-400">
            Prices and availability can change. Confirm at checkout.
          </span>
        </div>
      </div>
    </footer>
  );
};
