import { NextResponse } from 'next/server';
import { recordClick, getListings } from '@/lib/store';
import { sanitizeDestinationUrl } from '@/lib/normalization';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const referrer = req.headers.get('referer') || undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;

    const result = await recordClick(id, { user_agent: userAgent, referrer, ip_hash: ip });

    let dest = result.destination_raw;

    if (!dest) {
      const listings = await getListings();
      const match = listings.find((l) => l.id === id || l.slug === id);
      if (match) {
        dest = match.destination_raw || match.canonical_url || match.destination_normalized;
      }
    }

    if (!dest) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const targetUrl = sanitizeDestinationUrl(dest);

    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listing_id } = body || {};

    if (!listing_id) {
      return NextResponse.json({ success: false, error: 'listing_id is required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const referrer = req.headers.get('referer') || undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;

    const result = await recordClick(String(listing_id), { user_agent: userAgent, referrer, ip_hash: ip });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record click' },
      { status: 500 }
    );
  }
}
