'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { formatINR } from '@/lib/utils';
import { CATEGORIES, CategoryType, Listing } from '@/lib/types';
import { ExtractedMetadata } from '@/lib/metadataExtractor';
import { DEMO_LISTINGS } from '@/lib/demoData';
import { INDIAN_STATES } from '@/lib/indianLocations';
import { sanitizeDestinationUrl } from '@/lib/normalization';
import { X, Loader2, Globe, CheckCircle2, ExternalLink, Lock, Trophy, ArrowRight, MapPin, ChevronDown, Check, Search } from 'lucide-react';
import { FALLBACK_COUNTRIES, normalizeCountry, getCountryFlag } from '@/lib/globalLocations';
import { CustomDropdown } from '@/components/CustomDropdown';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRank?: number | null;
  requiredBid?: number;
  targetListing?: Listing | null;
  initialDestination?: string;
  initialCategory?: string;
  initialMetadata?: ExtractedMetadata | null;
  highestBid?: number;
  onBidSuccess: (data: { listing: Listing; newRank: number; amountPaid: number }) => void;
}

export function BidModal({
  isOpen,
  onClose,
  targetRank = 1,
  requiredBid = 99,
  targetListing = null,
  initialDestination = '',
  initialCategory = 'Startups',
  initialMetadata = null,
  highestBid = 12500,
  onBidSuccess,
}: BidModalProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [category, setCategory] = useState<CategoryType>('Startups');

  // GEOGRAPHIC LOCATION HIERARCHY
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('IN');
  const [state, setState] = useState('Rajasthan');
  const [city, setCity] = useState('Jaipur');

  // Dynamic Location Lists from Database (pre-populated with solid fallbacks)
  const [countriesList, setCountriesList] = useState<{ name: string; code: string }[]>(
    FALLBACK_COUNTRIES.map((c) => ({ name: c.name, code: c.code }))
  );
  const [statesList, setStatesList] = useState<{ name: string; code?: string }[]>(
    INDIAN_STATES.map((s) => ({ name: s.name }))
  );
  const [citiesList, setCitiesList] = useState<string[]>(
    INDIAN_STATES.find((s) => s.name === 'Rajasthan')?.cities || ['Jaipur', 'Jodhpur', 'Udaipur']
  );
  const [isCustomCity, setIsCustomCity] = useState(false);

  const [amount, setAmount] = useState<number>(requiredBid);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [cityListings, setCityListings] = useState<any[]>([]);

  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(initialMetadata);
  const [isFetchingMeta, setIsFetchingMeta] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [suggestedLocation, setSuggestedLocation] = useState<{ country: string; countryCode: string; state: string; city: string } | null>(null);

  const [statusState, setStatusState] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [finalRank, setFinalRank] = useState<number>(1);
  const [finalPaid, setFinalPaid] = useState<number>(requiredBid);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);

  // Load countries dynamically
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch('/api/locations?type=countries');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCountriesList(json.data);
        }
      } catch (err) {
        console.warn('Failed to fetch countries:', err);
      }
    }
    fetchCountries();
  }, []);

  // Explicit Country Change Handler (resets State and City)
  const handleCountryChange = async (newCountry: string) => {
    setCountry(newCountry);
    const norm = normalizeCountry(newCountry);
    setCountryCode(norm.code);
    setIsCustomCity(false);
    setIsCustomMode(false);
    setCustomAmount('');

    try {
      const res = await fetch(`/api/locations?type=states&country=${encodeURIComponent(newCountry)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setStatesList(json.data);
        const firstState = json.data[0].name;
        setState(firstState);

        // Fetch cities for new first state
        const cRes = await fetch(`/api/locations?type=cities&country=${encodeURIComponent(newCountry)}&state=${encodeURIComponent(firstState)}`);
        const cJson = await cRes.json();
        if (cJson.success && Array.isArray(cJson.data) && cJson.data.length > 0) {
          const names = cJson.data.map((c: any) => c.city);
          setCitiesList(names);
          setCity(names[0] || '');
        } else {
          setCitiesList([]);
          setCity('');
        }
      } else {
        setStatesList([]);
        setState('');
        setCitiesList([]);
        setCity('');
      }
    } catch (err) {
      console.warn('Failed to switch country:', err);
    }
  };

  // Explicit State Change Handler (resets City)
  const handleStateChange = async (newState: string) => {
    setState(newState);
    setIsCustomCity(false);
    setIsCustomMode(false);
    setCustomAmount('');

    try {
      const cRes = await fetch(`/api/locations?type=cities&country=${encodeURIComponent(country)}&state=${encodeURIComponent(newState)}`);
      const cJson = await cRes.json();
      if (cJson.success && Array.isArray(cJson.data) && cJson.data.length > 0) {
        const names = cJson.data.map((c: any) => c.city);
        setCitiesList(names);
        setCity(names[0] || '');
      } else {
        setCitiesList([]);
        setCity('');
      }
    } catch (err) {
      console.warn('Failed to switch state:', err);
    }
  };

  // Direct load when modal opens
  useEffect(() => {
    if (isOpen) {
      if (targetListing) {
        setDestination(targetListing.destination_normalized);
        setCategory(targetListing.category);
        const c = targetListing.country || 'India';
        const st = targetListing.state || 'Rajasthan';
        const ct = targetListing.city || 'Jaipur';
        setCountry(c);
        setCountryCode(targetListing.country_code || (c === 'India' ? 'IN' : 'US'));
        setState(st);
        setCity(ct);
        setAmount(requiredBid || 100);
        
        // Sync states/cities for target listing
        fetch(`/api/locations?type=states&country=${encodeURIComponent(c)}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.success && Array.isArray(j.data)) setStatesList(j.data);
          })
          .catch(() => {});
        fetch(`/api/locations?type=cities&country=${encodeURIComponent(c)}&state=${encodeURIComponent(st)}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.success && Array.isArray(j.data)) setCitiesList(j.data.map((x: any) => x.city));
          })
          .catch(() => {});
      } else {
        setDestination(initialDestination);
        setCategory((initialCategory as CategoryType) || 'Startups');
        setAmount(requiredBid || 99);
      }
      setMetadata(initialMetadata);
      setIsCustomMode(false);
      setCustomAmount('');
      setStatusState('idle');
      setErrorMsg('');
      setSuggestedLocation(null);
      setIsCustomCity(false);
    }
  }, [isOpen, targetRank, requiredBid, targetListing, initialDestination, initialCategory, initialMetadata]);

  // Sync city listings and recalculate/reset bid amount whenever location (country, state, city) changes
  useEffect(() => {
    if (!isOpen || !city || city === 'All Cities') return;

    let isMounted = true;
    async function syncCityScope() {
      try {
        const res = await fetch(
          `/api/listings?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&all=true`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setCityListings(json.data);
          const max = json.data.length > 0
            ? Math.max(...json.data.map((l: any) => l.cumulativeBid || l.cumulative_amount || l.amount || 0))
            : 0;
          const minReq = max > 0 ? max + 100 : 99;
          
          setAmount(minReq);
          setIsCustomMode(false);
          setCustomAmount('');
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch city scope listings:', err);
      }

      if (isMounted) {
        const fallback = DEMO_LISTINGS.filter(
          (l) =>
            (!country || l.country?.toLowerCase() === country.toLowerCase()) &&
            l.state.toLowerCase() === state.toLowerCase() &&
            l.city.toLowerCase() === city.toLowerCase() &&
            (!category || (category as string) === 'All' || l.category.toLowerCase() === category.toLowerCase())
        );
        setCityListings(fallback);
        const max = fallback.length > 0 ? Math.max(...fallback.map((l) => l.cumulativeBid)) : 0;
        const minReq = max > 0 ? max + 100 : 99;
        
        setAmount(minReq);
        setIsCustomMode(false);
        setCustomAmount('');
      }
    }

    syncCityScope();
    return () => {
      isMounted = false;
    };
  }, [category, country, state, city, isOpen]);

  // Real metadata fetch with 500ms debounce
  useEffect(() => {
    if (!isOpen) return;
    const clean = destination.trim();
    if (!clean) {
      setMetadata(null);
      setSuggestedLocation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingMeta(true);
      setImgError(false);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(clean)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setMetadata(json.data);
          // Suggest location if global keyword matched
          const text = (json.data.title + ' ' + json.data.description).toLowerCase();
          if (text.includes('jaipur')) {
            setSuggestedLocation({ country: 'India', countryCode: 'IN', state: 'Rajasthan', city: 'Jaipur' });
          } else if (text.includes('mumbai')) {
            setSuggestedLocation({ country: 'India', countryCode: 'IN', state: 'Maharashtra', city: 'Mumbai' });
          } else if (text.includes('kanpur')) {
            setSuggestedLocation({ country: 'India', countryCode: 'IN', state: 'Uttar Pradesh', city: 'Kanpur' });
          } else if (text.includes('bengaluru') || text.includes('bangalore')) {
            setSuggestedLocation({ country: 'India', countryCode: 'IN', state: 'Karnataka', city: 'Bengaluru' });
          } else if (text.includes('delhi')) {
            setSuggestedLocation({ country: 'India', countryCode: 'IN', state: 'Delhi', city: 'Delhi' });
          } else if (text.includes('los angeles') || text.includes('california')) {
            setSuggestedLocation({ country: 'United States', countryCode: 'US', state: 'California', city: 'Los Angeles' });
          } else if (text.includes('new york')) {
            setSuggestedLocation({ country: 'United States', countryCode: 'US', state: 'New York', city: 'New York City' });
          } else if (text.includes('london')) {
            setSuggestedLocation({ country: 'United Kingdom', countryCode: 'GB', state: 'England', city: 'London' });
          } else if (text.includes('dubai')) {
            setSuggestedLocation({ country: 'United Arab Emirates', countryCode: 'AE', state: 'Dubai', city: 'Dubai' });
          } else if (text.includes('toronto')) {
            setSuggestedLocation({ country: 'Canada', countryCode: 'CA', state: 'Ontario', city: 'Toronto' });
          }
        } else {
          setMetadata({
            platform: 'website',
            title: clean.replace(/^https?:\/\//, '').split('/')[0],
            description: 'Preview unavailable',
            image: null,
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(clean)}`,
            domain: clean.replace(/^https?:\/\//, '').split('/')[0],
            canonicalUrl: sanitizeDestinationUrl(clean),
            siteName: clean,
            socialLinks: {},
            isFallback: true,
          });
        }
      } catch {
        setMetadata({
          platform: 'website',
          title: clean.replace(/^https?:\/\//, '').split('/')[0],
          description: 'Preview unavailable',
          image: null,
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(clean)}`,
          domain: clean.replace(/^https?:\/\//, '').split('/')[0],
          canonicalUrl: sanitizeDestinationUrl(clean),
          siteName: clean,
          socialLinks: {},
          isFallback: true,
        });
      } finally {
        setIsFetchingMeta(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, isOpen]);

  // GEOGRAPHIC LEADERBOARD DYNAMIC MATH FOR SELECTED CITY/STATE & CATEGORY
  const scopeListings = useMemo(() => {
    if (cityListings.length > 0) return cityListings;
    return DEMO_LISTINGS.filter(
      (l) =>
        (!country || l.country?.toLowerCase() === country.toLowerCase()) &&
        l.state.toLowerCase() === state.toLowerCase() &&
        (city === 'All Cities' || l.city.toLowerCase() === city.toLowerCase()) &&
        (!category || (category as string) === 'All' || l.category.toLowerCase() === category.toLowerCase())
    );
  }, [cityListings, country, state, city, category]);

  const scopeMax = useMemo(() => {
    return scopeListings.length > 0
      ? Math.max(...scopeListings.map((l: any) => l.cumulativeBid || l.cumulative_amount || l.amount || 0))
      : 0;
  }, [scopeListings]);

  const scopeMinRequired = useMemo(() => {
    return scopeMax > 0 ? scopeMax + 100 : 99;
  }, [scopeMax]);

  const currentAmount = isCustomMode ? (Number(customAmount) || 0) : amount;
  const newListingTotal = currentAmount;

  // Calculate Projected Position within selected geographic & category scope
  const scopeTotals = scopeListings.map((l: any) => l.cumulativeBid || l.cumulative_amount || l.amount || 0);
  const higherListingsCount = scopeTotals.filter((tot) => tot > newListingTotal).length;
  const projectedRank = higherListingsCount + 1;

  const quickAmounts = useMemo(() => {
    if (scopeMinRequired === 99) {
      return [99, 250, 500, 1000, 2500];
    }
    return [
      scopeMinRequired,
      scopeMinRequired > 250 ? scopeMinRequired + 250 : 250,
      scopeMinRequired > 500 ? scopeMinRequired + 500 : 500,
      scopeMinRequired > 1000 ? scopeMinRequired + 1000 : 1000,
      2500,
    ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= scopeMinRequired);
  }, [scopeMinRequired]);

  const handleSelectQuick = (amt: number) => {
    setIsCustomMode(false);
    setAmount(amt);
    setErrorMsg('');
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setIsCustomMode(true);
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!destination.trim()) {
      setErrorMsg('Please enter your website URL or @handle');
      return;
    }

    if (!country || !country.trim()) {
      setErrorMsg('Please select a country');
      return;
    }

    if (!state || !state.trim()) {
      setErrorMsg('Please select a state / region');
      return;
    }

    if (!city || !city.trim()) {
      setErrorMsg('Please select or enter a city');
      return;
    }

    if (currentAmount < scopeMinRequired) {
      setErrorMsg(`Minimum required bid to claim #1 position in ${city} is ${formatINR(scopeMinRequired)}`);
      return;
    }

    setStatusState('processing');

    const domain = metadata?.domain || destination.replace(/^https?:\/\//, '').split('/')[0];
    const rawUrl = metadata?.canonicalUrl || sanitizeDestinationUrl(destination);

    // Initiate Dodo Payments checkout session via server API
    try {
      const createRes = await fetch('/api/bids/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: rawUrl,
          title: metadata?.title || domain,
          category,
          country,
          country_code: countryCode,
          state,
          state_code: statesList.find((s) => s.name === state)?.code || null,
          city,
          description: metadata?.description || `Verified business listing in ${city}, ${state}.`,
          avatar_url: metadata?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(domain)}`,
          canonical_url: rawUrl,
          amount: currentAmount,
          bidder_name: 'Verified Builder',
        }),
      });
      const createJson = await createRes.json();

      if (!createJson.success || !createJson.data?.checkout_url) {
        throw new Error(createJson.error || 'Failed to initialize Dodo Payments checkout');
      }

      // Redirect user to official Dodo Payments Hosted Checkout
      window.location.href = createJson.data.checkout_url;
      return;
    } catch (err: any) {
      setStatusState('idle');
      setErrorMsg(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans overflow-y-auto overflow-x-hidden box-border">
      <div className="bg-white w-[calc(100vw-24px)] max-w-lg rounded-3xl shadow-2xl border border-slate-200 relative p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 max-h-[calc(100dvh-24px)] overflow-y-auto overflow-x-hidden text-left mx-auto my-auto box-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* TOP BANNER WITH TARGET POSITION #1 DEFAULT */}
        <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 flex items-center justify-between font-sans">
          <div className="space-y-0.5">
            <div className="text-[10px] font-black text-orange-900 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-orange-500" /> Target Position
            </div>
            <div className="text-2xl font-black text-orange-700 font-sans">
              #{targetRank || 1}
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[10px] font-black text-orange-900 uppercase tracking-wider">
              {city} Scope Min Bid
            </div>
            <div className="text-xl font-black text-orange-700 font-mono">
              {formatINR(scopeMinRequired)}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        {statusState === 'idle' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* DESTINATION INPUT */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                Website / Instagram / X Handle *
              </label>
              <div className="relative flex items-center">
                <Globe className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. yourbusiness.com or @yourbusiness"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* PREVIEW & LOCATION SUGGESTION */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 relative">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-1">
                <span>PREVIEW</span>
                {isFetchingMeta && (
                  <span className="text-orange-500 font-semibold flex items-center gap-1 animate-pulse">
                    Fetching preview...
                  </span>
                )}
              </div>

              {metadata ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-3">
                    {imgError || !metadata.logo ? (
                      <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs flex-shrink-0 font-sans shadow-2xs">
                        {metadata.domain.slice(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={metadata.logo}
                        alt={metadata.title}
                        onError={() => setImgError(true)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover flex-shrink-0 shadow-2xs"
                      />
                    )}

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-slate-900 text-xs truncate">
                          {metadata.title}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 fill-orange-100 flex-shrink-0" />
                      </div>

                      <a
                        href={metadata.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-orange-500 hover:underline inline-flex items-center gap-0.5 truncate font-semibold"
                      >
                        <span>{metadata.domain}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {metadata.description}
                  </p>

                  {/* Detected Location Suggestion Pill */}
                  {suggestedLocation && (
                    <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-2 flex items-center justify-between text-[11px] font-bold text-orange-900 mt-2">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        <span className="truncate">Detected location: {suggestedLocation.city}, {suggestedLocation.state} ({suggestedLocation.country})</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const targetC = suggestedLocation.country;
                          const targetSt = suggestedLocation.state;
                          const targetCt = suggestedLocation.city;
                          setCountry(targetC);
                          setCountryCode(suggestedLocation.countryCode);
                          setState(targetSt);
                          setCity(targetCt);
                          setSuggestedLocation(null);
                          setIsCustomCity(false);

                          try {
                            const sRes = await fetch(`/api/locations?type=states&country=${encodeURIComponent(targetC)}`);
                            const sJson = await sRes.json();
                            if (sJson.success && Array.isArray(sJson.data) && sJson.data.length > 0) {
                              setStatesList(sJson.data);
                            }
                            const cRes = await fetch(`/api/locations?type=cities&country=${encodeURIComponent(targetC)}&state=${encodeURIComponent(targetSt)}`);
                            const cJson = await cRes.json();
                            if (cJson.success && Array.isArray(cJson.data) && cJson.data.length > 0) {
                              setCitiesList(cJson.data.map((x: any) => x.city));
                            }
                          } catch {}
                        }}
                        className="bg-orange-500 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] hover:bg-orange-600 cursor-pointer flex-shrink-0"
                      >
                        Use {suggestedLocation.city}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400 font-medium">
                  Enter your destination to generate preview...
                </div>
              )}
            </div>

            {/* Category selection */}
            <CustomDropdown
              label="Category"
              labelClassName="text-xs font-black text-slate-700 uppercase block"
              value={category}
              placeholder="Select category..."
              searchPlaceholder="Search category..."
              options={CATEGORIES}
              onSelect={(val) => setCategory(val as CategoryType)}
            />

            {/* GEOGRAPHIC LOCATION HIERARCHY SELECTORS (Country -> State -> City) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Business Location
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Country Selector */}
                <CustomDropdown
                  label="Country"
                  value={country}
                  placeholder="Select country..."
                  searchPlaceholder="Search country..."
                  options={countriesList.map((c) => ({
                    name: c.name,
                    code: c.code,
                    flag: getCountryFlag(c.code),
                  }))}
                  onSelect={(val) => handleCountryChange(val)}
                />

                {/* 2. State / Region Selector */}
                <CustomDropdown
                  label="State / Region"
                  value={state}
                  placeholder="Select state..."
                  searchPlaceholder="Search state..."
                  options={statesList.map((s) => ({
                    name: s.name,
                    code: s.code,
                  }))}
                  onSelect={(val) => handleStateChange(val)}
                />

                {/* 3. City Selector */}
                <CustomDropdown
                  label="City"
                  value={city}
                  placeholder="Select city..."
                  searchPlaceholder="Search city..."
                  options={citiesList.map((ct) => ({ name: ct }))}
                  allowCustom={true}
                  isCustomActive={isCustomCity}
                  customButtonText="+ Enter Custom City"
                  onCustomToggle={(active) => {
                    setIsCustomCity(active);
                    if (active) setCity('');
                  }}
                  onCustomChange={(val) => setCity(val)}
                  onSelect={(val) => {
                    setCity(val);
                    setIsCustomCity(false);
                  }}
                />
              </div>
            </div>

            {/* DYNAMIC BID AMOUNT SELECTOR */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700">Select your bid amount</label>
                <span className="text-[11px] text-slate-400 font-semibold font-mono">
                  Min ₹{scopeMinRequired} in {city}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {quickAmounts.map((amt) => {
                  const isSelected = !isCustomMode && amount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectQuick(amt)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isCustomMode
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomMode && (
                <div className="pt-1">
                  <input
                    type="number"
                    min={scopeMinRequired}
                    placeholder={`Enter custom amount in ₹ (min ₹${scopeMinRequired})`}
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-full bg-slate-50 border border-orange-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-sans"
                  />
                </div>
              )}
            </div>

            {/* LIVE CALCULATION BREAKDOWN FOR NEW LISTING IN SELECTED CITY */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs font-medium space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>{city} #1 highest</span>
                <span className="font-bold text-slate-900 font-mono">{formatINR(scopeMax)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>You&apos;re adding (Bid Payment)</span>
                <span className="font-extrabold text-orange-500 font-mono">{formatINR(currentAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
                <span>Your new cumulative total</span>
                <span className="font-black text-slate-900 font-mono">{formatINR(newListingTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Projected position in {city}</span>
                <span className="font-black text-orange-500 font-sans">#{projectedRank}</span>
              </div>
            </div>

            {/* Primary Payment CTA */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <span>PAY {formatINR(currentAmount)} & CLAIM #{projectedRank} IN {city.toUpperCase()} →</span>
            </button>

            {/* Dodo Payments Subtext */}
            <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 pt-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Secure payment powered by Dodo Payments</span>
            </div>
          </form>
        ) : statusState === 'processing' || statusState === 'verifying' ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
            <h4 className="text-xl font-black uppercase text-slate-900">
              {statusState === 'processing' ? 'Initializing Order...' : 'Verifying Server Payment...'}
            </h4>
            <p className="text-slate-500 text-xs font-medium">
              Creating your new listing in {city}, {state}...
            </p>
          </div>
        ) : (
          /* SUCCESS SCREEN AFTER VERIFICATION */
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 font-black text-2xl shadow-xs">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                You&apos;re #{finalRank} in {city} 🎉
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Successfully claimed position #{finalRank} in {city}, {state} with {formatINR(finalPaid)} verified total.
              </p>
            </div>

            {createdListing && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                  #{finalRank}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="font-extrabold text-slate-900 text-xs truncate">
                    {createdListing.title}
                  </div>
                  <div className="text-[11px] font-mono text-orange-500 font-semibold truncate">
                    {createdListing.category} · {createdListing.city}, {createdListing.state}
                  </div>
                </div>
                <div className="font-black text-orange-500 font-mono text-xs">
                  {formatINR(finalPaid)}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>View your position</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
