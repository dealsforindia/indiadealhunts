import { ArrowUpRight } from 'lucide-react';
import { NavTab } from '../types';
import { BrandMark } from './BrandMark';
import { LegalDocType } from './LegalModal';
import { ThemeToggle } from './ThemeToggle';
import { TelegramIcon } from './TelegramIcon';
interface FooterProps {
  onTabChange?: (tab: NavTab) => void;
  onOpenLegal?: (type: LegalDocType) => void;
  onOpenLookup?: () => void;
  onOpenSubmit?: () => void;
  onSelectCategory?: (category: string) => void;
}
export const Footer = ({ onTabChange, onOpenLegal, onOpenLookup, onOpenSubmit }: FooterProps) => {
  function scrollBehavior(): ScrollBehavior { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'; }
  function go(tab: NavTab) { onTabChange?.(tab); window.scrollTo({ top: 0, behavior: scrollBehavior() }); }
  return <footer className="idh-footer"><div className="idh-footer-inner">
    <div className="idh-footer-top"><div className="idh-footer-brand"><BrandMark /><span>IndiaDealHunts</span></div><a className="idh-footer-community" href="https://t.me/dealsforindiachannel" target="_blank" rel="noopener noreferrer"><TelegramIcon />Find us on Telegram <ArrowUpRight size={16} /></a></div>
    <div className="idh-footer-grid"><div className="idh-footer-intro"><h2>Little discoveries.<br />Better everyday.</h2><p>Offers across your favourite stores, price evidence when available, and a place to keep your next great find.</p></div>
      <nav aria-label="Explore IndiaDealHunts"><h3>Explore</h3><button onClick={() => go('home')}>Latest finds</button><button onClick={() => go('ending_soon')}>Top discounts</button><button onClick={() => go('saved')}>Saved deals</button><button onClick={() => go('profile')}>Your profile</button><button onClick={() => { go('home'); requestAnimationFrame(() => document.getElementById('category-rail')?.scrollIntoView({ behavior: scrollBehavior() })); }}>Browse categories</button></nav>
      <nav aria-label="Shopping help"><h3>A little help</h3><button onClick={onOpenLookup}>Check a product link</button><button onClick={onOpenSubmit}>Share a deal</button><button onClick={() => go('how_we_verify')}>How verification works</button><button onClick={() => go('about')}>About us</button><button onClick={() => go('contact')}>Contact & support</button></nav>
      <div className="idh-footer-appearance"><h3>Make yourself at home</h3><ThemeToggle /><p>We may earn a commission through affiliate links, including Amazon and EarnKaro, at no extra cost to you.</p></div>
    </div>
    <div className="idh-footer-bottom"><span>© {new Date().getFullYear()} IndiaDealHunts</span><nav aria-label="Legal"><button onClick={() => onOpenLegal?.('privacy')}>Privacy</button><button onClick={() => onOpenLegal?.('terms')}>Terms</button></nav><span>Prices change. Confirm at checkout.</span></div>
  </div></footer>;
};
