'use client';

import React, { useState, useCallback } from 'react';
import { DemoListing } from '@/lib/demoData';
import { LocationSelector } from '@/components/LocationSelector';
import { formatINR } from '@/lib/utils';
import { sanitizeDestinationUrl } from '@/lib/normalization';
import { Crown, ExternalLink, MousePointerClick, Tag, ArrowRight, Sparkles, Trophy } from 'lucide-react';

interface MarketplaceLeaderboardProps {
  selectedCategory: string;
  selectedCountry?: string;
  selectedState: string;
  selectedCity: string;
  listings: DemoListing[];
  totalListings: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  topScopeLimit?: 'all' | 10 | 20;
  onSelectTopScope?: (limit: 'all' | 10 | 20) => void;
  onPageChange: (newPage: number) => void;
  onSelectLocation: (country: string, state: string, city: string) => void;
  onOpenClaimModal: (targetRank: number, requiredBid: number, category?: string) => void;
  onOpenBidModal: (destination?: string, category?: string) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export function MarketplaceLeaderboard({
  selectedCategory,
  selectedCountry = 'All Countries',
  selectedState,
  selectedCity,
  listings,
  totalListings,
  currentPage,
  totalPages,
  pageSize,
  topScopeLimit = 'all',
  onSelectTopScope,
  onPageChange,
  onSelectLocation,
  onOpenClaimModal,
  onOpenBidModal,
}: MarketplaceLeaderboardProps) {
  const isAllCat = !selectedCategory || selectedCategory.toLowerCase() === 'all';
  const categoryHeaderTitle = isAllCat ? 'All Businesses' : selectedCategory;

  const isGlobal = !selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global';
  const locationHeaderSubtitle = isGlobal
    ? 'Global · All Countries'
    : selectedState === 'All States'
    ? `${selectedCountry} · All Cities`
    : selectedCity === 'All Cities'
    ? `${selectedState} (${selectedCountry})`
    : `${selectedCity}, ${selectedState} (${selectedCountry})`;

  const startListingNum = totalListings > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endListingNum = Math.min(currentPage * pageSize, totalListings);

  // Local optimistic click count overrides keyed by listing ID.
  // When a click is tracked successfully, we increment this immediately so the UI updates.
  const [clickOverrides, setClickOverrides] = useState<Record<string, number>>({});

  const handleOutboundClick = useCallback((listingId: string, baseClicks: number) => {
    // Guard: mark as in-flight to prevent double-counting from rapid clicks
    setClickOverrides((prev) => {
      const current = prev[listingId] ?? baseClicks;
      return { ...prev, [listingId]: current }; // no change yet, will update after API
    });

    // Fire click tracking POST — never block navigation
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId }),
      keepalive: true, // ensure request completes even if page unloads
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && typeof json.data?.click_count === 'number') {
          // Use authoritative count from server
          setClickOverrides((prev) => ({ ...prev, [listingId]: json.data.click_count }));
        } else {
          // Optimistic +1 if server didn't return count
          setClickOverrides((prev) => {
            const current = prev[listingId] ?? baseClicks;
            return { ...prev, [listingId]: current + 1 };
          });
        }
      })
      .catch(() => {
        // Tracking failed — still update optimistically so UX isn't broken
        setClickOverrides((prev) => {
          const current = prev[listingId] ?? baseClicks;
          return { ...prev, [listingId]: current + 1 };
        });
      });
  }, []);

  const handleClaimClick = (e: React.MouseEvent, item: DemoListing, claimAmount: number) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenClaimModal(item.rank, claimAmount, item.category);
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Leaderboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d0d0d] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#222222] shadow-2xs">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
              {categoryHeaderTitle}
            </h2>
            <span className="bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-[#4a1d0b] text-xs font-black px-2.5 py-0.5 rounded-full">
              {totalListings} {totalListings === 1 ? 'Listing' : 'Listings'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Live verified rankings for <strong className="text-slate-700 dark:text-slate-200">{locationHeaderSubtitle}</strong>. Sorted by cumulative bid.
          </p>
        </div>

        {/* Top Scope Segment & Location Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Top Filter Segment: [ All ] [ Top 10 ] [ Top 20 ] */}
          {onSelectTopScope && (
            <div className="flex items-center bg-slate-100 dark:bg-[#141414] p-1 rounded-xl border border-slate-200/80 dark:border-[#222222] text-xs font-bold font-sans">
              <button
                type="button"
                onClick={() => onSelectTopScope('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  topScopeLimit === 'all'
                    ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onSelectTopScope(10)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  topScopeLimit === 10
                    ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Top 10
              </button>
              <button
                type="button"
                onClick={() => onSelectTopScope(20)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  topScopeLimit === 20
                    ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Top 20
              </button>
            </div>
          )}

          {/* Location Selector */}
          <LocationSelector
            selectedCountry={selectedCountry}
            selectedState={selectedState}
            selectedCity={selectedCity}
            onSelectLocation={onSelectLocation}
          />
        </div>
      </div>

      {/* Leaderboard Cards Stream or Clean Empty State */}
      {listings.length > 0 ? (
        <div className="space-y-4 pt-2">
          {listings.map((item) => {
            const isRank1 = item.rank === 1;
            const directUrl = sanitizeDestinationUrl(item.url || item.domain || item.id);
            const claimRequiredAmount = item.cumulativeBid + 100;
            // Use local optimistic override if set, otherwise use server-fetched count
            const displayClicks = clickOverrides[item.id] ?? item.clicks;

            return (
              <a
                key={item.id}
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleOutboundClick(item.id, item.clicks)}
                className={`block bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md hover:border-orange-400 group relative space-y-3 cursor-pointer text-left ${
                  isRank1
                    ? 'border-orange-500/80 shadow-xs dark:bg-[#0d0d0d]'
                    : 'border-slate-200 dark:border-[#222222] shadow-2xs'
                }`}
              >
                {/* Outbid-style floating claim tooltip */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-200 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => handleClaimClick(e, item, claimRequiredAmount)}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-sans whitespace-nowrap border border-orange-400"
                  >
                    <Trophy className="w-3 h-3 text-amber-300" />
                    <span>Claim #{item.rank} for {formatINR(claimRequiredAmount)}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      {isRank1 ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-2xs">
                          <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-slate-300 font-black text-[11px] sm:text-xs flex items-center justify-center font-sans border border-slate-200 dark:border-[#2a2a2a]">
                          #{item.rank}
                        </div>
                      )}
                    </div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.avatarUrl}
                      alt={item.title}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2a2a2a] object-cover flex-shrink-0 shadow-2xs"
                    />

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-orange-500 transition-colors truncate font-sans">
                          {item.title}
                        </h3>
                        {item.badge && (
                          <span className="hidden sm:inline-block bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-orange-200 dark:border-[#4a1d0b] flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <span className="text-orange-600 dark:text-orange-400 font-extrabold group-hover:underline inline-flex items-center gap-1 truncate">
                          {item.domain}
                          <ExternalLink className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-400 dark:text-slate-500 font-sans font-medium text-[11px] truncate">
                          {item.daysAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left xs:text-right flex-shrink-0 space-y-0.5 pt-1 xs:pt-0 border-t xs:border-t-0 border-slate-100 dark:border-[#1a1a1a]">
                    <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                      {formatINR(item.cumulativeBid)}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Cumulative Bid
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1 border-t border-slate-100 dark:border-[#222222] text-slate-400">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-[#141414] px-2.5 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300">
                      <Tag className="w-3 h-3 text-slate-400" /> {item.category}
                    </span>
                    <span>•</span>
                    <span>{item.city}, {item.state}</span>
                  </div>

                  <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3 text-orange-500" />
                    <span>
                      {displayClicks.toLocaleString()} {displayClicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        /* Clean Empty State */
        <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-[#222222] text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-[#1c0d06] text-orange-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No listings yet in {locationHeaderSubtitle}.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              Be the first business to claim a position in {locationHeaderSubtitle}. Starting bid is ₹99.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenBidModal('', selectedCategory)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer font-sans"
          >
            <span>Claim #1 for ₹99 →</span>
          </button>
        </div>
      )}

      {/* DYNAMIC PAGINATION CONTROLS (50 per page default) */}
      {topScopeLimit === 'all' && totalListings > 0 && (
        <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#222222] shadow-2xs flex flex-col items-center justify-center gap-3 font-sans max-w-full">
          {/* Page Numbers & Arrows: ‹   1   2   3   4   ...   40   › */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs font-bold max-w-full overflow-x-auto py-1 px-1 scrollbar-none">
              {/* Previous Arrow */}
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#0d0d0d] hover:bg-slate-50 dark:hover:bg-[#141414] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                ‹
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((p, idx) => {
                if (typeof p === 'number') {
                  const isActive = p === currentPage;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white font-extrabold shadow-2xs'
                          : 'border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#0d0d0d] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                return (
                  <span key={idx} className="px-1 text-slate-400 dark:text-slate-600 font-mono">
                    ...
                  </span>
                );
              })}

              {/* Next Arrow */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#0d0d0d] hover:bg-slate-50 dark:hover:bg-[#141414] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                ›
              </button>
            </div>
          )}

          {/* Current Listing Count Range: "1 – 50 of 1952" */}
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
            {startListingNum} – {endListingNum} of {totalListings}
          </div>
        </div>
      )}
    </div>
  );
}
