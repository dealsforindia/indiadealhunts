import React from 'react';

const TRUST_POINTS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Verified Deals',
    description: 'Checked sources',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
    title: 'Real Discounts',
    description: 'No fake offers',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17l9.2-9.2M17 17V7H7" />
      </svg>
    ),
    title: 'Price History',
    description: 'Historical pricing',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
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
        maxWidth: '1280px',
        margin: '28px auto 0',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
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
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
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
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--muted)',
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
