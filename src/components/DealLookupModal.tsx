import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IconClose, IconSearch, IconShieldCheck, IconExternalLink } from './Icons';

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
        throw new Error(data.message || 'Verification failed. Please verify the product link is accessible.');
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconSearch size={16} color="var(--accent)" />
            <h2
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
              }}
            >
              Price Drop &amp; Deal Analyzer
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconClose size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: '20px' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(url);
            }}
            style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amazon, Flipkart, or Myntra link..."
              required
              style={{
                flex: 1,
                padding: '10px 12px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                borderRadius: '2px',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '0 16px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loading ? 'Analyzing...' : 'Verify Deal'}
            </button>
          </form>

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--red-subtle)',
                border: '1px solid var(--red)',
                color: 'var(--red)',
                fontSize: '13px',
                borderRadius: '2px',
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                backgroundColor: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                  }}
                >
                  {result.store || 'Verified Store'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <IconShieldCheck size={14} />
                  Safe Link
                </span>
              </div>

              <h4
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                }}
              >
                {result.title || 'Product Analysis Complete'}
              </h4>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                {result.price && (
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {'\u20B9'}{Number(result.price).toLocaleString('en-IN')}
                  </span>
                )}
                {result.mrp && result.mrp > result.price && (
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {'\u20B9'}{Number(result.mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {result.discount_pct && (
                  <span
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'var(--badge-disc-bg)',
                      border: '1px solid var(--badge-disc-bdr)',
                      color: 'var(--badge-disc-fg)',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '2px',
                    }}
                  >
                    {result.discount_pct}% OFF
                  </span>
                )}
              </div>

              {result.clean_url && (
                <a
                  href={result.clean_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{
                    marginTop: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '2px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Open Clean Merchant Link</span>
                  <IconExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
