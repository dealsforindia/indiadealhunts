import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { CategoryStoryCollection, StoriesResponse } from '../types';
import { StoryModal } from './StoryModal';

interface CategoryStoriesProps {
  onSelectCategoryFilter?: (catFilter: string) => void;
}

const EDGE_API = import.meta.env.VITE_EDGE_API_URL || 'https://dealflow-edge.pottemasshippo.workers.dev';
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

// High-confidence fallback curated stories in case backend or worker is cold
const FALLBACK_STORIES: CategoryStoryCollection[] = [
  {
    id: 'loot70',
    title: '70%+ Steals',
    emoji: '⚡',
    ring_color: 'from-amber-400 via-rose-500 to-purple-600',
    badge: 'HOTTEST',
    category_filter: 'loot70',
    items: [
      {
        id: 'fallback-loot-1',
        title: 'Noise Buds VS102 Wireless Earbuds (50H Playtime)',
        price: 899,
        mrp: 2999,
        discount_pct: 70,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/51+e8vE9D6L._SL1500_.jpg',
        url: 'https://amzn.to/example1',
      },
      {
        id: 'fallback-loot-2',
        title: 'Cello 27-Pc Opalware Dinner Set (Scratch Resistant)',
        price: 999,
        mrp: 3499,
        discount_pct: 71,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/71R2c8k1a-L._SL1500_.jpg',
        url: 'https://amzn.to/example2',
      },
    ],
  },
  {
    id: 'quick_drop',
    title: '10-Min Drops',
    emoji: '🍏',
    ring_color: 'from-emerald-400 via-teal-500 to-cyan-600',
    badge: 'ZEPTO / SWIGGY',
    category_filter: 'Grocery',
    items: [
      {
        id: 'fallback-quick-1',
        title: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch',
        price: 119,
        mrp: 175,
        discount_pct: 32,
        store: 'Zepto',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop',
        url: 'https://zeptonow.com',
      },
    ],
  },
  {
    id: 'tech',
    title: 'Audio & Tech',
    emoji: '🎧',
    ring_color: 'from-sky-400 via-blue-500 to-indigo-600',
    badge: 'TECH',
    category_filter: 'Electronics',
    items: [
      {
        id: 'fallback-tech-1',
        title: 'boAt Airdopes 141 ANC with 42H Playback & Beast Mode',
        price: 999,
        mrp: 4490,
        discount_pct: 78,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg',
        url: 'https://amzn.to/example3',
      },
    ],
  },
  {
    id: 'under199',
    title: 'Under ₹199',
    emoji: '🏷️',
    ring_color: 'from-yellow-400 via-orange-500 to-red-600',
    badge: 'BUDGET',
    category_filter: 'all',
    items: [
      {
        id: 'fallback-under199-1',
        title: 'Stainless Steel Double Wall Insulated Flask Bottle 750ml',
        price: 189,
        mrp: 699,
        discount_pct: 73,
        store: 'Flipkart',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop',
        url: 'https://flipkart.com',
      },
    ],
  },
  {
    id: 'fashion',
    title: 'Wardrobe Hauls',
    emoji: '👗',
    ring_color: 'from-pink-400 via-fuchsia-500 to-rose-600',
    badge: 'STYLE',
    category_filter: 'Fashion',
    items: [
      {
        id: 'fallback-fashion-1',
        title: 'Dennis Lingo Men Slim Fit Casual Cotton Shirt',
        price: 399,
        mrp: 1849,
        discount_pct: 78,
        store: 'Myntra',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop',
        url: 'https://myntra.com',
      },
    ],
  },
  {
    id: 'home',
    title: 'Home & Kitchen',
    emoji: '🏠',
    ring_color: 'from-purple-400 via-violet-500 to-indigo-700',
    badge: 'ESSENTIALS',
    category_filter: 'Home',
    items: [
      {
        id: 'fallback-home-1',
        title: 'Pigeon by Stovekraft Non-Stick Flat Tawa 280mm',
        price: 299,
        mrp: 895,
        discount_pct: 66,
        store: 'Amazon',
        image: 'https://m.media-amazon.com/images/I/61S+j-0eP-L._SL1500_.jpg',
        url: 'https://amzn.to/example4',
      },
    ],
  },
];

