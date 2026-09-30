import { PublicDeal } from '../types';

/**
 * DealFlow 1-Click WhatsApp & Telegram Share Utility
 * Formats rich deal summaries with verified badges and affiliate links
 */

export function formatDealShareText(deal: PublicDeal): string {
  const price = deal.price ? `₹${deal.price.toLocaleString('en-IN')}` : 'Lightning Deal';
  const mrp = deal.mrp && deal.price && deal.mrp > deal.price ? ` (MRP: ₹${deal.mrp.toLocaleString('en-IN')})` : '';
  const discount = deal.discount_pct ? `\n🏷️ *Discount:* ${deal.discount_pct}% OFF` : '';
  const savings = deal.mrp && deal.price && deal.mrp > deal.price ? ` (Save ₹${(deal.mrp - deal.price).toLocaleString('en-IN')})` : '';
  const store = deal.store || 'Verified Store';

  return `🔥 *VERIFIED LOOT DROP* 🔥\n\n🛍️ *${deal.title}*\n\n💰 *Price:* ${price}${mrp}${discount}${savings}\n🏪 *Store:* ${store}\n\n⚡ *Grab Deal Here:* ${deal.url}\n\n🛡️ Verified genuine by IndiaDealHunts`;
}

export function shareToWhatsApp(deal: PublicDeal): void {
  const text = formatDealShareText(deal);
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareToTelegram(deal: PublicDeal): void {
  const text = formatDealShareText(deal);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(deal.url);
  const url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyDealLink(deal: PublicDeal): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(deal.url);
      return true;
    }
    // Fallback for older browsers
    const input = document.createElement('textarea');
    input.value = deal.url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return true;
  } catch {
    return false;
  }
}
