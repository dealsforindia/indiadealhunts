import React, { useState, useRef } from 'react';
import { Play, Volume2, VolumeX, X, ExternalLink, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Film } from 'lucide-react';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface ViralShortsSectionProps {
  deals: PublicDeal[];
  onOpenDeal?: (deal: PublicDeal) => void;
}

export const ViralShortsSection: React.FC<ViralShortsSectionProps> = ({ deals, onOpenDeal }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideoDeal, setActiveVideoDeal] = useState<PublicDeal | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Filter deals that have ready videos
  const videoDeals = deals.filter(d => (d.has_video || d.video_url) && d.video_status !== 'failed');

  // If no deals have videos ready, gracefully don't render anything
  if (!videoDeals || videoDeals.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleOpenShort = (deal: PublicDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoDeal(deal);
  };

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
        {videoDeals.map((deal) => {
          const poster = deal.video_cover || getCleanImageUrl(deal.image);
          const disc = deal.discount_pct || 0;

          return (
            <div
              key={`short-${deal.id}`}
              onClick={(e) => handleOpenShort(deal, e)}
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

      {/* Fullscreen Vertical 9:16 Reel Player Modal */}
      {activeVideoDeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-2xl animate-fade-in"
          onClick={() => setActiveVideoDeal(null)}
        >
          <div
            className="relative max-h-[90vh] aspect-[9/16] w-full max-w-[420px] rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  9:16 Viral Short
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                  {activeVideoDeal.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveVideoDeal(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close short"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center">
              {activeVideoDeal.video_url ? (
                <video
                  src={activeVideoDeal.video_url}
                  poster={activeVideoDeal.video_cover || getCleanImageUrl(activeVideoDeal.image)}
                  controls
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  Video is processing or streaming link is unavailable.
                </div>
              )}
            </div>

            {/* Bottom Floating Bar */}
            <div className="p-4 bg-slate-950/95 border-t border-white/10 flex items-center justify-between gap-3 z-20">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ₹{activeVideoDeal.price?.toLocaleString('en-IN')}
                  </span>
                  {activeVideoDeal.mrp && activeVideoDeal.mrp > (activeVideoDeal.price || 0) && (
                    <span className="text-xs font-mono text-slate-500 line-through">
                      ₹{activeVideoDeal.mrp?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {activeVideoDeal.store || 'Verified Store'}
                </span>
              </div>

              <a
                href={activeVideoDeal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Grab Loot Deal</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
