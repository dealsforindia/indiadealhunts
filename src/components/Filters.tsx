import React from 'react';
import { SortOption } from '../types';
import { IconChevronDown } from './Icons';

interface FiltersProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals?: number;
  onlyConsensus?: boolean;
  onToggleConsensus?: () => void;
}

const STORES = [
  { id: 'all',      label: 'All Stores' },
  { id: 'Amazon',   label: 'Amazon'     },
  { id: 'Flipkart', label: 'Flipkart'   },
  { id: 'Myntra',   label: 'Myntra'     },
  { id: 'AJIO',     label: 'AJIO'       },
  { id: 'DesiDime', label: 'DesiDime'   },
  { id: 'Zepto',    label: 'Zepto'      },
  { id: 'Swiggy',   label: 'Swiggy'     },
  { id: 'Blinkit',  label: 'Blinkit'    },
];

const CATEGORIES = [
  { id: 'all',         label: 'All'         },
  { id: 'Electronics', label: 'Electronics' },
  { id: 'Fashion',     label: 'Fashion'     },
  { id: 'Home',        label: 'Home'        },
  { id: 'Kitchen',     label: 'Kitchen'     },
  { id: 'Grocery',     label: 'Grocery'     },
  { id: 'Beauty',      label: 'Beauty'      },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',     label: 'Newest First'     },
  { value: 'discount',   label: 'Highest Discount' },
  { value: 'worth',      label: 'Top Value'        },
  { value: 'price_low',  label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export const Filters: React.FC<FiltersProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onlyConsensus = false,
  onToggleConsensus,
}) => {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      role="region"
      aria-label="Deal filters"
    >
      {/* Row 1: Store pills and Sort */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Store pills (horizontal scrollable) */}
        <div
          role="group"
          aria-label="Filter by store"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
          className="scrollbar-none"
        >
          {STORES.map((s) => {
            const isActive = selectedStore.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => onSelectStore(s.id)}
                aria-pressed={isActive}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 600 : 400,
                  border: `1px solid ${isActive ? 'var(--border-strong)' : 'var(--border-default)'}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--bg-raised)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  lineHeight: '18px',
                  transition: 'background-color 100ms linear, color 100ms linear',
                }}
              >
                {s.label}
              </button>
            );
          })}

          {onToggleConsensus && (
            <button
              onClick={onToggleConsensus}
              aria-pressed={onlyConsensus}
              title="Verified by multiple sources"
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: onlyConsensus ? 600 : 400,
                border: `1px solid ${onlyConsensus ? 'var(--accent)' : 'var(--border-default)'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                backgroundColor: onlyConsensus ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                color: onlyConsensus ? 'var(--accent)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                lineHeight: '18px',
              }}
            >
              Multi-Source
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort deals"
            style={{
              padding: '5px 24px 5px 8px',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '2px',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {o.label}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconChevronDown size={10} />
          </div>
        </div>
      </div>

      {/* Row 2: Category pills */}
      <div
        role="group"
        aria-label="Filter by category"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
        className="scrollbar-none"
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Category:
        </span>
        {CATEGORIES.map((c) => {
          const isActive = selectedCategory.toLowerCase() === c.id.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              aria-pressed={isActive}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 400,
                border: `1px solid ${isActive ? 'var(--border-strong)' : 'transparent'}`,
                borderRadius: '2px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-raised)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                lineHeight: '16px',
                transition: 'background-color 100ms linear, color 100ms linear',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
