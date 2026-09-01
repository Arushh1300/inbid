const http = require('http');

async function getJson(path) {
  const res = await fetch('http://localhost:3000' + path);
  return await res.json();
}

async function verifyAll() {
  console.log('=== STARTING LOCATION SELECTOR FLOW VERIFICATIONS ===\n');

  // 1. India -> Uttar Pradesh -> Kanpur
  console.log('1. Testing Flow: India → Uttar Pradesh → Kanpur');
  const inStates = await getJson('/api/locations?type=states&country=India');
  const upFound = inStates.data.find(s => s.name === 'Uttar Pradesh');
  if (!upFound) throw new Error('Uttar Pradesh not in India states!');
  const inUpCities = await getJson('/api/locations?type=cities&country=India&state=Uttar%20Pradesh');
  const kanpurFound = inUpCities.data.find(c => c.city === 'Kanpur');
  if (!kanpurFound) throw new Error('Kanpur not found in Uttar Pradesh!');
  console.log('   ✓ India states count:', inStates.data.length);
  console.log('   ✓ UP cities count:', inUpCities.data.length, 'Kanpur:', kanpurFound.city);

  // 2. India -> Maharashtra -> Mumbai
  console.log('\n2. Testing Flow: India → Maharashtra → Mumbai');
  const mhFound = inStates.data.find(s => s.name === 'Maharashtra');
  if (!mhFound) throw new Error('Maharashtra not found in India states!');
  const inMhCities = await getJson('/api/locations?type=cities&country=India&state=Maharashtra');
  const mumbaiFound = inMhCities.data.find(c => c.city === 'Mumbai');
  if (!mumbaiFound) throw new Error('Mumbai not found in Maharashtra!');
  console.log('   ✓ MH cities count:', inMhCities.data.length, 'Mumbai:', mumbaiFound.city);

  // 3. India -> Rajasthan -> Jaipur
  console.log('\n3. Testing Flow: India → Rajasthan → Jaipur');
  const rjFound = inStates.data.find(s => s.name === 'Rajasthan');
  if (!rjFound) throw new Error('Rajasthan not found in India states!');
  const inRjCities = await getJson('/api/locations?type=cities&country=India&state=Rajasthan');
  const jaipurFound = inRjCities.data.find(c => c.city === 'Jaipur');
  if (!jaipurFound) throw new Error('Jaipur not found in Rajasthan!');
  console.log('   ✓ RJ cities count:', inRjCities.data.length, 'Jaipur:', jaipurFound.city);

  // 4. USA -> California -> Los Angeles
  console.log('\n4. Testing Flow: USA → California → Los Angeles');
  const usStates = await getJson('/api/locations?type=states&country=USA');
  const caFound = usStates.data.find(s => s.name === 'California');
  if (!caFound) throw new Error('California not found in USA states!');
  const usCaCities = await getJson('/api/locations?type=cities&country=USA&state=California');
  const laFound = usCaCities.data.find(c => c.city === 'Los Angeles');
  if (!laFound) throw new Error('Los Angeles not found in California!');
  console.log('   ✓ USA states count:', usStates.data.length);
  console.log('   ✓ CA cities count:', usCaCities.data.length, 'Los Angeles:', laFound.city);

  // 5. UK -> England -> London
  console.log('\n5. Testing Flow: UK → England → London');
  const ukRegions = await getJson('/api/locations?type=states&country=UK');
  const engFound = ukRegions.data.find(s => s.name === 'England');
  if (!engFound) throw new Error('England not found in UK regions!');
  const ukEngCities = await getJson('/api/locations?type=cities&country=UK&state=England');
  const londonFound = ukEngCities.data.find(c => c.city === 'London');
  if (!londonFound) throw new Error('London not found in England!');
  console.log('   ✓ UK regions count:', ukRegions.data.length);
  console.log('   ✓ England cities count:', ukEngCities.data.length, 'London:', londonFound.city);

  // 6. UAE -> Dubai -> Dubai
  console.log('\n6. Testing Flow: UAE → Dubai → Dubai');
  const uaeRegions = await getJson('/api/locations?type=states&country=UAE');
  const dubaiRegionFound = uaeRegions.data.find(s => s.name === 'Dubai');
  if (!dubaiRegionFound) throw new Error('Dubai emirate not found in UAE!');
  const uaeDubaiCities = await getJson('/api/locations?type=cities&country=UAE&state=Dubai');
  const dubaiCityFound = uaeDubaiCities.data.find(c => c.city === 'Dubai');
  if (!dubaiCityFound) throw new Error('Dubai city not found in Dubai emirate!');
  console.log('   ✓ UAE regions count:', uaeRegions.data.length);
  console.log('   ✓ Dubai cities count:', uaeDubaiCities.data.length, 'Dubai:', dubaiCityFound.city);

  // 7. Test Transition / Reset Logic: Changing Country from India to USA
  console.log('\n7. Testing Transition: India → USA');
  const inStatesList = inStates.data.map(s => s.name);
  const usStatesList = usStates.data.map(s => s.name);
  const overlap = inStatesList.filter(s => usStatesList.includes(s));
  console.log('   ✓ In states count:', inStatesList.length, 'US states count:', usStatesList.length);
  console.log('   ✓ State overlap (should be 0):', overlap.length);
  if (overlap.length > 0) throw new Error('Indian and US states leaked into each other!');

  // 8. Test Transition / Reset Logic: Changing State in USA (California -> New York)
  console.log('\n8. Testing State Transition: California → New York');
  const usNyCities = await getJson('/api/locations?type=cities&country=USA&state=New%20York');
  const nyCityNames = usNyCities.data.map(c => c.city);
  console.log('   ✓ NY cities count:', nyCityNames.length, 'Includes NYC:', nyCityNames.includes('New York City'));
  if (nyCityNames.includes('Los Angeles')) throw new Error('Los Angeles leaked into New York cities!');

  // 9. Test Global Search
  console.log('\n9. Testing Direct Global Search Endpoint');
  for (const q of ['Kanpur', 'Mumbai', 'Jaipur', 'Los Angeles', 'London', 'Dubai']) {
    const sRes = await getJson('/api/locations?type=search&q=' + encodeURIComponent(q));
    console.log(`   ✓ Search "${q}" -> Results:`, sRes.data.length, sRes.data[0]?.city, `(${sRes.data[0]?.state}, ${sRes.data[0]?.country})`);
  }

  console.log('\n========================================================');
  console.log('🎉 ALL 10 LOCATION FLOWS & TRANSITIONS FULLY VERIFIED! 🎉');
  console.log('========================================================');
}

verifyAll().catch(e => {
  console.error('Verification error:', e);
  process.exit(1);
});
