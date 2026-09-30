import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { HeroBanner } from './components/HeroBanner';
import { CategoryRail } from './components/CategoryRail';
import { DealToolbar } from './components/DealToolbar';
import { PublicDealCard } from './components/PublicDealCard';
import { PriceLookupStrip } from './components/PriceLookupStrip';
import { TrustStrip } from './components/TrustStrip';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { DealDetailModal } from './components/DealDetailModal';
import { DealLookupModal } from './components/DealLookupModal';
import { SubmitDeal } from './components/SubmitDeal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { AboutPage } from './components/AboutPage';
import { HowWeVerify } from './components/HowWeVerify';
import { ContactPage } from './components/ContactPage';
import { WallOfHappiness } from './components/WallOfHappiness';
import { DealSkeletonGrid } from './components/DealSkeleton';
import { MarqueeTicker } from './components/MarqueeTicker';
import { HowDealsWorkModal } from './components/HowDealsWorkModal';
import { CategoryStories } from './components/CategoryStories';
import { CommandPalette } from './components/CommandPalette';
import { CardCalculatorModal } from './components/CardCalculatorModal';
import { CompareDrawer } from './components/CompareDrawer';
import type { PublicDeal, PublicDealsResponse, SortOption, NavTab } from './types';
import { calculateWorthScore } from './utils/worthScore';
import { searchDealsClient } from './utils/semanticSearch';
import { INITIAL_VERIFIED_DEALS } from './data/mockDeals';
import { getSavedDealIds, toggleSavedDealId, subscribeSavedDeals } from './utils/savedDeals';
import { getSavedCards } from './utils/cardSavings';
import { isAudioEnabled, setAudioEnabled, playTactileClick } from './utils/audio';

