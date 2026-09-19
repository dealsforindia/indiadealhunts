import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Play, Pause, Volume2, VolumeX, X, ExternalLink, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Sparkles, Film, Heart, Share2, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  onOpenDeal,
  externalActiveDeal,
  onCloseExternal,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter deals that have ready, playable video streams
  const videoDeals = deals.filter(
    (d) => Boolean(d.video_url && typeof d.video_url === 'string' && d.video_url.startsWith('http') && d.video_status !== 'failed')
  );

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [showHeartAnim, setShowHeartAnim] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Sync externalActiveDeal from parent (e.g. clicking a deal card's short badge)
  useEffect(() => {
    if (externalActiveDeal) {
      const idx = videoDeals.findIndex(
        (d) => (d.id || (d as any).fp_hash) === (externalActiveDeal.id || (externalActiveDeal as any).fp_hash)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        // Fallback to first video if match not found in list
        setCurrentIndex(0);
      }
      setIsPlaying(true);
    }
  }, [externalActiveDeal, videoDeals]);

  const activeDeal = currentIndex >= 0 && currentIndex < videoDeals.length ? videoDeals[currentIndex] : null;

  // Carousel horizontal scroll
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleOpenShort = (deal: PublicDeal, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleClose = useCallback(() => {
    setCurrentIndex(-1);
    onCloseExternal?.();
  }, [onCloseExternal]);

  // Navigate next short
  const handleNext = useCallback(() => {
    if (videoDeals.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videoDeals.length);
    setIsPlaying(true);
  }, [videoDeals.length]);

  // Navigate prev short
  const handlePrev = useCallback(() => {
    if (videoDeals.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videoDeals.length) % videoDeals.length);
    setIsPlaying(true);
  }, [videoDeals.length]);

  // Toggle Play / Pause
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

  // Trigger floating heart explosion on double tap or like button
  const triggerLike = (dealId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHasLiked((prev) => ({ ...prev, [dealId]: !prev[dealId] }));
    setLikes((prev) => ({
      ...prev,
      [dealId]: (prev[dealId] || 42) + (hasLiked[dealId] ? -1 : 1),
    }));

    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);

    // Confetti heart burst
    confetti({
      particleCount: 18,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#ec4899', '#fb7185'],
      shapes: ['circle'],
    });
  };

  // Keyboard navigation for reels
  useEffect(() => {
    if (currentIndex === -1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'KeyS') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'KeyW') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleNext, handlePrev, handleClose]);

  // Touch Swipe Gestures on Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped Up -> Next Short
        handleNext();
      } else {
        // Swiped Down -> Prev Short
        handlePrev();
      }
    }
    setTouchStartY(null);
  };

  // Share Short Link
  const handleShare = async (deal: PublicDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?short=${deal.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Loot Short: ${deal.title}`,
          text: `Check out this 15s loot breakdown for ${deal.title} at ${deal.discount_pct}% OFF!`,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (!videoDeals || videoDeals.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 flex items-center justify-center">
            <Film className="w-4 h-4 text-indigo-400 animate-pulse" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-brand text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight flex items-center gap-2">
              <span>Automated Viral Shorts</span>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
                9:16 Video Reels
              </span>
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline ml-1">
            — 15s kinetic breakdowns with live verified prices
          </span>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9:16 Vertical Video Cards Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videoDeals.map((deal, idx) => {
          const poster = deal.video_cover || getCleanImageUrl(deal.image);
          const rawDisc = deal.discount_pct || 0;
          const disc = rawDisc >= 99 && (deal.mrp || 0) > 30000 && (deal.price || 0) < 3000
            ? Math.round((1 - (deal.price || 0) / Math.max((deal.price || 0) * 3, 2000)) * 100)
            : Math.min(95, rawDisc);

          return (
            <div
              key={`short-${deal.id}-${idx}`}
              onClick={(e) => handleOpenShort(deal, idx, e)}
              className="group relative w-56 sm:w-64 flex-shrink-0 aspect-[9/16] rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-indigo-500/50 transition-all duration-300 snap-start cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col bg-slate-950/80"
            >
              {/* Background Poster Image */}
              <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
                {poster ? (
                  <img
                    src={poster}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-950 flex items-center justify-center text-4xl">
                    🎬
                  </div>
                )}

                {/* 4s Animated WebP Hover Sticker Preview if available */}
                {deal.video_preview && (
                  <img
                    src={deal.video_preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    loading="lazy"
                  />
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60 pointer-events-none" />
              </div>

              {/* Top Bar: Store & Discount Pill */}
              <div className="relative z-10 p-3.5 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/15 shadow-sm">
                  {deal.store || 'Verified Store'}
                </span>

                {disc > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/90 text-white text-[10px] font-black font-mono shadow-md backdrop-blur-md">
                    -{disc}% OFF
                  </span>
                )}
              </div>

              {/* Center Play Pill */}
              <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                <div className="w-13 h-13 rounded-full bg-indigo-500/85 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/40 group-hover:scale-110 active:scale-95 transition-all duration-300">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Bottom Card Overlay: Price & CTA */}
              <div className="relative z-10 p-3.5 pt-0 flex flex-col gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                    {deal.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-black font-mono text-emerald-400 drop-shadow">
                      ₹{deal.price?.toLocaleString('en-IN')}
                    </span>
                    {deal.mrp && deal.mrp > (deal.price || 0) && (
                      <span className="text-[11px] font-mono text-slate-400 line-through">
                        ₹{deal.mrp?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Grab Deal Affiliate Link */}
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Grab Loot Deal</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Vertical 9:16 TikTok/Reels Player Modal portaled to document.body */}
      {typeof document !== 'undefined' && activeDeal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-black/94 backdrop-blur-2xl animate-fade-in"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Reel Viewport */}
          <div
            className="relative h-[92vh] max-h-[880px] aspect-[9/16] w-auto max-w-[440px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col select-none"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => triggerLike(activeDeal.id, e)}
          >
            {/* Modal Top Bar */}
            <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2 max-w-[70%]">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Film className="w-2.5 h-2.5 animate-pulse" />
                  <span>Reel {currentIndex + 1}/{videoDeals.length}</span>
                </span>
                <span className="text-xs font-bold text-white truncate drop-shadow">
                  {activeDeal.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Sound Visualizer & Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      {/* Bouncing Equalizer Bars */}
                      <span className="flex items-end gap-0.5 h-3 ml-0.5">
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2" />
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-3" />
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite_300ms] h-1.5" />
                      </span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close short (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Frame */}
            <div
              className="flex-1 w-full h-full relative bg-black flex items-center justify-center cursor-pointer"
              onClick={togglePlayPause}
            >
              {activeDeal.video_url ? (
                <video
                  ref={videoRef}
                  src={activeDeal.video_url}
                  poster={activeDeal.video_cover || getCleanImageUrl(activeDeal.image)}
                  autoPlay
                  playsInline
                  loop={!autoAdvance}
                  muted={isMuted}
                  onEnded={() => {
                    if (autoAdvance) handleNext();
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  Video short is rendering or streaming link unavailable.
                </div>
              )}

              {/* Centered Pause Overlay Icon */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-2xl">
                    <Play className="w-8 h-8 fill-white translate-x-1" />
                  </div>
                </div>
              )}

              {/* Floating Double-Tap Heart Animation */}
              {showHeartAnim && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-ping">
                  <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
                </div>
              )}
            </div>

            {/* Right TikTok-Style Action Dock */}
            <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4">
              {/* Like / Heart Action */}
              <button
                onClick={(e) => triggerLike(activeDeal.id, e)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Double-tap or click to like"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                    hasLiked[activeDeal.id]
                      ? 'bg-rose-500 border-rose-400 text-white scale-110 shadow-lg shadow-rose-500/50'
                      : 'bg-black/60 border-white/20 text-white group-hover:bg-rose-500/30'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${hasLiked[activeDeal.id] ? 'fill-white text-white' : 'text-white'}`}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                  {likes[activeDeal.id] || 42}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={(e) => handleShare(activeDeal, e)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                title="Share Reel link"
              >
                <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-90">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                  Share
                </span>
              </button>
            </div>

            {/* Bottom Deal Metadata & One-Click Grab Banner */}
            <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-2.5">
              {/* Title & Brand */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-indigo-400" />
                  <span>{activeDeal.store || 'VERIFIED STORE'} LOOT</span>
                </span>
                <h2 className="text-sm font-black text-white line-clamp-2 leading-tight drop-shadow mt-0.5">
                  {activeDeal.title}
                </h2>
              </div>

              {/* Live Price Tag & Savings */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black font-mono text-emerald-400 drop-shadow">
                    ₹{activeDeal.price?.toLocaleString('en-IN')}
                  </span>
                  {activeDeal.mrp && activeDeal.mrp > (activeDeal.price || 0) && (
                    <span className="text-xs font-mono text-slate-400 line-through">
                      ₹{activeDeal.mrp?.toLocaleString('en-IN')}
                    </span>
                  )}
                  {activeDeal.discount_pct && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-black font-mono shadow-md">
                      -{Math.min(95, activeDeal.discount_pct)}%
                    </span>
                  )}
                </div>

                {/* Direct Grab Link */}
                <a
                  href={activeDeal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl shadow-emerald-500/35 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Grab Loot Deal</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Floating Next / Prev Navigation Buttons */}
          <div className="hidden sm:flex flex-col gap-3 ml-4 z-50">
            <button
              onClick={handlePrev}
              className="p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-90 cursor-pointer"
              title="Previous Reel (Up Arrow / W)"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 shadow-xl transition-all hover:scale-110 active:scale-90 cursor-pointer"
              title="Next Reel (Down Arrow / S)"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
