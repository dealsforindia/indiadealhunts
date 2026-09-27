import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface ViralShortsSectionProps {
  deals: PublicDeal[];
  onOpenDeal?: (deal: PublicDeal) => void;
  externalActiveDeal?: PublicDeal | null;
  onCloseExternal?: () => void;
}

export const ViralShortsSection: React.FC<ViralShortsSectionProps> = ({
  deals,
  externalActiveDeal,
  onCloseExternal,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollLeft = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollRight = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const videoDeals = deals.filter(
    (d) => Boolean(d.video_url && typeof d.video_url === 'string' && d.video_url.startsWith('http') && d.video_status !== 'failed')
  );

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [autoAdvance] = useState<boolean>(true);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  useEffect(() => {
    if (externalActiveDeal) {
      const idx = videoDeals.findIndex(
        (d) => (d.id || (d as any).fp_hash) === (externalActiveDeal.id || (externalActiveDeal as any).fp_hash)
      );
      setCurrentIndex(idx !== -1 ? idx : 0);
      setIsPlaying(true);
    }
  }, [externalActiveDeal, videoDeals]);

  const activeDeal = currentIndex >= 0 && currentIndex < videoDeals.length ? videoDeals[currentIndex] : null;

  const handleOpenShort = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleClose = useCallback(() => {
    setCurrentIndex(-1);
    onCloseExternal?.();
  }, [onCloseExternal]);

  const handleNext = useCallback(() => {
    if (videoDeals.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videoDeals.length);
    setIsPlaying(true);
  }, [videoDeals.length]);

  const handlePrev = useCallback(() => {
    if (videoDeals.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videoDeals.length) % videoDeals.length);
    setIsPlaying(true);
  }, [videoDeals.length]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (currentIndex === -1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'KeyS') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowUp' || e.key === 'KeyW') { e.preventDefault(); handlePrev(); }
      else if (e.key === 'Escape') { e.preventDefault(); handleClose(); }
      else if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setIsMuted((p) => !p); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleNext, handlePrev, handleClose]);

  const handleShare = async (deal: PublicDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?short=${deal.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deal Video: ${deal.title}`,
          url: shareUrl,
        });
      } catch { /* ignore */ }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      });
    }
  };

  if (!videoDeals || videoDeals.length === 0) return null;

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: '#F5F5F5', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Video Shorts
          </h2>
          <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0, fontFamily: 'var(--font-body)' }}>
            15-second deal breakdowns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={scrollLeft} aria-label="Previous" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', border: '1px solid #262626', color: '#A3A3A3', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={scrollRight} aria-label="Next" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', border: '1px solid #262626', color: '#A3A3A3', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {videoDeals.map((deal, idx) => {
            const poster = deal.video_cover || getCleanImageUrl(deal.image);
            const disc = deal.discount_pct || 0;
            return (
              <div
                key={deal.id}
                onClick={(e) => handleOpenShort(idx, e)}
                style={{
                  position: 'relative', width: '200px', flexShrink: 0, aspectRatio: '9/16',
                  backgroundColor: '#111', border: '1px solid #262626', borderRadius: '4px',
                  overflow: 'hidden', cursor: 'pointer'
                }}
              >
                {poster ? (
                  <img src={poster} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#1A1A1A' }} />
                )}

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 0%, transparent 60%)' }} />

                <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ padding: '2px 6px', background: '#0A0A0A', border: '1px solid #262626', color: '#F5F5F5', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    {deal.store || 'VERIFIED'}
                  </span>
                  {disc > 0 && (
                    <span style={{ padding: '2px 6px', background: '#1A1200', border: '1px solid #452A00', color: '#F59E0B', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                      -{disc}%
                    </span>
                  )}
                </div>

                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                  <span className="price-num" style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#F5F5F5', marginBottom: '4px' }}>
                    {'\u20B9'}{deal.price?.toLocaleString('en-IN')}
                  </span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#A3A3A3', fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {deal.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {typeof document !== 'undefined' && activeDeal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {showCopied && (
            <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, padding: '8px 16px', background: '#111', border: '1px solid #262626', color: '#F5F5F5', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              Link copied
            </div>
          )}

          <div style={{ position: 'relative', height: '100%', maxHeight: '92vh', aspectRatio: '9/16', backgroundColor: '#0A0A0A', border: '1px solid #262626', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
              <span style={{ color: '#F5F5F5', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {currentIndex + 1} / {videoDeals.length}
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: '#F5F5F5', cursor: 'pointer' }}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#F5F5F5', cursor: 'pointer' }}>Close</button>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#000', position: 'relative' }} onClick={togglePlayPause}>
              {activeDeal.video_url && (
                <video
                  ref={videoRef}
                  src={activeDeal.video_url}
                  poster={activeDeal.video_cover || getCleanImageUrl(activeDeal.image)}
                  autoPlay
                  playsInline
                  loop={!autoAdvance}
                  muted={isMuted}
                  onEnded={() => { if (autoAdvance) handleNext(); }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
              {!isPlaying && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" fill="#F5F5F5"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'absolute', bottom: '80px', right: '16px', zIndex: 30, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={(e) => handleShare(activeDeal, e)} style={{ width: '40px', height: '40px', background: '#111', border: '1px solid #262626', color: '#F5F5F5', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12v8h16v-8M12 4v12M8 8l4-4 4 4"/></svg>
              </button>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', zIndex: 30, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
              <h3 style={{ fontSize: '13px', color: '#F5F5F5', margin: '0 0 8px', fontFamily: 'var(--font-body)' }}>{activeDeal.title}</h3>
              <a href={activeDeal.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px', background: '#F5F5F5', color: '#0A0A0A', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                Claim {'\u20B9'}{activeDeal.price?.toLocaleString('en-IN')}
              </a>
            </div>
          </div>
          
          <div style={{ position: 'absolute', right: '40px', flexDirection: 'column', gap: '16px', display: window.innerWidth > 768 ? 'flex' : 'none' }}>
            <button onClick={handlePrev} style={{ width: '48px', height: '48px', background: '#111', border: '1px solid #262626', color: '#F5F5F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ↑
            </button>
            <button onClick={handleNext} style={{ width: '48px', height: '48px', background: '#111', border: '1px solid #262626', color: '#F5F5F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ↓
            </button>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
