import { useModalSurface } from '../utils/useModalSurface';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Bell, Bookmark, Check, Copy, Heart, Image, Layers, MoreHorizontal, Repeat2, Share2, ShoppingBag, ShoppingCart, Star, X } from 'lucide-react';
import { useAutomaticReviews } from '../utils/reviewEvidence';
import { PublicDeal } from '../types';
import { getCleanImageUrl } from '../utils/imageUrl';
import { isDealSaved, toggleSavedDealId } from '../utils/savedDeals';
import { shareDeal, copyDealLink } from '../utils/shareDeal';
import { playTactileClick, playSuccessChime } from '../utils/audio';
import { openGoogleShoppingModal } from '../utils/googleShopping';
import { extractAmazonAsin, buildAmazonCartUrl, buildMultiAsinCartUrl, generateSubId, openSmartStoreLink, getRecommendedBundle } from '../utils/affiliateEngine';
interface PublicDealCardProps {
  deal: PublicDeal; index?: number; isSaved?: boolean; isComparing?: boolean; 
  onOpenImage?: (deal: PublicDeal) => void; onSelectDeal?: (deal: PublicDeal) => void;
  onToggleSave?: (deal: PublicDeal) => void; onToggleCompare?: (deal: PublicDeal) => void;
  onOpenPriceAlert?: (deal: PublicDeal) => void;
  onOpenExchange?: (deal: PublicDeal) => void; onShowToast?: (msg: string) => void;
}
function relativeTime(timestamp?: number) {
  if (!timestamp) return 'Time unavailable';
  const minutes = Math.max(0, Math.floor((Date.now() - (timestamp > 1e11 ? timestamp : timestamp * 1000)) / 60000));
  return minutes < 1 ? 'Just added' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
}
const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const PublicDealCard: React.FC<PublicDealCardProps> = ({ deal, index = 0, isSaved: suppliedSaved, isComparing = false, onOpenImage, onSelectDeal, onToggleSave, onToggleCompare, onOpenPriceAlert, onOpenExchange, onShowToast }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [localSaved, setLocalSaved] = useState(() => isDealSaved(deal.id));
  const [menuOpen, setMenuOpen] = useState(false);
  const [includeBundle, setIncludeBundle] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useModalSurface(menuOpen, () => setMenuOpen(false));
  const saved = suppliedSaved ?? localSaved;
  const card = useRef<HTMLElement>(null);
  const { result: reviewEvidence, load: reviewLoad } = useAutomaticReviews(deal.id, deal.url || '', card);
  const effectiveRating = reviewEvidence?.rating ?? deal.rating ?? null;
  const effectiveRatingCount = reviewEvidence?.rating_count ?? deal.rating_count ?? deal.review_count ?? null;
  const rawStore = deal.store || 'Store';
  const store = /static[\s_-]?assets/i.test(rawStore) ? 'Flipkart' : rawStore;
  const title = deal.title?.replace(/^[\s\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]+/u, '').trim() || `${store} offer`;
  const price = Number(deal.price ?? deal.sale_price ?? deal.prices?.sale) || 0;
  const rawMrp = deal.mrp ?? deal.prices?.mrp ?? null;
  const mrp = rawMrp && rawMrp > price && price > 0 ? rawMrp : null;
  const discount = deal.discount_pct ?? (mrp ? Math.round((mrp - price) / mrp * 100) : null);
  const expired = Boolean(deal.is_expired || deal.is_over || deal.status === 'expired');
  // This upstream soundbar photo is a phone advertisement, so show an honest fallback.
  const photo = deal.image?.includes('amz_B0H4VQX4CC.jpg') ? null : getCleanImageUrl(deal.image);
  const asin = /amazon/i.test(store) ? extractAmazonAsin(deal.url || deal.id) : null;
  const subId = generateSubId('card', deal.id);
  const bundle = asin ? getRecommendedBundle(deal.category, price) : null;
  useEffect(() => { setImageFailed(false); }, [photo]);
  function save() {
    playTactileClick();
    if (onToggleSave) onToggleSave(deal);
    else { const next = toggleSavedDealId(deal.id, deal).isSaved; setLocalSaved(next); if (next) playSuccessChime(); onShowToast?.(next ? 'Saved to your shortlist' : 'Removed from saved deals'); }
  }
  const details = () => { playTactileClick(); (onSelectDeal || onOpenImage)?.(deal); };
  const action = (callback: () => void) => { setMenuOpen(false); callback(); };
  function cart() {
    if (!asin) return;
    const url = includeBundle && bundle ? buildMultiAsinCartUrl(asin, bundle.asin, undefined, subId) : buildAmazonCartUrl(asin, undefined, subId);
    openSmartStoreLink(url, 'amazon', asin, true, subId);
  }
  const handleViewDeal = () => {
    let targetUrl = deal.url;
    if (!targetUrl || targetUrl.includes('.css') || targetUrl.includes('static-assets-web')) {
      targetUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(title)}`;
    }
    openSmartStoreLink(targetUrl, store, asin || undefined, false, subId);
  };
  return <article ref={card} style={{ '--card-delay': `${Math.min(index % 40, 7) * 35}ms` } as React.CSSProperties} className={`commerce-card commerce-card-reveal${expired ? ' is-expired' : ''}${isComparing ? ' is-comparing' : ''}`}>
    <div className="commerce-card-photo">
      <button type="button" className="commerce-photo-button" onClick={details} aria-label={`View details for ${title}`}>
        {photo && !imageFailed ? <img src={photo} alt={title} loading="lazy" decoding="async" onError={() => setImageFailed(true)} /> : <span className="commerce-image-fallback"><Image size={30} strokeWidth={1.2} /><span>Image unavailable</span></span>}
      </button>
      <span className={`commerce-store commerce-store-${store.toLowerCase().replace(/[^a-z]/g, '')}`}>{store}</span>
      <button type="button" className={`commerce-card-save${saved ? ' is-saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${title}`} aria-pressed={saved} onClick={save}><Bookmark className="desktop-save-icon" size={18} fill={saved ? 'currentColor' : 'none'} /><Heart className="mobile-save-icon" size={20} fill={saved ? 'currentColor' : 'none'} /></button>
      {expired ? <span className="commerce-discount">Ended</span> : discount != null && discount > 0 ? <span className="commerce-discount">{discount}% below MRP</span> : deal.sellout_prediction?.urgency_label && <span className="commerce-discount is-urgent" title="Estimated by the deal model, not merchant-confirmed stock">Estimate: {deal.sellout_prediction.urgency_label}</span>}
    </div>
    <div className="commerce-card-body">
      <button type="button" className="commerce-card-title" onClick={details}>{title}</button>
      <button type="button" className={`commerce-card-rating${effectiveRating == null ? ' is-unrated' : ''}`} onClick={details} aria-label={effectiveRating != null ? `Customer rating ${effectiveRating} out of 5. View review evidence` : `Customer reviews for ${title}`} title={reviewEvidence?.message || reviewLoad?.message || (effectiveRating != null ? `Rating: ${effectiveRating} ★${effectiveRatingCount != null ? ` (${effectiveRatingCount.toLocaleString('en-IN')} reviews)` : ''}` : 'Customer review evidence from the merchant')}>
        <Star size={13} fill={effectiveRating != null ? 'currentColor' : 'none'} />
        <span>{effectiveRating != null ? <>{effectiveRating.toFixed(1)}{effectiveRatingCount != null ? ` (${effectiveRatingCount.toLocaleString('en-IN')})` : ' / 5'}</> : reviewEvidence?.reviews.length ? `${reviewEvidence.reviews.length} review excerpts` : reviewEvidence || reviewLoad?.status === 'error' ? 'Reviews unavailable' : reviewLoad ? 'Checking reviews…' : 'Customer reviews'}</span>
      </button>
      <div className="commerce-card-price"><strong>{price > 0 ? money(price) : 'Check price'}</strong>{mrp && <s>{money(mrp)}</s>}</div>
      <p className="commerce-card-note">{expired ? 'This offer has ended' : 'Confirm price at checkout'}</p>
      <div className="commerce-card-actions"><button type="button" className="commerce-store-button" aria-label={`View at ${store}`} onClick={handleViewDeal} disabled={expired || !deal.url}><span><span className="commerce-store-prefix">View at </span>{store}</span><ArrowUpRight size={16} /></button><button ref={trigger} type="button" className="commerce-card-more" aria-label={`More options for ${title}`} aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><MoreHorizontal size={20} /></button></div>
      <div className="commerce-card-meta"><span>Listed {relativeTime(deal.display_ts || deal.posted_at)}</span><button type="button" onClick={details}>Details <span aria-hidden="true">↗</span></button></div>
    </div>
    {menuOpen && createPortal(<div className="commerce-sheet-backdrop" onClick={() => setMenuOpen(false)}><div ref={sheet} className="commerce-product-sheet" role="dialog" aria-modal="true" aria-label={`Shopping options for ${title}`} onClick={event => event.stopPropagation()}>
      <div className="commerce-sheet-handle" aria-hidden="true" />
      <header><div><small>SHOPPING OPTIONS</small><h2>{title}</h2></div><button type="button" aria-label="Close shopping options" onClick={() => setMenuOpen(false)}><X size={22} /></button></header>
      <div className="commerce-sheet-options">
        <button type="button" onClick={() => action(details)}><Layers size={19} /><span>Details & price evidence</span><ArrowUpRight size={16} /></button>
        <button type="button" onClick={() => action(() => openGoogleShoppingModal(title))}><ShoppingBag size={19} /><span>Compare across stores (Google Radar)</span><ArrowUpRight size={16} /></button>
        {onToggleCompare && <button type="button" onClick={() => action(() => onToggleCompare(deal))}>{isComparing ? <Check size={19} /> : <Layers size={19} />}<span>{isComparing ? 'Remove from comparison' : 'Add to comparison'}</span></button>}
        {onOpenPriceAlert && <button type="button" onClick={() => action(() => onOpenPriceAlert(deal))}><Bell size={19} /><span>Set a price alert</span></button>}
        {onOpenExchange && <button type="button" onClick={() => action(() => onOpenExchange(deal))}><Repeat2 size={19} /><span>Exchange calculator</span></button>}
        {onOpenImage && <button type="button" onClick={() => action(() => onOpenImage(deal))}><Image size={19} /><span>View product photo</span></button>}
        {asin && !expired && <button type="button" onClick={() => action(cart)}><ShoppingCart size={19} /><span>Open Amazon cart{includeBundle ? ' with add-on' : ''}</span><ArrowUpRight size={16} /></button>}
      </div>
      {bundle && <label className="commerce-bundle"><input type="checkbox" checked={includeBundle} onChange={event => setIncludeBundle(event.target.checked)} /><span>Optional add-on: {bundle.name}<small>Estimate {money(bundle.price)} · confirm final price at Amazon</small></span></label>}
      <div className="commerce-share-row"><button type="button" onClick={() => action(async () => { const result = await shareDeal(deal); if (result === 'copied') onShowToast?.('Deal link copied — paste it anywhere'); if (result === 'failed') onShowToast?.('Could not share this link. Please try again.'); })}><Share2 size={17} />Share</button><button type="button" onClick={() => action(async () => { const copied = await copyDealLink(deal); onShowToast?.(copied ? 'Deal link copied' : 'Could not copy this link'); })}><Copy size={16} />Copy link</button></div>
    </div></div>, document.body)}
  </article>;
};
