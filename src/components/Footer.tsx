import React from 'react';
import { NavTab } from '../types';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onTabChange?: (tab: NavTab) => void;
  onOpenLegal?: (type: LegalDocType) => void;
}

const WHATSAPP_URL = 'https://whatsapp.com/channel/0029VaHCuZs2v1IkBRgH9w3z';
const TELEGRAM_URL = 'https://t.me/dealsforindiachannel';

const linkStyle: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  color: '#6B6B6B',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textAlign: 'left',
  lineHeight: '20px',
  textDecoration: 'none',
  transition: 'color 120ms ease',
};

const SectionLink: React.FC<{
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  external?: boolean;
}> = ({ onClick, href, children, external }) => {
  const style = linkStyle;
  const hoverIn = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.color = '#F5F5F5';
  };
  const hoverOut = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.color = '#6B6B6B';
  };

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={style}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
      {children}
    </button>
  );
};

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenLegal }) => {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      marginTop: '64px',
      borderTop: '1px solid #1E1E1E',
      backgroundColor: '#0A0A0A',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px 32px' }}>

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid #1E1E1E',
        }}>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#F5F5F5',
              letterSpacing: '-0.02em',
            }}>
              IndiaDealHunts
            </span>
            <p style={{ fontSize: '12px', color: '#6B6B6B', lineHeight: 1.6, maxWidth: '200px' }}>
              Curated deal discovery across 27 Indian retail channels. Verified prices, no inflated MRPs.
            </p>
            <a
              href="mailto:hello@rudranil.me"
              style={{ fontSize: '12px', color: '#6B6B6B', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B6B')}
            >
              hello@rudranil.me
            </a>
          </div>

          {/* Explore */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#404040',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Explore
            </span>
            <nav aria-label="Explore pages" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SectionLink onClick={() => onTabChange?.('home')}>Latest Deals</SectionLink>
              <SectionLink onClick={() => onTabChange?.('ending_soon')}>Popular</SectionLink>
              <SectionLink onClick={() => onTabChange?.('best_worth')}>Top Rated</SectionLink>
              <SectionLink onClick={() => onTabChange?.('lookup')}>Link Lookup Tool</SectionLink>
              <SectionLink onClick={() => onTabChange?.('submit_deal')}>Submit a Deal</SectionLink>
            </nav>
          </div>

          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#404040',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Company
            </span>
            <nav aria-label="Company pages" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SectionLink onClick={() => onTabChange?.('about')}>About</SectionLink>
              <SectionLink onClick={() => onTabChange?.('how_we_verify')}>How We Verify</SectionLink>
              <SectionLink onClick={() => onTabChange?.('contact')}>Contact</SectionLink>
            </nav>
          </div>

          {/* Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#404040',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Legal
            </span>
            <nav aria-label="Legal documents" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SectionLink onClick={() => onOpenLegal?.('terms')}>Terms of Service</SectionLink>
              <SectionLink onClick={() => onOpenLegal?.('privacy')}>Privacy Policy</SectionLink>
              <SectionLink onClick={() => onOpenLegal?.('disclosure')}>Affiliate Disclosure</SectionLink>
            </nav>
          </div>

          {/* Community */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#404040',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Alerts
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: '#22C55E',
                  color: '#0A0A0A',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  transition: 'background-color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22C55E')}
              >
                WhatsApp Channel
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  color: '#A3A3A3',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  border: '1px solid #262626',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  transition: 'color 120ms ease, border-color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F5F5F5';
                  e.currentTarget.style.borderColor = '#404040';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A3A3A3';
                  e.currentTarget.style.borderColor = '#262626';
                }}
              >
                Telegram Channel
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: copyright + legal links */}
        <div style={{
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{ fontSize: '11px', color: '#404040', fontFamily: 'var(--font-mono)' }}>
            &copy; {year} IndiaDealHunts. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {(['terms', 'privacy', 'disclosure'] as const).map((key, i) => (
              <React.Fragment key={key}>
                {i > 0 && <span style={{ color: '#262626', fontSize: '10px' }}>|</span>}
                <button
                  type="button"
                  onClick={() => onOpenLegal?.(key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#404040',
                    padding: 0,
                    transition: 'color 120ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#A3A3A3')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#404040')}
                >
                  {key === 'terms' ? 'Terms' : key === 'privacy' ? 'Privacy' : 'Disclosure'}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
