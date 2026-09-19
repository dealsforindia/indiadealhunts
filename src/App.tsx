import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { Filters } from './components/Filters';
import { PublicDealCard } from './components/PublicDealCard';
import { ImageModal } from './components/ImageModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { DealLookupModal } from './components/DealLookupModal';
import { CardCalculatorModal } from './components/CardCalculatorModal';
import { getSavedCards } from './utils/cardSavings';
import { FloatingDock } from './components/FloatingDock';
import { Footer } from './components/Footer';
import { SubmitDeal } from './components/SubmitDeal';
import { AboutPage } from './components/AboutPage';
import { HowWeVerify } from './components/HowWeVerify';
import { ContactPage } from './components/ContactPage';
import type { PublicDeal, PublicDealsResponse, SortOption, NavTab } from './types';
import { calculateWorthScore } from './utils/worthScore';
import { MarqueeTicker } from './components/MarqueeTicker';
import { CategoryStories } from './components/CategoryStories';
import { ViralShortsSection } from './components/ViralShortsSection';
import { Sparkles, Zap, RefreshCw, AlertCircle, Clock, ShoppingBag, ChevronRight, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { PriceAlertModal } from './components/PriceAlertModal';
import { BountyEmptyState } from './components/BountyEmptyState';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { UserMenuDrawer } from './components/UserMenuDrawer';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

const AppContent: React.FC = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Deals State
  const [deals, setDeals] = useState<PublicDeal[]>([]);
  const [videoDeals, setVideoDeals] = useState<PublicDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dedicated fetch for video deals
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/videos`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.deals) {
          const mapped: PublicDeal[] = data.deals.map((d: any) => ({
            id: d.fp_hash || d.id,
            title: d.prod_name || d.title || 'Curated Deal',
            price: d.prices?.sale ?? 0,
            mrp: d.prices?.mrp ?? 0,
            discount_pct: d.prices?.discount_pct ?? 0,
            store: (d.platforms || ['Amazon'])[0],
            image: d.img_url || '',
            url: d.aff_url || d.canonical_url || d.url || '',
            category: d.category || 'Special Deal',
            posted_at: d.processed_ts || d.ts || Date.now() / 1000,
            has_video: true,
            video_url: d.video_url,
            video_cover: d.video_cover,
            video_status: d.video_status || 'ready',
          }));
          setVideoDeals(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filters & Search
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Ending Soon Filter Pills
  const [hideOverEndingSoon, setHideOverEndingSoon] = useState<boolean>(false);
  const [endingSoonStoreFilter, setEndingSoonStoreFilter] = useState<string>('all');

  // Pagination
  const [totalDeals, setTotalDeals] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 40;

  // Modals & User Customization
  const [lightboxDeal, setLightboxDeal] = useState<PublicDeal | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDocType>(null);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [lookupUrl, setLookupUrl] = useState<string>('');
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [activeCards, setActiveCards] = useState<string[]>(() => getSavedCards());
  const [onlyConsensus, setOnlyConsensus] = useState<boolean>(false);
  const [alertDeal, setAlertDeal] = useState<PublicDeal | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [activeReelDeal, setActiveReelDeal] = useState<PublicDeal | null>(null);

  // Fetch Deals from Backend
  const fetchDeals = useCallback(
    async (currentSkip = 0, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          skip: currentSkip.toString(),
        });

        if (selectedStore !== 'all') params.append('store', selectedStore);
        if (selectedCategory !== 'all' && selectedCategory !== 'loot70') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        params.append('sort', sortBy === 'worth' ? 'heat' : sortBy);

        const res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch deals: ${res.status} ${res.statusText}`);
        }

        const data: PublicDealsResponse = await res.json();

        // Enrich deals with Worth Score
        const enriched = (data.deals || []).map((d) => {
          const w = calculateWorthScore(d);
          return {
            ...d,
            worth_score: w.score,
            worth_label: w.label,
          };
        });

        if (isAppend) {
          setDeals((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newDeals = enriched.filter((d) => !existingIds.has(d.id));
            return [...prev, ...newDeals];
          });
        } else {
          setDeals(enriched);
        }

        setTotalDeals(data.total || enriched.length);
        setHasMore(data.has_more ?? (currentSkip + enriched.length < data.total));
        setSkip(currentSkip);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Unable to connect to DealFlow engine');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedStore, selectedCategory, searchQuery, sortBy]
  );

  // Initial fetch and reload on filter changes
  useEffect(() => {
    fetchDeals(0, false);
  }, [fetchDeals]);

  // Curated Top 3 Showcase Drops for Hero (Highest real savings on physical goods)
  const topShowcaseDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];

    const spamPhrases = [
      'lab test', 'test @', 'recharge', 'refer', 'loot -', 'loot alert', 'voucher',
      'minutes', 'short', 'bottle', 'party', 'watch video', 'survey', 'claim free',
    ];

    const candidates = deals.filter((d) => {
      if (!d.image || !d.price || d.price < 150) return false;
      const lowerTitle = d.title.toLowerCase();
      if (spamPhrases.some((phrase) => lowerTitle.includes(phrase))) return false;
      if (d.image.includes('banner_') || d.image.includes('ytimg') || d.image.includes('youtube')) return false;
      return true;
    });

    const calculateSavings = (deal: typeof deals[0]) => {
      const price = deal.price || 0;
      if (deal.mrp && deal.mrp > price) {
        return deal.mrp - price;
      }
      if (deal.discount_pct && deal.discount_pct > 0 && price > 0) {
        return (price / (1 - deal.discount_pct / 100)) - price;
      }
      return 0;
    };

    const now = Date.now() / 1000;

    // Showcase Recent Best Deals (Fresh drops from recent hours + top worth scores & discounts)
    candidates.sort((a, b) => {
      const ageA = Math.max(0, (now - (a.posted_at || now)) / 3600); // hours
      const ageB = Math.max(0, (now - (b.posted_at || now)) / 3600);

      // Recency multiplier: top priority for fresh drops (<12h)
      const recencyA = Math.exp(-ageA / 12);
      const recencyB = Math.exp(-ageB / 12);

      const aIsStoreCdn = a.image?.includes('media-amazon.com') || a.image?.includes('rukminim') || a.image?.includes('myntassets') ? 15 : 0;
      const bIsStoreCdn = b.image?.includes('media-amazon.com') || b.image?.includes('rukminim') || b.image?.includes('myntassets') ? 15 : 0;

      const worthA = a.worth_score || 75;
      const worthB = b.worth_score || 75;

      const discA = Math.min(90, a.discount_pct || 0);
      const discB = Math.min(90, b.discount_pct || 0);

      const lowestBonusA = a.is_lowest_price ? 15 : 0;
      const lowestBonusB = b.is_lowest_price ? 15 : 0;

      const scoreA = (worthA * 0.35 + discA * 0.35 + aIsStoreCdn + lowestBonusA) * (0.6 + 0.4 * recencyA);
      const scoreB = (worthB * 0.35 + discB * 0.35 + bIsStoreCdn + lowestBonusB) * (0.6 + 0.4 * recencyB);

      return scoreB - scoreA;
    });

    return candidates.slice(0, 3);
  }, [deals]);

  const spotlightDeal = topShowcaseDeals[0] || deals[0] || null;

  // Curated Carousels for Homepage (ShoppinGenie Pattern: "Order Right Now" + "Ending Soon")
  const orderRightNowDeals = useMemo(() => {
    return [...deals]
      .filter((d) => (d.worth_score || 0) >= 80 && !d.is_over)
      .slice(0, 4);
  }, [deals]);

  const endingSoonCarouselDeals = useMemo(() => {
    return [...deals]
      .filter((d) => (d.discount_pct || 0) >= 50 && !d.is_over)
      .slice(0, 4);
  }, [deals]);

  // Exclusive Grid Deals
  const gridDeals = useMemo(() => {
    let result = [...deals];

    // Exclude showcase deals in home tab so they don't repeat
    if (activeTab === 'home' && topShowcaseDeals.length > 0) {
      const showcaseIds = new Set(topShowcaseDeals.map((d) => d.id));
      result = result.filter((d) => !showcaseIds.has(d.id));
    }

    // Filter for 'loot70' (70%+ off steal deals)
    if (selectedCategory === 'loot70') {
      result = result.filter((d) => (d.discount_pct || 0) >= 70);
    }

    // Filter for 'Best Worth' Tab (Score 78+)
    if (activeTab === 'best_worth') {
      result = result.filter((d) => (d.worth_score || 0) >= 78);
    }

    // Filter for 'Ending Soon' Tab (High discount or urgent price crash)
    if (activeTab === 'ending_soon') {
      result = result.filter((d) => (d.discount_pct || 0) >= 50);
      if (hideOverEndingSoon) {
        result = result.filter((d) => !d.is_over && d.expiry_mins !== 0);
      }
      if (endingSoonStoreFilter !== 'all') {
        result = result.filter((d) => d.store.toLowerCase().includes(endingSoonStoreFilter.toLowerCase()));
      }
    }

    // Filter for Multi-Channel Consensus (spotted across 2+ channels)
    if (onlyConsensus) {
      result = result.filter((d) => Boolean(d.cluster_count && d.cluster_count >= 2));
    }

    // Sorting Logic: Standardized display_ts and dynamic Heat Score
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.display_ts || b.posted_at || 0) - (a.display_ts || a.posted_at || 0));
    } else if (sortBy === 'worth') {
      result.sort((a, b) => (b.heat_score || b.worth_score || 0) - (a.heat_score || a.worth_score || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [deals, topShowcaseDeals, activeTab, sortBy, hideOverEndingSoon, endingSoonStoreFilter, selectedCategory, onlyConsensus]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDeals(skip + PAGE_SIZE, true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070A11] text-white flex flex-col selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* 0. Top Live Telemetry Marquee Ticker */}
      <MarqueeTicker />

      {/* 1. Pro Max Sticky Glassmorphic Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'lookup') {
            setIsLookupOpen(true);
          } else {
            setActiveTab(tab);
            if (tab === 'home') {
              setSortBy('newest');
            } else if (tab === 'ending_soon') {
              setSortBy('discount');
            } else if (tab === 'best_worth') {
              setSortBy('worth');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        totalDeals={totalDeals}
        onOpenCardModal={() => setIsCardModalOpen(true)}
        activeCardCount={activeCards.length}
      />

      {/* 2. Main Content Area with Safe Bottom Padding */}
      <main className="flex-1 pb-28 sm:pb-20">

        {/* Tab 1: HOME VIEW */}
        {activeTab === 'home' && (
          <>
            {/* Hero Banner with Search & Top 3 Curated Drops Showcase */}
            <HeroBanner
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onQuickSearch={(tag) => {
                setSearchQuery(tag);
                setActiveTab('home');
              }}
              dealCount={totalDeals}
              spotlightDeal={spotlightDeal}
              showcaseDeals={topShowcaseDeals}
              onOpenLookup={(url) => {
                setLookupUrl(url || '');
                setIsLookupOpen(true);
              }}
            />

            {/* Category Stories (Instagram/ShoppinGenie Style Quick Filter Bar) */}
            <div className="mt-4 mb-2">
              <CategoryStories
                selectedCategory={selectedCategory}
                onSelectCategory={(catId) => {
                  setSelectedCategory(catId);
                }}
              />
            </div>

            {/* Automated Viral Shorts Section (9:16 Video Reels) */}
            <ViralShortsSection
              deals={videoDeals.length > 0 ? videoDeals : deals}
              externalActiveDeal={activeReelDeal}
              onCloseExternal={() => setActiveReelDeal(null)}
            />

            {/* ShoppinGenie Feature: "Order Right Now" Horizontal 4-Card Carousel */}
            {orderRightNowDeals.length > 0 && !searchQuery && selectedStore === 'all' && selectedCategory === 'all' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-brand text-white tracking-tight">
                      Order Right Now
                    </h2>
                    <span className="text-xs text-slate-400 hidden md:inline">
                      — Insane Worth Scores (80+) verified live
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('best_worth');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                  >
                    <span>See all</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {orderRightNowDeals.map((deal) => (
                    <PublicDealCard
                      key={`orn-${deal.id}`}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      onOpenVideo={setActiveReelDeal}
                      activeCards={activeCards}
                      onOpenCardModal={() => setIsCardModalOpen(true)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ShoppinGenie Feature: "Ending Soon" Horizontal 4-Card Carousel */}
            {endingSoonCarouselDeals.length > 0 && !searchQuery && selectedStore === 'all' && selectedCategory === 'all' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-brand text-white tracking-tight">
                      Ending Soon
                    </h2>
                    <span className="text-xs text-slate-400 hidden md:inline">
                      — Fast-selling drops near stock depletion
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('ending_soon');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-orange-500/10 transition-colors"
                  >
                    <span>See all</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {endingSoonCarouselDeals.map((deal) => (
                    <PublicDealCard
                      key={`es-${deal.id}`}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      onOpenVideo={setActiveReelDeal}
                      isEndingSoonView={true}
                      activeCards={activeCards}
                      onOpenCardModal={() => setIsCardModalOpen(true)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Filter & Sort Bar */}
            <div className="mt-12">
              <Filters
                selectedStore={selectedStore}
                onSelectStore={setSelectedStore}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalDeals={gridDeals.length}
                onlyConsensus={onlyConsensus}
                onToggleConsensus={() => setOnlyConsensus((prev) => !prev)}
              />
            </div>

            {/* Section Heading: "Verified Live Loot Hunts" */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <h2 className="text-xl sm:text-2xl font-bold font-brand text-white tracking-tight">
                  Verified Live Loot Hunts
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  — Verified at lowest price in 90 days across Indian stores
                </span>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              {loading && deals.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-300 text-sm font-medium">
                    Loading verified drops from DealFlow engine...
                  </p>
                </div>
              ) : error && deals.length === 0 ? (
                <div className="py-16 px-6 text-center max-w-md mx-auto rounded-3xl border border-red-500/20 bg-red-950/20">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" aria-hidden="true" />
                  <h3 className="font-bold text-white mb-1">Could not connect to engine</h3>
                  <p className="text-xs text-slate-300 mb-4">{error}</p>
                  <button
                    onClick={() => fetchDeals(0, false)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs focus-ring active:scale-95 transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : gridDeals.length === 0 ? (
                <BountyEmptyState
                  searchTerm={searchQuery}
                  onClearSearch={() => {
                    setSelectedStore('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  onSelectTrending={(term) => setSearchQuery(term)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {gridDeals.map((deal) => (
                    <PublicDealCard
                      key={deal.id}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      onOpenVideo={setActiveReelDeal}
                      activeCards={activeCards}
                      onOpenCardModal={() => setIsCardModalOpen(true)}
                      onOpenAlert={(d) => {
                        setAlertDeal(d);
                        setIsAlertOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && gridDeals.length > 0 && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="min-h-[44px] px-8 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-emerald-500 hover:text-black text-white font-bold text-sm tracking-tight border border-white/15 hover:border-emerald-400 transition-all duration-200 active:scale-95 shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50 focus-ring"
                    aria-label="Load more deals"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                        <span>Loading More Drops...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Deals</span>
                        <span className="text-xs opacity-75 font-mono">({gridDeals.length} shown)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </>
        )}

        {/* Tab 2: ENDING SOON VIEW (With ShoppinGenie Filter Pills) */}
        {activeTab === 'ending_soon' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-pulse" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                    Ending Soon Price Drops
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Flash loots with stock depletion alerts. Once these sell out, prices return to regular retail.
                  </p>
                </div>
              </div>

              {/* ShoppinGenie Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setEndingSoonStoreFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'all'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('amazon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'amazon'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Amazon
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('flipkart')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    endingSoonStoreFilter === 'flipkart'
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Flipkart
                </button>
                <button
                  onClick={() => setHideOverEndingSoon(!hideOverEndingSoon)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    hideOverEndingSoon
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hideOverEndingSoon ? 'bg-rose-400' : 'bg-slate-600'}`} />
                  Hide OVER
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {gridDeals.map((deal) => (
                <PublicDealCard
                  key={deal.id}
                  deal={deal}
                  onOpenImage={setLightboxDeal}
                  onOpenVideo={setActiveReelDeal}
                  isEndingSoonView={true}
                  activeCards={activeCards}
                  onOpenCardModal={() => setIsCardModalOpen(true)}
                  onOpenAlert={(d) => {
                    setAlertDeal(d);
                    setIsAlertOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BEST WORTH DEALS VIEW (Large 3-Column Cards) */}
        {activeTab === 'best_worth' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                  Best Worth Deals
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Ranked by DealFlow Worth Index (78+ rating) with verified 90-day regular price comparison.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridDeals.map((deal) => (
                <PublicDealCard
                  key={deal.id}
                  deal={deal}
                  onOpenImage={setLightboxDeal}
                  onOpenVideo={setActiveReelDeal}
                  isBestWorthView={true}
                  activeCards={activeCards}
                  onOpenCardModal={() => setIsCardModalOpen(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ACTIVE OFFERS & VOUCHERS VIEW (Rich Image & Action Cards) */}
        {activeTab === 'active_offers' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
                  Verified Loot Hacks & Active Offers
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Curated step-by-step loot tricks, grocery coupon stacks, and instant savings verified across leading Indian apps.
                </p>
              </div>
            </div>

            {/* Dynamic Live Coupon & App Deals Feed */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Live Verified Coupon Deals
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Deals currently active with stackable promo codes & high-discount drops.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {deals
                  .filter((d) => Boolean(d.coupon || (d.discount_pct && d.discount_pct >= 60)))
                  .slice(0, 12)
                  .map((deal) => (
                    <PublicDealCard
                      key={deal.id}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      onOpenVideo={setActiveReelDeal}
                      activeCards={activeCards}
                      onOpenCardModal={() => setIsCardModalOpen(true)}
                      onOpenAlert={(d) => {
                        setAlertDeal(d);
                        setIsAlertOpen(true);
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}


        {/* Tab 6: SUBMIT DEAL VIEW (ShoppinGenie Feature) */}
        {activeTab === 'submit_deal' && (
          <SubmitDeal onBackToHome={() => setActiveTab('home')} />
        )}

        {/* Tab 7: ABOUT PAGE VIEW (ShoppinGenie Feature) */}
        {activeTab === 'about' && (
          <AboutPage
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 8: HOW WE VERIFY VIEW (ShoppinGenie Feature) */}
        {activeTab === 'how_we_verify' && (
          <HowWeVerify
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 9: CONTACT PAGE VIEW (ShoppinGenie Feature) */}
        {activeTab === 'contact' && (
          <ContactPage
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={setActiveTab}
          />
        )}

      </main>

      {/* 3. Floating Quick Filter & Back to Top Dock */}
      <FloatingDock
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
      />

      {/* 4. Footer */}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => {
          if (type === 'verify') {
            setActiveTab('how_we_verify');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setActiveLegal(type);
          }
        }}
      />

      {/* 5. Lightbox Modal */}
      <ImageModal
        deal={lightboxDeal}
        onClose={() => setLightboxDeal(null)}
      />

      {/* 6. Real Legal & Verification Modal */}
      <LegalModal
        type={activeLegal}
        onClose={() => setActiveLegal(null)}
      />

      {/* 6. Continuous Price Drop Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          setAlertDeal(null);
        }}
        deal={alertDeal}
      />

      {/* 7. Instant Deal Lookup & Sanity Checker Modal */}
      <DealLookupModal
        isOpen={isLookupOpen || activeTab === 'lookup'}
        initialUrl={lookupUrl}
        onClose={() => {
          setIsLookupOpen(false);
          setLookupUrl('');
          if (activeTab === 'lookup') setActiveTab('home');
        }}
      />

      {/* 8. Personalized Credit Card Price Calculator Modal */}
      <CardCalculatorModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onCardsUpdated={setActiveCards}
      />

      {/* 9. Passwordless Email Authentication Modal */}
      <AuthModal />

      {/* 10. User Profile & Live Alerts Slide-over Drawer */}
      <UserMenuDrawer />

    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
