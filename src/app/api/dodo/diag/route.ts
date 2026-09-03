import { NextResponse } from 'next/server';
import { getDodoClient } from '@/lib/dodo';

export async function GET() {
  try {
    const rawKey = process.env.DODO_PAYMENTS_API_KEY || '';
    const rawEnv = process.env.DODO_PAYMENTS_ENVIRONMENT || '';
    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID || '';
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || '';

    const apiKey = rawKey.trim();
    const maskedKey =
      apiKey.length > 10
        ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
        : 'EMPTY_OR_SHORT';

    const maskedSecret =
      webhookSecret.length > 8
        ? `${webhookSecret.substring(0, 4)}...${webhookSecret.substring(webhookSecret.length - 4)}`
        : 'EMPTY_OR_SHORT';

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      env: {
        hasApiKey: Boolean(apiKey),
        apiKeyLength: apiKey.length,
        maskedKey,
        rawEnvSetting: rawEnv,
        isStrictLiveMode: rawEnv === 'live_mode',
        isStrictTestMode: rawEnv === 'test_mode',
        hasProductId: Boolean(productId),
        productIdLength: productId.length,
        hasWebhookSecret: Boolean(webhookSecret),
        maskedWebhookSecret: maskedSecret,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not_set',
      },
      sdkCheck: {
        initialized: false,
        error: null,
      },
      liveApiTest: {
        attempted: false,
        success: false,
        status: null,
        error: null,
      },
    };

    // Attempt SDK initialization
    let client;
    try {
      client = getDodoClient();
      diagnostics.sdkCheck.initialized = true;
    } catch (sdkErr: any) {
      diagnostics.sdkCheck.error = sdkErr?.message || String(sdkErr);
      return NextResponse.json(diagnostics, { status: 400 });
    }

    // Attempt lightweight live call to verify credentials against Dodo server
    diagnostics.liveApiTest.attempted = true;
    try {
      // Attempt to list products or fetch session to verify bearer token authentication
      if ((client.products as any)?.list) {
        await (client.products as any).list({ page_size: 1 });
        diagnostics.liveApiTest.success = true;
        diagnostics.liveApiTest.status = 'Authenticated successfully with Dodo Payments API';
      } else {
        diagnostics.liveApiTest.status = 'SDK client ready (products.list endpoint not invoked)';
        diagnostics.liveApiTest.success = true;
      }
    } catch (apiErr: any) {
      diagnostics.liveApiTest.success = false;
      diagnostics.liveApiTest.status = apiErr?.status || apiErr?.statusCode || 401;
      diagnostics.liveApiTest.error = {
        name: apiErr?.name,
        message: apiErr?.message || String(apiErr),
        status: apiErr?.status,
        code: apiErr?.code,
      };
    }

    return NextResponse.json(diagnostics);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Diagnostic handler failure',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
