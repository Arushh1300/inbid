const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log('=== RUNNING GLOBAL LOCATIONS VERIFICATION TESTS ===\n');

  // Test 1: Count exact countries, regions, and cities
  console.log('1. Querying public.locations table statistics...');
  const { data: allLocations, error: locErr } = await supabase
    .from('locations')
    .select('country, country_code, state, state_code, city');

  if (locErr) {
    console.error('Failed to query locations:', locErr.message);
    process.exit(1);
  }

  const countriesSet = new Set(allLocations.map((l) => l.country));
  const regionsSet = new Set(allLocations.map((l) => `${l.country}:${l.state}`));
  const citiesCount = allLocations.length;

  console.log(`   Countries supported: ${countriesSet.size}`);
  console.log(`   States/Regions supported: ${regionsSet.size}`);
  console.log(`   Total cities supported: ${citiesCount}`);

  // Test 2: India -> Uttar Pradesh -> Kanpur
  console.log('\n2. Testing India → Uttar Pradesh → Kanpur:');
  const kanpurMatch = allLocations.find(
    (l) => l.country === 'India' && l.state === 'Uttar Pradesh' && l.city === 'Kanpur'
  );
  if (!kanpurMatch) throw new Error('Kanpur, Uttar Pradesh, India not found in dataset!');
  console.log('   FOUND:', kanpurMatch);

  // Test 3: USA -> California -> Los Angeles
  console.log('\n3. Testing USA → California → Los Angeles:');
  const laMatch = allLocations.find(
    (l) => l.country === 'United States' && l.state === 'California' && l.city === 'Los Angeles'
  );
  if (!laMatch) throw new Error('Los Angeles, California, United States not found in dataset!');
  console.log('   FOUND:', laMatch);

  // Test 4: UK -> England -> London
  console.log('\n4. Testing UK → England → London:');
  const londonMatch = allLocations.find(
    (l) => l.country === 'United Kingdom' && l.state === 'England' && l.city === 'London'
  );
  if (!londonMatch) throw new Error('London, England, United Kingdom not found in dataset!');
  console.log('   FOUND:', londonMatch);

  // Test 5: UAE -> Dubai -> Dubai
  console.log('\n5. Testing UAE → Dubai → Dubai:');
  const dubaiMatch = allLocations.find(
    (l) => l.country === 'United Arab Emirates' && l.state === 'Dubai' && l.city === 'Dubai'
  );
  if (!dubaiMatch) throw new Error('Dubai, Dubai, United Arab Emirates not found in dataset!');
  console.log('   FOUND:', dubaiMatch);

  // Test 6: City Search
  console.log('\n6. Testing Indexed City Search for "Kanpur", "Los Angeles", "London", "Dubai":');
  for (const q of ['Kanpur', 'Los Angeles', 'London', 'Dubai']) {
    const { data: searchResults } = await supabase
      .from('locations')
      .select('city, state, country, country_code')
      .or(`city.ilike.%${q}%,state.ilike.%${q}%`)
      .limit(5);

    console.log(`   Search "${q}":`, searchResults?.map((r) => `${r.city}, ${r.state} (${r.country})`));
    if (!searchResults || searchResults.length === 0) {
      throw new Error(`Search for ${q} returned no results`);
    }
  }

  // Test 7: Category + Location Filtering on listings
  console.log('\n7. Testing Category + Location Filtering on public.listings:');
  const { data: catLocData, error: catLocErr } = await supabase
    .from('listings')
    .select('id, title, category, country, state, city')
    .eq('category', 'Startups')
    .eq('country', 'India');

  if (catLocErr) throw catLocErr;
  console.log(`   Filtered listings count (Category="Startups", Country="India"):`, catLocData.length);

  // Test 8: Existing Listings Integrity Check
  console.log('\n8. Testing Existing Listings Integrity:');
  const { data: existingListings, error: exErr } = await supabase
    .from('listings')
    .select('id, title, destination_normalized, country, country_code, state, city');

  if (exErr) throw exErr;
  console.log(`   Total listings in database: ${existingListings.length}`);
  existingListings.forEach((l) => {
    console.log(`   Listing: ${l.title} (${l.destination_normalized}) -> Country: ${l.country} (${l.country_code}), State: ${l.state}, City: ${l.city}`);
    if (l.country !== 'India' || l.country_code !== 'IN') {
      throw new Error(`Existing listing ${l.id} has incorrect country: ${l.country}`);
    }
  });

  console.log('\n====================================================');
  console.log('🎉 ALL GLOBAL LOCATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('====================================================');
}

runTests().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
