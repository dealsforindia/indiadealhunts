import React from 'react';

const TRUST_POINTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Multi-Source Vetted',
    description: 'Deals validated across India’s top curation networks to eliminate spam & duplicates.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    ),
    title: 'Real Discounts Only',
    description: 'Tested against 90-day price trends to eliminate fake MRP price hikes.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
      </svg>
    ),
    title: 'Sub-Minute Drops',
    description: '24/7 real-time radar catches lightning price errors and flash loots before stock ends.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Direct Store Links',
    description: 'Verified direct destination links straight to Amazon, Flipkart, Myntra & Swiggy.',
  },
];

export const TrustStrip: React.FC = () => {
  return (
    <section aria-label="Verification and trust features" className="max-w-[1340px] mx-auto px-4 md:px-6 my-10 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_POINTS.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-xs">
              {item.icon}
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-slate-900 leading-snug">
                {item.title}
              </h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
