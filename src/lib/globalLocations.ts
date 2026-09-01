export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
}

export interface StateInfo {
  name: string;
  code?: string;
}

export interface CityInfo {
  city: string;
  state: string;
  country: string;
  country_code: string;
}

export const FALLBACK_COUNTRIES: CountryInfo[] = [
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
];

export const POPULAR_GLOBAL_CITIES: CityInfo[] = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', country_code: 'IN' },
  { city: 'Delhi', state: 'Delhi', country: 'India', country_code: 'IN' },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', country_code: 'IN' },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', country_code: 'IN' },
  { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', country_code: 'IN' },
  { city: 'Los Angeles', state: 'California', country: 'United States', country_code: 'US' },
  { city: 'New York City', state: 'New York', country: 'United States', country_code: 'US' },
  { city: 'London', state: 'England', country: 'United Kingdom', country_code: 'GB' },
  { city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', country_code: 'AE' },
  { city: 'Toronto', state: 'Ontario', country: 'Canada', country_code: 'CA' },
  { city: 'Sydney', state: 'New South Wales', country: 'Australia', country_code: 'AU' },
];

export function getCountryFlag(countryCode: string): string {
  const code = (countryCode || '').toUpperCase();
  const flagMap: Record<string, string> = {
    IN: '🇮🇳',
    US: '🇺🇸',
    GB: '🇬🇧',
    AE: '🇦🇪',
    CA: '🇨🇦',
    AU: '🇦🇺',
    DE: '🇩🇪',
    FR: '🇫🇷',
    JP: '🇯🇵',
    SG: '🇸🇬',
    NL: '🇳🇱',
    SE: '🇸🇪',
    CH: '🇨🇭',
    SA: '🇸🇦',
    BR: '🇧🇷',
    ES: '🇪🇸',
    IT: '🇮🇹',
    KR: '🇰🇷',
    MX: '🇲🇽',
  };
  return flagMap[code] || '🌍';
}

export function normalizeCountry(input?: string | null): { name: string; code: string } {
  if (!input) return { name: 'India', code: 'IN' };
  const clean = input.trim().toLowerCase();
  if (clean === 'india' || clean === 'in') return { name: 'India', code: 'IN' };
  if (clean === 'usa' || clean === 'us' || clean === 'united states' || clean === 'united states of america') return { name: 'United States', code: 'US' };
  if (clean === 'uk' || clean === 'gb' || clean === 'united kingdom' || clean === 'great britain') return { name: 'United Kingdom', code: 'GB' };
  if (clean === 'uae' || clean === 'ae' || clean === 'united arab emirates') return { name: 'United Arab Emirates', code: 'AE' };
  if (clean === 'canada' || clean === 'ca') return { name: 'Canada', code: 'CA' };
  if (clean === 'australia' || clean === 'au') return { name: 'Australia', code: 'AU' };
  if (clean === 'germany' || clean === 'de') return { name: 'Germany', code: 'DE' };
  if (clean === 'france' || clean === 'fr') return { name: 'France', code: 'FR' };
  if (clean === 'japan' || clean === 'jp') return { name: 'Japan', code: 'JP' };
  if (clean === 'singapore' || clean === 'sg') return { name: 'Singapore', code: 'SG' };
  if (clean === 'netherlands' || clean === 'nl') return { name: 'Netherlands', code: 'NL' };
  if (clean === 'sweden' || clean === 'se') return { name: 'Sweden', code: 'SE' };
  if (clean === 'switzerland' || clean === 'ch') return { name: 'Switzerland', code: 'CH' };
  if (clean === 'saudi arabia' || clean === 'sa') return { name: 'Saudi Arabia', code: 'SA' };
  return { name: input.trim(), code: 'GLOBAL' };
}
