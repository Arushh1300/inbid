-- =========================================================
-- Migration: Add Dodo Payments Columns & Order Statuses
-- =========================================================

-- 1. Add dodo_checkout_session_id column to bids if missing
ALTER TABLE public.bids 
ADD COLUMN IF NOT EXISTS dodo_checkout_session_id TEXT;

-- 2. Drop existing bids_status_check constraint and replace with expanded statuses
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_status_check;
ALTER TABLE public.bids ADD CONSTRAINT bids_status_check 
CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'cancelled'));

-- Create index on dodo_checkout_session_id
CREATE INDEX IF NOT EXISTS idx_bids_dodo_session_id ON public.bids(dodo_checkout_session_id);

-- 3. Atomic Function to Mark Bid as Failed or Cancelled safely
CREATE OR REPLACE FUNCTION public.cancel_bid_payment(
    p_order_id TEXT,
    p_reason TEXT DEFAULT 'cancelled'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bid RECORD;
BEGIN
    SELECT * INTO v_bid
    FROM public.bids
    WHERE payment_order_id = p_order_id OR dodo_checkout_session_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bid order not found');
    END IF;

    IF v_bid.status = 'confirmed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel an already confirmed bid');
    END IF;

    UPDATE public.bids
    SET status = CASE WHEN p_reason = 'failed' THEN 'failed' ELSE 'cancelled' END,
        updated_at = NOW()
    WHERE id = v_bid.id;

    RETURN jsonb_build_object('success', true, 'status', v_bid.status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_bid_payment(TEXT, TEXT) TO anon, authenticated;
