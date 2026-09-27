import React from 'react';

export const DealSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '2px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* 1:1 Image placeholder */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '2px',
        }}
      />

      {/* Metadata placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '48px', height: '12px' }} />
        <div className="skeleton" style={{ width: '36px', height: '12px' }} />
      </div>

      {/* Title placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="skeleton" style={{ width: '92%', height: '14px' }} />
        <div className="skeleton" style={{ width: '60%', height: '14px' }} />
      </div>

      {/* Price block placeholder */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
        <div className="skeleton" style={{ width: '64px', height: '18px' }} />
        <div className="skeleton" style={{ width: '40px', height: '12px' }} />
        <div className="skeleton" style={{ width: '44px', height: '14px', marginLeft: 'auto' }} />
      </div>

      {/* Action button placeholder */}
      <div className="skeleton" style={{ width: '100%', height: '34px', marginTop: '4px' }} />
    </div>
  );
};

export const DealSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '12px',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <DealSkeleton key={i} />
      ))}
    </div>
  );
};
