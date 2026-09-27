import React, { useState, useEffect } from 'react';

interface DealLookupModalProps {
  initialUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const DealLookupModal: React.FC<DealLookupModalProps> = ({
  initialUrl = '',
  isOpen = true,
  onClose,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialUrl) {
      handleLookup(initialUrl);
    }
  }, [initialUrl]);

  const handleLookup = async (inputUrl: string) => {
    const targetUrl = (inputUrl || url).trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`https://api.rudranil.me/api/v1/deals/analyze-url?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Verification failed. This might not be a supported product link.');
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%', maxWidth: '640px', backgroundColor: '#111111', border: '1px solid #262626',
          borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #1E1E1E', backgroundColor: '#161616' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontFamily: 'var(--font-heading)', color: '#F5F5F5' }}>Link Lookup</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer' }}>Close</button>
        </div>

        <div style={{ padding: '24px' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleLookup(url); }}
            style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}
          >
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste Amazon/Flipkart URL..."
              required
              style={{
                flex: 1, padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626',
                color: '#F5F5F5', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0 20px', backgroundColor: '#D47A10', border: 'none', color: '#0A0A0A',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {error && (
            <div style={{ padding: '16px', backgroundColor: '#1F0D0D', border: '1px solid #450A0A', color: '#EF4444', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="skeleton" style={{ height: '200px', width: '100%' }} />
          )}

          {result && !loading && (
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#F5F5F5', fontFamily: 'var(--font-heading)' }}>
                {result.product_name}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, padding: '16px', backgroundColor: '#161616', border: '1px solid #262626' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>Current Price</span>
                  <span className="price-num" style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5' }}>
                    {'\u20B9'}{typeof result.price === 'number' ? result.price.toLocaleString('en-IN') : result.price}
                  </span>
                </div>
                <div style={{ flex: 1, padding: '16px', backgroundColor: '#161616', border: '1px solid #262626' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>Verdict</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: result.is_deal ? '#22C55E' : '#EF4444' }}>
                    {result.is_deal ? 'Good Deal' : 'Wait for Drop'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
