import React from 'react';
import { motion } from 'motion/react';

interface CategoryRailProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts?: Record<string, number>;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'All Deals',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'Electronics',
    label: 'Electronics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'Fashion',
    label: 'Fashion',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    ),
  },
  {
    id: 'Home',
    label: 'Home',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'Grocery',
    label: 'Grocery',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    id: 'Beauty',
    label: 'Beauty',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'Sports',
    label: 'Sports',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
      </svg>
    ),
  },
  {
    id: 'Automotive',
    label: 'Automotive',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 3M19 17l1 3" />
        <circle cx="7.5" cy="12.5" r="1.5" />
        <circle cx="16.5" cy="12.5" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'Travel',
    label: 'Travel',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.5-.1-.9.1-1.2.4l-.8.8c-.3.3-.3.8 0 1.1l5.5 3.5-3.5 3.5-2.5-.5c-.3 0-.6.1-.8.3l-.5.5c-.2.2-.2.6 0 .8l2.5 2.5 2.5 2.5c.2.2.6.2.8 0l.5-.5c.2-.2.3-.5.3-.8l-.5-2.5 3.5-3.5 3.5 5.5c.3.3.8.3 1.1 0l.8-.8c.3-.3.5-.7.4-1.2z" />
      </svg>
    ),
  },
];

export const CategoryRail: React.FC<CategoryRailProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <nav
      id="category-rail"
      aria-label="Category navigation rail"
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: '64px',
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          gap: '4px',
          height: '56px',
        }}
        className="scrollbar-none"
      >
        {CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 14px',
                height: '56px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#F59E0B' : '#9099A6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#F5F7FA';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#9099A6';
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>

              {/* Physical sliding underline indicator */}
              {isSelected && (
                <motion.div
                  layoutId="category-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: '#F59E0B',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
