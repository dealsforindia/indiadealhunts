import React, { useState, useRef } from 'react';

// Define explicit types instead of `any`
interface DealSubmissionResult {
  status: string;
  message?: string;
  deal_id?: string;
  [key: string]: unknown;
}

interface SubmitDealProps {
  onBackToHome?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const SubmitDeal: React.FC<SubmitDealProps> = ({ onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [store, setStore] = useState('Amazon');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [tip, setTip] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealResult, setDealResult] = useState<DealSubmissionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !tip.trim()) {
      setError('Please provide either a product link or a tip text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetUrl = url.trim() || tip.trim();
      
      // If we have a file, use FormData. Otherwise use JSON.
      // Assuming backend supports both or multipart fallback
      let res: Response;
      
      if (file) {
        const formData = new FormData();
        formData.append('url', targetUrl);
        formData.append('store', store);
        if (price) formData.append('price', price);
        if (mrp) formData.append('mrp', mrp);
        if (tip) formData.append('tip', tip);
        if (email) formData.append('email', email);
        formData.append('screenshot', file);

        res = await fetch(`${API_BASE}/api/v1/deals/submit`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/v1/deals/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            store,
            price: price ? parseFloat(price) : null,
            mrp: mrp ? parseFloat(mrp) : null,
            tip,
            email: email.trim(),
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to submit deal. Please verify the URL.');
      }

      const data = await res.json() as DealSubmissionResult;
      setDealResult(data);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please check your connection or URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setUrl('');
    setStore('Amazon');
    setPrice('');
    setMrp('');
    setTip('');
    setFile(null);
    setSubmitted(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <button onClick={onBackToHome} style={{ background: 'none', border: 'none', color: '#6B6B6B', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
          &larr; Back to Home
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', color: '#F5F5F5', margin: '0 0 8px' }}>
          Submit a Deal
        </h1>
        <p style={{ fontSize: '14px', color: '#A3A3A3', margin: 0, fontFamily: 'var(--font-body)' }}>
          Found a massive price drop? Share it with the community. Approved deals get published to Telegram automatically.
        </p>
      </div>

      {submitted ? (
        <div style={{ padding: '32px', backgroundColor: '#0F2018', border: '1px solid #166534', borderRadius: '4px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: '#22C55E', margin: '0 0 8px' }}>
            Deal Submitted Successfully
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A3A3', marginBottom: '24px' }}>
            Thank you for contributing. Our AI verification engine is processing the link.
            {dealResult?.deal_id && <span style={{ display: 'block', marginTop: '8px' }}>Tracking ID: <code style={{ color: '#F5F5F5' }}>{dealResult.deal_id}</code></span>}
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px', backgroundColor: '#F5F5F5', color: '#0A0A0A', border: 'none',
              borderRadius: '2px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}
          >
            Submit Another Deal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#1F0D0D', border: '1px solid #450A0A', color: '#EF4444', fontSize: '13px', borderRadius: '2px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="deal-url" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>Deal URL (Required)</label>
              <input
                id="deal-url"
                type="url"
                required
                placeholder="https://amazon.in/dp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="deal-store" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>Store</label>
              <select
                id="deal-store"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none' }}
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Myntra">Myntra</option>
                <option value="AJIO">AJIO</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zepto">Zepto</option>
                <option value="Blinkit">Blinkit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="deal-price" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>Sale Price (₹)</label>
              <input
                id="deal-price"
                type="number"
                placeholder="e.g. 499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="deal-mrp" style={{ fontSize: '12px', fontWeight: 600, color: '#A3A3A3' }}>Regular MRP (Optional)</label>
              <input
                id="deal-mrp"
                type="number"
                placeholder="e.g. 1999"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="deal-tip" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>How to claim / Bank offers</label>
            <textarea
              id="deal-tip"
              rows={3}
              placeholder="e.g. Apply ₹200 coupon on page and use SBI credit card for extra 10% off."
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="deal-file" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>Screenshot (Optional, max 5MB)</label>
            <input
              id="deal-file"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '16px', borderTop: '1px solid #1E1E1E' }}>
            <label htmlFor="deal-email" style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>Your Email (Optional, for updates)</label>
            <input
              id="deal-email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '10px 12px', backgroundColor: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '14px', borderRadius: '2px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '16px',
              padding: '14px',
              backgroundColor: '#D47A10',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '2px',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 150ms ease',
            }}
          >
            {loading ? 'Submitting...' : 'Submit Deal to Engineers'}
          </button>
        </form>
      )}
    </div>
  );
};
