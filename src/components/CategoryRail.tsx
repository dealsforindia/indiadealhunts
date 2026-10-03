import React from 'react';
import { motion } from 'motion/react';
import { Car, Dumbbell, Grid2X2, Headphones, House, Plane, Shirt, ShoppingBasket, Sparkles } from 'lucide-react';
interface CategoryRailProps { selectedCategory: string; onSelectCategory: (cat: string) => void; categoryCounts?: Record<string, number>; }
const CATEGORIES = [
  { id: 'all', label: 'All Deals', Icon: Grid2X2 },
  { id: 'Electronics', label: 'Electronics', Icon: Headphones },
  { id: 'Fashion', label: 'Fashion', Icon: Shirt },
  { id: 'Home', label: 'Home & Kitchen', Icon: House },
  { id: 'Grocery', label: 'Grocery & 10-Min', Icon: ShoppingBasket },
  { id: 'Beauty', label: 'Beauty & Care', Icon: Sparkles },
  { id: 'Sports', label: 'Sports & Fitness', Icon: Dumbbell },
  { id: 'Automotive', label: 'Automotive', Icon: Car },
  { id: 'Travel', label: 'Luggage & Travel', Icon: Plane },
];
export const CategoryRail: React.FC<CategoryRailProps> = ({ selectedCategory, onSelectCategory }) => <nav id="category-rail" aria-label="Category navigation rail" className="category-rail sticky top-16 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#0D1527]/95 border-b border-slate-200 dark:border-white/10 transition-all">
  <div className="max-w-[1340px] mx-auto px-4 md:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
    {CATEGORIES.map(({ id, label, Icon }) => {
      const selected = selectedCategory === id || (id === 'all' && !selectedCategory);
      return <button type="button" key={id} aria-pressed={selected} onClick={() => onSelectCategory(id)} className={`premium-category ${selected ? 'is-selected' : ''}`}>
        <Icon size={17} aria-hidden="true" /><span>{label}</span>
        {selected && <motion.div layoutId="active-category-pill" transition={{ type: 'spring', stiffness: 450, damping: 35 }} className="premium-category-fill" />}
      </button>;
    })}
  </div>
</nav>;
