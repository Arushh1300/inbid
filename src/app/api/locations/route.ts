import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { normalizeCountry, FALLBACK_COUNTRIES, POPULAR_GLOBAL_CITIES } from '@/lib/globalLocations';
import { INDIAN_STATES } from '@/lib/indianLocations';

function getSupabaseClient() {
  const admin = createAdminClient();
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (url && anonKey && !anonKey.includes('your_supabase')) {
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'countries';
    const rawCountry = searchParams.get('country') || undefined;
    const rawCountryCode = searchParams.get('country_code') || undefined;
    const state = searchParams.get('state') || undefined;
    const query = searchParams.get('q') || searchParams.get('search') || undefined;

    const supabase = getSupabaseClient();
    const norm = normalizeCountry(rawCountry || rawCountryCode);

    // 1. DIRECT SEARCH (Global City / Location Search)
    if (query && query.trim()) {
      const q = query.trim();
      if (supabase) {
        const { data, error } = await supabase
          .from('locations')
          .select('country, country_code, state, state_code, city, is_popular')
          .or(`city.ilike.%${q}%,state.ilike.%${q}%,country.ilike.%${q}%`)
          .order('is_popular', { ascending: false })
          .order('city', { ascending: true })
          .limit(20);

        if (!error && data && data.length > 0) {
          return NextResponse.json({
            success: true,
            data,
          });
        }
      }

      // Fallback in-memory search
      const qLower = q.toLowerCase();
      const localMatches = POPULAR_GLOBAL_CITIES.filter(
        (c) =>
          c.city.toLowerCase().includes(qLower) ||
          c.state.toLowerCase().includes(qLower) ||
          c.country.toLowerCase().includes(qLower)
      );

      return NextResponse.json({
        success: true,
        data: localMatches,
      });
    }

    // 2. FETCH CITIES FOR A GIVEN COUNTRY AND STATE
    if (type === 'cities') {
      if (supabase) {
        let dbQuery = supabase
          .from('locations')
          .select('city, is_popular, state, country, country_code')
          .order('city', { ascending: true });

        if (norm.name) {
          dbQuery = dbQuery.or(`country.ilike.${norm.name},country_code.eq.${norm.code}`);
        }

        if (state && state !== 'All States') {
          dbQuery = dbQuery.or(`state.ilike.${state},state_code.ilike.${state}`);
        }

        const { data, error } = await dbQuery.limit(500);
        if (!error && data && data.length > 0) {
          return NextResponse.json({
            success: true,
            data,
          });
        }
      }

      // Fallback cities
      if (norm.name === 'India' && state) {
        const stObj = INDIAN_STATES.find(
          (s) => s.name.toLowerCase() === state.toLowerCase() || (s.cities && s.cities.includes(state))
        );
        if (stObj) {
          return NextResponse.json({
            success: true,
            data: stObj.cities.map((ct) => ({
              city: ct,
              is_popular: false,
              state: stObj.name,
              country: 'India',
              country_code: 'IN',
            })),
          });
        }
      }

      const matchingPopular = POPULAR_GLOBAL_CITIES.filter(
        (c) =>
          c.country.toLowerCase() === norm.name.toLowerCase() &&
          (!state || state === 'All States' || c.state.toLowerCase() === state.toLowerCase())
      );

      return NextResponse.json({
        success: true,
        data: matchingPopular,
      });
    }

    // 3. FETCH STATES / REGIONS FOR A GIVEN COUNTRY
    if (type === 'states') {
      if (supabase) {
        let dbQuery = supabase
          .from('locations')
          .select('state, state_code, country, country_code');

        if (norm.name) {
          dbQuery = dbQuery.or(`country.ilike.${norm.name},country_code.eq.${norm.code}`);
        }

        const { data, error } = await dbQuery.limit(1000);
        if (!error && data && data.length > 0) {
          const stateMap = new Map<string, { name: string; code?: string }>();
          data.forEach((row: any) => {
            if (!stateMap.has(row.state)) {
              stateMap.set(row.state, { name: row.state, code: row.state_code || undefined });
            }
          });

          const uniqueStates = Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          return NextResponse.json({
            success: true,
            data: uniqueStates,
          });
        }
      }

      // Fallback states for India and other countries
      if (norm.name === 'India') {
        return NextResponse.json({
          success: true,
          data: INDIAN_STATES.map((s) => ({ name: s.name })),
        });
      }

      const popularStates = Array.from(
        new Set(
          POPULAR_GLOBAL_CITIES.filter((c) => c.country.toLowerCase() === norm.name.toLowerCase()).map(
            (c) => c.state
          )
        )
      ).map((st) => ({ name: st }));

      return NextResponse.json({
        success: true,
        data: popularStates.length > 0 ? popularStates : [{ name: 'Default Region' }],
      });
    }

    // 4. FETCH ALL COUNTRIES (Default)
    if (supabase) {
      const { data, error } = await supabase
        .from('locations')
        .select('country, country_code');

      if (!error && data && data.length > 0) {
        const countryMap = new Map<string, { name: string; code: string }>();
        data.forEach((row: any) => {
          if (!countryMap.has(row.country)) {
            countryMap.set(row.country, { name: row.country, code: row.country_code });
          }
        });

        const priorityOrder = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia'];
        const countriesList = Array.from(countryMap.values()).sort((a, b) => {
          const idxA = priorityOrder.indexOf(a.name);
          const idxB = priorityOrder.indexOf(b.name);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        return NextResponse.json({
          success: true,
          data: countriesList,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: FALLBACK_COUNTRIES.map((c) => ({ name: c.name, code: c.code })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
