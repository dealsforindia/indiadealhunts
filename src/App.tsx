import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
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
import { ViralShortsSection } from './components/ViralShortsSection';
import { searchDealsClient } from './utils/semanticSearch';

// Skeleton Component for Deal Cards
const SkeletonCard = () => (
  <div style={{
    backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px'
  }}>
    <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '2px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton" style={{ width: '60px', height: '16px' }} />
      <div className="skeleton" style={{ width: '40px', height: '16px' }} />
    </div>
    <div className="skeleton" style={{ width: '100%', height: '18px' }} />
    <div className="skeleton" style={{ width: '80%', height: '18px' }} />
    <div className="skeleton" style={{ width: '60px', height: '24px', marginTop: '12px' }} />
  </div>
);

const EDGE_API = import.meta.env.VITE_EDGE_API_URL || 'https://dealflow-edge.pottemasshippo.workers.dev';
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
          const mapped: PublicDeal[] = data.deals
            .filter((d: any) => Boolean(d.video_url && typeof d.video_url === 'string' && d.video_url.startsWith('http')))
            .map((d: any) => ({
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
              video_preview: d.video_preview || d.preview_url,
              video_status: d.video_status || 'ready',
            }));
          setVideoDeals(mapped);

          // Deep-link support: Auto-open reel if ?short=fp_hash is present in URL
          try {
            const params = new URLSearchParams(window.location.search);
            const shortId = params.get('short');
            if (shortId) {
              const matched = mapped.find(d => d.id === shortId);
              if (matched) {
                setActiveReelDeal(matched);
              }
            }
          } catch (_) {}
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
  const [activeReelDeal, setActiveReelDeal] = useState<PublicDeal | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);

  // Fetch Deals from Backend
  const fetchDeals = useCallback(
    async (currentSkip = 0, isAppend = false, isSilent = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else if (isSilent) {
        setIsAutoRefreshing(true);
      } else {
        setLoading(true);
      }
      if (!isSilent) setError(null);

      try {
        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          skip: currentSkip.toString(),
        });

        if (selectedStore !== 'all') params.append('store', selectedStore);
        if (selectedCategory === 'loot70') {
          params.append('category', 'loot70');
          params.append('min_discount', '70');
        } else if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        params.append('sort', sortBy);
        if (isSilent) {
          params.append('_t', Date.now().toString());
        }

        let res: Response;
        try {
          res = await fetch(`${EDGE_API}/api/v1/deals/public?${params.toString()}`);
          if (!res.ok) throw new Error(`Edge error: ${res.status}`);
        } catch {
          res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`);
        }

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
        } else if (isSilent && currentSkip === 0) {
          // Prepend new arrivals seamlessly without jolting the user
          setDeals((prev) => {
            const newIds = new Set(enriched.map((d) => d.id));
            const unchangedOlder = prev.filter((d) => !newIds.has(d.id));
            return [...enriched, ...unchangedOlder];
          });
        } else {
          setDeals(enriched);
        }

        setTotalDeals(data.total || enriched.length);
        setHasMore(data.has_more ?? (currentSkip + enriched.length < data.total));
        setSkip(currentSkip);
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        if (!isSilent) {
          setError(err instanceof Error ? err.message : 'Unable to connect to DealFlow engine');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsAutoRefreshing(false);
      }
    },
    [selectedStore, selectedCategory, searchQuery, sortBy]
  );

  // Initial fetch and reload on filter changes
  useEffect(() => {
    fetchDeals(0, false);
  }, [fetchDeals]);

  // Real-Time Background Auto-Refresh (Every 25 seconds on Home tab)
  useEffect(() => {
    if (activeTab !== 'home' || searchQuery.trim() || skip > 0) return;

    const interval = setInterval(() => {
      fetchDeals(0, false, true);
    }, 25000);

    return () => clearInterval(interval);
  }, [activeTab, searchQuery, skip, fetchDeals]);

  // Tab Focus / Phone Unlock Visibility Change Auto-Refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab === 'home' && !searchQuery.trim()) {
        fetchDeals(0, false, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [activeTab, searchQuery, fetchDeals]);

  // Live WebSocket Stream Listener for Instant Real-Time Drops
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        const wsUrl = API_BASE.replace(/^https?:\/\//, (m) => m === 'https://' ? 'wss://' : 'ws://') + '/ws';
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (
              data.event === 'deals:new' ||
              data.event === 'deal_approved' ||
              data.type === 'new_deal' ||
              data.event === 'deal_update'
            ) {
              fetchDeals(0, false, true);
            }
          } catch {}
        };

        ws.onerror = () => {
          ws?.close();
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 8000);
        };
      } catch {}
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
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

  // On-Device Semantic Vector Search & Natural Intent Filter
  const { deals: semanticFilteredDeals, parsedQuery: searchInsights } = useMemo(() => {
    return searchDealsClient(deals, searchQuery);
  }, [deals, searchQuery]);

  // Exclusive Grid Deals
  const gridDeals = useMemo(() => {
    let result = [...semanticFilteredDeals];

    // Exclude spotlight deal in home tab so it doesn't repeat immediately if featured in hero
    if (activeTab === 'home' && spotlightDeal) {
      result = result.filter((d) => d.id !== spotlightDeal.id);
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

            {/* Store & Sort Filter Rail */}
            <div className="mt-4 mb-2">
              <Filters
                selectedStore={selectedStore}
                onSelectStore={setSelectedStore}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalDeals={gridDeals.length}
                onlyConsensus={onlyConsensus}
                onToggleConsensus={() => setOnlyConsensus(!onlyConsensus)}
              />
            </div>

            {/* Live Feed Header */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-live" style={{ marginTop: '6px' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#F5F5F5', margin: 0 }}>
                  Recent Verified Drops
                </h2>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#22C55E', backgroundColor: '#0F2018', border: '1px solid #166534', padding: '2px 8px', borderRadius: '2px', marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                  Auto-Sync
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => fetchDeals(0, false, false)}
                  disabled={loading}
                  style={{
                    padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid #262626', color: '#F5F5F5',
                    fontSize: '12px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  title="Refresh deals now"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading || isAutoRefreshing ? 'spin 1s linear infinite' : 'none' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.22-10.27l-3.26-3.26"/>
                  </svg>
                  Refresh
                </button>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#D47A10', backgroundColor: '#1A1200', padding: '2px 8px', borderRadius: '2px', border: '1px solid #452A00' }}>
                  {gridDeals.length} drops
                </span>
              </div>
            </div>

            {/* Deals Grid */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 48px' }}>
              {loading && deals.length === 0 ? (
                <div style={{ padding: '64px 0', textAlign: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                     <SkeletonCard />
                  </div>
                </div>
              ) : error && deals.length === 0 ? (
                <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '400px', margin: '0 auto', borderRadius: '4px', border: '1px solid #450A0A', backgroundColor: '#1F0D0D' }}>
                  <h3 style={{ fontWeight: 600, color: '#F5F5F5', marginBottom: '8px' }}>Could not connect to engine</h3>
                  <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '16px' }}>{error}</p>
                  <button
                    onClick={() => fetchDeals(0, false)}
                    style={{ minHeight: '44px', padding: '0 20px', backgroundColor: '#F5F5F5', color: '#0A0A0A', fontWeight: 600, fontSize: '12px', borderRadius: '2px', border: 'none', cursor: 'pointer' }}
                  >
                    Retry Connection
                  </button>
                </div>
              ) : gridDeals.length === 0 ? (
                <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '400px', margin: '0 auto', borderRadius: '4px', border: '1px solid #262626', backgroundColor: '#111111' }}>
                  <h3 style={{ fontWeight: 600, color: '#F5F5F5', marginBottom: '8px' }}>No deals found</h3>
                  <p style={{ fontSize: '12px', color: '#A3A3A3', marginBottom: '16px' }}>Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSelectedStore('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    style={{ minHeight: '44px', padding: '0 20px', backgroundColor: '#1A1A1A', color: '#F5F5F5', fontWeight: 600, fontSize: '12px', borderRadius: '2px', border: '1px solid #404040', cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {searchQuery && searchInsights.activeBadges.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 12px', borderRadius: '4px', backgroundColor: '#0A1A0F', border: '1px solid #166534' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E' }}>AI Intent:</span>
                      {searchInsights.activeBadges.map((badge, idx) => (
                        <span key={idx} style={{ padding: '2px 8px', borderRadius: '2px', backgroundColor: '#166534', color: '#F5F5F5', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {badge}
                        </span>
                      ))}
                      <span style={{ fontSize: '11px', color: '#6B6B6B', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                        {gridDeals.length} deals matched
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {gridDeals.map((deal) => (
                    <PublicDealCard
                      key={deal.id}
                      deal={deal}
                      onOpenImage={setLightboxDeal}
                      onOpenVideo={setActiveReelDeal}
                      activeCards={activeCards}
                      onOpenCardModal={() => setIsCardModalOpen(true)}
                    />
                  ))}
                  </div>
                </>
              )}

              {/* Automated Viral Shorts Section (9:16 Video Reels) - Moved to bottom */}
              <div style={{ marginTop: '32px', marginBottom: '16px', borderTop: '1px solid #1E1E1E' }}>
                <ViralShortsSection
                  deals={videoDeals.length > 0 ? videoDeals : deals}
                  externalActiveDeal={activeReelDeal}
                  onCloseExternal={() => setActiveReelDeal(null)}
                />
              </div>

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

        {/* Tab 2: ENDING SOON VIEW */}
        {activeTab === 'ending_soon' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px 48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1E1E1E' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#F5F5F5', margin: '0 0 8px' }}>
                  Popular / Ending Soon
                </h1>
                <p style={{ fontSize: '14px', color: '#A3A3A3', margin: 0, fontFamily: 'var(--font-body)', maxWidth: '480px' }}>
                  Flash deals with stock depletion alerts. Once these sell out, prices return to regular retail.
                </p>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setEndingSoonStoreFilter('all')}
                  style={{ padding: '6px 12px', borderRadius: '2px', fontSize: '13px', fontWeight: endingSoonStoreFilter === 'all' ? 600 : 400, color: endingSoonStoreFilter === 'all' ? '#0A0A0A' : '#A3A3A3', backgroundColor: endingSoonStoreFilter === 'all' ? '#D47A10' : 'transparent', border: endingSoonStoreFilter === 'all' ? '1px solid #D47A10' : '1px solid #262626', cursor: 'pointer' }}
                >
                  All Stores
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('amazon')}
                  style={{ padding: '6px 12px', borderRadius: '2px', fontSize: '13px', fontWeight: endingSoonStoreFilter === 'amazon' ? 600 : 400, color: endingSoonStoreFilter === 'amazon' ? '#0A0A0A' : '#A3A3A3', backgroundColor: endingSoonStoreFilter === 'amazon' ? '#D47A10' : 'transparent', border: endingSoonStoreFilter === 'amazon' ? '1px solid #D47A10' : '1px solid #262626', cursor: 'pointer' }}
                >
                  Amazon
                </button>
                <button
                  onClick={() => setEndingSoonStoreFilter('flipkart')}
                  style={{ padding: '6px 12px', borderRadius: '2px', fontSize: '13px', fontWeight: endingSoonStoreFilter === 'flipkart' ? 600 : 400, color: endingSoonStoreFilter === 'flipkart' ? '#0A0A0A' : '#A3A3A3', backgroundColor: endingSoonStoreFilter === 'flipkart' ? '#D47A10' : 'transparent', border: endingSoonStoreFilter === 'flipkart' ? '1px solid #D47A10' : '1px solid #262626', cursor: 'pointer' }}
                >
                  Flipkart
                </button>
                <button
                  onClick={() => setHideOverEndingSoon(!hideOverEndingSoon)}
                  style={{ padding: '6px 12px', borderRadius: '2px', fontSize: '13px', fontWeight: hideOverEndingSoon ? 600 : 400, color: hideOverEndingSoon ? '#EF4444' : '#A3A3A3', backgroundColor: hideOverEndingSoon ? '#1F0D0D' : 'transparent', border: hideOverEndingSoon ? '1px solid #450A0A' : '1px solid #262626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hideOverEndingSoon ? '#EF4444' : '#6B6B6B' }} />
                  Hide Expired
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {gridDeals.map((deal) => (
                <PublicDealCard
                  key={deal.id}
                  deal={deal}
                  onOpenImage={setLightboxDeal}
                  onOpenVideo={setActiveReelDeal}
                  isEndingSoonView={true}
                  activeCards={activeCards}
                  onOpenCardModal={() => setIsCardModalOpen(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BEST WORTH DEALS VIEW */}
        {activeTab === 'best_worth' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px 48px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1E1E1E' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#F5F5F5', margin: '0 0 8px' }}>
                Top Rated Deals
              </h1>
              <p style={{ fontSize: '14px', color: '#A3A3A3', margin: 0, fontFamily: 'var(--font-body)', maxWidth: '480px' }}>
                Algorithmic curation of deals with high historical value, consensus drops, and brand tier discounts.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
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

        {/* Tab 4: ACTIVE OFFERS & VOUCHERS VIEW */}
        {activeTab === 'active_offers' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px 48px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1E1E1E' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#F5F5F5', margin: '0 0 8px' }}>
                Verified Hacks & Offers
              </h1>
              <p style={{ fontSize: '14px', color: '#A3A3A3', margin: 0, fontFamily: 'var(--font-body)', maxWidth: '480px' }}>
                Curated step-by-step loot tricks, grocery coupon stacks, and instant savings verified across leading Indian apps.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
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
                  />
                ))}
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

    </div>
  );
};

export const App: React.FC = () => (
  <AppContent />
);

export default App;
