import React, { useState } from 'react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalDeals: number;
  onOpenCardModal?: () => void;
  activeCardCount?: number;
}

const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

const NAV_TABS: { id: NavTab; label: string }[] = [
  { id: 'home',         label: 'Latest'      },
  { id: 'ending_soon',  label: 'Popular'     },
  { id: 'best_worth',   label: 'Top Rated'   },
  { id: 'lookup',       label: 'Link Lookup' },
  { id: 'submit_deal',  label: 'Submit Deal' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalDeals,
  onOpenCardModal,
  activeCardCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#0A0A0A',
        borderBottom: '1px solid #262626',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Main bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', gap: '16px' }}>

          {/* Brand */}
          <button
            onClick={() => { onTabChange('home'); setMobileOpen(false); }}
            aria-label="IndiaDealHunts home"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '15px',
              color: '#F5F5F5',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              IndiaDealHunts
            </span>
            {totalDeals > 0 && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                color: '#6B6B6B',
                letterSpacing: '0',
              }}>
                {totalDeals} live
              </span>
            )}
          </button>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
            className="hidden md:flex"
          >
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'var(--font-body)',
                    color: isActive ? '#F5F5F5' : '#6B6B6B',
                    backgroundColor: isActive ? '#1A1A1A' : 'transparent',
                    border: isActive ? '1px solid #262626' : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    lineHeight: '20px',
                    transition: 'color 150ms ease, background-color 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {onOpenCardModal && (
              <button
                onClick={onOpenCardModal}
                aria-label="Manage my credit cards"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  color: '#A3A3A3',
                  backgroundColor: 'transparent',
                  border: '1px solid #262626',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  lineHeight: '20px',
                  whiteSpace: 'nowrap',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#A3A3A3';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                }}
              >
                My Cards
                {typeof activeCardCount === 'number' && activeCardCount > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#D47A10',
                    color: '#0A0A0A',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {activeCardCount}
                  </span>
                )}
              </button>
            )}

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Telegram channel"
              className="hidden lg:flex"
              style={{
                alignItems: 'center',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: '#A3A3A3',
                border: '1px solid #262626',
                borderRadius: '4px',
                lineHeight: '20px',
                whiteSpace: 'nowrap',
                transition: 'color 150ms ease, border-color 150ms ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#F5F5F5';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#404040';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = '#A3A3A3';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#262626';
              }}
            >
              Telegram
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join WhatsApp alerts channel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: '#0A0A0A',
                backgroundColor: '#22C55E',
                border: '1px solid #22C55E',
                borderRadius: '4px',
                lineHeight: '20px',
                whiteSpace: 'nowrap',
                transition: 'background-color 150ms ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#16A34A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#22C55E';
              }}
            >
              Alerts
            </a>

            {/* Mobile menu toggle */}
            <button
              className="flex md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                backgroundColor: 'transparent',
                border: '1px solid #262626',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#A3A3A3',
              }}
            >
              {mobileOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            style={{
              borderTop: '1px solid #1E1E1E',
              padding: '8px 0 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: 'var(--font-body)',
                    color: isActive ? '#F5F5F5' : '#A3A3A3',
                    backgroundColor: isActive ? '#1A1A1A' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
            <div style={{ height: '1px', backgroundColor: '#1E1E1E', margin: '6px 0' }} />
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '10px 12px', fontSize: '14px', color: '#A3A3A3', fontFamily: 'var(--font-body)' }}
              onClick={() => setMobileOpen(false)}
            >
              Telegram Channel
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '10px 12px', fontSize: '14px', color: '#A3A3A3', fontFamily: 'var(--font-body)' }}
              onClick={() => setMobileOpen(false)}
            >
              WhatsApp Alerts
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};
