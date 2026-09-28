import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCount: React.FC<CountUpProps> = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          let current = 0;
          const duration = 1000; // ms
          const steps = 20;
          const increment = target / steps;
          const stepTime = duration / steps;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.round(current));
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={elementRef} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

const TRUST_METRICS = [
  { target: 1248, label: 'Verified Deals Active', suffix: '' },
  { target: 45000, label: 'Deal Hunters Saved', suffix: '+' },
  { target: 27, label: 'Channels Monitored', suffix: '' },
  { target: 100, label: 'No Affiliate Cloaking', suffix: '%', prefix: '' },
];

const TRUST_POINTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Verified Deals',
    description: 'Manually checked',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Real Discounts',
    description: 'No fake offers',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: 'Price History',
    description: 'See price trends',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: 'Trusted Sources',
    description: 'Amazon, Flipkart & more',
  },
];

export const TrustStrip: React.FC = () => {
  return (
    <section
      aria-label="Verification and trust features"
      style={{
        maxWidth: '1320px',
        margin: '40px auto 0',
        padding: '0 20px',
      }}
    >
      {/* ── Count-up Statistics (Micro-interaction 16) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          paddingBottom: '24px',
        }}
        className="md:grid-cols-4"
      >
        {TRUST_METRICS.map((metric, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#141820',
              border: '1px solid #28313D',
              borderRadius: '6px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '22px',
                fontWeight: 800,
                color: '#F59E0B',
                lineHeight: 1,
              }}
            >
              <AnimatedCount target={metric.target} suffix={metric.suffix} prefix={metric.prefix} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: '#9099A6',
              }}
            >
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Trust Pillars ── */}
      <div
        style={{
          borderTop: '1px solid #23262F',
          borderBottom: '1px solid #23262F',
          padding: '24px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}
        className="md:grid-cols-4"
      >
        {TRUST_POINTS.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#F5F7FA',
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#9099A6',
                  marginTop: '2px',
                }}
              >
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
