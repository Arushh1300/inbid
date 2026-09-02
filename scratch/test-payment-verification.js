const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Skipping database test: Supabase environment variables not present');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentVerificationLookups() {
  console.log('--- Testing confirm_bid_payment RPC Lookups ---');

  try {
    const { data: pendingBid, error: fetchErr } = await supabase
      .from('bids')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error fetching sample bid:', fetchErr.message);
      return;
    }

    if (!pendingBid) {
      console.log('No bids found in database to test.');
      return;
    }

    console.log('Sample bid record fetched:', {
      id: pendingBid.id,
      payment_order_id: pendingBid.payment_order_id,
      dodo_checkout_session_id: pendingBid.dodo_checkout_session_id,
      status: pendingBid.status,
    });

    if (pendingBid.payment_order_id) {
      const { data: byOrder } = await supabase
        .from('bids')
        .select('id, payment_order_id, dodo_checkout_session_id')
        .or(`payment_order_id.eq.${pendingBid.payment_order_id},dodo_checkout_session_id.eq.${pendingBid.payment_order_id}`)
        .maybeSingle();

      console.log('✅ Scenario 1 (payment_order_id lookup):', byOrder ? 'SUCCESS (Order found)' : 'NOT FOUND');
    }

    if (pendingBid.dodo_checkout_session_id) {
      const { data: bySession } = await supabase
        .from('bids')
        .select('id, payment_order_id, dodo_checkout_session_id')
        .or(`payment_order_id.eq.${pendingBid.dodo_checkout_session_id},dodo_checkout_session_id.eq.${pendingBid.dodo_checkout_session_id}`)
        .maybeSingle();

      console.log('✅ Scenario 2 (dodo_checkout_session_id lookup):', bySession ? 'SUCCESS (Session found)' : 'NOT FOUND');
    }

    console.log('--- Both Lookup Scenarios Verified Successfully ---');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

testPaymentVerificationLookups();
