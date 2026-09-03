import { Listing, Bid, BidQuote, CategoryType, PlatformStats, ActivityEvent, PaginatedResult } from './types';
import { normalizeDestination, slugify, sanitizeDestinationUrl } from './normalization';
import { createAdminClient } from './supabase/admin';

/**
 * Fetch Ranked Active Listings with Category, State, City and Search filtering from Supabase
 * Only listings with status='active' (or cumulative_amount > 0) are returned for public leaderboard
 */
export async function getListings(
  category?: string,
  search?: string,
  state?: string,
  city?: string,
  country?: string
): Promise<Listing[]> {
  const adminClient = createAdminClient();

  if (adminClient) {
    try {
      let query = adminClient
        .from('listings')
        .select('*')
        .or('status.eq.active,cumulative_amount.gt.0')
        .order('cumulative_amount', { ascending: false })
        .order('created_at', { ascending: true });

      if (category && category !== 'All' && category.toLowerCase() !== 'all') {
        query = query.ilike('category', category);
      }
      if (country && country !== 'All Countries' && country !== 'Global' && country.toLowerCase() !== 'all countries' && country.toLowerCase() !== 'global') {
        query = query.ilike('country', country);
      }
      if (state && state !== 'All States' && state.toLowerCase() !== 'all states') {
        query = query.ilike('state', state);
      }
      if (city && city !== 'All Cities' && city.toLowerCase() !== 'all cities') {
        query = query.ilike('city', city);
      }

      const { data, error } = await query;

      if (!error && data) {
        let results = data as Listing[];
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          results = results.filter(
            (item: Listing) =>
              item.title?.toLowerCase().includes(q) ||
              item.destination_normalized?.toLowerCase().includes(q) ||
              item.category?.toLowerCase().includes(q) ||
              (item.city && item.city.toLowerCase().includes(q)) ||
              (item.state && item.state.toLowerCase().includes(q)) ||
              (item.country && item.country.toLowerCase().includes(q))
          );
        }

        return results.map((item: Listing, idx: number) => ({
          ...item,
          rank: idx + 1,
        }));
      }
    } catch (err) {
      console.warn('Supabase getListings error:', err);
    }
  }

  return [];
}

/**
 * Server/Database Level Paginated Listings
 */
