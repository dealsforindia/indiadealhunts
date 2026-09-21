import { PublicDeal } from '../types';

export interface ParsedSearchQuery {
  rawQuery: string;
  cleanQuery: string;
  maxPrice?: number;
  minPrice?: number;
  minDiscount?: number;
  targetStore?: string;
  isLootOrGlitch?: boolean;
  activeBadges: string[];
}

export interface SemanticSearchResult {
  deals: PublicDeal[];
  parsedQuery: ParsedSearchQuery;
  totalMatches: number;
}

// Comprehensive Indian E-Commerce Semantic Synonyms Dictionary
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  earbuds: ['tws', 'airpods', 'earphones', 'headphones', 'neckband', 'headset', 'airdopes', 'buds', 'earphone'],
  tws: ['earbuds', 'airpods', 'earphones', 'headphones', 'neckband', 'headset', 'airdopes', 'buds'],
  headphones: ['headset', 'earphones', 'earbuds', 'neckband', 'tws', 'wireless'],
  sneakers: ['shoes', 'running', 'footwear', 'crocs', 'slippers', 'sandals', 'loafers', 'slides', 'boots'],
  shoes: ['sneakers', 'running', 'footwear', 'crocs', 'slippers', 'sandals', 'loafers', 'slides', 'boots', 'clogs'],
  bag: ['backpack', 'trolley', 'luggage', 'duffle', 'suitcase', 'handbag', 'rucksack', 'pouch'],
  backpack: ['bag', 'rucksack', 'laptop bag', 'school bag', 'gym bag', 'trolley'],
  phone: ['smartphone', 'mobile', 'iphone', 'android', 'galaxy', 'oneplus', 'redmi', 'realme', 'iqoo', 'pixel'],
  mobile: ['smartphone', 'phone', 'iphone', 'android', 'galaxy', 'oneplus', 'redmi'],
  watch: ['smartwatch', 'analog', 'chronograph', 'fitness band', 'tracker'],
  smartwatch: ['watch', 'fitness band', 'tracker', 'smart watch'],
  laptop: ['notebook', 'macbook', 'ultrabook', 'thinkpad', 'chromebook'],
  shirt: ['t-shirt', 'tee', 'polo', 'kurta', 'kurti', 'hoodie', 'sweatshirt', 'top'],
  tee: ['t-shirt', 'shirt', 'polo', 'top', 'oversized'],
  tv: ['television', 'smart tv', 'oled', 'qled', '4k', 'led', 'android tv'],
  skincare: ['face wash', 'moisturizer', 'sunscreen', 'serum', 'body wash', 'lotion', 'cream', 'cleanser'],
  bottle: ['flask', 'thermos', 'sipper', 'water bottle', 'milton'],
  speaker: ['soundbar', 'home theatre', 'bluetooth speaker', 'party speaker', 'boat stone'],
};

