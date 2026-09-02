-- =========================================================
-- InBid.site PostgreSQL Database Schema
-- Production-Ready Marketplace Foundation with Row Level Security
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE (Reference Catalog)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Categories
INSERT INTO public.categories (id, name, icon_name, display_order)
VALUES
    ('startups', 'Startups', 'Rocket', 1),
    ('ai', 'AI', 'Cpu', 2),
    ('saas', 'SaaS', 'Laptop', 3),
    ('restaurants', 'Restaurants', 'Utensils', 4),
    ('cafes', 'Cafés', 'Coffee', 5),
    ('salons', 'Salons', 'Scissors', 6),
    ('hotels', 'Hotels', 'Building', 7),
    ('fashion', 'Fashion', 'ShoppingBag', 8),
    ('jewellery', 'Jewellery', 'Gem', 9),
    ('realestate', 'Real Estate', 'Home', 10),
    ('interior', 'Interior Design', 'Palette', 11),
    ('agencies', 'Agencies', 'Briefcase', 12),
    ('creators', 'Creators', 'Video', 13),
    ('developers', 'Developers', 'Code', 14),
    ('ecommerce', 'E-commerce', 'ShoppingCart', 15),
    ('entertainment', 'Entertainment', 'Film', 16),
    ('other', 'Other', 'Sparkles', 17)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order;

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    destination_raw TEXT NOT NULL,
    destination_normalized TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Startups',
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL DEFAULT 'Rajasthan',
    city TEXT NOT NULL DEFAULT 'Jaipur',
    description TEXT,
    avatar_url TEXT,
    og_image_url TEXT,
    canonical_url TEXT,
    metadata_fetched_at TIMESTAMPTZ,
    cumulative_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cumulative_amount >= 0),
    click_count INT NOT NULL DEFAULT 0 CHECK (click_count >= 0),
    ai_visibility_score INT NOT NULL DEFAULT 75 CHECK (ai_visibility_score BETWEEN 0 AND 100),
    ai_queries TEXT[] DEFAULT ARRAY['top indian businesses', 'best tools in india'],
    ai_opportunity TEXT DEFAULT 'Expand local search visibility in Tier-1 cities',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BIDS TABLE
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    payment_order_id TEXT UNIQUE,
    dodo_checkout_session_id TEXT,
    payment_id TEXT,
    bidder_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLICKS TABLE (Outbound Click Tracking)
CREATE TABLE IF NOT EXISTS public.clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    ip_hash TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ACTIVITIES TABLE (Public Live Activity Feed)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('listing_created', 'bid_confirmed', 'rank_changed', 'position_taken')),
    amount NUMERIC(12, 2),
    previous_rank INT,
    new_rank INT,
    listing_title TEXT NOT NULL,
    listing_domain TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_listings_cumulative_amount ON public.listings(cumulative_amount DESC);
