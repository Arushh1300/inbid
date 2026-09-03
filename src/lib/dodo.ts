import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

/**
 * Singleton Dodo Payments SDK Client (Server-side Only)
 */
export function getDodoClient(): DodoPayments {
  const rawKey =
    process.env.DODO_PAYMENTS_API_KEY ||
    process.env.DODO_PAYMENTS_API_KEY_LIVE ||
    process.env.DODO_PAYMENTS_API_KEY_TEST;

  if (!rawKey) {
    throw new Error('DODO_PAYMENTS_API_KEY environment variable is not configured');
  }

  const apiKey = rawKey.trim();
  const rawEnv = (process.env.DODO_PAYMENTS_ENVIRONMENT || '').trim().toLowerCase();
  let envMode: 'live_mode' | 'test_mode';

  if (rawEnv === 'live_mode' || rawEnv === 'live mode' || rawEnv === 'live') {
    envMode = 'live_mode';
  } else if (rawEnv === 'test_mode' || rawEnv === 'test mode' || rawEnv === 'test') {
    envMode = 'test_mode';
  } else {
    throw new Error(
      `Invalid DODO_PAYMENTS_ENVIRONMENT value "${process.env.DODO_PAYMENTS_ENVIRONMENT}". Must be "live_mode" or "test_mode".`
    );
  }

  // Safe diagnostic logging (Do not expose raw secret key)
  const maskedKey =
    apiKey.length > 10
      ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
      : '***';

  console.log('[Dodo SDK Init]', {
    hasApiKey: true,
    keyLength: apiKey.length,
    maskedKey,
    environment: envMode,
  });

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
  const productId =
    process.env.DODO_PAYMENTS_PRODUCT_ID ||
    process.env.DODO_PAYMENTS_PRODUCT_ID_LIVE ||
    process.env.DODO_PAYMENTS_PRODUCT_ID_TEST;

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
    
    // Attempt to fetch checkout session
    if ((client.checkoutSessions as any)?.get) {
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
    }
  } catch (err: any) {
    console.warn('Dodo checkout session lookup notice:', err?.message || err);
  }

  try {
    const client = getDodoClient();
    // Attempt to fetch payment directly
    if ((client.payments as any)?.get) {
      const payment: any = await (client.payments as any).get(sessionIdOrPaymentId);
      if (payment) {
        const status = payment.status;
        const isPaid = status === 'succeeded' || status === 'paid' || status === 'completed';
        return {
          paid: isPaid,
          status: String(status || 'unknown'),
          paymentId: payment.payment_id || payment.id || sessionIdOrPaymentId,
        };
      }
    }
  } catch (err: any) {
    console.warn('Dodo payment lookup fallback notice:', err?.message || err);
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
