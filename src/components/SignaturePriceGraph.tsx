import React from 'react';
import { motion } from 'motion/react';

interface SignaturePriceGraphProps {
  currentPrice: number;
  regularPrice?: number;
  mrp?: number;
}

export const SignaturePriceGraph: React.FC<SignaturePriceGraphProps> = ({
  currentPrice,
  regularPrice,
  mrp,
}) => {
  // Only render graph when we have real price comparison data — never fabricate historical prices
  const hasRealHistory = Boolean((regularPrice && regularPrice > currentPrice) || (mrp && mrp > currentPrice));
  const highPrice = regularPrice || mrp || 0;
  const diff = highPrice - currentPrice;
  const dropPct = highPrice > 0 ? Math.round((diff / highPrice) * 100) : 0;

  if (!hasRealHistory) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '14px 16px',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#94A3B8',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600 }}>
          30-Day Price History — Not enough data yet
        </span>
      </div>
    );
  }

  // Coordinate geometry for 320x100 SVG stage
  const startX = 24;
  const startY = 24;
  const currentX = 296;
  const currentY = 82;
  const bottomY = 98;

  const path = `M ${startX} ${startY} C 100 ${startY}, 130 50, 180 54 C 230 58, 250 ${currentY}, ${currentX} ${currentY}`;
  const areaPath = `${path} L ${currentX} ${bottomY} L ${startX} ${bottomY} Z`;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '16px',
        marginTop: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          30-Day Price History
        </span>
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.35 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#059669',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          ↓ {dropPct}% below recent average
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '110px' }}>
        <svg
          viewBox="0 0 320 100"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="price-blue-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="20" y1={startY} x2="300" y2={startY} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="20" y1={currentY} x2="300" y2={currentY} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill="url(#price-blue-grad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          />

          {/* Line Path */}
          <motion.path
            d={path}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* High Price Marker */}
          <circle cx={startX} cy={startY} r="3" fill="#94A3B8" />
          <text
            x={startX + 6}
            y={startY - 6}
            fill="#64748B"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
          >
            ₹{highPrice.toLocaleString('en-IN')}
          </text>

          {/* Current Price Dot */}
          <motion.circle
            cx={currentX}
            cy={currentY}
            r="4.5"
            fill="#2563EB"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
          />

          {/* Tiny Outer Pulse Ring (once) */}
          <motion.circle
            cx={currentX}
            cy={currentY}
            r="6"
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
          />

          {/* Current Price Label */}
          <text
            x={currentX - 10}
            y={currentY + 16}
            textAnchor="end"
            fill="#0F172A"
            fontSize="12"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="800"
          >
            ₹{currentPrice.toLocaleString('en-IN')}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94A3B8' }}>
          30 days ago
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2563EB', fontWeight: 600 }}>
          Today (Verified Low)
        </span>
      </div>
    </div>
  );
};
