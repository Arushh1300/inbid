'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { formatINR } from '@/lib/utils';
import { CATEGORIES, CategoryType, Listing } from '@/lib/types';
import { ExtractedMetadata } from '@/lib/metadataExtractor';
import { DEMO_LISTINGS } from '@/lib/demoData';
import { INDIAN_STATES } from '@/lib/indianLocations';
import { sanitizeDestinationUrl } from '@/lib/normalization';
import { X, Loader2, Globe, CheckCircle2, ExternalLink, Lock, Trophy, ArrowRight, MapPin } from 'lucide-react';

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

  // Dynamic Location Lists from Database
  const [countriesList, setCountriesList] = useState<{ name: string; code: string }[]>([]);
  const [statesList, setStatesList] = useState<{ name: string; code?: string }[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isCustomCity, setIsCustomCity] = useState(false);

  const [amount, setAmount] = useState<number>(requiredBid);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(initialMetadata);
  const [isFetchingMeta, setIsFetchingMeta] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [suggestedLocation, setSuggestedLocation] = useState<{ country: string; countryCode: string; state: string; city: string } | null>(null);

  const [statusState, setStatusState] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [finalRank, setFinalRank] = useState<number>(1);
  const [finalPaid, setFinalPaid] = useState<number>(requiredBid);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);

  // Fetch available countries dynamically on modal open
  useEffect(() => {
    if (!isOpen) return;
    async function fetchCountries() {
      try {
        const res = await fetch('/api/locations?type=countries');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCountriesList(json.data);
        }
      } catch (err) {
        console.warn('Failed to fetch countries:', err);
      }
    }
    fetchCountries();
  }, [isOpen]);

  // Fetch states dynamically when country changes
  useEffect(() => {
    if (!isOpen || !country) return;
    async function fetchStates() {
      try {
        const res = await fetch(`/api/locations?type=states&country=${encodeURIComponent(country)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setStatesList(json.data);
          // If current state not in list, default to first
          const found = json.data.find((s: any) => s.name === state);
          if (!found && json.data.length > 0) {
            setState(json.data[0].name);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch states:', err);
      }
    }
    fetchStates();
  }, [isOpen, country]);

  // Fetch cities dynamically when state changes
  useEffect(() => {
    if (!isOpen || !country || !state) return;
    async function fetchCities() {
      try {
        const res = await fetch(`/api/locations?type=cities&country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const names = json.data.map((c: any) => c.city);
          setCitiesList(names);
          if (!isCustomCity && names.length > 0 && !names.includes(city)) {
            setCity(names[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch cities:', err);
      }
    }
    fetchCities();
  }, [isOpen, country, state, isCustomCity]);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (targetListing) {
        setDestination(targetListing.destination_normalized);
        setCategory(targetListing.category);
        setCountry(targetListing.country || 'India');
        setCountryCode(targetListing.country_code || (targetListing.country === 'India' ? 'IN' : 'US'));
        setState(targetListing.state || 'Rajasthan');
        setCity(targetListing.city || 'Jaipur');
        setAmount(requiredBid || 100);
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

  if (!isOpen) return null;

  // GEOGRAPHIC LEADERBOARD DYNAMIC MATH FOR SELECTED CITY/STATE
  const scopeListings = DEMO_LISTINGS.filter(
    (l) => l.state.toLowerCase() === state.toLowerCase() && (city === 'All Cities' || l.city.toLowerCase() === city.toLowerCase())
  );
  const scopeMax = scopeListings.length > 0 ? Math.max(...scopeListings.map((l) => l.cumulativeBid)) : 0;
  const scopeMinRequired = scopeMax > 0 ? scopeMax + 100 : 99;

  const currentAmount = isCustomMode ? (Number(customAmount) || 0) : amount;
  const newListingTotal = currentAmount;

  // Calculate Projected Position within selected geographic scope
  const scopeTotals = scopeListings.map((l) => l.cumulativeBid);
  const higherListingsCount = scopeTotals.filter((tot) => tot > newListingTotal).length;
  const projectedRank = higherListingsCount + 1;

  const activeStateObj = INDIAN_STATES.find((st) => st.name === state) || INDIAN_STATES[0];

  const quickAmounts = [
    scopeMinRequired,
    scopeMinRequired > 250 ? scopeMinRequired + 250 : 250,
    scopeMinRequired > 500 ? scopeMinRequired + 500 : 500,
    scopeMinRequired > 1000 ? scopeMinRequired + 1000 : 1000,
    2500,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v > 0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!destination.trim()) {
      setErrorMsg('Please enter your website URL or @handle');
      return;
    }

    if (currentAmount < 99) {
      setErrorMsg('Minimum initial bid for a new listing is ₹99');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
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
                        onClick={() => {
                          setCountry(suggestedLocation.country);
                          setCountryCode(suggestedLocation.countryCode);
                          setState(suggestedLocation.state);
                          setCity(suggestedLocation.city);
                          setSuggestedLocation(null);
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
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* GEOGRAPHIC LOCATION HIERARCHY SELECTORS (Country -> State -> City) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Business Location
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Country</span>
                  <select
                    value={country}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setCountry(sel);
                      const cObj = countriesList.find((c) => c.name === sel);
                      if (cObj) setCountryCode(cObj.code);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                  >
                    {countriesList.length > 0 ? (
                      countriesList.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="India">India</option>
                    )}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">State / Region</span>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                  >
                    {statesList.length > 0 ? (
                      statesList.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name} {st.code ? `(${st.code})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value={state}>{state}</option>
                    )}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">City</span>
                  {isCustomCity ? (
                    <div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City name..."
                        className="w-full bg-slate-50 border border-orange-300 rounded-xl px-2 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCity(false)}
                        className="text-[9px] font-bold text-orange-500 hover:underline block pt-0.5"
                      >
                        ← Choose from list
                      </button>
                    </div>
                  ) : (
                    <select
                      value={city}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCity(true);
                          setCity('');
                        } else {
                          setCity(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                    >
                      {citiesList.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                      <option value="__custom__">+ Other (Type City)</option>
                    </select>
                  )}
                </div>
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
