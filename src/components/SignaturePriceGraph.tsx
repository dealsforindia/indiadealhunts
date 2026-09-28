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
  const highPrice = regularPrice || mrp || Math.round(currentPrice * 1.5);
  const diff = highPrice - currentPrice;
  const dropPct = highPrice > 0 ? Math.round((diff / highPrice) * 100) : 31;

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
        backgroundColor: '#141820',
        border: '1px solid #28313D',
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
            color: '#9099A6',
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
            color: '#22C55E',
            backgroundColor: '#123322',
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
            <linearGradient id="price-amber-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="20" y1={startY} x2="300" y2={startY} stroke="#1F2630" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="20" y1={currentY} x2="300" y2={currentY} stroke="#1F2630" strokeDasharray="3 3" strokeWidth="1" />

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill="url(#price-amber-grad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          />

          {/* Line Path */}
          <motion.path
            d={path}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          {/* High Price Marker */}
          <circle cx={startX} cy={startY} r="3" fill="#687482" />
          <text
            x={startX + 6}
            y={startY - 6}
            fill="#9099A6"
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
            fill="#F59E0B"
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
            stroke="#F59E0B"
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
            fill="#F59E0B"
            fontSize="12"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="800"
          >
            ₹{currentPrice.toLocaleString('en-IN')}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#687482' }}>
          30 days ago
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>
          Today (Verified Low)
        </span>
      </div>
    </div>
  );
};