export const CategoryStories: React.FC<CategoryStoriesProps> = ({ onSelectCategoryFilter }) => {
  const [collections, setCollections] = useState<CategoryStoryCollection[]>(FALLBACK_STORIES);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());
  const railRef = useRef<HTMLDivElement>(null);

  // Fetch real-time live curated stories from backend
  useEffect(() => {
    let isMounted = true;
    const loadStories = async () => {
      try {
        let res: Response | null = null;
        try {
          res = await fetch(`${API_BASE}/api/v1/deals/stories`);
        } catch {
          res = null;
        }
        if (!res || !res.ok) {
          try {
            res = await fetch(`${EDGE_API}/deals/stories`);
          } catch {
            res = null;
          }
        }
        if (res && res.ok) {
          const data: StoriesResponse = await res.json();
          if (isMounted && data.stories && data.stories.length > 0) {
            // Filter collections that actually have deals
            const validStories = data.stories.filter((s) => s.items && s.items.length > 0);
            if (validStories.length > 0) {
              setCollections(validStories);
            }
          }
        }
      } catch (err) {
        console.warn('Stories endpoint background notice, using curated fallback:', err);
      }
    };

    loadStories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check for ?story=id deep link in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const storyParam = params.get('story');
      if (storyParam && collections.length > 0) {
        const foundIdx = collections.findIndex(
          (c) =>
            c.id.toLowerCase() === storyParam.toLowerCase() ||
            c.category_filter.toLowerCase() === storyParam.toLowerCase()
        );
        if (foundIdx !== -1) {
          setSelectedStoryIndex(foundIdx);
          setViewedStoryIds((prev) => new Set(prev).add(collections[foundIdx].id));
        }
      }
    } catch {
      // ignore URL parsing issues in non-browser envs
    }
  }, [collections]);

  const handleStoryClick = (index: number) => {
    const story = collections[index];
    if (story) {
      setViewedStoryIds((prev) => new Set(prev).add(story.id));
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('story', story.id);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
    setSelectedStoryIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedStoryIndex(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('story');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    railRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <>
      <section
        className="w-full py-4 bg-white border-b border-slate-200/80"
        aria-label="Flash Deal Stories"
      >
        <div className="max-w-[1340px] mx-auto px-4 md:px-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-mono">
                Flash Stories &amp; Curated Hauls
              </h3>
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                • Tap to preview 5-sec deals
              </span>
            </div>

            {/* Desktop Scroll Chevrons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all text-xs cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all text-xs cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                ›
              </button>
            </div>
          </div>

          {/* Stories Rail */}
          <div
            ref={railRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1 scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {collections.map((story, index) => {
              const isViewed = viewedStoryIds.has(story.id);
              const previewImg = story.items?.[0]?.image;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleStoryClick(index)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
                  style={{ scrollSnapAlign: 'start' }}
                  aria-label={`Open story: ${story.title}`}
                >
                  {/* Avatar Bubble with Gradient Ring */}
                  <div className="relative">
                    <div
                      className={`w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] rounded-full p-[2.5px] transition-all duration-300 transform group-hover:scale-105 ${
                        isViewed
                          ? 'bg-slate-200'
                          : `bg-gradient-to-tr ${story.ring_color} shadow-sm`
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden relative shadow-2xs">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            alt={story.title}
                            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                            {story.emoji}
                          </div>
                        )}

                        {/* Centered Emoji Overlay Badge */}
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] shadow-2xs">
                          {story.emoji}
                        </div>
                      </div>
                    </div>

                    {/* Badge Pill for Hottest */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-white whitespace-nowrap shadow-sm">
                      {story.badge}
                    </div>
                  </div>

                  {/* Story Label */}
                  <span className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors tracking-tight text-center max-w-[80px] sm:max-w-[90px] truncate mt-1">
                    {story.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Story Viewer Modal ── */}
      <StoryModal
        isOpen={selectedStoryIndex !== null}
        onClose={handleCloseModal}
        collections={collections}
        initialCollectionIndex={selectedStoryIndex ?? 0}
        onSelectCategoryFilter={onSelectCategoryFilter}
      />
    </>
  );
};
