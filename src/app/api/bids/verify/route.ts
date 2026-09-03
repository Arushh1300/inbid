import { NextResponse } from 'next/server';
import { verifyAndConfirmPayment } from '@/lib/store';
import { verifyDodoPaymentStatus } from '@/lib/dodo';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_order_id, order_id, session_id } = body || {};
    const targetOrderId = payment_order_id || order_id || session_id;

    if (!targetOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment order_id' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // 1. Fetch bid record from Supabase
    const { data: bid, error: fetchErr } = await adminClient
      .from('bids')
      .select('*, listings(*)')
      .or(`payment_order_id.eq.${targetOrderId},dodo_checkout_session_id.eq.${targetOrderId}`)
      .maybeSingle();

    if (fetchErr || !bid) {
      return NextResponse.json(
        { success: false, error: 'Bid order not found' },
        { status: 404 }
      );
    }

    // 2. If already confirmed (e.g. by Webhook), perform idempotent confirmation lookup
    if (bid.status === 'confirmed') {
      const result = await verifyAndConfirmPayment(
        bid.payment_order_id,
        bid.payment_id || targetOrderId
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 3. Backup verification: If status is still pending, verify directly with Dodo Payments API
    if (bid.status === 'pending') {
      const lookupId = bid.dodo_checkout_session_id || bid.payment_order_id;
      const dodoCheck = await verifyDodoPaymentStatus(lookupId);

      if (dodoCheck.paid) {
        // Atomic, idempotent database confirmation in Supabase
        const result = await verifyAndConfirmPayment(
          bid.payment_order_id,
          dodoCheck.paymentId || lookupId
        );

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      return NextResponse.json(
        { success: false, error: `Payment is not completed yet (Status: ${dodoCheck.status})` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Order is in ${bid.status} status` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Dodo Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server payment verification failed' },
      { status: 500 }
    );
  }
}
