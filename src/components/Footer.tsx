import React from 'react';
import { NavTab } from '../types';
import { LegalDocType } from './LegalModal';

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
  onSelectCategory,
}) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        marginTop: '60px',
        backgroundColor: '#0A0C0F',
        borderTop: '1px solid #1E232B',
        padding: '48px 20px 32px',
        color: '#9099A6',
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
        }}
      >
        {/* ── Main 4-Column Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '36px',
            paddingBottom: '36px',
            borderBottom: '1px solid #1E232B',
          }}
          className="sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* 1. Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid #F59E0B',
                  borderRadius: '4px',
                  color: '#F59E0B',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11zM4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-7z"/>
                </svg>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '17px',
                  color: '#F5F7FA',
                  letterSpacing: '-0.02em',
                }}
              >
                IndiaDealHunts
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#F59E0B',
                fontWeight: 600,
              }}
            >
              Real Deals. Real Savings.
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#9099A6', margin: 0 }}>
              Your trusted source for verified deals, price drops and offers from top stores in India.
            </p>

            {/* Social Icons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              {/* Telegram */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                aria-label="Telegram"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#141820',
                  border: '1px solid #28313D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  transition: 'border-color 120ms ease, color 120ms ease',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.73-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.75 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="X (Twitter)"
                aria-label="X Twitter"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#141820',
                  border: '1px solid #28313D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9099A6',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#141820',
                  border: '1px solid #28313D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9099A6',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                aria-label="YouTube"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: '#141820',
                  border: '1px solid #28313D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9099A6',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 2. Explore Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5F7FA',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <button
                onClick={() => handleLinkClick('home')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Latest Deals
              </button>
              <button
                onClick={() => handleLinkClick('ending_soon')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Popular Deals
              </button>
              <button
                onClick={() => handleLinkClick('best_worth')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Top Value
              </button>
              <button
                onClick={() => {
                  const rail = document.getElementById('category-rail');
                  if (rail) rail.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Categories
              </button>
            </div>
          </div>

          {/* 3. Tools Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5F7FA',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {onOpenLookup && (
                <button
                  onClick={onOpenLookup}
                  style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Price Lookup
                </button>
              )}
              {onOpenSubmit && (
                <button
                  onClick={onOpenSubmit}
                  style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Submit a Deal
                </button>
              )}
              <button
                onClick={() => handleLinkClick('how_we_verify')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                How We Verify
              </button>
              <button
                onClick={() => handleLinkClick('about')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                About Us
              </button>
            </div>
          </div>

          {/* 4. Legal Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5F7FA',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <button
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleLinkClick('contact')}
                style={{ textAlign: 'left', color: '#9099A6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Line ── */}
        <div
          style={{
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontFamily: 'var(--font-body)',
            color: '#687482',
          }}
        >
          <span>© {currentYear} IndiaDealHunts. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
