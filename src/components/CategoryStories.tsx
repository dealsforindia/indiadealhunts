import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CategoryStoryItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  gradient: string;
  ringColor: string;
  countLabel?: string;
}

const CATEGORIES: CategoryStoryItem[] = [
  {
    id: 'all',
    name: 'All Drops',
    icon: '🔥',
    badge: 'LIVE',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    ringColor: 'from-emerald-400 to-teal-400',
    countLabel: '24/7',
  },
  {
    id: 'loot70',
    name: '70%+ Off',
    icon: '⚡',
    badge: 'STEAL',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    ringColor: 'from-amber-400 to-orange-500',
    countLabel: 'Urgent',
  },
  {
    id: 'Electronics',
    name: 'Electronics',
    icon: '📱',
    badge: 'HOT',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    ringColor: 'from-cyan-400 to-blue-500',
    countLabel: 'Gadgets',
  },
  {
    id: 'Fashion',
    name: 'Fashion',
    icon: '👗',
    badge: 'TREND',
    gradient: 'from-pink-500 via-rose-500 to-purple-500',
    ringColor: 'from-pink-400 to-rose-500',
    countLabel: 'Styles',
  },
  {
    id: 'Home',
    name: 'Home Decor',
    icon: '🏠',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    ringColor: 'from-indigo-400 to-purple-500',
    countLabel: 'Living',
  },
  {
    id: 'Kitchen',
    name: 'Kitchenware',
    icon: '🍳',
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    ringColor: 'from-amber-400 to-yellow-500',
    countLabel: 'Dining',
  },
  {
    id: 'Beauty',
    name: 'Beauty & Care',
    icon: '💄',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    ringColor: 'from-fuchsia-400 to-pink-500',
    countLabel: 'Self Care',
  },
  {
    id: 'Grocery',
    name: 'Quick Grocery',
    icon: '🍎',
    badge: '₹10 LOOT',
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    ringColor: 'from-emerald-400 to-lime-400',
    countLabel: '10 Mins',
  },
];

interface CategoryStoriesProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryStories: React.FC<CategoryStoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2" 
      aria-label="Category Stories Bar"
    >
      {/* Subtle Section Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            Loot Stories & Categories
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stories Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
      >
        {CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus-ring rounded-2xl cursor-pointer p-1 transition-transform duration-200 active:scale-95"
              aria-label={`Filter deals by ${cat.name}`}
              aria-pressed={isSelected}
            >
              {/* Animated Story Ring */}
              <div
                className={`relative p-[2.5px] rounded-full transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-tr ${cat.ringColor} shadow-lg shadow-emerald-500/30 scale-105`
                    : 'bg-white/15 group-hover:bg-gradient-to-tr group-hover:' + cat.ringColor
                }`}
              >
                {/* Inner Ring Dark Border Frame */}
                <div className="p-0.5 rounded-full bg-[#070A11]">
                  {/* Category Circle Core */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? `bg-gradient-to-br ${cat.gradient} text-white shadow-inner`
                        : 'bg-[#0E1424] text-slate-200 group-hover:bg-[#151E34]'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-115">
                      {cat.icon}
                    </span>

                    {/* Subtle Radial Glow when Selected */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/20 mix-blend-overlay pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Micro Badge (e.g. LIVE, STEAL, ₹10) */}
                {cat.badge && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border shadow-sm whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-950 text-white border-white/20'
                        : 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Category Name Label */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap ${
                    isSelected ? 'text-white font-black' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                </span>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

