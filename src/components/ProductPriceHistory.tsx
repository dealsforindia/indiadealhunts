import React, { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { PUBLIC_API_BASE, lookupTargetUrl } from '../utils/publicLinks';
import { cleanHistory, rupees } from '../utils/shoppingIntelligence';

export function ProductPriceHistory({ url, dealId }: { url: string; dealId?: string }) {
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [days, setDays] = useState(90);
  const [source, setSource] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 38000);
    setLoading(true); setMessage(''); setPoints([]); setSource(''); setDays(90);
    async function load() {
      try {
        const target = lookupTargetUrl(url);
        if (!target) throw new Error('Missing product link');
        // Existing directory history route uses the original product URL and Genie,
        // without waiting for a separate live merchant scrape or affiliate conversion.
        let observations: Array<[number, number]> = [];
        let historySource = '';
        if (dealId && /^[a-f0-9]{8,64}$/i.test(dealId)) {
          const request = new AbortController();
          const stop = () => request.abort();
          controller.signal.addEventListener('abort', stop, { once: true });
          const deadline = setTimeout(stop, 15000);
          try {
            const response = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/${encodeURIComponent(dealId)}/price-history`, { signal: request.signal, cache: 'no-store' });
            if (response.ok) {
              const data = await response.json();
              observations = cleanHistory(data.price_intelligence?.history || data.history);
              if (observations.length) historySource = 'ShoppinGenie';
            }
          } catch { /* Try URL lookup when directory history is unavailable. */ }
          finally { clearTimeout(deadline); controller.signal.removeEventListener('abort', stop); }
        }
        if (controller.signal.aborted) throw new Error('History lookup timed out');
        if (observations.length < 2) {
          const response = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/analyze-url?url=${encodeURIComponent(target)}`, { signal: controller.signal, cache: 'no-store' });
          if (!response.ok && !observations.length) throw new Error('History unavailable');
          if (response.ok) {
            const data = await response.json();
            const fallback = cleanHistory(data.history || data.price_intelligence?.history);
            if (fallback.length > observations.length) {
              observations = fallback;
              historySource = data.history_source === 'shoppingenie' ? 'ShoppinGenie' : 'Recorded product observations';
            }
          }
        }
        if (controller.signal.aborted) throw new Error('History lookup timed out');
        setPoints(observations);
        setSource(historySource);
        if (observations.length < 2) setMessage(observations.length ? 'Only one recorded price is available. More observations are needed for a trend.' : 'No recorded history returned for this product yet.');
      } catch {
        if (controller.signal.reason !== 'closed') setMessage(controller.signal.aborted ? 'History lookup took too long. Retry or check the store.' : 'Price history could not be retrieved. Retry or confirm the price at the store.');
      } finally {
        clearTimeout(timer);
        if (controller.signal.reason !== 'closed') setLoading(false);
      }
    }
    void load();
    return () => { clearTimeout(timer); controller.abort('closed'); };
  }, [url, dealId, attempt]);
  const visible = days ? points.filter(([time]) => time >= Date.now() - days * 86400000) : points;
  const values = visible.map(point => point[1]);
  const low = Math.min(...values), high = Math.max(...values);
  const start = visible[0]?.[0] || 0, end = visible[visible.length - 1]?.[0] || start;
  const path = visible.map(([time, price], index) => `${index ? 'L' : 'M'}${(20 + (time - start) / (end - start || 1) * 560).toFixed(1)},${(20 + (high - price) / (high - low || 1) * 110).toFixed(1)}`).join(' ');
  return <section className="commerce-price-history" aria-label="Recorded product price history" aria-busy={loading}>
    <header><div><h3><History size={17} />Price history</h3><span className="commerce-history-source">{source || 'Recorded price observations'}</span></div><button type="button" disabled={loading} aria-label="Refresh price history" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={16} /></button></header>
    <div className="commerce-history-periods" aria-label="History period">{[7, 30, 90, 0].map(period => <button type="button" key={period} aria-pressed={days === period} onClick={() => setDays(period)}>{period ? `${period} days` : 'All'}</button>)}</div>
    {loading ? <p className="commerce-history-status" role="status"><RefreshCw size={20} className="commerce-spinner" />Looking up recorded prices…</p> : visible.length >= 2 ? <>
      <svg viewBox="0 0 600 160" role="img" aria-label={`Recorded prices range from ${rupees(low)} to ${rupees(high)} across ${visible.length} observations`}>
        {[40, 85, 130].map(y => <path key={y} d={`M20 ${y}H580`} className="commerce-history-grid" />)}
        <path d={`${path}L580 150L20 150Z`} className="commerce-history-area" />
        <path d={path} className="commerce-history-line" />
        {visible.map(([time, price]) => <circle key={time} cx={20 + (time - start) / (end - start || 1) * 560} cy={20 + (high - price) / (high - low || 1) * 110} r="3.5" fill="currentColor"><title>{new Date(time).toLocaleDateString('en-IN')}: {rupees(price)}</title></circle>)}
      </svg>
      <div className="commerce-history-dates"><span>{new Date(start).toLocaleDateString('en-IN')}</span><span>{new Date(end).toLocaleDateString('en-IN')}</span></div>
      <div className="commerce-history-stats"><span>Recorded low<strong>{rupees(low)}</strong></span><span>Recorded high<strong>{rupees(high)}</strong></span><span>Observations<strong>{visible.length}</strong></span></div>
    </> : <div className="commerce-history-empty" role="status"><History size={25} /><p>{points.length && visible.length < points.length ? 'No trend in this period. Select All to see available history.' : message || 'No recorded prices in this period. Try a longer period.'}</p>{visible.length === 1 && <strong>{rupees(visible[0][1])} · {new Date(visible[0][0]).toLocaleDateString('en-IN')}</strong>}</div>}
    <small>Recorded observations, not a price prediction. History coverage varies; confirm the current checkout price.</small>
  </section>;
}
