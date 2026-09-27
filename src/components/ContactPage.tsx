import React, { useState } from 'react';
import { IconCheck, IconChevronRight, IconClose } from './Icons';

interface ContactPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch('https://api.rudranil.me/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Shopper',
          email: email.trim(),
          subject: subject || 'Website Inquiry',
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to send. Please email us directly at hello@rudranil.me'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <button
          onClick={onBackToHome}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
        >
          Home
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Contact &amp; Feedback</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Contact &amp; Feedback
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Report a broken link, provide deal suggestions, or reach our technical moderation desk. Direct email: <a href="mailto:hello@rudranil.me" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>hello@rudranil.me</a>.
        </p>
      </div>

      {submitted ? (
        <div
          style={{
            padding: '24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--green)',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontWeight: 600, fontSize: '16px' }}>
            <IconCheck size={18} />
            <span>Message Received</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Thank you for reaching out. Your feedback has been forwarded to our curation desk.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage('');
            }}
            style={{
              marginTop: '8px',
              padding: '6px 14px',
              backgroundColor: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                style={{
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shopper@example.com"
                style={{
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                padding: '9px 12px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="Feedback">General Feedback</option>
              <option value="Broken Link">Broken or Expired Deal Link</option>
              <option value="Deal Suggestion">Deal Suggestion</option>
              <option value="Partnership">Retail Partnership</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Message *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question, issue, or suggestion..."
              style={{
                padding: '9px 12px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {submitError && (
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--red-subtle)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: '12px', borderRadius: '2px' }}>
              {submitError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 20px',
                backgroundColor: 'var(--accent)',
                color: 'var(--text-inverse)',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '2px',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Submitting...' : 'Send Message'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
