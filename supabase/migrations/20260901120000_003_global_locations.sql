-- Migration: Add Global Locations Table, Indexes & Update Listings Schema

-- 1. CREATE LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    state TEXT NOT NULL,
    state_code TEXT,
    city TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT locations_country_state_city_key UNIQUE (country_code, state, city)
);

-- 2. CREATE INDEXES ON LOCATIONS TABLE
CREATE INDEX IF NOT EXISTS idx_locations_country_code ON public.locations(country_code);
CREATE INDEX IF NOT EXISTS idx_locations_state_code ON public.locations(state_code);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_country_state ON public.locations(country_code, state_code);

-- 3. UPDATE LISTINGS TABLE TO SUPPORT COUNTRY_CODE AND STATE_CODE
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'IN';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS state_code TEXT;

-- 4. MIGRATE EXISTING LISTINGS SAFELY
UPDATE public.listings 
SET country = 'India', country_code = 'IN' 
WHERE country IS NULL OR country = '' OR country = 'India';

-- Set state codes for known Indian states
UPDATE public.listings SET state_code = 'RJ' WHERE state = 'Rajasthan';
UPDATE public.listings SET state_code = 'MH' WHERE state = 'Maharashtra';
UPDATE public.listings SET state_code = 'UP' WHERE state = 'Uttar Pradesh';
UPDATE public.listings SET state_code = 'KA' WHERE state = 'Karnataka';
UPDATE public.listings SET state_code = 'DL' WHERE state = 'Delhi';
UPDATE public.listings SET state_code = 'TS' WHERE state = 'Telangana';
UPDATE public.listings SET state_code = 'TN' WHERE state = 'Tamil Nadu';
UPDATE public.listings SET state_code = 'GJ' WHERE state = 'Gujarat';
UPDATE public.listings SET state_code = 'WB' WHERE state = 'West Bengal';

-- 5. CREATE INDEXES ON LISTINGS TABLE FOR GLOBAL FILTERING
CREATE INDEX IF NOT EXISTS idx_listings_country_state_city ON public.listings(country, state, city);
CREATE INDEX IF NOT EXISTS idx_listings_country_code ON public.listings(country_code);
CREATE INDEX IF NOT EXISTS idx_listings_global_filter ON public.listings(status, category, country, state, city, cumulative_amount DESC);

-- 6. ENABLE ROW LEVEL SECURITY AND PERMISSIONS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone"
    ON public.locations FOR SELECT
    USING (true);

GRANT SELECT ON public.locations TO anon, authenticated;
