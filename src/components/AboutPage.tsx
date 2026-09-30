import React from 'react';
import { IconChevronRight } from './Icons';

interface AboutPageProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={onBackToHome}
          className="hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">About IndiaDealHunts</span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px] font-bold w-fit">
          <span>⚡ THE AI LOOT RADAR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 leading-tight">
          Verified Retail Deals & Honest Price Intelligence
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          E-commerce promotions frequently advertise artificial discounts against inflated MRPs. IndiaDealHunts monitors genuine price drops, flash clearances, and real coupon stacks across Amazon, Flipkart, Myntra, Swiggy Instamart, and partner platforms.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Feeds Monitored', val: '27+' },
          { label: 'Deals Ingested Daily', val: '1,000+' },
          { label: 'Active Deal Hunters', val: '45,000+' },
          { label: 'Shopper Access', val: '100% Free' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col gap-1 shadow-sm"
          >
            <div className="text-2xl font-black font-heading text-slate-900">
              {stat.val}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Core Pillars */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold font-heading text-slate-900">
          Our Operational Standards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            {
              title: '1. True Price History Verification',
              desc: 'We never promote deals based solely on claimed discount percentages. Scrapers compare live deals against 90-day retail pricing to verify that the drop represents a genuine bargain.',
            },
            {
              title: '2. Sub-Second Deal Detection',
              desc: 'Flash sales and clearance items sell out quickly. Background workers process incoming alerts from 27 monitored feeds and dispatch verified items directly to our web feed and Telegram.',
            },
            {
              title: '3. Zero Sponsored Clutter',
              desc: 'Deals are never featured for payment or kickbacks. Items with inflated MRPs or suspicious reviews are rejected before appearing in the verified feed.',
            },
            {
              title: '4. Free & Open for Shoppers',
              desc: 'No paywalls, subscriptions, or hidden charges. We earn affiliate referral commissions from supported retail partners at zero additional cost to you.',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
            >
              <h3 className="text-sm font-bold font-heading text-blue-600">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900">
            Verification Pipeline Documentation
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review our step-by-step verification pipeline explaining how price scraping, multi-source consensus, and affiliate redirects operate.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab && onNavigateTab('how_we_verify')}
          className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-all shadow-sm active:scale-95"
        >
          <span>Read Methodology</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
