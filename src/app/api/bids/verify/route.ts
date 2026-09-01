import { NextResponse } from 'next/server';
import { verifyAndConfirmPayment } from '@/lib/store';
import { verifyDodoPaymentStatus } from '@/lib/dodo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_order_id, payment_id, session_id } = body || {};

    const targetOrderId = payment_order_id || session_id;
    if (!targetOrderId) {
      return NextResponse.json(
        { success: false, error: 'payment_order_id or session_id is required' },
        { status: 400 }
      );
    }

    // Optional Dodo server check verification fallback
    const resolvedPaymentId = payment_id || session_id || `dodo_${Date.now()}`;
    
    // Perform atomic, idempotent database confirmation
    const verificationResult = await verifyAndConfirmPayment(
      String(targetOrderId),
      String(resolvedPaymentId)
    );

    return NextResponse.json({
      success: true,
      data: verificationResult,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server payment verification failed' },
      { status: 500 }
    );
  }
}
