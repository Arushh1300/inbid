import { NextResponse } from 'next/server';
import { fetchAndExtractMetadata } from '@/lib/metadataExtractor';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const metadata = await fetchAndExtractMetadata(url.trim());

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to extract website metadata',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const metadata = await fetchAndExtractMetadata(url.trim());

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to extract website metadata',
      },
      { status: 500 }
    );
  }
}
