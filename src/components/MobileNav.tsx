import React from 'react';
import { Bookmark, Gem, Home, Search, TrendingDown } from 'lucide-react';
import { NavTab } from '../types';

interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenLookup: () => void;
  onOpenSubmit: () => void;
  onFocusSearch: () => void;
  savedCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, onFocusSearch, savedCount = 0 }) => {
  const items = [
    { tab: 'home' as NavTab, label: 'Discover', aria: 'Home deals feed', Icon: Home },
    { tab: 'ending_soon' as NavTab, label: 'Discounts', aria: 'Top Discounts', Icon: TrendingDown },
    { tab: null, label: 'Search', aria: 'Search deals', Icon: Search },
    { tab: 'saved' as NavTab, label: 'Saved', aria: 'Saved Loot Bookmarks', Icon: Bookmark },
    { tab: 'best_worth' as NavTab, label: 'Worth', aria: 'Top Worth Score Deals', Icon: Gem },
  ];
  return <nav className="phone-navigation md:hidden" aria-label="Mobile Bottom Navigation">
    {items.map(({ tab, label, aria, Icon }) => <button key={label} type="button"
      className={`phone-nav-item${tab === activeTab ? ' is-active' : ''}${tab === null ? ' is-search' : ''}`}
      aria-label={aria} aria-current={tab === activeTab ? 'page' : undefined}
      onClick={() => tab === null ? onFocusSearch() : onTabChange(tab)}>
      <span className="phone-nav-icon"><Icon size={21} strokeWidth={tab === activeTab ? 2.4 : 1.8} />
        {tab === 'saved' && savedCount > 0 && <span className="phone-nav-count">{savedCount > 99 ? '99+' : savedCount}</span>}
      </span><span>{label}</span>
    </button>)}
  </nav>;
};
