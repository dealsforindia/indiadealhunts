export interface PublicDeal {
  id: string;
  title: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  store: 'Amazon' | 'Flipkart' | 'Myntra' | 'AJIO' | 'Swiggy Instamart' | 'Zepto' | 'Blinkit' | 'Croma' | string;
  image: string | null;
  url: string;
  category: string;
  posted_at: number;
  coupon?: string | null;
  coupon_discount?: number | null;
  effective_price?: number | null;
  usually_price?: number | null;
  savings?: number | null;
  worth_score?: number;
  worth_label?: string;
  expiry_mins?: number;
  stock_status?: string;
  is_over?: boolean;
  desidime_temperature?: number | null;
  is_community_verified?: boolean;
  deal_score?: number | null;
  is_lowest_price?: boolean;
  regular_price?: number | null;
  displayRegularPrice?: number | null;
  cluster_count?: number;
  cluster_channels?: string[];
  consensus_badge?: string;
  deal_badges?: string[];
  is_expired?: boolean;
  status?: string;
  display_ts?: number;
  heat_score?: number;
  heat_badge?: {
    tier: string;
    label: string;
    emoji: string;
    color: string;
  };
  has_video?: boolean;
  video_url?: string;
  video_cover?: string;
  video_status?: string;
}

export interface CreditCardProfile {
  id: string;
  name: string;
  bank: string;
  rewardText: string;
  colorGradient: string;
  borderColor: string;
  accentColor: string;
  cashbackPct: number;
  stores: string[]; // e.g. ['Amazon'], ['Flipkart'], ['All']
  monthlyCap?: number;
}

export interface CardSavingsResult {
  cardName: string;
  bank: string;
  cashbackPct: number;
  cashbackAmount: number;
  effectivePrice: number;
  colorGradient: string;
}

export interface CuratedBundleItem {
  id: string;
  title: string;
  store: string;
  price: number;
  mrp: number;
  image: string;
  url: string;
  category: string;
}

export interface CuratedBundle {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  themeColor: string;
  gradient: string;
  icon: string;
  items: CuratedBundleItem[];
  totalPrice: number;
  totalMrp: number;
  savings: number;
  discountPct: number;
}

export interface ActiveOffer {
  id: string;
  title: string;
  store: string;
  storeLogo?: string;
  code?: string;
  description: string;
  discountBadge: string;
  validTill: string;
  link: string;
  type: 'bank' | 'voucher' | 'wallet';
  minSpend?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  productName: string;
  savingsText: string;
  store: string;
  comment: string;
  imageUrl?: string;
  rating: number;
  date: string;
}

export interface PublicDealsResponse {
  deals: PublicDeal[];
  total: number;
  limit: number;
  skip: number;
  has_more: boolean;
}

export interface LookupResult {
  title: string;
  price: number;
  regular_price?: number | null;
  mrp?: number | null;
  discount_pct?: number | null;
  image: string;
  url: string;
  store: string;
  usually_price?: number | null;
  worth_score?: number;
  worth_label?: string;
  is_verified_deal: boolean;
  in_stock?: boolean;
  is_lowest_price?: boolean;
  lowest_price?: number | null;
  history?: Array<[number, number]>;
  savings?: number | null;
  verdict: string;
  stock_text?: string | null;
}

export type SortOption = 'worth' | 'newest' | 'discount' | 'price_low' | 'price_high';
export type NavTab = 'home' | 'ending_soon' | 'best_worth' | 'active_offers' | 'lookup' | 'submit_deal' | 'about' | 'how_we_verify' | 'contact';

