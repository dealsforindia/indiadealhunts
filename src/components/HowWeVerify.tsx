import React from 'react';
import { IconChevronRight } from './Icons';

interface HowWeVerifyProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const HowWeVerify: React.FC<HowWeVerifyProps> = ({ onBackToHome }) => {
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
        <span className="text-slate-800 font-semibold">Verification Pipeline</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold w-fit">
          <span>🛡️ ZERO-TOLERANCE FRAUD FILTER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 leading-tight">
          How Deals Are Verified
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          Every deal listed on IndiaDealHunts passes through our automated multi-layer verification pipeline. From live merchant scraping and 90-day price benchmarking to link sanitization, we verify that only genuine discounts reach the feed.
        </p>
      </div>

      {/* 5-Step Pipeline */}
      <div className="flex flex-col gap-3.5">
        {[
          {
            num: '01',
            title: 'Canonical Link Resolution & Sanitization',
            tag: 'Link Layer',
            desc: 'When a deal URL enters our ingestion workers, we follow all redirect hops (such as fpkrt.cc or amzn.to) to unpack the canonical merchant product ID (ASIN on Amazon, pid/itm on Flipkart). We sanitize tracking tokens to guarantee safe, direct merchant landing.',
          },
          {
            num: '02',
            title: '90-Day Historical Price Benchmarking',
            tag: 'Price Audit',
            desc: 'Sellers frequently raise list prices immediately before promotional sales. Our workers cross-reference current live prices against 90-day median pricing to verify whether a discount is historically meaningful.',
          },
          {
            num: '03',
            title: 'Multi-Source Signal Consensus',
            tag: 'Consensus',
            desc: 'When an extraordinary price drop occurs, our system checks if multiple independent channels are reporting the same drop simultaneously. High consensus indicates a verified clearance or flash sale event.',
          },
          {
            num: '04',
            title: 'Live Stock & Merchant Availability',
            tag: 'Telemetry',
            desc: 'Scrapers poll product detail pages to check if items are in-stock, fulfilled by reputable sellers, and eligible for delivery. Expired promotions are automatically labeled as Sold Out to prevent wasted clicks.',
          },
          {
            num: '05',
            title: 'Clean Affiliate Transformation',
            tag: 'Monetization',
            desc: 'Clean URLs are transformed with transparent affiliate tags for Amazon Associates and Flipkart/EarnKaro networks. This sustains our free service with zero price impact on the buyer.',
          },
        ].map((step) => (
          <div
            key={step.num}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-start"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-600 text-sm flex-shrink-0">
              {step.num}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold font-heading text-slate-900">
                  {step.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  {step.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Try Tool Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900">
            Want to test a product link yourself?
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Use our interactive Price Lookup tool to paste any Amazon, Flipkart, or Myntra link and inspect live metrics right now.
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 transition-all shadow-sm active:scale-95"
        >
          <span>Explore Live Drops</span>
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
