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
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All Deals', icon: '⚡' },
  { id: 'Electronics', label: 'Electronics', icon: '🎧' },
  { id: 'Fashion', label: 'Fashion', icon: '👕' },
  { id: 'Home', label: 'Home & Kitchen', icon: '🍳' },
  { id: 'Grocery', label: 'Grocery & 10-Min', icon: '🥑' },
  { id: 'Beauty', label: 'Beauty & Care', icon: '✨' },
  { id: 'Sports', label: 'Sports & Fitness', icon: '🏋️' },
  { id: 'Automotive', label: 'Automotive', icon: '🚗' },
  { id: 'Travel', label: 'Luggage & Travel', icon: '✈️' },
];

export const CategoryRail: React.FC<CategoryRailProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <nav
      id="category-rail"
      aria-label="Category navigation rail"
      className="sticky top-16 z-40 w-full backdrop-blur-xl bg-white/95 border-b border-slate-200 transition-all"
    >
      <div className="max-w-[1340px] mx-auto px-4 md:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory === cat.id ||
            (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>

              {isSelected && (
                <motion.div
                  layoutId="active-category-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-slate-900 pointer-events-none -z-10"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