const KNOWN_STORES = ['amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'blinkit', 'zepto', 'croma', 'shopsy'];

/**
 * Parses freeform natural language search input and extracts:
 * - Price constraints ("under 1000", "below 1500", "between 500 and 1500", "< 2000")
 * - Discount constraints ("50% off", "70% discount")
 * - Store mentions ("on amazon", "flipkart deals")
 * - Urgency / Loot keywords ("loot", "glitch", "freebie")
 */
export function parseNaturalQuery(raw: string): ParsedSearchQuery {
  let text = raw.trim();
  const activeBadges: string[] = [];
  let maxPrice: number | undefined;
  let minPrice: number | undefined;
  let minDiscount: number | undefined;
  let targetStore: string | undefined;
  let isLootOrGlitch = false;

  // 1. Range Price: "between 500 and 1500" or "500 to 1500" or "500 - 1500"
  const rangeMatch = text.match(/(?:between\s+)?(?:₹|rs\.?\s*)?(\d{2,6})\s*(?:and|to|-)\s*(?:₹|rs\.?\s*)?(\d{2,6})/i);
  if (rangeMatch) {
    const p1 = parseInt(rangeMatch[1], 10);
    const p2 = parseInt(rangeMatch[2], 10);
    minPrice = Math.min(p1, p2);
    maxPrice = Math.max(p1, p2);
    activeBadges.push(`₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`);
    text = text.replace(rangeMatch[0], '');
  }

  // 2. Max Price: "under 1000", "below 500", "< 2000", "less than 800"
  if (!maxPrice) {
    const maxMatch = text.match(/(?:under|below|<|less\s+than)\s*(?:₹|rs\.?\s*)?(\d{2,6})/i);
    if (maxMatch) {
      maxPrice = parseInt(maxMatch[1], 10);
      activeBadges.push(`Under ₹${maxPrice.toLocaleString('en-IN')}`);
      text = text.replace(maxMatch[0], '');
    }
  }

  // 3. Min Price: "above 500", "greater than 1000", "> 500"
  if (!minPrice) {
    const minMatch = text.match(/(?:above|>|greater\s+than)\s*(?:₹|rs\.?\s*)?(\d{2,6})/i);
    if (minMatch) {
      minPrice = parseInt(minMatch[1], 10);
      activeBadges.push(`Above ₹${minPrice.toLocaleString('en-IN')}`);
      text = text.replace(minMatch[0], '');
    }
  }

  // 4. Discount: "50% off", "70% discount", "flat 80%"
  const discMatch = text.match(/(\d{1,2})\s*%\s*(?:off|discount)?/i);
  if (discMatch) {
    minDiscount = parseInt(discMatch[1], 10);
    activeBadges.push(`≥ ${minDiscount}% OFF`);
    text = text.replace(discMatch[0], '');
  }

  // 5. Store Detection
  const lower = text.toLowerCase();
  for (const s of KNOWN_STORES) {
    const storeRegex = new RegExp(`\\b(?:on\\s+)?${s}\\b`, 'i');
    if (storeRegex.test(lower)) {
      targetStore = s.charAt(0).toUpperCase() + s.slice(1);
      activeBadges.push(`Store: ${targetStore}`);
      text = text.replace(storeRegex, '');
      break;
    }
  }

  // 6. Loot / Glitch Detection
  if (/\b(?:loot|glitch|error|fat-finger|steal)\b/i.test(text)) {
    isLootOrGlitch = true;
    activeBadges.push('🔥 Loot Drops Only');
    text = text.replace(/\b(?:loot|glitch|error|fat-finger|steal)\b/gi, '');
  }

  const cleanQuery = text.replace(/[\s\-_]+/g, ' ').trim();

  return {
    rawQuery: raw,
    cleanQuery,
    maxPrice,
    minPrice,
    minDiscount,
    targetStore,
    isLootOrGlitch,
    activeBadges,
  };
}

/**
 * On-Device Semantic & Constraint Deal Search
 * Evaluates in-memory deals against parsed natural constraints and multi-token semantic relevance.
 */
export function searchDealsClient(deals: PublicDeal[], rawQuery: string): SemanticSearchResult {
  if (!rawQuery || !rawQuery.trim()) {
    return {
      deals,
      parsedQuery: { rawQuery: '', cleanQuery: '', activeBadges: [] },
      totalMatches: deals.length,
    };
  }

  const parsed = parseNaturalQuery(rawQuery);
  const cleanLower = parsed.cleanQuery.toLowerCase();
  const queryTokens = cleanLower.split(/\s+/).filter((t) => t.length > 1);

  // Collect semantic synonym tokens
  const expandedTokens = new Set<string>(queryTokens);
  for (const tok of queryTokens) {
    if (SEMANTIC_SYNONYMS[tok]) {
      SEMANTIC_SYNONYMS[tok].forEach((syn) => expandedTokens.add(syn.toLowerCase()));
    }
  }

  const scored: Array<{ deal: PublicDeal; score: number }> = [];

  for (const deal of deals) {
    const price = deal.price || 0;
    const discount = deal.discount_pct || 0;
    const store = (deal.store || '').toLowerCase();
    const title = (deal.title || '').toLowerCase();
    const category = (deal.category || '').toLowerCase();

    // 1. Strict Price Filtering
    if (parsed.maxPrice !== undefined && price > parsed.maxPrice) continue;
    if (parsed.minPrice !== undefined && price < parsed.minPrice) continue;

    // 2. Strict Discount Filtering
    if (parsed.minDiscount !== undefined && discount < parsed.minDiscount) continue;

    // 3. Strict Store Filtering
    if (parsed.targetStore && !store.includes(parsed.targetStore.toLowerCase())) continue;

    // 4. Loot / Glitch Filtering
    if (parsed.isLootOrGlitch && discount < 65 && (deal.worth_score || 0) < 85) continue;

    // If only constraints were provided (e.g. "under 1000") and no keywords:
    if (queryTokens.length === 0) {
      scored.push({ deal, score: (deal.worth_score || 50) + discount });
      continue;
    }

    // 5. Semantic & Lexical Scoring
    let score = 0;

    // Exact full query match in title
    if (title.includes(cleanLower)) {
      score += 120;
    }

    // Exact full query match in category
    if (category.includes(cleanLower)) {
      score += 40;
    }

    // Token-by-token scoring
    let hitCount = 0;
    for (const tok of queryTokens) {
      if (title.includes(tok)) {
        score += 35;
        hitCount++;
      } else if (category.includes(tok)) {
        score += 20;
        hitCount++;
      } else if (store.includes(tok)) {
        score += 15;
        hitCount++;
      }
    }

    // Synonym token scoring
    for (const syn of expandedTokens) {
      if (!queryTokens.includes(syn)) {
        if (title.includes(syn)) {
          score += 25;
          hitCount++;
        }
      }
    }

    // Must match at least one token if text keywords were provided
    if (hitCount === 0 && score === 0) continue;

    // Quality boosters
    if (deal.is_lowest_price) score += 15;
    score += (deal.worth_score || 0) * 0.2;
    score += Math.min(discount, 80) * 0.15;

    scored.push({ deal, score });
  }

  // Sort by highest relevance score first
  scored.sort((a, b) => b.score - a.score);

  const matchedDeals = scored.map((s) => s.deal);

  return {
    deals: matchedDeals,
    parsedQuery: parsed,
    totalMatches: matchedDeals.length,
  };
}
