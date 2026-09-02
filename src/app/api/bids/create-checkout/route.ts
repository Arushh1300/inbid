import { NextResponse } from 'next/server';
import { createPendingBidOrder, updateBidDodoSession, getQuoteForBid } from '@/lib/store';
import { createDodoCheckoutSession } from '@/lib/dodo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      destination,
      title,
      category,
      country,
      country_code,
      state,
      state_code,
      city,
      description,
      avatar_url,
      og_image_url,
      canonical_url,
      amount,
      bidder_name,
    } = body || {};

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination URL is required' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 99) {
      return NextResponse.json(
        { success: false, error: 'Minimum initial bid amount is ₹99' },
        { status: 400 }
      );
    }

    // Verify quote / position bid requirements on server side for exact scope
    const quote = await getQuoteForBid(
      String(destination).trim(),
      numAmount,
      category ? String(category).trim() : undefined,
      country ? String(country).trim() : undefined,
      state ? String(state).trim() : undefined,
      city ? String(city).trim() : undefined
    );

    if (numAmount < quote.min_amount_required) {
      const scopeName = city ? String(city).trim() : 'this leaderboard';
      return NextResponse.json(
        {
          success: false,
          error: `Minimum required bid to claim #1 in ${scopeName} is ₹${quote.min_amount_required}`,
        },
        { status: 400 }
      );
    }

    // 1. Create pending bid order in Supabase
    const orderResult = await createPendingBidOrder({
      destination: String(destination).trim(),
      title: title ? String(title).trim() : undefined,
      category,
      country,
      country_code,
      state,
      state_code,
      city: city ? String(city).trim() : undefined,
      description: description ? String(description).trim() : undefined,
      avatar_url,
      og_image_url,
      canonical_url,
      amount: numAmount,
      bidder_name: bidder_name ? String(bidder_name).trim() : undefined,
    });

    // 2. Create Dodo Payments Checkout Session server-side
    let dodoSession;
    try {
      dodoSession = await createDodoCheckoutSession({
        orderId: orderResult.order_id,
        listingId: orderResult.listing.id,
        amount: numAmount,
        listingTitle: orderResult.listing.title,
        destination: orderResult.listing.destination_normalized,
        bidderName: bidder_name ? String(bidder_name).trim() : undefined,
      });

      // Attach Dodo Checkout Session ID to pending bid in database
      await updateBidDodoSession(orderResult.order_id, dodoSession.session_id);
    } catch (dodoErr: any) {
      console.error('Dodo Checkout Session creation error:', dodoErr);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to initiate Dodo Payments checkout: ${dodoErr?.message || 'Check server configuration'}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderResult.order_id,
        session_id: dodoSession.session_id,
        checkout_url: dodoSession.checkout_url,
        amount: numAmount,
        listing: orderResult.listing,
      },
    });
  } catch (error: any) {
    console.error('create-checkout error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process checkout request' },
      { status: 500 }
    );
  }
}
