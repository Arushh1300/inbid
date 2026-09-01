export type CategoryType =
  | 'Startups'
  | 'AI'
  | 'SaaS'
  | 'Restaurants'
  | 'Cafés'
  | 'Salons'
  | 'Hotels'
  | 'Fashion'
  | 'Jewellery'
  | 'Real Estate'
  | 'Interior Design'
  | 'Agencies'
  | 'Creators'
  | 'Developers'
  | 'E-commerce'
  | 'Entertainment'
  | 'Other';

export const CATEGORIES: CategoryType[] = [
  'Startups',
  'AI',
  'SaaS',
  'Restaurants',
  'Cafés',
  'Salons',
  'Hotels',
  'Fashion',
  'Jewellery',
  'Real Estate',
  'Interior Design',
  'Agencies',
  'Creators',
  'Developers',
  'E-commerce',
  'Entertainment',
  'Other',
];

export interface Listing {
  id: string;
  slug: string;
  title: string;
  destination_raw: string;
  destination_normalized: string;
  category: CategoryType;
  country: string;
  country_code?: string;
  state: string;
  state_code?: string;
  city: string;
  description?: string | null;
  avatar_url?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  metadata_fetched_at?: string | null;
  cumulative_amount: number;
  click_count: number;
  ai_visibility_score: number;
  ai_queries?: string[];
  ai_opportunity?: string;
  created_at: string;
  updated_at: string;
  rank?: number;
  cityRank?: number;
  stateRank?: number;
  countryRank?: number;
  globalRank?: number;
}

export type BidStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface Bid {
  id: string;
  listing_id: string;
  amount: number;
  status: BidStatus;
  payment_order_id?: string | null;
  payment_id?: string | null;
  bidder_name?: string | null;
  created_at: string;
  listing?: Listing;
}

export interface BidQuote {
  destination_normalized: string;
  title: string;
  category: CategoryType;
  country: string;
  country_code?: string;
  state: string;
  state_code?: string;
  city: string;
  existing_listing_id?: string | null;
  current_total: number;
  amount_adding: number;
  new_total: number;
  projected_rank: number;
  min_amount_required: number;
  is_new_listing: boolean;
}

export interface WebsiteMetadata {
  title: string;
  description: string;
  image: string | null;
  logo: string;
  domain: string;
  canonicalUrl: string | null;
  siteName: string | null;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isFallback: boolean;
  errorNotice?: string;
}

export interface CreateBidRequest {
  destination: string;
  title?: string;
  category?: CategoryType;
  country?: string;
  country_code?: string;
  state?: string;
  state_code?: string;
  city?: string;
  description?: string;
  avatar_url?: string;
  og_image_url?: string;
  canonical_url?: string;
  amount: number;
  bidder_name?: string;
}

export interface PlatformStats {
  live_listings: number;
  total_bids_amount: number;
  outbound_clicks: number;
}

export type ActivityEventType = 'listing_created' | 'bid_confirmed' | 'rank_changed' | 'position_taken';

export interface ActivityEvent {
  id: string;
  listing_id: string;
  event_type: ActivityEventType;
  amount?: number | null;
  previous_rank?: number | null;
  new_rank?: number | null;
  listing_title: string;
  listing_domain: string;
  category?: string;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
