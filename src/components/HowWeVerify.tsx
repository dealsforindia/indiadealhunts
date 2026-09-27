import React from 'react';
import { IconShieldCheck, IconExternalLink, IconChevronRight, IconTag } from './Icons';

interface HowWeVerifyProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const HowWeVerify: React.FC<HowWeVerifyProps> = ({ onBackToHome, onNavigateTab }) => {
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Verification Methodology</span>
      </div>

      {/* Header */}
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
          How Deals Are Verified
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', margin: 0 }}>
          Every deal listed on IndiaDealHunts passes through our automated multi-layer verification pipeline. From live merchant scraping and 90-day price benchmarking to link sanitization, we verify that only genuine discounts reach the feed.
        </p>
      </div>

      {/* 5-Step Pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          {
            num: '01',
            title: 'Canonical Link Resolution and Sanitization',
            tag: 'Link Layer',
            desc: 'When a deal URL enters our ingestion workers, we follow all redirect hops (such as fpkrt.cc or amzn.to) to unpack the canonical merchant product ID (ASIN on Amazon, pid/itm on Flipkart). We sanitize tracking tokens to guarantee safe, direct merchant landing.',
          },
          {
            num: '02',
            title: 'Historical Price Benchmarking',
            tag: 'Price Audit',
            desc: 'Sellers frequently raise list prices immediately before promotional sales. Our workers cross-reference current live prices against 90-day median pricing to verify whether a discount is historically meaningful.',
          },
          {
            num: '03',
            title: 'Multi-Source Signal Consensus',
            tag: 'Consensus',
            desc: 'When an extraordinary price drop occurs, our system checks if multiple independent channels are reporting the same drop simultaneously. High consensus indicates a verified clearance or flash sale event.',
          },
          {
            num: '04',
            title: 'Live Stock and Cart Availability Confirmation',
            tag: 'Telemetry',
            desc: 'Scrapers poll product detail pages to check if items are in-stock, fulfilled by reputable sellers, and eligible for delivery. Expired promotions are automatically labeled as Sold Out to prevent wasted clicks.',
          },
          {
            num: '05',
            title: 'Clean Affiliate Transformation',
            tag: 'Monetization',
            desc: 'Clean URLs are transformed with transparent affiliate tags for Amazon Associates and Flipkart/EarnKaro networks. This sustains our free service with zero price impact on the buyer.',
          },
        ].map((step) => (
          <div
            key={step.num}
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '2px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--accent)',
                backgroundColor: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                padding: '6px 10px',
                borderRadius: '2px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {step.num}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {step.title}
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    backgroundColor: 'var(--accent-subtle)',
                    border: '1px solid var(--badge-disc-bdr)',
                    padding: '2px 6px',
                    borderRadius: '2px',
                  }}
                >
                  {step.tag}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Return CTA */}
      <div style={{ paddingTop: '8px' }}>
        <button
          onClick={onBackToHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-raised)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          <span>Return to Deals Feed</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
