import { NextResponse } from 'next/server';
import { verifyDodoWebhookSignature } from '@/lib/dodo';
import { verifyAndConfirmPayment, cancelBidOrder } from '@/lib/store';

export async function POST(req: Request) {
  try {
    // 1. Extract raw body text for signature verification
    const rawBody = await req.text();

    // 2. Collect webhook headers
    const headers = {
      'webhook-id': req.headers.get('webhook-id') || undefined,
      'webhook-timestamp': req.headers.get('webhook-timestamp') || undefined,
      'webhook-signature': req.headers.get('webhook-signature') || undefined,
    };

    // 3. Verify signature using Standard Webhooks requirement
    let verifiedPayload: any;
    try {
      verifiedPayload = verifyDodoWebhookSignature(rawBody, headers);
    } catch (sigErr: any) {
      console.error('Dodo Webhook Signature Verification Failed:', sigErr?.message || sigErr);
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = typeof verifiedPayload === 'string' ? JSON.parse(verifiedPayload) : verifiedPayload;
    const eventType = payload?.type || payload?.event_type;
    const data = payload?.data || payload;

    const metadata = data?.metadata || {};
    const orderId = metadata?.order_id || data?.payment_order_id || data?.order_id || data?.session_id;
    const paymentId = data?.payment_id || data?.id || `dodo_${Date.now()}`;

    console.log(`Received Dodo webhook event: [${eventType}] for order [${orderId}]`);

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'No order_id associated with event' });
    }

    // 4. Handle webhook event types idempotently
    if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
      await verifyAndConfirmPayment(String(orderId), String(paymentId));
      return NextResponse.json({ success: true, status: 'confirmed' });
    }

    if (eventType === 'payment.failed' || eventType === 'checkout.session.expired' || eventType === 'payment.cancelled') {
      await cancelBidOrder(String(orderId), 'failed');
      return NextResponse.json({ success: true, status: 'cancelled' });
    }

    return NextResponse.json({ success: true, message: `Event ${eventType} acknowledged` });
  } catch (error: any) {
    console.error('Dodo Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
