import React from 'react';

interface CategoryStoriesProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const CATEGORIES = [
  { id: 'Electronics', label: 'Tech' },
  { id: 'Fashion',     label: 'Style' },
  { id: 'Home',        label: 'Home' },
  { id: 'Kitchen',     label: 'Kitchen' },
  { id: 'Grocery',     label: 'Grocery' },
  { id: 'Beauty',      label: 'Beauty' },
];

export const CategoryStories: React.FC<CategoryStoriesProps> = ({ 
  onSelectCategory, 
  selectedCategory 
}) => {
  return (
    <nav style={{
      maxWidth: '1280px', margin: '0 auto', padding: '16px', display: 'flex', gap: '8px', overflowX: 'auto',
      borderBottom: '1px solid #1E1E1E'
    }}>
      <span style={{ fontSize: '11px', color: '#6B6B6B', fontFamily: 'var(--font-mono)', alignSelf: 'center', marginRight: '8px' }}>
        View by category:
      </span>
      {CATEGORIES.map((c) => {
        const isActive = selectedCategory.toLowerCase() === c.id.toLowerCase();
        return (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            style={{
              padding: '6px 14px', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400,
              backgroundColor: isActive ? '#1A1A1A' : 'transparent',
              border: isActive ? '1px solid #404040' : '1px solid #262626',
              borderRadius: '2px', color: isActive ? '#F5F5F5' : '#6B6B6B', cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </nav>
  );
};
