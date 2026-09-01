import { NextResponse } from 'next/server';
import { getListingsPaginated, getListingBySlug, getListings } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const detail = await getListingBySlug(slug);
      if (!detail) {
        return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: detail.listing,
        bids: detail.bids,
      });
    }

    const category = searchParams.get('category') || undefined;
    const country = searchParams.get('country') || undefined;
    const search = searchParams.get('search') || undefined;
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const all = searchParams.get('all') === 'true';
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || (all ? 1000 : 50);

    if (all) {
      const allData = await getListings(category, search, state, city, country);
      return NextResponse.json({
        success: true,
        data: allData,
        total: allData.length,
        page: 1,
        pageSize: allData.length,
        totalPages: 1,
      });
    }

    const result = await getListingsPaginated(category, search, city, page, pageSize, state, country);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
