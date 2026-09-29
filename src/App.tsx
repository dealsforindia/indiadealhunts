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
import { DealSkeletonGrid } from './components/DealSkeleton';
import type { PublicDeal, PublicDealsResponse, SortOption, NavTab } from './types';
import { calculateWorthScore } from './utils/worthScore';
import { searchDealsClient } from './utils/semanticSearch';
import { INITIAL_VERIFIED_DEALS } from './data/mockDeals';

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

  // Modals
  const [selectedDetailDeal, setSelectedDetailDeal] = useState<PublicDeal | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [lookupUrl, setLookupUrl] = useState<string>('');
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [activeLegal, setActiveLegal] = useState<LegalDocType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
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

        let res = await fetch(`${EDGE_API}/deals?${params.toString()}`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/v1/deals/public?${params.toString()}`);
        }

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
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
    if (activeTab === 'ending_soon') {
      // Popular / High discount
      result = [...result].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (activeTab === 'best_worth') {
      // Top Value
      result = [...result].sort((a, b) => (b.worth_score || 0) - (a.worth_score || 0));
    }

    return result;
  }, [deals, searchQuery, selectedCategory, selectedStore, activeTab]);

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
            className="px-3 md:px-5 w-full"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              paddingTop: '12px',
              paddingBottom: '32px',
            }}
          >
            {/* Section Header */}
            <div
              style={{
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', color: '#F59E0B' }}>⚡</span>
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: '#F5F7FA',
                      margin: 0,
                    }}
                  >
                    <span className="hidden sm:inline">Latest Verified Deals</span>
                    <span className="sm:hidden">Latest Deals</span>
                  </h2>
                </div>
                <p
                  className="hidden sm:block"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: '#9099A6',
                    margin: '4px 0 0',
                  }}
                >
                  Handpicked and verified by our team • Updated frequently
                </p>
              </div>

              {/* Mobile Deal Count */}
              <span
                className="sm:hidden"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#9099A6',
                }}
              >
                {totalDeals ? `${totalDeals.toLocaleString('en-IN')} deals` : '1,248 deals'}
              </span>
            </div>

            {/* Cards Grid / Empty States */}
            {loading && deals.length === 0 ? (
              <div style={{ padding: '24px 0' }}>
                <DealSkeletonGrid count={8} />
              </div>
            ) : error && deals.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  maxWidth: '460px',
                  margin: '0 auto',
                  borderRadius: '6px',
                  border: '1px solid #3A1714',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <h3 style={{ fontWeight: 700, color: '#F5F7FA', marginBottom: '8px' }}>
                  Could not load deals
                </h3>
                <p style={{ fontSize: '13px', color: '#FF6B5F', marginBottom: '18px' }}>
                  {error}
                </p>
                <button
                  onClick={() => fetchDeals(0, false)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#F59E0B',
                    color: '#090A0C',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '4px',
                  }}
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div
                style={{
                  padding: '56px 24px',
                  textAlign: 'center',
                  maxWidth: '460px',
                  margin: '0 auto',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <h3 style={{ fontWeight: 700, color: '#F5F7FA', marginBottom: '8px' }}>
                  No deals found
                </h3>
                <p style={{ fontSize: '13px', color: '#9099A6', marginBottom: '18px' }}>
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSelectedStore('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--surface-2)',
                    color: '#F5F7FA',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                  }}
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
                        onSelectDeal={(d) => setSelectedDetailDeal(d)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More Button */}
                {hasMore && filteredDeals.length > 0 && (
                  <div style={{ textAlign: 'center', marginTop: '36px' }}>
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: loadingMore ? 0.6 : 1,
                        transition: 'border-color 120ms ease, background-color 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#F59E0B';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      }}
                    >
                      {loadingMore ? 'Loading More Drops...' : 'Load More Deals ↓'}
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
      />

      {/* ── Deal Detail Modal (Opens when card clicked) ── */}
      <DealDetailModal
        deal={selectedDetailDeal}
        onClose={() => setSelectedDetailDeal(null)}
        onShowToast={showToast}
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

      {/* ── Floating Action Toast ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '72px',
            right: '20px',
            zIndex: 110,
            backgroundColor: '#141820',
            border: '1px solid #F59E0B',
            borderRadius: '4px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#F5F7FA',
            fontSize: '13px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <span style={{ color: '#F59E0B' }}>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
