import React, { useEffect, useState, useId, useRef } from 'react';
import { History, RefreshCw, TrendingDown, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PUBLIC_API_BASE, lookupTargetUrl } from '../utils/publicLinks';
import { cleanHistory, rupees } from '../utils/shoppingIntelligence';

interface ProductPriceHistoryProps {
  url: string;
  dealId?: string;
  currentPrice?: number;
  mrp?: number;
}

interface MappedPoint {
  time: number;
  price: number;
  x: number;
  y: number;
}

function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Recorded samples use straight segments: do not invent smooth price swings.
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return path;
}

export function ProductPriceHistory({ url, dealId, currentPrice }: ProductPriceHistoryProps) {
  const gradientId = useId();
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [days, setDays] = useState(90);
  const [source, setSource] = useState('');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 38000);
    setLoading(true);
    setMessage('');
    setPoints([]);
    setSource('');
    setDays(90);
    setHoverIdx(null);

    async function load() {
      try {
        const target = lookupTargetUrl(url);
        if (!target) throw new Error('Missing product link');

        let observations: Array<[number, number]> = [];
        let historySource = '';

        if (dealId && /^[a-f0-9]{8,64}$/i.test(dealId)) {
          const request = new AbortController();
          const stop = () => request.abort();
          controller.signal.addEventListener('abort', stop, { once: true });
          const deadline = setTimeout(stop, 15000);
          try {
            const response = await fetch(
              `${PUBLIC_API_BASE}/api/v1/deals/${encodeURIComponent(dealId)}/price-history`,
              { signal: request.signal, cache: 'no-store' }
            );
            if (response.ok) {
              const data = await response.json();
              observations = cleanHistory(data.price_intelligence?.history || data.history);
              if (observations.length) historySource = 'DealFlow Verified History';
            }
          } catch {
            /* Try URL lookup when directory history is unavailable */
          } finally {
            clearTimeout(deadline);
            controller.signal.removeEventListener('abort', stop);
          }
        }

        if (controller.signal.aborted) throw new Error('History lookup timed out');

        if (observations.length < 2) {
          const response = await fetch(
            `${PUBLIC_API_BASE}/api/v1/deals/analyze-url?url=${encodeURIComponent(target)}`,
            { signal: controller.signal, cache: 'no-store' }
          );
          if (response.ok) {
            const data = await response.json();
            const fallback = cleanHistory(data.history || data.price_intelligence?.history);
            if (fallback.length > observations.length) {
              observations = fallback;
              historySource = 'DealFlow Verified History';
            }
          }
        }

        if (controller.signal.aborted) throw new Error('History lookup timed out');

        // If only 1 observation and currentPrice is available, ensure spot observation is accurate
        if (observations.length === 0 && currentPrice && currentPrice > 0) {
          observations = [[Date.now(), currentPrice]];
          historySource = 'Live Scanned Baseline';
        }

        setPoints(observations);
        setSource(historySource);
        if (observations.length < 2) {
          setMessage(
            observations.length
              ? 'Initial recorded price logged. Trend forms as subsequent observations arrive.'
              : 'Live dropped offer. New price points are being recorded as prices update.'
          );
        }
      } catch {
        if (controller.signal.reason !== 'closed') {
          setMessage('Live dropped offer. New price points are being recorded as prices update.');
        }
      } finally {
        clearTimeout(timer);
        if (controller.signal.reason !== 'closed') setLoading(false);
      }
    }

    void load();
    return () => {
      clearTimeout(timer);
      controller.abort('closed');
    };
  }, [url, dealId, attempt, currentPrice]);

  // Filter points based on selected period
  const visible = days ? points.filter(([time]) => time >= Date.now() - days * 86400000) : points;
  const values = visible.map(([, price]) => price);
  const rawLow = values.length ? Math.min(...values) : 0;
  const rawHigh = values.length ? Math.max(...values) : 0;
  const latestPrice = values.length ? values[values.length - 1] : rawLow;

  // Chart Canvas Dimensions
  const chartWidth = 360;
  const chartHeight = 230;
  const chartLeft = 12;
  const chartRight = 290; // Reserve room for readable rupee labels.
  const chartTop = 24;
  const chartBottom = 194;
  const innerWidth = chartRight - chartLeft;
  const innerHeight = chartBottom - chartTop;

  // Y-Axis Range & Smart Centering for Flat Lines
  let yMin: number;
  let yMax: number;
  if (rawHigh === rawLow) {
    const spread = Math.max(Math.round(rawLow * 0.15), 100);
    yMin = Math.max(0, rawLow - spread);
    yMax = rawLow + spread;
  } else {
    const spread = (rawHigh - rawLow) * 0.15;
    yMin = Math.max(0, Math.floor(rawLow - spread));
    yMax = Math.ceil(rawHigh + spread);
  }

  const start = visible[0]?.[0] || 0;
  const end = visible[visible.length - 1]?.[0] || start;
  const timeSpan = end - start;

  // Map coordinates
  const mappedPoints: MappedPoint[] = visible.map(([time, price], idx) => {
    let x: number;
    if (timeSpan <= 0) {
      x = chartLeft + (idx / Math.max(visible.length - 1, 1)) * innerWidth;
    } else {
      x = chartLeft + ((time - start) / timeSpan) * innerWidth;
    }
    const y = chartTop + ((yMax - price) / (yMax - yMin || 1)) * innerHeight;
    return { time, price, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  // Calculate smooth curves
  const linePath = createSmoothPath(mappedPoints);
  const areaPath = mappedPoints.length >= 2
    ? `${linePath} L ${mappedPoints[mappedPoints.length - 1].x} ${chartBottom} L ${mappedPoints[0].x} ${chartBottom} Z`
    : '';

  // Y-axis grid ticks (3 horizontal levels)
  const yTicks = [
    { y: chartTop + 6, price: yMax },
    { y: (chartTop + chartBottom) / 2, price: Math.round((yMax + yMin) / 2) },
    { y: chartBottom - 6, price: yMin },
  ];

  // Active point for scrubbing
  const activePt = hoverIdx !== null && mappedPoints[hoverIdx] ? mappedPoints[hoverIdx] : null;
  const displayedPrice = activePt ? activePt.price : latestPrice;
  const isLowestEver = rawLow > 0 && latestPrice <= rawLow;

  // Mouse & Touch Scrubbing Handlers
  const handlePointerMove = (clientX: number) => {
    if (!chartRef.current || mappedPoints.length < 2) return;
    const rect = chartRef.current.querySelector('svg')?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = ((clientX - rect.left) / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDist = Infinity;
    mappedPoints.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIdx(closestIdx);
  };

  return (
    <section
      className="proper-price-history premium-history mt-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#070b14] p-4 sm:p-5 shadow-sm text-slate-800 dark:text-slate-100 min-w-0 transition-colors"
      aria-label="Recorded product price history"
      aria-busy={loading}
    >
      {/* 1. Header with Live Telemetry & Badge */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            {isLowestEver ? <TrendingDown size={17} /> : <Activity size={17} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Price history & trend
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {loading ? 'Loading' : points.length >= 2 ? 'Recorded history' : points.length === 1 ? 'One observation' : 'Unavailable'}
              </span>
            </div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {source || 'DealFlow Verified Merchant Scanners'}
            </span>
          </div>
        </div>

        {/* Right Header Status / Refresh */}
        <div className="flex items-center gap-2">
          {visible.length >= 2 && (
            <div className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              isLowestEver
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25'
                : 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/25'
            }`}>
              {isLowestEver ? 'Lowest in this period' : rawHigh === rawLow ? '⚖️ Stable at Current Level' : 'Recorded price range'}
            </div>
          )}
          <button
            type="button"
            disabled={loading}
            aria-label="Refresh price history"
            onClick={() => setAttempt(v => v + 1)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Re-check verified merchant prices"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* 2. Interactive Period Segmented Control */}
      <div className="flex items-center justify-between gap-2 mt-3.5 mb-3 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/5 gap-1 text-xs">
          {[
            { label: '7 days', val: 7 },
            { label: '30 days', val: 30 },
            { label: '90 days', val: 90 },
            { label: 'All', val: 0 },
          ].map(p => (
            <button
              type="button"
              key={p.val}
              aria-pressed={days === p.val}
              onClick={() => { setDays(p.val); setHoverIdx(null); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                days === p.val
                  ? 'bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-slate-200/60 dark:border-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Dynamic Scrubbing Indicator */}
        {activePt && (
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>
              Inspecting: <strong className="text-slate-800 dark:text-white font-bold">{rupees(activePt.price)}</strong> on{' '}
              {new Date(activePt.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {!loading && visible.length >= 2 && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{activePt ? 'Selected observation' : 'Latest recorded price'}</span>
            <strong className="block text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{rupees(displayedPrice)}</strong>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Touch to inspect · Swipe to scroll</span>
        </div>
      )}

      {/* 3. Main Chart Canvas / States */}
      {loading ? (
        <div className="min-h-[190px] flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 py-10" role="status">
          <RefreshCw size={24} className="animate-spin text-sky-500" />
          <p className="text-xs font-medium">Scanning authentic historical price observations…</p>
        </div>
      ) : visible.length >= 2 ? (
        <div
          ref={chartRef}
          className="relative select-none touch-pan-y rounded-xl border border-slate-200/60 dark:border-white/5 bg-gradient-to-b from-white/40 to-slate-100/30 dark:from-white/[0.02] dark:to-transparent p-2 sm:p-3 overflow-hidden"
          onMouseMove={e => handlePointerMove(e.clientX)}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchStart={e => e.touches[0] && handlePointerMove(e.touches[0].clientX)}
          onTouchCancel={() => setHoverIdx(null)}
          onTouchMove={e => e.touches[0] && handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIdx(null)}
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="price-history-chart w-full block overflow-visible"
            role="img"
            aria-label={`Price trend from ${rupees(rawLow)} to ${rupees(rawHigh)} across ${visible.length} points`}
          >
            <defs>
              {/* Luminous Area Fill Gradient */}
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={'#8b5cf6'} stopOpacity="0.28" />
                <stop offset="50%" stopColor={'#8b5cf6'} stopOpacity="0.08" />
                <stop offset="100%" stopColor={'#8b5cf6'} stopOpacity="0.0" />
              </linearGradient>

              {/* Stroke Gradient */}
              <linearGradient id={`${gradientId}-stroke`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={'#7c3aed'} />
                <stop offset="100%" stopColor={'#a78bfa'} />
              </linearGradient>

              {/* Drop Shadow Glow Filter */}
              <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor={'#7c3aed'}
                  floodOpacity="0.25"
                />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Right Y-Axis Price Labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={chartLeft}
                  y1={tick.y}
                  x2={chartRight}
                  y2={tick.y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  className="text-slate-200 dark:text-slate-800/80"
                />
                <text
                  x={chartRight + 8}
                  y={tick.y + 3.5}
                  fontSize="12"
                  fontWeight="600"
                  className="fill-slate-400 dark:fill-slate-500 font-mono select-none"
                >
                  ₹{tick.price.toLocaleString('en-IN')}
                </text>
              </g>
            ))}

            {/* High / Low Threshold Guide Lines if variable */}
            {rawHigh !== rawLow && (
              <line
                x1={chartLeft}
                y1={mappedPoints.find(p => p.price === rawLow)?.y ?? chartBottom}
                x2={chartRight}
                y2={mappedPoints.find(p => p.price === rawLow)?.y ?? chartBottom}
                stroke="#10b981"
                strokeDasharray="2 3"
                strokeWidth="1"
                opacity="0.4"
              />
            )}

            {/* Smooth Gradient Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#${gradientId}-area)`}
              />
            )}

            {/* Smooth Curved Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId}-stroke)`}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${gradientId}-glow)`}
            />

            {/* Historical Observation Anchor Dots */}
            {mappedPoints.map((pt, index) => {
              const isHovered = hoverIdx === index;
              return (
                <g key={index}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3}
                    fill={isHovered ? '#ffffff' : ('#8b5cf6')}
                    stroke={isHovered ? ('#7c3aed') : '#ffffff'}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}

            {/* Active Scrubbing Crosshair & Target Focus */}
            {activePt && (
              <g className="pointer-events-none">
                {/* Vertical Crosshair Guide Line */}
                <line
                  x1={activePt.x}
                  y1={chartTop}
                  x2={activePt.x}
                  y2={chartBottom}
                  stroke="#a78bfa"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  className="opacity-75"
                />

                {/* Glowing Target Pulsing Rings */}
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="10"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  className="animate-ping opacity-40"
                />
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                />
              </g>
            )}
          </svg>

          {/* Interactive Floating Tooltip Overlay */}
          {activePt && (
            <div
              className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-full transition-all duration-75"
              style={{
                left: `${Math.max(12, Math.min(88, (activePt.x / chartWidth) * 100))}%`,
                top: `${Math.max(12, (activePt.y / chartHeight) * 100 - 6)}%`,
              }}
            >
              <div className="price-history-tooltip bg-violet-600 text-white border border-white/20 shadow-xl rounded-xl px-3 py-2 text-xs flex flex-col gap-0.5 whitespace-nowrap min-w-[120px]">
                <div className="text-[10px] text-violet-100 font-medium">
                  {new Date(activePt.time).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  ·{' '}
                  {new Date(activePt.time).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-base font-extrabold text-white tracking-tight">
                  {rupees(activePt.price)}
                </div>
                <div className="text-[9.5px] font-semibold text-violet-100">
                  {activePt.price <= rawLow ? '🟢 Lowest price recorded' : `+₹${(activePt.price - rawLow).toLocaleString('en-IN')} vs lowest`}
                </div>
              </div>
            </div>
          )}

          {/* X-Axis Timeline Markers */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 px-1 border-t border-slate-200/50 dark:border-white/5">
            {timeSpan < 86400000 ? (
              <>
                <span>First check: {new Date(start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {new Date(start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>Latest check: {new Date(end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : (
              <>
                <span>{new Date(start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                {timeSpan >= 86400000 * 3 && (
                  <span>{new Date(start + timeSpan / 2).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                )}
                <span>Latest ({new Date(end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</span>
              </>
            )}
          </div>
        </div>
      ) : (
        /* 4. Single-point / Baseline Established State */
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-white/[0.02] p-6 text-center flex flex-col items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <History size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              Verified Price Baseline Established
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5 leading-relaxed">
              {message || 'Initial verified observation recorded. The trend curve populates automatically as subsequent price scanner checks run.'}
            </p>
          </div>
          {visible.length === 1 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1">
              <CheckCircle2 size={14} />
              Logged at {rupees(visible[0][1])} · {new Date(visible[0][0]).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>
      )}

      {/* 5. Key Metrics Stats Cards Strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-4">
        {/* Lowest Price Card */}
        <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.02] p-2.5 sm:p-3 flex flex-col justify-between">
          <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">Recorded low</span>
          <strong className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {rawLow > 0 ? rupees(rawLow) : '—'}
          </strong>
          <span className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/70 font-medium mt-0.5">
            {isLowestEver ? '🎯 Current offer' : 'Selected period low'}
          </span>
        </div>

        {/* Highest Price Card */}
        <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.02] p-2.5 sm:p-3 flex flex-col justify-between">
          <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">Recorded high</span>
          <strong className="text-sm sm:text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
            {rawHigh > 0 ? rupees(rawHigh) : '—'}
          </strong>
          <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {rawHigh === rawLow ? 'Steady reference' : 'Peak check'}
          </span>
        </div>

        {/* Observations Card */}
        <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.02] p-2.5 sm:p-3 flex flex-col justify-between">
          <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">Observations</span>
          <strong className="text-sm sm:text-base font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
            {visible.length} {visible.length === 1 ? 'check' : 'checks'}
          </strong>
          <span className="text-[9.5px] text-sky-600/80 dark:text-sky-400/70 font-medium mt-0.5">
            {days ? `Selected ${days} days` : 'All observations'}
          </span>
        </div>
      </div>

      {/* 6. Legal / Verification Footer */}
      <footer className="mt-3.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <span>
          Recorded observations verified by DealFlow crawlers. Confirm current checkout price directly with the merchant.
        </span>
      </footer>
    </section>
  );
}
