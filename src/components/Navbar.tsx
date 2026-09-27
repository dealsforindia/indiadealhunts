import React, { useState } from 'react';
import { NavTab } from '../types';
import { IconExternalLink, IconInfo } from './Icons';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalDeals?: number;
  onOpenLegal?: () => void;
}

const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

const NAV_TABS: { id: NavTab; label: string }[] = [
  { id: 'home',         label: 'Latest Deals' },
  { id: 'ending_soon',  label: 'Popular'      },
  { id: 'best_worth',   label: 'Top Value'    },
  { id: 'lookup',       label: 'Price Lookup' },
  { id: 'submit_deal',  label: 'Submit Deal'  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenLegal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
        height: '48px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand */}
        <button
          onClick={() => {
            onTabChange('home');
            setMobileMenuOpen(false);
          }}
          aria-label="IndiaDealHunts home"
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
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--accent)',
              borderRadius: '1px',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            IndiaDealHunts
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '4px',
          }}
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
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-raised)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'background-color 100ms linear, color 100ms linear',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions (Legal & Broadcast) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenLegal && (
            <button
              onClick={onOpenLegal}
              title="Terms of Service and Privacy Policy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                cursor: 'pointer',
                background: 'none',
              }}
            >
              <IconInfo size={14} />
              <span className="hidden sm:inline">Legal</span>
            </button>
          )}

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join verified Telegram deal channel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: '2px',
              textDecoration: 'none',
            }}
          >
            <span>Telegram</span>
            <IconExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
};