CREATE INDEX IF NOT EXISTS idx_listings_destination_norm ON public.listings(destination_normalized);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_state_city ON public.listings(state, city);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_composite_filter ON public.listings(status, category, state, city, cumulative_amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON public.bids(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_clicks_listing_id ON public.clicks(listing_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON public.clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ATOMIC STORED PROCEDURES / FUNCTIONS

-- Function 1: Atomic Outbound Click Recording
CREATE OR REPLACE FUNCTION public.record_listing_click(
    p_listing_id UUID,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_click_count INT;
    v_dest_raw TEXT;
BEGIN
    -- Record raw click row
    INSERT INTO public.clicks (listing_id, ip_hash, user_agent, referrer, created_at)
    VALUES (p_listing_id, p_ip_hash, p_user_agent, p_referrer, NOW());

    -- Atomically increment listing click counter
    UPDATE public.listings
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = p_listing_id
    RETURNING click_count, COALESCE(destination_raw, canonical_url, 'https://' || destination_normalized)
    INTO v_new_click_count, v_dest_raw;

    RETURN jsonb_build_object(
        'success', true,
        'click_count', v_new_click_count,
        'destination_raw', v_dest_raw
    );
END;
$$;

-- Function 2: Atomic Bid Confirmation & Cumulative Amount Update (Idempotent & Transaction-Safe)
CREATE OR REPLACE FUNCTION public.confirm_bid_payment(
    p_order_id TEXT,
    p_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bid RECORD;
    v_listing RECORD;
    v_old_rank INT;
    v_new_rank INT;
    v_event_type TEXT;
    v_act_id UUID;
BEGIN
    -- 1. Lock the bid row for update to prevent concurrent duplicate payment processing
    -- Supports lookup by payment_order_id OR dodo_checkout_session_id
    SELECT * INTO v_bid
    FROM public.bids
    WHERE payment_order_id = p_order_id OR dodo_checkout_session_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found or invalid', p_order_id;
    END IF;

    -- 2. If already confirmed, return current state idempotently without double-counting
    IF v_bid.status = 'confirmed' THEN
        SELECT * INTO v_listing FROM public.listings WHERE id = v_bid.listing_id;
        
        -- Compute current rank in exact leaderboard scope (category, country, state, city)
        SELECT COUNT(*) + 1 INTO v_new_rank
        FROM public.listings
        WHERE status = 'active'
          AND category = v_listing.category
          AND country = v_listing.country
          AND state = v_listing.state
          AND city = v_listing.city
          AND (
            cumulative_amount > v_listing.cumulative_amount OR
            (cumulative_amount = v_listing.cumulative_amount AND created_at < v_listing.created_at)
          );

        RETURN jsonb_build_object(
            'success', true,
            'already_confirmed', true,
            'listing', to_jsonb(v_listing),
            'newRank', v_new_rank,
            'amountPaid', v_bid.amount
        );
    END IF;

    IF v_bid.status != 'pending' THEN
        RAISE EXCEPTION 'Bid order % is in % status and cannot be confirmed', p_order_id, v_bid.status;
    END IF;

    -- 3. Lock associated listing for update
    SELECT * INTO v_listing
    FROM public.listings
    WHERE id = v_bid.listing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing % associated with order % not found', v_bid.listing_id, p_order_id;
    END IF;

    -- Compute old rank before adding amount (among active listings in exact category + location scope)
    IF v_listing.status = 'active' AND v_listing.cumulative_amount > 0 THEN
        SELECT COUNT(*) + 1 INTO v_old_rank
        FROM public.listings
        WHERE status = 'active'
          AND category = v_listing.category
          AND country = v_listing.country
          AND state = v_listing.state
          AND city = v_listing.city
          AND (
            cumulative_amount > v_listing.cumulative_amount OR
            (cumulative_amount = v_listing.cumulative_amount AND created_at < v_listing.created_at)
          );
    ELSE
        v_old_rank := 0;
    END IF;

    -- 4. Mark bid as confirmed
    UPDATE public.bids
    SET status = 'confirmed',
        payment_id = p_payment_id,
        updated_at = NOW()
    WHERE id = v_bid.id;

    -- 5. Atomically update listing cumulative total and mark active
    UPDATE public.listings
    SET cumulative_amount = cumulative_amount + v_bid.amount,
        status = 'active',
        updated_at = NOW()
    WHERE id = v_listing.id
    RETURNING * INTO v_listing;

    -- 6. Compute new rank after increment (among active listings in exact category + location scope)
    SELECT COUNT(*) + 1 INTO v_new_rank
    FROM public.listings
    WHERE status = 'active'
      AND category = v_listing.category
      AND country = v_listing.country
      AND state = v_listing.state
      AND city = v_listing.city
      AND (
        cumulative_amount > v_listing.cumulative_amount OR
        (cumulative_amount = v_listing.cumulative_amount AND created_at < v_listing.created_at)
      );

    -- 7. Determine public activity event type
    IF v_new_rank = 1 THEN
        v_event_type := 'position_taken';
    ELSIF v_old_rank > 0 AND v_old_rank <> v_new_rank THEN
        v_event_type := 'rank_changed';
    ELSE
        v_event_type := 'bid_confirmed';
    END IF;

    -- 8. Record public activity event
    INSERT INTO public.activities (
        listing_id,
        event_type,
        amount,
        previous_rank,
        new_rank,
        listing_title,
        listing_domain,
        category,
        created_at
    )
    VALUES (
        v_listing.id,
        v_event_type,
        v_bid.amount,
        NULLIF(v_old_rank, 0),
        v_new_rank,
        v_listing.title,
        v_listing.destination_normalized,
        v_listing.category,
        NOW()
    )
    RETURNING id INTO v_act_id;

    RETURN jsonb_build_object(
        'success', true,
        'already_confirmed', false,
        'listing', to_jsonb(v_listing),
        'newRank', v_new_rank,
        'amountPaid', v_bid.amount,
        'activityId', v_act_id
    );
END;
$$;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 1. Categories: Public Read
CREATE POLICY "Categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (true);

-- 2. Listings: Public Read ONLY for active/confirmed listings (cumulative_amount > 0 or status = 'active')
CREATE POLICY "Active listings are viewable by everyone"
    ON public.listings FOR SELECT
    USING (status = 'active' OR cumulative_amount > 0);

-- 3. Bids: Public Read ONLY for confirmed bids
CREATE POLICY "Confirmed bids are viewable by everyone"
    ON public.bids FOR SELECT
    USING (status = 'confirmed');

-- 4. Clicks: Public Read and Public Insert
CREATE POLICY "Clicks are viewable by everyone"
    ON public.clicks FOR SELECT
    USING (true);

CREATE POLICY "Anyone can record clicks"
    ON public.clicks FOR INSERT
    WITH CHECK (true);

-- 5. Activities: Public Read for verified events
CREATE POLICY "Activities are viewable by everyone"
    ON public.activities FOR SELECT
    USING (true);

-- Grant appropriate permissions to standard roles
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT SELECT ON public.bids TO anon, authenticated;
GRANT SELECT, INSERT ON public.clicks TO anon, authenticated;
GRANT SELECT ON public.activities TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_listing_click(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_bid_payment(TEXT, TEXT) TO anon, authenticated;
