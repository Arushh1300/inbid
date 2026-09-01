import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

/**
 * Singleton Dodo Payments SDK Client (Server-side Only)
 */
export function getDodoClient(): DodoPayments {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('DODO_PAYMENTS_API_KEY environment variable is not configured');
  }

  const envMode = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';

  return new DodoPayments({
    bearerToken: apiKey,
    environment: envMode,
  });
}

export interface CreateCheckoutOptions {
  orderId: string;
  listingId: string;
  amount: number; // Amount in INR (e.g. 99 for ₹99)
  listingTitle: string;
  destination: string;
  bidderName?: string;
  bidderEmail?: string;
  returnUrl?: string;
}

export interface DodoCheckoutResult {
  checkout_url: string;
  session_id: string;
}

/**
 * Create a Dodo Payments Checkout Session Server-Side
 * Converts INR amount to paise (minor units: 1 INR = 100 paise)
 */
export async function createDodoCheckoutSession(options: CreateCheckoutOptions): Promise<DodoCheckoutResult> {
  const client = getDodoClient();
  const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;

  if (!productId) {
    throw new Error('DODO_PAYMENTS_PRODUCT_ID environment variable is missing');
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://inbid.site').replace(/\/$/, '');
  const returnUrl = options.returnUrl || `${appUrl}/?payment_status=success&order_id=${encodeURIComponent(options.orderId)}`;

  // Convert ₹99 to 9900 paise (minor currency units)
  const amountInPaise = Math.round(options.amount * 100);

  const response = await client.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        amount: amountInPaise,
      },
    ],
    billing_address: {
      country: 'IN',
    },
    customer: {
      email: options.bidderEmail || 'builder@inbid.site',
      name: options.bidderName || 'Verified Builder',
    },
    metadata: {
      order_id: options.orderId,
      listing_id: options.listingId,
      bid_amount: String(options.amount),
      destination: options.destination,
    },
    return_url: returnUrl,
  });

  const checkoutUrl = response.checkout_url;
  const sessionId = (response as any).session_id || (response as any).id || options.orderId;

  if (!checkoutUrl) {
    throw new Error('Dodo Payments checkout_url was not returned by API');
  }

  return {
    checkout_url: checkoutUrl,
    session_id: sessionId,
  };
}

/**
 * Verify Dodo Payment Status via Server API
 */
export async function verifyDodoPaymentStatus(sessionIdOrPaymentId: string): Promise<{
  paid: boolean;
  status: string;
  paymentId?: string;
}> {
  try {
    const client = getDodoClient();
    
    // Attempt to fetch checkout session or payment details
    const session: any = await (client.checkoutSessions as any).get(sessionIdOrPaymentId);
    
    if (session) {
      const status = session.status || session.payment_status;
      const isPaid = status === 'succeeded' || status === 'paid' || status === 'completed';
      return {
        paid: isPaid,
        status: String(status || 'unknown'),
        paymentId: session.payment_id || session.id || sessionIdOrPaymentId,
      };
    }
  } catch (err: any) {
    console.warn('Dodo payment verify lookup notice:', err?.message || err);
  }

  return { paid: false, status: 'unverified' };
}

/**
 * Verify Webhook Signature according to Standard Webhooks specification
 */
export function verifyDodoWebhookSignature(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): any {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('DODO_PAYMENTS_WEBHOOK_SECRET is not configured');
  }

  const webhookId = Array.isArray(headers['webhook-id']) ? headers['webhook-id'][0] : headers['webhook-id'];
  const webhookTimestamp = Array.isArray(headers['webhook-timestamp']) ? headers['webhook-timestamp'][0] : headers['webhook-timestamp'];
  const webhookSignature = Array.isArray(headers['webhook-signature']) ? headers['webhook-signature'][0] : headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new Error('Missing Standard Webhook signature headers');
  }

  const wh = new Webhook(secret);
  return wh.verify(rawBody, {
    'webhook-id': webhookId,
    'webhook-timestamp': webhookTimestamp,
    'webhook-signature': webhookSignature,
  });
}