export async function getListingsPaginated(
  category?: string,
  search?: string,
  city?: string,
  page = 1,
  pageSize = 20,
  state?: string,
  country?: string
): Promise<PaginatedResult<Listing>> {
  const allFiltered = await getListings(category, search, state, city, country);
  const total = allFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const offset = (safePage - 1) * pageSize;
  const pageSlice = allFiltered.slice(offset, offset + pageSize);

  // Preserve Global Ranks across pages (#1-#20, #21-#40...)
  const paginatedData = pageSlice.map((item, idx) => ({
    ...item,
    rank: offset + idx + 1,
  }));

  return {
    data: paginatedData,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch Active Listing Detail by Slug with Confirmed Bids History
 */
export async function getListingBySlug(slug: string): Promise<{ listing: Listing; bids: Bid[] } | null> {
  const adminClient = createAdminClient();
  const cleanSlug = slug.toLowerCase().trim();

  if (adminClient) {
    try {
      // Find listing by exact slug, normalized domain, or slug without extension
      const { data: listings, error: listErr } = await adminClient
        .from('listings')
        .select('*')
        .or('status.eq.active,cumulative_amount.gt.0');

      if (!listErr && listings) {
        const found = (listings as Listing[]).find(
          (l) =>
            l.slug?.toLowerCase() === cleanSlug ||
            l.destination_normalized?.toLowerCase() === cleanSlug ||
            l.destination_normalized?.replace(/\.[^/.]+$/, '').toLowerCase() === cleanSlug
        );

        if (found) {
          // Fetch confirmed bids
          const { data: bidsData } = await adminClient
            .from('bids')
            .select('*')
            .eq('listing_id', found.id)
            .eq('status', 'confirmed')
            .order('created_at', { ascending: false });

          // Calculate current global rank
          const allListings = await getListings();
          const rank = allListings.findIndex((l) => l.id === found.id) + 1;

          return {
            listing: { ...found, rank: rank > 0 ? rank : 1 },
            bids: (bidsData as Bid[]) || [],
          };
        }
      }
    } catch (err) {
      console.warn('Supabase getListingBySlug error:', err);
    }
  }

  return null;
}

/**
 * Calculate Quote / Estimate Rank for Competitive Bidding against Real Database Listings
 * Leaderboard scope: category + country + state + city
 */
export async function getQuoteForBid(
  destinationInput: string,
  amount: number,
  category?: string,
  country?: string,
  state?: string,
  city?: string
): Promise<BidQuote> {
  const normalizedInfo = normalizeDestination(destinationInput);
  const normDest = normalizedInfo.normalized;

  // 1. Fetch active listings for the EXACT leaderboard scope (category, country, state, city)
  const listingsInScope = await getListings(category, undefined, state, city, country);

  // 2. Find existing listing for this domain in the scope (if any)
  const existing = listingsInScope.find((l) => l.destination_normalized === normDest);
  const currentTotal = existing ? existing.cumulative_amount : 0;

  // 3. Find highest cumulative_amount among OTHER listings in this exact scope
  const otherListings = listingsInScope.filter((l) => l.destination_normalized !== normDest);
  const highestCurrentInScope = otherListings.length > 0
    ? Math.max(...otherListings.map((l) => l.cumulative_amount))
    : 0;

  // 4. Minimum required bid to claim Rank #1 in this scope:
  // If no other confirmed bids in scope: ₹99
  // If highest bid is e.g. ₹99: ₹199 (highestCurrentInScope + 100)
  const minRequiredToTake1 = highestCurrentInScope > 0 ? highestCurrentInScope + 100 : 99;

  // 5. Full bid amount charged (no subtraction across different businesses)
  const newTotal = currentTotal + amount;

  const higherCount = otherListings.filter((l) => l.cumulative_amount > newTotal).length;
  const projectedRank = higherCount + 1;

  return {
    destination_normalized: normDest,
    title: existing ? existing.title : destinationInput,
    category: (category as CategoryType) || (existing ? existing.category : 'Startups'),
    country: country || (existing ? existing.country : 'India'),
    country_code: existing ? existing.country_code : (country === 'India' ? 'IN' : 'US'),
    state: state || (existing ? existing.state : 'Rajasthan'),
    state_code: existing ? existing.state_code || undefined : undefined,
    city: city || (existing ? existing.city : 'Jaipur'),
    existing_listing_id: existing ? existing.id : null,
    current_total: currentTotal,
    amount_adding: amount,
    new_total: newTotal,
    projected_rank: projectedRank,
    min_amount_required: minRequiredToTake1,
    is_new_listing: !existing,
  };
}

/**
 * Real Database Platform Stats
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const adminClient = createAdminClient();

  if (adminClient) {
    try {
      const { data: listings, error } = await adminClient
        .from('listings')
        .select('cumulative_amount, click_count')
        .or('status.eq.active,cumulative_amount.gt.0');

      if (!error && listings) {
        const liveListings = listings.length;
        const totalBidsAmount = listings.reduce((sum, item) => sum + (Number(item.cumulative_amount) || 0), 0);
        const outboundClicks = listings.reduce((sum, item) => sum + (Number(item.click_count) || 0), 0);

        return {
          live_listings: liveListings,
          total_bids_amount: totalBidsAmount,
          outbound_clicks: outboundClicks,
        };
      }
    } catch (err) {
      console.warn('Supabase getPlatformStats error:', err);
    }
  }

  return {
    live_listings: 0,
    total_bids_amount: 0,
    outbound_clicks: 0,
  };
}

/**
 * Real Server Database Activity Feed (Paginated)
 */
export async function getActivityPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<ActivityEvent>> {
  const adminClient = createAdminClient();

  if (adminClient) {
    try {
      const offset = (page - 1) * pageSize;
      const { data, count, error } = await adminClient
        .from('activities')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (!error && data) {
        const total = count || 0;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        return {
          data: data as ActivityEvent[],
          total,
          page,
          pageSize,
          totalPages,
        };
      }
    } catch (err) {
      console.warn('Supabase getActivityPaginated error:', err);
    }
  }

  return {
    data: [],
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  };
}

/**
 * Compact Recent Activity Feed for Homepage (Latest confirmed events)
 */
export async function getRecentActivity(limit = 5): Promise<ActivityEvent[]> {
  const adminClient = createAdminClient();

  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as ActivityEvent[];
      }
    } catch (err) {
      console.warn('Supabase getRecentActivity error:', err);
    }
  }

  return [];
}

/**
 * Create Pending Bid Order in Supabase
 * Note: If listing is new, creates it with status='draft' and cumulative_amount=0
 * Pending listings are NOT publicly visible until payment confirmation
 */
export async function createPendingBidOrder(payload: {
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
}): Promise<{ order_id: string; amount: number; listing: Listing }> {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('Database connection not configured');
  }

  const normalizedInfo = normalizeDestination(payload.destination);
  const normDest = normalizedInfo.normalized;
  const rawDest = payload.canonical_url || sanitizeDestinationUrl(payload.destination);

  // 1. Check if listing already exists by destination_normalized
  const { data: existingListing, error: fetchErr } = await adminClient
    .from('listings')
    .select('*')
    .eq('destination_normalized', normDest)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(`Failed to check existing listing: ${fetchErr.message}`);
  }

  let listing = existingListing as Listing | null;

  // 2. If new listing, insert with status='draft' and cumulative_amount=0
  if (!listing) {
    const slugBase = slugify(payload.title || normDest);
    const newListingData = {
      slug: `${slugBase}-${Date.now().toString(36).slice(-4)}`,
      title: payload.title || normDest,
      destination_raw: rawDest,
      destination_normalized: normDest,
      category: payload.category || 'Startups',
      country: payload.country || 'India',
      country_code: payload.country_code || (payload.country === 'India' ? 'IN' : 'US'),
      state: payload.state || 'Rajasthan',
      state_code: payload.state_code || null,
      city: payload.city || 'Jaipur',
      description: payload.description || null,
      avatar_url: payload.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normDest)}`,
      og_image_url: payload.og_image_url || null,
      canonical_url: rawDest,
      metadata_fetched_at: new Date().toISOString(),
      cumulative_amount: 0,
      click_count: 0,
      ai_visibility_score: 75,
      status: 'draft', // Not publicly visible until verified payment
    };

    const { data: inserted, error: insertErr } = await adminClient
      .from('listings')
      .insert(newListingData)
      .select('*')
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Failed to create listing record: ${insertErr?.message}`);
    }

    listing = inserted as Listing;
  }

  // 3. Create pending bid order with unique order ID
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const { error: bidErr } = await adminClient
    .from('bids')
    .insert({
      listing_id: listing.id,
      amount: payload.amount,
      status: 'pending',
      payment_order_id: orderId,
      bidder_name: payload.bidder_name || 'Anonymous Builder',
    });

  if (bidErr) {
    throw new Error(`Failed to create pending bid: ${bidErr.message}`);
  }

  return {
    order_id: orderId,
    amount: payload.amount,
    listing,
  };
}

