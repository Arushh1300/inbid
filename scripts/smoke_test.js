// Standalone Supabase Smoke Test for InBid
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  console.log('--- STARTING INBID SUPABASE PRODUCTION SMOKE TEST ---');
  console.log('Target URL:', supabaseUrl);

  const testDomain = 'smoke-test-' + Date.now() + '.in';
  const testOrder = 'order_smoke_' + Date.now();

  try {
    // 1. Check clean initial state
    const { data: initialListings, error: initErr } = await supabase
      .from('listings')
      .select('*')
      .or('status.eq.active,cumulative_amount.gt.0');

    if (initErr) throw initErr;
    console.log('1. Initial active listings count:', initialListings.length);

    // 2. Insert draft listing (unpaid)
    console.log('2. Inserting draft listing (unpaid)...');
    const { data: draftListing, error: draftErr } = await supabase
      .from('listings')
      .insert({
        slug: 'smoke-test-' + Date.now(),
        title: 'Smoke Test Business',
        destination_raw: 'https://' + testDomain,
        destination_normalized: testDomain,
        category: 'Startups',
        country: 'India',
        state: 'Maharashtra',
        city: 'Mumbai',
        description: 'Smoke test business description',
        cumulative_amount: 0,
        click_count: 0,
        status: 'draft',
      })
      .select('*')
      .single();

    if (draftErr) throw draftErr;
    console.log('   Draft listing created:', { id: draftListing.id, status: draftListing.status });

    // 3. Create pending bid
    console.log('3. Inserting pending bid order...');
    const { data: pendingBid, error: bidErr } = await supabase
      .from('bids')
      .insert({
        listing_id: draftListing.id,
        amount: 500.00,
        status: 'pending',
        payment_order_id: testOrder,
        bidder_name: 'QA Engineer',
      })
      .select('*')
      .single();

    if (bidErr) throw bidErr;
    console.log('   Pending bid created:', { id: pendingBid.id, order_id: pendingBid.payment_order_id });

    // 4. Verify draft listing is NOT in active listings query
    const { data: activeCheck, error: activeErr } = await supabase
      .from('listings')
      .select('*')
      .or('status.eq.active,cumulative_amount.gt.0')
      .eq('destination_normalized', testDomain);

    if (activeErr) throw activeErr;
    if (activeCheck.length > 0) {
      throw new Error('FAILED: Draft/unpaid listing appeared in active listings query!');
    }
    console.log('   PASSED: Draft listing is not visible on active leaderboard.');

    // 5. Call atomic confirm_bid_payment stored procedure
    console.log('5. Executing atomic confirm_bid_payment RPC...');
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('confirm_bid_payment', {
      p_order_id: testOrder,
      p_payment_id: 'pay_test_' + Date.now(),
    });

    if (rpcErr) throw rpcErr;
    console.log('   RPC Result:', {
      success: rpcResult.success,
      newRank: rpcResult.newRank,
      amountPaid: rpcResult.amountPaid,
      cumulativeAmount: rpcResult.listing.cumulative_amount,
    });

    if (!rpcResult.success || Number(rpcResult.listing.cumulative_amount) !== 500) {
      throw new Error('FAILED: RPC confirmation failed or cumulative amount mismatch!');
    }
    console.log('   PASSED: Bid payment confirmed and cumulative amount updated.');

    // 6. Test Idempotency / Duplicate Prevention
    console.log('6. Testing duplicate payment confirmation prevention (re-confirming same order)...');
    const { data: dupResult, error: dupErr } = await supabase.rpc('confirm_bid_payment', {
      p_order_id: testOrder,
      p_payment_id: 'pay_test_' + Date.now(),
    });

    if (dupErr) throw dupErr;
    console.log('   Duplicate RPC Result:', {
      success: dupResult.success,
      already_confirmed: dupResult.already_confirmed,
      cumulativeAmount: dupResult.listing.cumulative_amount,
    });

    if (Number(dupResult.listing.cumulative_amount) !== 500 || !dupResult.already_confirmed) {
      throw new Error('FAILED: Duplicate payment prevention failed!');
    }
    console.log('   PASSED: Duplicate payment prevented, cumulative amount unchanged (500).');

    // 7. Test Outbound Click Tracking RPC
    console.log('7. Testing atomic click tracking RPC...');
    const { data: clickResult, error: clickErr } = await supabase.rpc('record_listing_click', {
      p_listing_id: draftListing.id,
      p_ip_hash: '127.0.0.1',
      p_user_agent: 'SmokeTestAgent',
      p_referrer: 'https://inbid.site',
    });

    if (clickErr) throw clickErr;
    console.log('   Click RPC Result:', clickResult);
    if (!clickResult.success || clickResult.click_count !== 1) {
      throw new Error('FAILED: Click recording failed');
    }
    console.log('   PASSED: Outbound click tracked and counted.');

    // 8. Verify Activity Record
    console.log('8. Verifying activity feed row...');
    const { data: activities, error: actErr } = await supabase
      .from('activities')
      .select('*')
      .eq('listing_id', draftListing.id);

    if (actErr) throw actErr;
    console.log('   Activity row recorded:', { count: activities.length, event: activities[0]?.event_type });
    if (activities.length === 0) {
      throw new Error('FAILED: No activity logged for confirmed bid');
    }
    console.log('   PASSED: Verified activity feed entry.');

    // 9. Clean up test record
    console.log('9. Cleaning up smoke test data from Supabase...');
    await supabase.from('listings').delete().eq('id', draftListing.id);
    console.log('   PASSED: Test record cleaned up.');

    console.log('====================================================');
    console.log('🎉 ALL SUPABASE PRODUCTION SMOKE TESTS PASSED! 🎉');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ SMOKE TEST FAILED:', err);
    // Cleanup on error
    await supabase.from('listings').delete().eq('destination_normalized', testDomain);
    process.exit(1);
  }
}

run();
