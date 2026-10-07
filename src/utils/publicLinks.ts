import type { PublicDeal } from '../types';

// The public website uses its own origin. Only shopper endpoints are proxied.
export const PUBLIC_API_BASE = '';
export const PUBLIC_EDGE_BASE = '/feed-fallback';
const API_HOSTS = new Set(['api.rudranil.me', '74.225.250.0']);

export function publicStoreUrl(value: string): string {
  if (!value || !/^(?:https?:\/\/|\/out\/[a-zA-Z0-9_-]{1,100}(?:[?#]|$))/i.test(value)) return '';
  try {
    const parsed = new URL(value, 'https://indiadealhunts.vercel.app');
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (API_HOSTS.has(parsed.hostname)) {
      const redirect = parsed.pathname.match(/^\/r\/([a-zA-Z0-9_-]+)\/?$/);
      if (redirect) return `/out/${redirect[1]}${parsed.search}`;
      return '';
    }
    return value.startsWith('/') && !value.startsWith('//') ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.href;
  } catch { return ''; }
}

export function lookupTargetUrl(value: string): string {
  try {
    const parsed = new URL(value, 'https://indiadealhunts.vercel.app');
    const match = parsed.pathname.match(/^\/out\/([a-zA-Z0-9_-]+)\/?$/);
    return match && ['indiadealhunts.vercel.app', 'indiadealhunts.com', '127.0.0.1', 'localhost'].includes(parsed.hostname) ? `https://api.rudranil.me/r/${match[1]}${parsed.search}` : value;
  } catch { return value; }
}

export function publicDeal(deal: PublicDeal): PublicDeal {
  const resolvedImage = deal.image || (deal as any).uploaded_img_url || (deal as any).uploadedImgUrl || (deal as any).img_url || null;
  return {
    ...deal,
    image: resolvedImage,
    url: publicStoreUrl(deal.url),
    ...(Array.isArray(deal.items) ? { items: deal.items.map(item => ({ ...item, buy_url: publicStoreUrl(item.buy_url) })) } : {}),
    ...(deal.arbitrage ? { arbitrage: { ...deal.arbitrage, stores: Array.isArray(deal.arbitrage.stores) ? deal.arbitrage.stores.map(store => ({ ...store, ...(store.url ? { url: publicStoreUrl(store.url) } : {}) })) : [] } } : {}),
  };
}

export function publicShareUrl(value: string): string {
  const link = publicStoreUrl(value);
  return link.startsWith('/') ? `${typeof window === 'undefined' ? 'https://indiadealhunts.vercel.app' : window.location.origin}${link}` : link;
}

/** Hide unfinished template records without inventing replacement product data. */
export function isDisplayableOffer(deal: Pick<PublicDeal, 'title' | 'url' | 'status'>): boolean {
  const title = typeof deal.title === 'string' ? deal.title.trim() : '';
  return !!title && !/\{\{?\s*(?:title|product(?:_name)?|name)\s*\}?\}|^\s*(?:undefined|null|test (?:deal|product)|sample product|placeholder)\s*$/i.test(title)
    && !['rejected', 'pending', 'pending_approval', 'deleted', 'unpublished'].includes(deal.status || '')
    && !!publicStoreUrl(deal.url);
}

export function selectTickerDeals(deals: PublicDeal[] = []): PublicDeal[] {
  const seen = new Set<string>();
  return deals.filter(deal => {
    if (!deal.id || seen.has(deal.id) || !isDisplayableOffer(deal) || !Number.isFinite(deal.price) || !(Number(deal.price) > 0) || deal.is_expired || deal.is_over || deal.status === 'expired') return false;
    seen.add(deal.id);
    return true;
  }).slice(0, 12);
}
