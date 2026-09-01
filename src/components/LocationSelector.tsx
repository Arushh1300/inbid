'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CountryInfo, StateInfo, CityInfo, POPULAR_GLOBAL_CITIES, getCountryFlag, FALLBACK_COUNTRIES, normalizeCountry } from '@/lib/globalLocations';
import { MapPin, ChevronDown, ChevronRight, Check, Search, ArrowLeft, X, Globe, Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  selectedCountry?: string;
  selectedState: string;
  selectedCity: string;
  onSelectLocation: (country: string, state: string, city: string) => void;
}

export function LocationSelector({
  selectedCountry = 'All Countries',
  selectedState,
  selectedCity,
  onSelectLocation,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation hierarchy: level 1 (countries) -> level 2 (states) -> level 3 (cities)
  const [activeCountry, setActiveCountry] = useState<CountryInfo | null>(null);
  const [activeState, setActiveState] = useState<StateInfo | null>(null);

  // Dynamic data states
  const [countries, setCountries] = useState<CountryInfo[]>(FALLBACK_COUNTRIES);
  const [states, setStates] = useState<StateInfo[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<CityInfo[]>([]);

  // Loading indicators
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // In-memory caching for snappy performance
  const statesCache = useRef<Record<string, StateInfo[]>>({});
  const citiesCache = useRef<Record<string, string[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside and Escape key listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 1. Fetch countries on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      try {
        const res = await fetch('/api/locations?type=countries');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted && json.data.length > 0) {
          const mapped: CountryInfo[] = json.data.map((c: any) => ({
            name: c.name,
            code: c.code,
            flag: getCountryFlag(c.code),
          }));
          setCountries(mapped);
        }
      } catch (err) {
        console.warn('Failed to load countries:', err);
      }
    }

    loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch states dynamically when activeCountry changes
  useEffect(() => {
    if (!activeCountry) {
      setStates([]);
      return;
    }

    const countryKey = activeCountry.name;
    if (statesCache.current[countryKey]) {
      setStates(statesCache.current[countryKey]);
      return;
    }

    let isMounted = true;
    async function loadStates() {
      setIsLoadingStates(true);
      try {
        const res = await fetch(`/api/locations?type=states&country=${encodeURIComponent(countryKey)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          statesCache.current[countryKey] = json.data;
          setStates(json.data);
        }
      } catch (err) {
        console.warn('Failed to load states:', err);
      } finally {
        if (isMounted) setIsLoadingStates(false);
      }
    }

    loadStates();
    return () => {
      isMounted = false;
    };
  }, [activeCountry]);

  // 3. Fetch cities dynamically when activeState changes
  useEffect(() => {
    if (!activeCountry || !activeState) {
      setCities([]);
      return;
    }

    const countryName = activeCountry.name;
    const stateName = activeState.name;
    const cacheKey = `${countryName}:${stateName}`;
    if (citiesCache.current[cacheKey]) {
      setCities(citiesCache.current[cacheKey]);
      return;
    }

    let isMounted = true;
    async function loadCities() {
      setIsLoadingCities(true);
      try {
        const res = await fetch(
          `/api/locations?type=cities&country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          const cityNames = json.data.map((c: any) => c.city);
          citiesCache.current[cacheKey] = cityNames;
          setCities(cityNames);
        }
      } catch (err) {
        console.warn('Failed to load cities:', err);
      } finally {
        if (isMounted) setIsLoadingCities(false);
      }
    }

    loadCities();
    return () => {
      isMounted = false;
    };
  }, [activeCountry, activeState]);

  // 4. Server-Side Debounced Search for Cities (Level 1 only)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || activeCountry || activeState) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/locations?type=search&q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSearchResults(json.data);
        }
      } catch (err) {
        console.warn('City search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCountry, activeState]);

  // Compute Display Trigger Label
  const displayLabel = useMemo(() => {
    const isGlobal = !selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global';
    if (isGlobal) {
      return 'Global · All Countries';
    }

    if (!selectedState || selectedState === 'All States') {
      return `${selectedCountry} · All Cities`;
    }
    if (!selectedCity || selectedCity === 'All Cities') {
      return `${selectedState} · All Cities`;
    }
    return `${selectedCity} · ${selectedState}`;
  }, [selectedCountry, selectedState, selectedCity]);

  const activeFlag = useMemo(() => {
    if (!selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global') {
      return '🌍';
    }
    const norm = normalizeCountry(selectedCountry);
    return getCountryFlag(norm.code);
  }, [selectedCountry]);

  // Filtered Countries at Level 1
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (q === 'usa' && c.code === 'US') ||
        (q === 'uk' && c.code === 'GB') ||
        (q === 'uae' && c.code === 'AE')
    );
  }, [countries, searchQuery]);

  // Filtered States at Level 2
  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
    );
  }, [states, searchQuery]);

  // Filtered Cities at Level 3
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, searchQuery]);

  // Selection Handlers (with clean state resets)
  const handleSelectGlobal = () => {
    onSelectLocation('All Countries', 'All States', 'All Cities');
    setActiveCountry(null);
    setActiveState(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleSelectCountryAll = (countryName: string) => {
    onSelectLocation(countryName, 'All States', 'All Cities');
    setActiveCountry(null);
    setActiveState(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleSelectStateAll = (countryName: string, stateName: string) => {
    onSelectLocation(countryName, stateName, 'All Cities');
    setActiveCountry(null);
    setActiveState(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleSelectCity = (countryName: string, stateName: string, cityName: string) => {
    onSelectLocation(countryName, stateName, cityName);
    setActiveCountry(null);
    setActiveState(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleCountryClick = (c: CountryInfo) => {
    setActiveCountry(c);
    setActiveState(null);
    setSearchQuery('');
  };

  const handleStateClick = (st: StateInfo) => {
    setActiveState(st);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative font-sans text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#222222] hover:border-orange-400 dark:hover:border-orange-500/80 rounded-xl px-3.5 py-2 text-xs font-black text-slate-800 dark:text-white shadow-2xs transition-all cursor-pointer group"
      >
        <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
        <span className="truncate max-w-[150px] sm:max-w-[200px]" title={displayLabel}>
          {activeFlag} {displayLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-88 max-w-xs sm:max-w-sm bg-white dark:bg-[#0d0d0d] rounded-2xl shadow-xl border border-slate-200 dark:border-[#222222] z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 font-sans max-h-[85vh] sm:max-h-[32rem] flex flex-col">
          
          {/* Header Navigation / Back Button */}
          <div className="flex items-center justify-between text-xs font-extrabold pb-2 border-b border-slate-100 dark:border-[#222222] flex-shrink-0">
            {activeState ? (
              <button
                type="button"
                onClick={() => {
                  setActiveState(null);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{activeCountry?.name || 'States'}</span>
              </button>
            ) : activeCountry ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCountry(null);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>All Countries</span>
              </button>
            ) : (
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-orange-500" /> Select Location
              </span>
            )}

            <button
              type="button"
              onClick={handleSelectGlobal}
              className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Reset to Global
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeState
                  ? `Search cities in ${activeState.name}...`
                  : activeCountry
                  ? `Search regions in ${activeCountry.name}...`
                  : 'Search country or city...'
              }
              className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#222222] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors font-sans"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
            {!isSearching && searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Body Content with internal scrolling */}
          <div className="overflow-y-auto pr-1 flex-1 max-h-64 sm:max-h-80 space-y-2">
            {activeState && activeCountry ? (
              /* LEVEL 3: CITY SELECTION FOR ACTIVE STATE */
              <div className="space-y-1">
                {/* Option 1: All Cities in this State */}
                <button
                  type="button"
                  onClick={() => handleSelectStateAll(activeCountry.name, activeState.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCountry === activeCountry.name && selectedState === activeState.name && selectedCity === 'All Cities'
                      ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                  }`}
                >
                  <span className="truncate">{activeState.name} · All Cities</span>
                  {selectedCountry === activeCountry.name && selectedState === activeState.name && selectedCity === 'All Cities' && (
                    <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  )}
                </button>

                <div className="pt-1 pb-1 px-1 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Cities in {activeState.name} ({filteredCities.length})</span>
                  {isLoadingCities && <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />}
                </div>

                {isLoadingCities ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    <span>Loading cities...</span>
                  </div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((ct) => {
                    const isSelected = selectedCountry === activeCountry.name && selectedState === activeState.name && selectedCity === ct;
                    return (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => handleSelectCity(activeCountry.name, activeState.name, ct)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 font-extrabold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#141414]'
                        }`}
                      >
                        <span className="truncate">{ct}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No cities matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            ) : activeCountry ? (
              /* LEVEL 2: STATE / PROVINCE / REGION SELECTION FOR ACTIVE COUNTRY */
              <div className="space-y-1">
                {/* Option 1: Entire Country · All Cities */}
                <button
                  type="button"
                  onClick={() => handleSelectCountryAll(activeCountry.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCountry === activeCountry.name && selectedState === 'All States'
                      ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{activeCountry.flag}</span>
                    <span className="truncate">{activeCountry.name} · All Cities</span>
                  </div>
                  {selectedCountry === activeCountry.name && selectedState === 'All States' && (
                    <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  )}
                </button>

                <div className="pt-1 pb-1 px-1 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>States / Regions ({filteredStates.length})</span>
                  {isLoadingStates && <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />}
                </div>

                {isLoadingStates ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    <span>Loading states...</span>
                  </div>
                ) : filteredStates.length > 0 ? (
                  filteredStates.map((st) => {
                    const isStateActive = selectedCountry === activeCountry.name && selectedState === st.name;
                    return (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => handleStateClick(st)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors group/st cursor-pointer ${
                          isStateActive
                            ? 'bg-orange-50/70 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400'
                            : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{st.name}</span>
                          {st.code && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              ({st.code})
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/st:text-orange-500 flex-shrink-0" />
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No states matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            ) : (
              /* LEVEL 1: GLOBAL, POPULAR CITIES & COUNTRIES LIST */
              <div className="space-y-3">
                {/* Search Matching Cities preview if query is present */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-[#222222]">
                    <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 px-1">
                      Direct City Matches ({searchResults.length})
                    </div>
                    {searchResults.map((item) => (
                      <button
                        key={`${item.country_code}-${item.state}-${item.city}`}
                        type="button"
                        onClick={() => handleSelectCity(item.country, item.state, item.city)}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-orange-50/60 dark:hover:bg-[#1c0d06] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm flex-shrink-0">{getCountryFlag(item.country_code)}</span>
                          <div className="truncate">
                            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                              {item.city}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              ({item.state}, {item.country})
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Option 1: Global / All Countries */}
                <button
                  type="button"
                  onClick={handleSelectGlobal}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    (!selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global')
                      ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                      : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span>Global · All Countries</span>
                  </div>
                  {(!selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global') && (
                    <Check className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </button>

                {/* POPULAR GLOBAL CITIES SECTION (Only when no query) */}
                {!searchQuery && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      Popular Global Cities
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {POPULAR_GLOBAL_CITIES.map((pop) => {
                        const isSelected = selectedCountry === pop.country && selectedState === pop.state && selectedCity === pop.city;
                        return (
                          <button
                            key={`${pop.country}-${pop.city}`}
                            type="button"
                            onClick={() => handleSelectCity(pop.country, pop.state, pop.city)}
                            className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-[#4a1d0b]'
                                : 'bg-slate-50 dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-orange-50/50 dark:hover:bg-[#1f1f1f] hover:text-orange-500'
                            }`}
                          >
                            <div className="flex items-center gap-1 truncate">
                              <span className="text-xs">{getCountryFlag(pop.country_code)}</span>
                              <span className="truncate">{pop.city}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-orange-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* COUNTRIES LIST */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center justify-between">
                    <span>Countries ({filteredCountries.length})</span>
                    {isLoadingCountries && <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />}
                  </div>

                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => {
                      const isCountryActive = selectedCountry === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCountryClick(c)}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors group/cnt cursor-pointer ${
                            isCountryActive
                              ? 'bg-orange-50/70 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{c.flag}</span>
                            <span className="truncate">{c.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/cnt:text-orange-500 flex-shrink-0" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No countries matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
