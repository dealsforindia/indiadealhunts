import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';
import { Flame, ArrowRight, ExternalLink } from 'lucide-react';
import type { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';

interface TopDealsCarouselProps {
  deals: PublicDeal[];
  onOpenDeal: (deal: PublicDeal) => void;
}

export const TopDealsCarousel: React.FC<TopDealsCarouselProps> = ({ deals, onOpenDeal }) => {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (!deals || deals.length === 0) return null;

  return (
    <div className="w-full mb-8 pt-4">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-rose-500/20 to-orange-500/20 p-2 rounded-xl border border-rose-500/20">
            <Flame className="text-rose-500 fill-rose-500 animate-pulse" size={20} />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Editor's Choice
          </h2>
        </div>
      </div>

      <div className="overflow-hidden px-4 sm:px-6 lg:px-8 pb-6" ref={emblaRef}>
        <div className="flex gap-4">
          {deals.slice(0, 5).map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: 'spring' }}
              className="flex-[0_0_85%] sm:flex-[0_0_400px] min-w-0"
            >
              <div 
                onClick={() => onOpenDeal(deal)}
                className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden cursor-pointer select-none"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-slate-900">
                  <img 
                    src={getCleanImageUrl(deal.image)} 
                    alt={deal.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070A11] via-[#070A11]/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    {deal.discount_pct && deal.discount_pct > 0 && (
                      <span className="bg-emerald-500 text-black px-2 py-1 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20">
                        {deal.discount_pct}% OFF
                      </span>
                    )}
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      {deal.store || "Deal"}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-3 drop-shadow-md">
                    {deal.title}
                  </h3>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
                        ₹{deal.price?.toLocaleString('en-IN') || 0}
                      </span>
                      {deal.mrp && deal.mrp > (deal.price || 0) && (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          ₹{deal.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                      <ExternalLink size={18} className="translate-x-[-1px] group-hover:translate-x-0 group-hover:-translate-y-[1px] transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
