import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'countries';
    const country = searchParams.get('country') || undefined;
    const countryCode = searchParams.get('country_code') || undefined;
    const state = searchParams.get('state') || undefined;
    const query = searchParams.get('q') || searchParams.get('search') || undefined;

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'Database connection not available' }, { status: 500 });
    }

    // 1. DIRECT SEARCH (Global City / Location Search)
    if (query && query.trim()) {
      const q = query.trim();
      const { data, error } = await adminClient
        .from('locations')
        .select('country, country_code, state, state_code, city, is_popular')
        .or(`city.ilike.%${q}%,state.ilike.%${q}%,country.ilike.%${q}%`)
        .order('is_popular', { ascending: false })
        .order('city', { ascending: true })
        .limit(20);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    // 2. FETCH CITIES FOR A GIVEN COUNTRY AND STATE
    if (type === 'cities') {
      let dbQuery = adminClient
        .from('locations')
        .select('city, is_popular, state, country, country_code')
        .order('city', { ascending: true });

      if (country) {
        dbQuery = dbQuery.ilike('country', country);
      } else if (countryCode) {
        dbQuery = dbQuery.eq('country_code', countryCode.toUpperCase());
      }

      if (state && state !== 'All States') {
        dbQuery = dbQuery.ilike('state', state);
      }

      const { data, error } = await dbQuery.limit(500);
      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    // 3. FETCH STATES / REGIONS FOR A GIVEN COUNTRY
    if (type === 'states') {
      let dbQuery = adminClient
        .from('locations')
        .select('state, state_code, country, country_code');

      if (country) {
        dbQuery = dbQuery.ilike('country', country);
      } else if (countryCode) {
        dbQuery = dbQuery.eq('country_code', countryCode.toUpperCase());
      }

      const { data, error } = await dbQuery.limit(1000);
      if (error) throw error;

      // Group unique states
      const stateMap = new Map<string, { name: string; code?: string }>();
      (data || []).forEach((row: any) => {
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

    // 4. FETCH ALL COUNTRIES (Default)
    const { data, error } = await adminClient
      .from('locations')
      .select('country, country_code');

    if (error) throw error;

    const countryMap = new Map<string, { name: string; code: string }>();
    (data || []).forEach((row: any) => {
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