/**
 * Attach Dodo Payments Checkout Session ID to pending bid row in database
 */
export async function updateBidDodoSession(orderId: string, dodoSessionId: string): Promise<void> {
  const adminClient = createAdminClient();
  if (adminClient) {
    await adminClient
      .from('bids')
      .update({ dodo_checkout_session_id: dodoSessionId, updated_at: new Date().toISOString() })
      .eq('payment_order_id', orderId);
  }
}

/**
 * Mark a Pending Bid Order as Cancelled or Failed without altering leaderboard
 */
export async function cancelBidOrder(orderId: string, reason = 'cancelled'): Promise<void> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      await adminClient.rpc('cancel_bid_payment', {
        p_order_id: orderId,
        p_reason: reason,
      });
    } catch (err) {
      console.warn('cancelBidOrder error:', err);
    }
  }
}

/**
 * Verify Payment Server-Side & Atomically Confirm Bid & Cumulative Amount
 * Idempotent, transaction-safe, prevents duplicate payment confirmations.
 */
export async function verifyBidPayment(
  orderId: string,
  paymentId: string
): Promise<{ success: boolean; listing: Listing; newRank: number; amountPaid: number }> {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('Database connection not configured');
  }

  // Call atomic PostgreSQL RPC
  const { data: rpcResult, error: rpcErr } = await adminClient.rpc('confirm_bid_payment', {
    p_order_id: orderId,
    p_payment_id: paymentId,
  });

  if (rpcErr) {
    throw new Error(`Payment verification failed: ${rpcErr.message}`);
  }

  if (!rpcResult || !rpcResult.success) {
    throw new Error('Payment confirmation RPC returned unsuccessful status');
  }

  return {
    success: true,
    listing: rpcResult.listing as Listing,
    newRank: rpcResult.newRank,
    amountPaid: rpcResult.amountPaid,
  };
}

export const verifyAndConfirmPayment = verifyBidPayment;

/**
 * Record Outbound Click Atomically
 */
export async function recordClick(
  listingId: string,
  meta?: { ip_hash?: string; user_agent?: string; referrer?: string }
): Promise<{ success: boolean; click_count: number; destination_raw: string }> {
  const adminClient = createAdminClient();

  if (adminClient) {
    try {
      // Find listing id if a slug was passed
      let targetId = listingId;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listingId);

      if (!isUUID) {
        const { data: matched } = await adminClient
          .from('listings')
          .select('id')
          .or(`slug.eq.${listingId},destination_normalized.eq.${listingId}`)
          .maybeSingle();

        if (matched) {
          targetId = matched.id;
        }
      }

      // Call atomic RPC
      const { data, error } = await adminClient.rpc('record_listing_click', {
        p_listing_id: targetId,
        p_ip_hash: meta?.ip_hash || null,
        p_user_agent: meta?.user_agent || null,
        p_referrer: meta?.referrer || null,
      });

      if (!error && data && data.success) {
        return {
          success: true,
          click_count: data.click_count,
          destination_raw: data.destination_raw,
        };
      }
    } catch (err) {
      console.warn('Supabase recordClick error:', err);
    }
  }

  return { success: false, click_count: 0, destination_raw: '' };
}

/**
 * Fetch Admin Data from Real Supabase Database
 */
export async function getAdminData(): Promise<{ listings: Listing[]; bids: any[]; stats: PlatformStats }> {
  const adminClient = createAdminClient();
  const stats = await getPlatformStats();

  if (adminClient) {
    try {
      const { data: listingsData } = await adminClient
        .from('listings')
        .select('*')
        .order('cumulative_amount', { ascending: false });

      const { data: bidsData } = await adminClient
        .from('bids')
        .select('*, listings(id, title, destination_normalized, category, city)')
        .order('created_at', { ascending: false });

      return {
        listings: (listingsData as Listing[]) || [],
        bids: bidsData || [],
        stats,
      };
    } catch (err) {
      console.warn('Supabase getAdminData error:', err);
    }
  }

  return {
    listings: [],
    bids: [],
    stats,
  };
}
