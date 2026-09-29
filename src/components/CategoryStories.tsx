import React, { useRef } from 'react';
import { motion } from 'motion/react';

interface CategoryStoriesProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

const CATEGORIES = [
  { id: 'all',         label: 'All Deals' },
  { id: 'loot70',      label: '70%+ Off' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion',     label: 'Fashion' },
  { id: 'beauty',      label: 'Beauty' },
  { id: 'home',        label: 'Home & Kitchen' },
  { id: 'grocery',     label: 'Grocery' },
  { id: 'health',      label: 'Health' },
  { id: 'sports',      label: 'Sports' },
  { id: 'automotive',  label: 'Auto' },
];

export const CategoryStories: React.FC<CategoryStoriesProps> = ({ selectedCategory, onSelectCategory }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback for 'loot70' magic category
  const activeId = selectedCategory.toLowerCase() === 'loot70' ? 'loot70' : selectedCategory.toLowerCase();

  return (
    <div style={{ position: 'relative', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg)' }}>
      <div
        ref={containerRef}
        className="container-wide cat-rail"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          height: '56px',
        }}
        role="tablist"
        aria-label="Deal categories"
      >
        {CATEGORIES.map(cat => {
          const isActive = activeId === cat.id || (activeId === 'all' && cat.id === 'all');
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`Category: ${cat.label}`}
              onClick={() => {
                onSelectCategory(cat.id);
                // Scroll button loosely into view
                const btn = document.getElementById(`catbtn-${cat.id}`);
                if (btn && containerRef.current) {
                  containerRef.current.scrollTo({
                    left: btn.offsetLeft - containerRef.current.offsetWidth / 2 + btn.offsetWidth / 2,
                    behavior: 'smooth'
                  });
                }
              }}
              id={`catbtn-${cat.id}`}
              style={{
                position: 'relative',
                height: '100%',
                padding: '0 16px',
                background: 'none',
                border: 'none',
                outline: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                transition: 'color 150ms ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }}
            >
              {cat.id === 'loot70' && <span style={{ color: 'var(--accent)', marginRight: '4px', display: 'inline-block' }}>⚡</span>}
              {cat.label}

              {/* Shared motion layout indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '12px',
                    right: '12px',
                    height: '2px',
                    background: 'var(--accent)',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
