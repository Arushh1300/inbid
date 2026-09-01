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

// Popular locations mapping for quick access buttons
export const POPULAR_GLOBAL_CITIES: CityInfo[] = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', country_code: 'IN' },
  { city: 'Delhi', state: 'Delhi', country: 'India', country_code: 'IN' },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', country_code: 'IN' },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', country_code: 'IN' },
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
