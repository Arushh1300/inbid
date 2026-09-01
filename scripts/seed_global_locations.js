const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Structured Verified Global Dataset
const GLOBAL_DATASET = [
  // ================= INDIA (IN) =================
  {
    country: 'India',
    country_code: 'IN',
    state: 'Andhra Pradesh',
    state_code: 'AP',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Nellore', 'Kurnool'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Arunachal Pradesh',
    state_code: 'AR',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Assam',
    state_code: 'AS',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Bihar',
    state_code: 'BR',
    cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Begusarai'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Chhattisgarh',
    state_code: 'CG',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Goa',
    state_code: 'GA',
    cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Gujarat',
    state_code: 'GJ',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Haryana',
    state_code: 'HR',
    cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Panchkula'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Himachal Pradesh',
    state_code: 'HP',
    cities: ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi', 'Kullu', 'Hamirpur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Jharkhand',
    state_code: 'JH',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Karnataka',
    state_code: 'KA',
    cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Shivamogga'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Kerala',
    state_code: 'KL',
    cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Kannur', 'Kottayam'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Madhya Pradesh',
    state_code: 'MP',
    cities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Maharashtra',
    state_code: 'MH',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Manipur',
    state_code: 'MN',
    cities: ['Imphal', 'Churachandpur', 'Thoubal', 'Bishnupur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Meghalaya',
    state_code: 'ML',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Mizoram',
    state_code: 'MZ',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Nagaland',
    state_code: 'NL',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Odisha',
    state_code: 'OD',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Punjab',
    state_code: 'PB',
    cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Rajasthan',
    state_code: 'RJ',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Sikkim',
    state_code: 'SK',
    cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Tamil Nadu',
    state_code: 'TN',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thanjavur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Telangana',
    state_code: 'TS',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Tripura',
    state_code: 'TR',
    cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Uttar Pradesh',
    state_code: 'UP',
    cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Ghaziabad', 'Noida', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur', 'Jhansi'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Uttarakhand',
    state_code: 'UK',
    cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Kashipur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'West Bengal',
    state_code: 'WB',
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman', 'Malda'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Andaman and Nicobar Islands',
    state_code: 'AN',
    cities: ['Port Blair'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Chandigarh',
    state_code: 'CH',
    cities: ['Chandigarh'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    state_code: 'DH',
    cities: ['Daman', 'Silvassa', 'Diu'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Delhi',
    state_code: 'DL',
    cities: ['Delhi', 'New Delhi', 'Dwarka', 'Rohini'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Jammu and Kashmir',
    state_code: 'JK',
    cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Ladakh',
    state_code: 'LA',
    cities: ['Leh', 'Kargil'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Lakshadweep',
    state_code: 'LD',
    cities: ['Kavaratti'],
  },
  {
    country: 'India',
    country_code: 'IN',
    state: 'Puducherry',
    state_code: 'PY',
    cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  },

  // ================= UNITED STATES (US) =================
  {
    country: 'United States',
    country_code: 'US',
    state: 'California',
    state_code: 'CA',
    cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Irvine', 'Fresno', 'Oakland', 'Santa Clara', 'Palo Alto', 'Beverly Hills', 'Anaheim', 'Pasadena', 'Long Beach'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'New York',
    state_code: 'NY',
    cities: ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Syracuse', 'Yonkers'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Texas',
    state_code: 'TX',
    cities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Florida',
    state_code: 'FL',
    cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg', 'Tallahassee'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Illinois',
    state_code: 'IL',
    cities: ['Chicago', 'Springfield', 'Naperville', 'Peoria'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Washington',
    state_code: 'WA',
    cities: ['Seattle', 'Tacoma', 'Spokane', 'Bellevue', 'Redmond'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Massachusetts',
    state_code: 'MA',
    cities: ['Boston', 'Cambridge', 'Worcester', 'Springfield'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Georgia',
    state_code: 'GA',
    cities: ['Atlanta', 'Savannah', 'Augusta'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Colorado',
    state_code: 'CO',
    cities: ['Denver', 'Colorado Springs', 'Boulder'],
  },
  {
    country: 'United States',
    country_code: 'US',
    state: 'Nevada',
    state_code: 'NV',
    cities: ['Las Vegas', 'Reno', 'Henderson'],
  },

  // ================= UNITED KINGDOM (GB) =================
  {
    country: 'United Kingdom',
    country_code: 'GB',
    state: 'England',
    state_code: 'ENG',
    cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Oxford', 'Cambridge', 'Newcastle upon Tyne', 'Sheffield', 'Nottingham', 'Southampton', 'Brighton', 'Leicester'],
  },
  {
    country: 'United Kingdom',
    country_code: 'GB',
    state: 'Scotland',
    state_code: 'SCT',
    cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
  },
  {
    country: 'United Kingdom',
    country_code: 'GB',
    state: 'Wales',
    state_code: 'WLS',
    cities: ['Cardiff', 'Swansea', 'Newport'],
  },
  {
    country: 'United Kingdom',
    country_code: 'GB',
    state: 'Northern Ireland',
    state_code: 'NIR',
    cities: ['Belfast', 'Derry'],
  },

  // ================= UNITED ARAB EMIRATES (AE) =================
  {
    country: 'United Arab Emirates',
    country_code: 'AE',
    state: 'Dubai',
    state_code: 'DU',
    cities: ['Dubai'],
  },
  {
    country: 'United Arab Emirates',
    country_code: 'AE',
    state: 'Abu Dhabi',
    state_code: 'AZ',
    cities: ['Abu Dhabi', 'Al Ain'],
  },
  {
    country: 'United Arab Emirates',
    country_code: 'AE',
    state: 'Sharjah',
    state_code: 'SH',
    cities: ['Sharjah'],
  },
  {
    country: 'United Arab Emirates',
    country_code: 'AE',
    state: 'Ras Al Khaimah',
    state_code: 'RK',
    cities: ['Ras Al Khaimah'],
  },
  {
    country: 'United Arab Emirates',
    country_code: 'AE',
    state: 'Ajman',
    state_code: 'AJ',
    cities: ['Ajman'],
  },

  // ================= CANADA (CA) =================
  {
    country: 'Canada',
    country_code: 'CA',
    state: 'Ontario',
    state_code: 'ON',
    cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Kitchener'],
  },
  {
    country: 'Canada',
    country_code: 'CA',
    state: 'Quebec',
    state_code: 'QC',
    cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke'],
  },
  {
    country: 'Canada',
    country_code: 'CA',
    state: 'British Columbia',
    state_code: 'BC',
    cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna'],
  },
  {
    country: 'Canada',
    country_code: 'CA',
    state: 'Alberta',
    state_code: 'AB',
    cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
  },

  // ================= AUSTRALIA (AU) =================
  {
    country: 'Australia',
    country_code: 'AU',
    state: 'New South Wales',
    state_code: 'NSW',
    cities: ['Sydney', 'Newcastle', 'Wollongong', 'Parramatta'],
  },
  {
    country: 'Australia',
    country_code: 'AU',
    state: 'Victoria',
    state_code: 'VIC',
    cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
  },
  {
    country: 'Australia',
    country_code: 'AU',
    state: 'Queensland',
    state_code: 'QLD',
    cities: ['Brisbane', 'Gold Coast', 'Cairns', 'Townsville'],
  },
  {
    country: 'Australia',
    country_code: 'AU',
    state: 'Western Australia',
    state_code: 'WA',
    cities: ['Perth', 'Fremantle'],
  },
  {
    country: 'Australia',
    country_code: 'AU',
    state: 'South Australia',
    state_code: 'SA',
    cities: ['Adelaide'],
  },

  // ================= GERMANY (DE) =================
  {
    country: 'Germany',
    country_code: 'DE',
    state: 'Bavaria',
    state_code: 'BY',
    cities: ['Munich', 'Nuremberg', 'Augsburg'],
  },
  {
    country: 'Germany',
    country_code: 'DE',
    state: 'Berlin',
    state_code: 'BE',
    cities: ['Berlin'],
  },
  {
    country: 'Germany',
    country_code: 'DE',
    state: 'North Rhine-Westphalia',
    state_code: 'NW',
    cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn'],
  },
  {
    country: 'Germany',
    country_code: 'DE',
    state: 'Hesse',
    state_code: 'HE',
    cities: ['Frankfurt', 'Wiesbaden', 'Kassel'],
  },
  {
    country: 'Germany',
    country_code: 'DE',
    state: 'Hamburg',
    state_code: 'HH',
    cities: ['Hamburg'],
  },

  // ================= FRANCE (FR) =================
  {
    country: 'France',
    country_code: 'FR',
    state: 'Île-de-France',
    state_code: 'IDF',
    cities: ['Paris', 'Boulogne-Billancourt', 'Versailles', 'Saint-Denis'],
  },
  {
    country: 'France',
    country_code: 'FR',
    state: 'Auvergne-Rhône-Alpes',
    state_code: 'ARA',
    cities: ['Lyon', 'Grenoble', 'Saint-Étienne'],
  },
  {
    country: 'France',
    country_code: 'FR',
    state: 'Provence-Alpes-Côte d\'Azur',
    state_code: 'PAC',
    cities: ['Marseille', 'Nice', 'Cannes', 'Toulon'],
  },

  // ================= JAPAN (JP) =================
  {
    country: 'Japan',
    country_code: 'JP',
    state: 'Kanto',
    state_code: 'KT',
    cities: ['Tokyo', 'Yokohama', 'Kawasaki', 'Saitama', 'Chiba'],
  },
  {
    country: 'Japan',
    country_code: 'JP',
    state: 'Kansai',
    state_code: 'KS',
    cities: ['Osaka', 'Kyoto', 'Kobe', 'Nara'],
  },

  // ================= SINGAPORE (SG) =================
  {
    country: 'Singapore',
    country_code: 'SG',
    state: 'Central Region',
    state_code: 'CR',
    cities: ['Singapore'],
  },

  // ================= NETHERLANDS (NL) =================
  {
    country: 'Netherlands',
    country_code: 'NL',
    state: 'North Holland',
    state_code: 'NH',
    cities: ['Amsterdam', 'Haarlem'],
  },
  {
    country: 'Netherlands',
    country_code: 'NL',
    state: 'South Holland',
    state_code: 'ZH',
    cities: ['Rotterdam', 'The Hague'],
  },

  // ================= SWEDEN (SE) =================
  {
    country: 'Sweden',
    country_code: 'SE',
    state: 'Stockholm County',
    state_code: 'AB',
    cities: ['Stockholm'],
  },

  // ================= SWITZERLAND (CH) =================
  {
    country: 'Switzerland',
    country_code: 'CH',
    state: 'Zurich',
    state_code: 'ZH',
    cities: ['Zurich'],
  },
  {
    country: 'Switzerland',
    country_code: 'CH',
    state: 'Geneva',
    state_code: 'GE',
    cities: ['Geneva'],
  },

  // ================= SAUDI ARABIA (SA) =================
  {
    country: 'Saudi Arabia',
    country_code: 'SA',
    state: 'Riyadh Province',
    state_code: 'RI',
    cities: ['Riyadh'],
  },
  {
    country: 'Saudi Arabia',
    country_code: 'SA',
    state: 'Makkah Province',
    state_code: 'MK',
    cities: ['Jeddah', 'Mecca'],
  },
];

const POPULAR_CITY_LIST = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Jaipur',
  'Los Angeles', 'New York City', 'San Francisco', 'Chicago',
  'London', 'Manchester', 'Dubai', 'Abu Dhabi', 'Toronto', 'Vancouver',
  'Sydney', 'Melbourne', 'Berlin', 'Munich', 'Paris', 'Tokyo', 'Singapore'
];

async function seed() {
  console.log('--- STARTING GLOBAL LOCATIONS DATABASE MIGRATION & SEEDING ---');

  // Prepare flat location rows
  const locationRows = [];
  const countrySet = new Set();
  const stateSet = new Set();
  let totalCityCount = 0;

  for (const group of GLOBAL_DATASET) {
    countrySet.add(group.country);
    stateSet.add(`${group.country_code}:${group.state}`);
    for (const city of group.cities) {
      totalCityCount++;
      const isPop = POPULAR_CITY_LIST.includes(city);
      locationRows.push({
        country: group.country,
        country_code: group.country_code,
        state: group.state,
        state_code: group.state_code,
        city,
        is_popular: isPop,
      });
    }
  }

  console.log(`Dataset statistics to seed:`);
  console.log(`- Countries: ${countrySet.size}`);
  console.log(`- States/Regions: ${stateSet.size}`);
  console.log(`- Total Cities: ${totalCityCount}`);

  // Batch upsert into public.locations (chunks of 100)
  console.log('Upserting location records into public.locations in batches...');
  const CHUNK_SIZE = 100;
  let insertedCount = 0;

  for (let i = 0; i < locationRows.length; i += CHUNK_SIZE) {
    const chunk = locationRows.slice(i, i + CHUNK_SIZE);
    const { error: upsertErr } = await supabase
      .from('locations')
      .upsert(chunk, { onConflict: 'country_code,state,city' });

    if (upsertErr) {
      console.warn(`Batch ${i / CHUNK_SIZE + 1} notice:`, upsertErr.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  console.log(`Successfully upserted ${insertedCount} location rows into public.locations!`);

  // Update existing listings in Supabase to have country='India' and country_code='IN'
  console.log('Migrating existing listings to have country="India", country_code="IN"...');
  const { data: listingsToUpdate } = await supabase
    .from('listings')
    .select('id, state');

  if (listingsToUpdate && listingsToUpdate.length > 0) {
    for (const listing of listingsToUpdate) {
      const stateCodeMap = {
        'Rajasthan': 'RJ',
        'Maharashtra': 'MH',
        'Uttar Pradesh': 'UP',
        'Karnataka': 'KA',
        'Delhi': 'DL',
        'Telangana': 'TS',
        'Tamil Nadu': 'TN',
        'Gujarat': 'GJ',
        'West Bengal': 'WB',
        'Chandigarh': 'CH',
      };
      const stCode = stateCodeMap[listing.state] || null;

      await supabase
        .from('listings')
        .update({
          country: 'India',
          country_code: 'IN',
          ...(stCode ? { state_code: stCode } : {}),
        })
        .eq('id', listing.id);
    }
    console.log(`Migrated ${listingsToUpdate.length} existing listing rows safely.`);
  }

  console.log('=== GLOBAL LOCATION SEEDING COMPLETED ===');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
