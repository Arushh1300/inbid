const http = require('http');

async function getJson(path) {
  const res = await fetch('http://localhost:3000' + path);
  return await res.json();
}

async function testAll() {
  console.log('=== VERIFYING GLOBAL LOCATION SELECTOR & SEARCH ===\n');

  // Test 1: India -> Uttar Pradesh -> Kanpur
  console.log('1. India → Uttar Pradesh → Kanpur');
  const inStates = await getJson('/api/locations?type=states&country=India');
  if (!inStates.data.some(s => s.name === 'Uttar Pradesh')) throw new Error('Uttar Pradesh not in India states');
  const upCities = await getJson('/api/locations?type=cities&country=India&state=Uttar%20Pradesh');
  if (!upCities.data.some(c => c.city === 'Kanpur')) throw new Error('Kanpur not in Uttar Pradesh cities');
  console.log('   ✓ Found Kanpur in Uttar Pradesh (India)');

  // Test 2: India -> Maharashtra -> Mumbai
  console.log('\n2. India → Maharashtra → Mumbai');
  if (!inStates.data.some(s => s.name === 'Maharashtra')) throw new Error('Maharashtra not in India states');
  const mhCities = await getJson('/api/locations?type=cities&country=India&state=Maharashtra');
  if (!mhCities.data.some(c => c.city === 'Mumbai')) throw new Error('Mumbai not in Maharashtra cities');
  console.log('   ✓ Found Mumbai in Maharashtra (India)');

  // Test 3: India -> Rajasthan -> Jaipur
  console.log('\n3. India → Rajasthan → Jaipur');
  if (!inStates.data.some(s => s.name === 'Rajasthan')) throw new Error('Rajasthan not in India states');
  const rjCities = await getJson('/api/locations?type=cities&country=India&state=Rajasthan');
  if (!rjCities.data.some(c => c.city === 'Jaipur')) throw new Error('Jaipur not in Rajasthan cities');
  console.log('   ✓ Found Jaipur in Rajasthan (India)');

  // Test 4: USA -> California -> Los Angeles
  console.log('\n4. USA → California → Los Angeles');
  const usStates = await getJson('/api/locations?type=states&country=USA');
  if (!usStates.data.some(s => s.name === 'California')) throw new Error('California not in USA states');
  const caCities = await getJson('/api/locations?type=cities&country=USA&state=California');
  if (!caCities.data.some(c => c.city === 'Los Angeles')) throw new Error('Los Angeles not in California cities');
  console.log('   ✓ Found Los Angeles in California (USA)');

  // Test 5: USA -> New York -> New York City
  console.log('\n5. USA → New York → New York City');
  if (!usStates.data.some(s => s.name === 'New York')) throw new Error('New York not in USA states');
  const nyCities = await getJson('/api/locations?type=cities&country=USA&state=New%20York');
  if (!nyCities.data.some(c => c.city === 'New York City')) throw new Error('New York City not in New York cities');
  console.log('   ✓ Found New York City in New York (USA)');

  // Test 6: Canada -> Ontario -> Toronto
  console.log('\n6. Canada → Ontario → Toronto');
  const caProvinces = await getJson('/api/locations?type=states&country=Canada');
  if (!caProvinces.data.some(s => s.name === 'Ontario')) throw new Error('Ontario not in Canada provinces');
  const onCities = await getJson('/api/locations?type=cities&country=Canada&state=Ontario');
  if (!onCities.data.some(c => c.city === 'Toronto')) throw new Error('Toronto not in Ontario cities');
  console.log('   ✓ Found Toronto in Ontario (Canada)');

  // Test 7: UK -> England -> London
  console.log('\n7. UK → England → London');
  const ukRegions = await getJson('/api/locations?type=states&country=UK');
  if (!ukRegions.data.some(s => s.name === 'England')) throw new Error('England not in UK regions');
  const engCities = await getJson('/api/locations?type=cities&country=UK&state=England');
  if (!engCities.data.some(c => c.city === 'London')) throw new Error('London not in England cities');
  console.log('   ✓ Found London in England (UK)');

  // Test 8: UAE -> Dubai -> Dubai
  console.log('\n8. UAE → Dubai → Dubai');
  const uaeEmirates = await getJson('/api/locations?type=states&country=UAE');
  if (!uaeEmirates.data.some(s => s.name === 'Dubai')) throw new Error('Dubai not in UAE emirates');
  const dubaiCities = await getJson('/api/locations?type=cities&country=UAE&state=Dubai');
  if (!dubaiCities.data.some(c => c.city === 'Dubai')) throw new Error('Dubai not in Dubai emirate');
  console.log('   ✓ Found Dubai in Dubai (UAE)');

  // Test Search Queries
  console.log('\n--- TESTING SEARCH QUERIES ---');
  const searches = ['India', 'United States', 'California', 'Maharashtra', 'London', 'Los Angeles'];
  for (const q of searches) {
    const res = await getJson('/api/locations?type=search&q=' + encodeURIComponent(q));
    console.log(`   Search "${q}": Found ${res.data.length} match(es) -> [${res.data.slice(0, 2).map(r => r.city || r.name).join(', ')}]`);
    if (!res.data || res.data.length === 0) throw new Error(`Search for ${q} returned 0 results!`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 8 HIERARCHY FLOWS AND 6 SEARCH TESTS PASSED! 🎉');
  console.log('======================================================');
}

testAll().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
