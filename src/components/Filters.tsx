import React from 'react';
import { SortOption } from '../types';

interface FiltersProps {
  selectedStore: string;
  onSelectStore: (store: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalDeals: number;
  onlyConsensus?: boolean;
  onToggleConsensus?: () => void;
}

const STORES = [
  { id: 'all',      label: 'All Stores' },
  { id: 'Amazon',   label: 'Amazon'     },
  { id: 'Flipkart', label: 'Flipkart'   },
  { id: 'Myntra',   label: 'Myntra'     },
  { id: 'AJIO',     label: 'AJIO'       },
  { id: 'Zepto',    label: 'Zepto'      },
  { id: 'Swiggy',   label: 'Swiggy'     },
  { id: 'Croma',    label: 'Croma'      },
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
  { value: 'newest',     label: 'Newest first'     },
  { value: 'discount',   label: 'Biggest discount'  },
  { value: 'worth',      label: 'Best value'        },
  { value: 'price_low',  label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
];

const CITIES = ['all', 'Kolkata', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'];

const pillBase: React.CSSProperties = {
  padding: '5px 12px',
  fontSize: '12px',
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  border: '1px solid #262626',
  borderRadius: '2px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  whiteSpace: 'nowrap',
  lineHeight: '18px',
  color: '#6B6B6B',
  transition: 'color 120ms ease, border-color 120ms ease, background-color 120ms ease',
};

const pillActive: React.CSSProperties = {
  ...pillBase,
  color: '#F5F5F5',
  backgroundColor: '#1A1A1A',
  borderColor: '#404040',
  fontWeight: 500,
};

const selectStyle: React.CSSProperties = {
  padding: '5px 8px',
  fontSize: '12px',
  fontFamily: 'var(--font-body)',
  color: '#A3A3A3',
  backgroundColor: '#111111',
  border: '1px solid #262626',
  borderRadius: '2px',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  paddingRight: '22px',
};

export const Filters: React.FC<FiltersProps> = ({
  selectedStore,
  onSelectStore,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  sortBy,
  onSortChange,
  totalDeals,
  onlyConsensus = false,
  onToggleConsensus,
}) => {
  return (
    <div
      style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      role="region"
      aria-label="Deal filters"
    >
      {/* Row 1: Store pills + right controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>

        {/* Store pills */}
        <div
          role="group"
          aria-label="Filter by store"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '2px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          className="scrollbar-none"
        >
          {STORES.map((s) => {
            const isActive = selectedStore.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                onClick={() => onSelectStore(s.id)}
                aria-pressed={isActive}
                style={isActive ? pillActive : pillBase}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                  }
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
              title="Deals confirmed by 2 or more independent Telegram channels"
              style={onlyConsensus ? { ...pillActive, color: '#F59E0B', borderColor: '#854D0E' } : pillBase}
            >
              Consensus
            </button>
          )}
        </div>

        {/* Right: deal count + location + sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#6B6B6B',
            whiteSpace: 'nowrap',
          }}>
            {totalDeals} deals
          </span>

          <div style={{ position: 'relative' }}>
            <select
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              aria-label="Filter by city"
              style={selectStyle}
            >
              {CITIES.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: '#111111', color: '#F5F5F5' }}>
                  {c === 'all' ? 'All cities' : c}
                </option>
              ))}
            </select>
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6B6B' }}
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort deals"
              style={selectStyle}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ backgroundColor: '#111111', color: '#F5F5F5' }}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B6B6B' }}
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: Category pills */}
      <div
        role="group"
        aria-label="Filter by category"
        style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}
        className="scrollbar-none"
      >
        <span style={{
          fontSize: '11px',
          color: '#6B6B6B',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
          marginRight: '4px',
          whiteSpace: 'nowrap',
        }}>
          Category:
        </span>
        {CATEGORIES.map((c) => {
          const isActive = selectedCategory.toLowerCase() === c.id.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              aria-pressed={isActive}
              style={isActive ? pillActive : pillBase}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F5';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#404040';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#6B6B6B';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                }
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
