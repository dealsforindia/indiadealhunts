import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSelectCategory?: (category: string) => void;
  onOpenLookup: () => void;
  onOpenSubmit: () => void;
  onFocusSearch?: () => void;
}

const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

const CATEGORIES = [
  { id: 'all', label: 'All Deals' },
  { id: 'Electronics', label: 'Electronics' },
  { id: 'Fashion', label: 'Fashion' },
  { id: 'Home', label: 'Home & Kitchen' },
  { id: 'Grocery', label: 'Grocery' },
  { id: 'Beauty', label: 'Beauty & Care' },
  { id: 'Sports', label: 'Fitness & Sports' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onSelectCategory,
  onOpenLookup,
  onOpenSubmit,
  onFocusSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Close categories popover on click outside
  useEffect(() => {
    if (!categoriesOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoriesOpen]);

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    // Scroll to deals section smoothly
    const rail = document.getElementById('category-rail');
    if (rail) {
      rail.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="sticky top-0 z-50 h-14 md:h-16 glass-panel"
      style={{
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="px-3 md:px-5 w-full flex items-center justify-between gap-2 md:gap-4 h-full"
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
        }}
      >
        {/* ── Left: Mobile Hamburger (on mobile) + Brand Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Mobile Hamburger toggle */}
          <button
            className="flex md:hidden items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            style={{
              width: '36px',
              height: '36px',
              color: '#F5F7FA',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Logo: Amber mark + IndiaDealHunts */}
          <button
            onClick={() => {
              onTabChange('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="IndiaDealHunts Home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {/* Amber mark emblem */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #F59E0B',
                borderRadius: '4px',
                color: '#F59E0B',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11zM4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-7z"/>
                <path d="M6 5.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm0 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
              </svg>
            </span>
            <span
              className="gradient-text"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              IndiaDealHunts
            </span>
          </button>
        </div>

        {/* ── Center: Desktop Navigation Tabs with tiny active bottom indicator ── */}
        <nav
          className="hidden md:flex items-center"
          aria-label="Primary navigation"
          style={{ gap: '24px', height: '100%' }}
        >
          {[
            { id: 'home', label: 'Latest' },
            { id: 'ending_soon', label: 'Popular' },
            { id: 'best_worth', label: 'Top Value' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTab)}
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#F59E0B' : '#9099A6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  transition: 'color 120ms ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA'; }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#9099A6';
                }}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#F59E0B',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                )}
              </button>
            );
          })}

          <button
            onClick={onOpenLookup}
            style={{
              position: 'relative',
              height: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: '#9099A6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
              transition: 'color 120ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#9099A6'; }}
          >
            Price Lookup
          </button>

          {/* Categories Popover dropdown */}
          <div ref={categoriesRef} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                color: categoriesOpen ? '#F59E0B' : '#9099A6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 2px',
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA'; }}
              onMouseLeave={(e) => {
                if (!categoriesOpen) (e.currentTarget as HTMLButtonElement).style.color = '#9099A6';
              }}
            >
              Categories
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: categoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease',
                }}
              >
                <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {categoriesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '180px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '6px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  zIndex: 60,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      color: '#F5F7FA',
                      backgroundColor: 'transparent',
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 100ms ease, color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1B222C';
                      (e.currentTarget as HTMLButtonElement).style.color = '#F59E0B';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA';
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right: Search icon, Submit Deal, Telegram ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Quick Search Focus button (both Mobile and Desktop) */}
          {onFocusSearch && (
            <button
              className="flex items-center justify-center"
              onClick={onFocusSearch}
              title="Search deals (/)"
              aria-label="Focus search"
              style={{
                width: '36px',
                height: '36px',
                color: '#9099A6',
                backgroundColor: 'transparent',
                border: '1px solid #28313D',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'border-color 120ms ease, color 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#384454';
                (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#28313D';
                (e.currentTarget as HTMLButtonElement).style.color = '#9099A6';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Submit Deal CTA (Desktop only) */}
          <button
            className="hidden md:inline-flex items-center btn-primary"
            onClick={onOpenSubmit}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-heading)',
              fontSize: '13px',
              letterSpacing: '-0.01em',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Submit Deal
          </button>

          {/* Telegram circular icon button (both Mobile and Desktop) */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Join IndiaDealHunts Telegram Channel"
            aria-label="Join IndiaDealHunts Telegram"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              borderRadius: '4px',
              border: '1px solid #334155',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 120ms ease, border-color 120ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0284C7';
              (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1E293B';
              (e.currentTarget as HTMLAnchorElement).style.color = '#38BDF8';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
            zIndex: 49,
          }}
        >
          <button
            onClick={() => { onTabChange('home'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px 0',
              fontSize: '15px',
              fontFamily: 'var(--font-heading)',
              fontWeight: activeTab === 'home' ? 700 : 500,
              color: activeTab === 'home' ? '#F59E0B' : '#F5F7FA',
              borderBottom: '1px solid #1B222C',
            }}
          >
            Latest Deals
          </button>
          <button
            onClick={() => { onTabChange('ending_soon'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px 0',
              fontSize: '15px',
              fontFamily: 'var(--font-heading)',
              fontWeight: activeTab === 'ending_soon' ? 700 : 500,
              color: activeTab === 'ending_soon' ? '#F59E0B' : '#F5F7FA',
              borderBottom: '1px solid #1B222C',
            }}
          >
            Popular Drops
          </button>
          <button
            onClick={() => { onTabChange('best_worth'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px 0',
              fontSize: '15px',
              fontFamily: 'var(--font-heading)',
              fontWeight: activeTab === 'best_worth' ? 700 : 500,
              color: activeTab === 'best_worth' ? '#F59E0B' : '#F5F7FA',
              borderBottom: '1px solid #1B222C',
            }}
          >
            Top Value
          </button>
          <button
            onClick={() => { onOpenLookup(); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px 0',
              fontSize: '15px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 500,
              color: '#F5F7FA',
              borderBottom: '1px solid #1B222C',
            }}
          >
            Price Lookup Tool
          </button>

          {/* Quick Categories section */}
          <div style={{ paddingTop: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#687482', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Categories
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--muted)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
