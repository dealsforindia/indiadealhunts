import React, { FormEvent } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';

interface SearchResultsHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  verifiedCount: number;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({ query, onQueryChange, onSubmit, onClear, verifiedCount }) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="phone-search-results border-b border-[var(--border-subtle)] dark:border-white/10 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 px-4 py-4 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-[1340px]">
        <button type="button" onClick={onClear} className="mb-4 text-xs font-bold text-[var(--text-secondary)] transition hover:text-[var(--idh-accent)]">← Back to all deals</button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--idh-accent)]">Storefront search</p>
            <h1 className="font-heading text-2xl font-black tracking-tight text-[var(--text-primary)] dark:text-[var(--text-primary)] sm:text-4xl">Deals for “{query.trim()}”</h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-[var(--text-secondary)]">Search the deal directory and discover store offers. Inspect product matches and available price evidence before buying.</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{verifiedCount} directory result{verifiedCount === 1 ? '' : 's'}</div>
        </div>

        <form onSubmit={handleSubmit} className="results-search" role="search" aria-label="Refine product search">
          <Search className="results-search-icon" size={19} strokeWidth={1.7} aria-hidden="true" />
          <input id="search-results-input" aria-label="Search products" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search products or paste a link…" autoFocus />
          <button type="submit" className="results-search-submit"><span>Search</span><ArrowRight size={17} aria-hidden="true" /></button>
          <button type="button" onClick={onClear} className="results-search-clear" aria-label="Clear search"><X size={17} aria-hidden="true" /><span>Clear</span></button>
        </form>
      </div>
    </section>
  );
};
