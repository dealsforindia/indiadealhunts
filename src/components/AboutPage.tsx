import React from 'react';
import { IconShieldCheck, IconClock, IconTag, IconExternalLink, IconChevronRight } from './Icons';

interface AboutPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onNavigateTab }) => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <button
          onClick={onBackToHome}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
        >
          Home
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>About</span>
      </div>

      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Verified Retail Deals and Honest Price Intelligence
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: 0 }}>
          E-commerce promotions frequently advertise artificial discounts against inflated MRPs. IndiaDealHunts monitors genuine price drops, flash clearances, and real coupon stacks across Amazon, Flipkart, Myntra, Swiggy Instamart, and partner platforms.
        </p>
      </div>

      {/* Impact Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {[
          { label: 'Active Channels Monitored', val: '27+' },
          { label: 'Deals Ingested Daily', val: '1,000+' },
          { label: 'Community Shoppers', val: '50,000+' },
          { label: 'Platform Access', val: '100% Free' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
              }}
            >
              {stat.val}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Core Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>
          Operational Standards
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            {
              title: '1. True Price History Verification',
              desc: 'We do not promote deals based solely on claimed discount percentages. Scrapers compare live deals against 90-day retail pricing to verify that the drop represents a genuine bargain.',
            },
            {
              title: '2. Low-Latency Deal Detection',
              desc: 'Flash sales and clearance items sell out quickly. Background workers process incoming alerts from 27 monitored feeds and dispatch verified items directly to the web feed and Telegram.',
            },
            {
              title: '3. Zero Sponsored Clutter',
              desc: 'Deals are never featured for payment or kickbacks. Items with inflated MRPs or suspicious reviews are rejected before appearing in the verified feed.',
            },
            {
              title: '4. Free and Open for Shoppers',
              desc: 'No paywalls, subscriptions, or hidden charges. We earn affiliate referral commissions from supported retail partners at zero additional cost to you.',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Banner */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-raised)',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Verification Pipeline Documentation
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Review our step-by-step verification pipeline explaining how price scraping, multi-source consensus, and affiliate redirects operate.
        </p>
        <div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('how_we_verify')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'var(--accent)',
              color: 'var(--text-inverse)',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            <span>Read Verification Pipeline</span>
            <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