const EDGE_API = import.meta.env.VITE_EDGE_API_URL || 'https://dealflow-edge.pottemasshippo.workers.dev';
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const App: React.FC = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Deals State (Preloaded with high-value verified drops)
  const [deals, setDeals] = useState<PublicDeal[]>(INITIAL_VERIFIED_DEALS);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [totalDeals, setTotalDeals] = useState<number>(INITIAL_VERIFIED_DEALS.length);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 40;

  // Modals & Power Tools
  const [selectedDetailDeal, setSelectedDetailDeal] = useState<PublicDeal | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [lookupUrl, setLookupUrl] = useState<string>('');
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [activeLegal, setActiveLegal] = useState<LegalDocType>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareDeals, setCompareDeals] = useState<PublicDeal[]>([]);
  const [activeCardIds, setActiveCardIds] = useState<string[]>(() => getSavedCards());
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => isAudioEnabled());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Deals (Favorites) State
  const [savedDealIds, setSavedDealIds] = useState<string[]>(() => getSavedDealIds());

  useEffect(() => {
    return subscribeSavedDeals((ids) => setSavedDealIds(ids));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  }, []);

  const handleToggleCompare = useCallback((deal: PublicDeal) => {
    setCompareDeals((prev) => {
      const exists = prev.some((d) => d.id === deal.id);
      if (exists) {
        showToast('Removed from comparison');
        return prev.filter((d) => d.id !== deal.id);
      }
      if (prev.length >= 3) {
        showToast('Max 3 deals can be compared at once');
        return prev;
      }
      showToast(`Added to compare dock (${prev.length + 1}/3)`);
      return [...prev, deal];
    });
  }, [showToast]);

  const handleRemoveCompareDeal = useCallback((id: string) => {
    setCompareDeals((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleClearCompareAll = useCallback(() => {
    setCompareDeals([]);
    setIsCompareModalOpen(false);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = !isAudioActive;
    setAudioEnabled(next);
    setIsAudioActive(next);
    if (next) {
      playTactileClick();
      showToast('Sound effects enabled 🔊');
    } else {
      showToast('Sound effects muted 🔇');
    }
  }, [isAudioActive, showToast]);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleToggleSaveDeal = useCallback((deal: PublicDeal) => {
    const { isSaved, list } = toggleSavedDealId(deal.id);
    setSavedDealIds(list);
    showToast(isSaved ? 'Saved to your Loot Bookmarks!' : 'Removed from saved deals');
  }, [showToast]);

  const flashLootCount = useMemo(() => {
    return deals.filter((d) => (d.discount_pct || 0) >= 70).length;
  }, [deals]);

  const handleFilterFlashLoot = useCallback(() => {
    setActiveTab('home');
    setSelectedCategory('all');
    setSelectedStore('all');
    setSearchQuery('');
    setSortBy('discount');
    const section = document.getElementById('deals-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Top Page Scroll Progress (Micro-interaction 15: 2px Amber indicator)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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
          sort: sortBy,
        });

        if (selectedStore !== 'all') params.append('store', selectedStore);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);

        let res: Response | null = null;
        try {
          res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`);
        } catch {
          res = null;
        }

        if (!res || !res.ok) {
          try {
            res = await fetch(`${EDGE_API}/deals?${params.toString()}`);
          } catch {
            res = null;
          }
        }

        if (!res || !res.ok) {
          throw new Error(`API returned status ${res ? res.status : 'network error'}`);
        }

        const data: PublicDealsResponse = await res.json();
        const incomingDeals: PublicDeal[] = (data.deals || []).map((deal: PublicDeal) => {
          const score = typeof deal.worth_score === 'number' ? deal.worth_score : calculateWorthScore(deal).score;
          return {
            ...deal,
            worth_score: score,
            display_ts: deal.posted_at ? deal.posted_at * 1000 : Date.now(),
          };
        });

        if (isAppend) {
          setDeals((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const fresh = incomingDeals.filter((d) => !existingIds.has(d.id));
            return [...prev, ...fresh];
          });
        } else {
          setDeals(incomingDeals);
        }

        setTotalDeals(data.total || incomingDeals.length);
        setHasMore(data.has_more ?? incomingDeals.length === PAGE_SIZE);
        setSkip(currentSkip);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch deals';
        console.warn('Live API sync notice, serving verified catalog:', msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedStore, selectedCategory, sortBy]
  );

  // Initial fetch and on filter/sort changes
  useEffect(() => {
    fetchDeals(0, false);
  }, [fetchDeals]);

  // Load More Handler
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextSkip = skip + PAGE_SIZE;
    fetchDeals(nextSkip, true);
  };

  // Filter deals locally based on search query, category rail, activeTab
  const filteredDeals = useMemo(() => {
    let result = deals;

    // Search query filtering
    if (searchQuery.trim()) {
      result = searchDealsClient(result, searchQuery).deals;
    }

    // Category filtering
    if (selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter(
        (d) =>
          d.category?.toLowerCase().includes(catLower) ||
          d.title?.toLowerCase().includes(catLower)
      );
    }

    // Store filtering
    if (selectedStore !== 'all') {
      const storeLower = selectedStore.toLowerCase();
      result = result.filter((d) => d.store?.toLowerCase().includes(storeLower));
    }

    // Tab-based filtering
    if (activeTab === 'saved') {
      result = result.filter((d) => savedDealIds.includes(d.id));
    } else if (activeTab === 'ending_soon') {
      // Popular / High discount
      result = [...result].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (activeTab === 'best_worth') {
      // Top Value
      result = [...result].sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));
    }

    return result;
  }, [deals, searchQuery, selectedCategory, selectedStore, activeTab, savedDealIds]);

  const handleFocusSearch = () => {
    const inputEl = document.getElementById('hero-search-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputEl.focus(), 250);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 0. Global Ambient Mesh Background ── */}
      <div className="ambient-mesh"></div>

      {/* ── 0.1 Top Scroll Progress Indicator ── */}
      <motion.div
        style={{
          scaleX,
          transformOrigin: '0%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: '#F59E0B',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
        className="glow-amber"
      />

      {/* ── 1. Header (Navbar) ── */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') {
            setSelectedStore('all');
            setSelectedCategory('all');
            setSearchQuery('');
          }
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onFocusSearch={handleFocusSearch}
        onOpenCardsModal={() => setIsCardsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isAudioEnabled={isAudioActive}
        onToggleAudio={handleToggleAudio}
        savedCount={savedDealIds.length}
      />

      {/* ── Real-Time Loot Radar Marquee Ticker ── */}
      <MarqueeTicker
        onSelectDeal={(deal) => {
          const fullDeal = deals.find((d) => d.id === deal.id);
          setSelectedDetailDeal((fullDeal || deal) as PublicDeal);
        }}
        onOpenVerify={() => setIsVerifyModalOpen(true)}
      />

      {/* ── Tab Views: About, How We Verify, Contact, Submit ── */}
      {activeTab === 'about' ? (
        <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          <AboutPage />
        </main>
      ) : activeTab === 'how_we_verify' ? (
        <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          <HowWeVerify />
        </main>
      ) : activeTab === 'wall_of_happiness' ? (
        <main style={{ flex: 1, width: '100%' }}>
          <WallOfHappiness
            onBackToHome={() => setActiveTab('home')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        </main>
      ) : activeTab === 'contact' ? (
        <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          <ContactPage />
        </main>
      ) : activeTab === 'submit_deal' || isSubmitOpen ? (
        <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          <SubmitDeal onBackToHome={() => { setIsSubmitOpen(false); setActiveTab('home'); }} />
        </main>
      ) : (
        /* ── Homepage Main Flow ── */
        <main style={{ flex: 1, width: '100%' }}>
          {/* ── 2. Hero Section & Decoupled Search ── */}
          <HeroBanner
            searchQuery={searchQuery}
            onSearch={(q) => setSearchQuery(q)}
            onOpenLookup={(url) => {
              setLookupUrl(url || '');
              setIsLookupOpen(true);
            }}
            highDiscountCount={flashLootCount}
            onFilterFlashLoot={handleFilterFlashLoot}
          />

          {/* ── 2.5 Flash Category Stories Rail (Instagram-style) ── */}
          <CategoryStories
            onSelectCategoryFilter={(cat) => {
              setSelectedCategory(cat);
              const dealGrid = document.getElementById('deals-section');
              if (dealGrid) {
                dealGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />

          {/* ── 3. Category Rail (Sticky below header) ── */}
          <CategoryRail
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* ── 4. Deal Toolbar (Store, Category, Sort, Deal Count, View Toggle) ── */}
          <DealToolbar
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalDeals={filteredDeals.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* ── 5. Deal Section: Latest Verified Deals ── */}
          <section
            id="deals-section"
            className="max-w-[1340px] mx-auto px-4 md:px-6 pt-4 pb-10 w-full"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0">
                    {activeTab === 'saved' ? (
                      <span>💖 Saved Loot Bookmarks</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Latest Verified Drops</span>
                        <span className="sm:hidden">Latest Drops</span>
                      </>
                    )}
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeTab === 'saved' ? 'BOOKMARKS' : 'LIVE RADAR'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {activeTab === 'saved'
                    ? 'Your bookmarked loot deals saved locally in your browser.'
                    : 'Cross-referenced against 90-day price history • Verified affiliate-direct links'}
                </p>
              </div>

              {/* Deal count */}
              <span className="font-mono text-xs sm:text-sm text-slate-500 font-semibold">
                {activeTab === 'saved'
                  ? `${filteredDeals.length} saved`
                  : totalDeals ? `${totalDeals.toLocaleString('en-IN')} drops` : '3,350+ drops'}
              </span>
            </div>

            {/* Cards Grid / Empty States */}
            {loading && deals.length === 0 ? (
              <div className="py-8">
                <DealSkeletonGrid count={8} />
              </div>
            ) : error && deals.length === 0 ? (
              <div className="py-12 px-6 text-center max-w-md mx-auto rounded-2xl border border-rose-200 bg-white shadow-sm">
                <h3 className="font-heading font-bold text-slate-900 mb-2">
                  Could not load deals
                </h3>
                <p className="text-xs text-rose-600 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => fetchDeals(0, false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
                >
                  Retry Connection
                </button>
              </div>
            ) : activeTab === 'saved' && filteredDeals.length === 0 ? (
              <div className="py-14 px-6 text-center max-w-md mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col items-center">
                <span className="text-4xl mb-3">💖</span>
                <h3 className="font-heading font-bold text-slate-900 mb-2">
                  No Saved Deals Yet
                </h3>
                <p className="text-xs text-slate-500 mb-5 max-w-xs leading-relaxed">
                  Tap the heart icon on any verified deal card to bookmark bargains here for instant tracking.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all hover:scale-105"
                >
                  Browse Verified Drops →
                </button>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="py-14 px-6 text-center max-w-md mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h3 className="font-heading font-bold text-slate-900 mb-2">
                  No deals found
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSelectedStore('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Responsive Grid: 4 columns desktop, 2 columns mobile */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredDeals.map((deal, idx) => (
                      <PublicDealCard
                        key={deal.id}
                        deal={deal}
                        index={idx}
                        isSaved={savedDealIds.includes(deal.id)}
                        isComparing={compareDeals.some((d) => d.id === deal.id)}
                        activeCardIds={activeCardIds}
                        onToggleSave={handleToggleSaveDeal}
                        onToggleCompare={handleToggleCompare}
                        onShowToast={showToast}
                        onSelectDeal={(d) => setSelectedDetailDeal(d)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More Button */}
                {hasMore && filteredDeals.length > 0 && (
                  <div className="text-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="h-11 px-7 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                    >
                      {loadingMore ? 'Loading More Drops...' : '⚡ Load More Drops ↓'}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── 6. Price Lookup CTA Strip ── */}
          <PriceLookupStrip
            onOpenLookup={() => {
              setLookupUrl('');
              setIsLookupOpen(true);
            }}
          />

          {/* ── 7. Trust / Verification Strip ── */}
          <TrustStrip />
        </main>
      )}

      {/* ── 8. Footer ── */}
      <Footer
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => setActiveLegal(type)}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* ── 9. Mobile Bottom Navigation (md:hidden) ── */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLookup={() => {
          setLookupUrl('');
          setIsLookupOpen(true);
        }}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onFocusSearch={handleFocusSearch}
        savedCount={savedDealIds.length}
      />

      {/* ── Deal Detail Modal (Opens when card clicked) ── */}
      <DealDetailModal
        deal={selectedDetailDeal}
        onClose={() => setSelectedDetailDeal(null)}
        onShowToast={showToast}
        onToggleSave={handleToggleSaveDeal}
      />

      {/* ── Price Lookup Tool Modal ── */}
      <DealLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        initialUrl={lookupUrl}
      />

      {/* ── Legal / Terms Modal ── */}
      <LegalModal
        type={activeLegal}
        onClose={() => setActiveLegal(null)}
      />

      {/* ── Autonomous Deal Verification Pipeline Modal ── */}
      <HowDealsWorkModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onViewFullPage={() => {
          setIsVerifyModalOpen(false);
          setActiveTab('how_we_verify');
        }}
      />

      {/* ── Credit Card Savings Calculator Modal ── */}
      <CardCalculatorModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        onCardsUpdated={(cards) => {
          setActiveCardIds(cards);
          showToast('Credit card preferences updated!');
        }}
      />

      {/* ── Apple Spotlight / Command Palette ── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        deals={deals}
        onSelectDeal={(deal) => {
          setSelectedDetailDeal(deal);
        }}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          setActiveTab('home');
          const el = document.getElementById('deals-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── Multi-Deal Comparison Drawer & Modal ── */}
      <CompareDrawer
        compareDeals={compareDeals}
        isOpen={isCompareModalOpen}
        onOpenModal={() => setIsCompareModalOpen(true)}
        onCloseModal={() => setIsCompareModalOpen(false)}
        onRemoveDeal={handleRemoveCompareDeal}
        onClearAll={handleClearCompareAll}
      />

      {/* ── Floating Action Toast ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '20px',
            zIndex: 110,
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.25)',
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <span style={{ color: '#10B981' }}>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
