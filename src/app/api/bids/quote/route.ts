import { NextResponse } from 'next/server';
import { getQuoteForBid } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, amount } = body || {};

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return NextResponse.json(
        { success: false, error: 'Destination URL or handle is required' },
        { status: 400 }
      );
    }

    const bidAmount = Number(amount) || 100;
    const quote = await getQuoteForBid(destination.trim(), bidAmount);

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}
