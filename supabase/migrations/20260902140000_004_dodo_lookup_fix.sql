-- =========================================================
-- Migration: 004 - Support Dodo Checkout Session ID or Order ID lookup in confirm_bid_payment
-- =========================================================

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
        
        -- Compute current rank
        SELECT COUNT(*) + 1 INTO v_new_rank
        FROM public.listings
        WHERE status = 'active'
          AND cumulative_amount > v_listing.cumulative_amount;

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

    -- Compute old rank before adding amount (among active listings)
    IF v_listing.status = 'active' AND v_listing.cumulative_amount > 0 THEN
        SELECT COUNT(*) + 1 INTO v_old_rank
        FROM public.listings
        WHERE status = 'active'
          AND cumulative_amount > v_listing.cumulative_amount;
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

    -- 6. Compute new rank after increment
    SELECT COUNT(*) + 1 INTO v_new_rank
    FROM public.listings
    WHERE status = 'active'
      AND cumulative_amount > v_listing.cumulative_amount;

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
    );

    RETURN jsonb_build_object(
        'success', true,
        'already_confirmed', false,
        'listing', to_jsonb(v_listing),
        'newRank', v_new_rank,
        'amountPaid', v_bid.amount
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_bid_payment(TEXT, TEXT) TO anon, authenticated;
