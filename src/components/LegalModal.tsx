import React, { useEffect } from 'react';
import { IconClose, IconShieldCheck, IconCheck, IconDocument, IconInfo, IconExternalLink } from './Icons';

export type LegalDocType = 'disclosure' | 'verify' | 'terms' | 'privacy' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          textAlign: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
            <IconShieldCheck size={16} color="var(--accent)" />
            <h2
              id="legal-modal-title"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {type === 'disclosure' && 'Affiliate Disclosure'}
              {type === 'verify' && 'How Deals Are Verified'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'privacy' && 'Privacy Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          {/* AFFILIATE DISCLOSURE */}
          {type === 'disclosure' && (
            <>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                IndiaDealHunts operates on complete transparency. Our service is free to use and sustained through retail partner commissions.
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Amazon Associates Program
                </h4>
                <p>
                  IndiaDealHunts is a participant in the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases. When you click an Amazon link on our site and make a purchase, we may receive a commission at zero additional cost to you. The price you pay is completely unchanged.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Flipkart and EarnKaro Affiliate Networks
                </h4>
                <p>
                  We participate in the Flipkart Affiliate Program and partner networks including EarnKaro. When you purchase items on Flipkart, Myntra, Ajio, Swiggy, or Croma through our links, we may receive referral compensation.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Editorial Independence
                </h4>
                <p>
                  Commission rates never determine which deals are posted. Deals are surfaced based strictly on verified price drops and genuine merchant discounts.
                </p>
              </div>
            </>
          )}

          {/* VERIFY METHODOLOGY */}
          {type === 'verify' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Multi-Channel Signal Verification
                </h4>
                <p>
                  Incoming price drops are scanned across 27 monitored Indian shopping channels. Multi-source consensus verifies whether a price is genuine before promotion.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Inflation Filter
                </h4>
                <p>
                  Sellers often artificially inflate MRP before applying fake discounts. Our engine compares current prices against historical retail prices to calculate honest discount percentages.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Direct Merchant Landing
                </h4>
                <p>
                  All redirect links are resolved directly to official merchant domains (amazon.in, flipkart.com, myntra.com). Third-party redirect chains are inspected for user safety.
                </p>
              </div>
            </>
          )}

          {/* TERMS OF SERVICE */}
          {type === 'terms' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Service Nature
                </h4>
                <p>
                  IndiaDealHunts is an automated deal aggregator and price comparison discovery tool. We do not sell products directly. All transactions occur on third-party merchant sites (Amazon, Flipkart, etc.).
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Pricing and Stock Availability
                </h4>
                <p>
                  Prices and stock availability fluctuate rapidly on retail marketplaces. While our automated engine scans deals continuously, prices displayed were accurate at the time of publication and may change without notice.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Limitation of Liability
                </h4>
                <p>
                  IndiaDealHunts is not responsible for product warranties, fulfillment, shipping delays, or refund disputes. All customer support requests regarding orders must be directed to the respective retail merchant.
                </p>
              </div>
            </>
          )}

          {/* PRIVACY POLICY */}
          {type === 'privacy' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Zero Personal Data Harvesting
                </h4>
                <p>
                  IndiaDealHunts does not require user accounts, passwords, or personal identity information to browse or search deals.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Local Storage and Preferences
                </h4>
                <p>
                  We store UI state preferences (such as selected store filters and theme configurations) locally in your browser storage. This data never leaves your device.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Outbound Links and Third-Party Cookies
                </h4>
                <p>
                  When navigating to external retailer websites via deal links, third-party affiliate networks may set tracking cookies according to their respective privacy policies to credit referral commissions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-raised)',
              border: '1px solid var(--border-strong)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
