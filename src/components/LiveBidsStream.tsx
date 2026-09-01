'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { DemoListing } from '@/lib/demoData';
import { formatINR } from '@/lib/utils';
import { sanitizeDestinationUrl } from '@/lib/normalization';
import { Radio, ExternalLink } from 'lucide-react';

interface LiveBidsStreamProps {
  listings: DemoListing[];
}

interface CityGroup {
  cityState: string;
  cityName: string;
  stateName: string;
  items: (DemoListing & { cityRank: number })[];
}

export function LiveBidsStream({ listings }: LiveBidsStreamProps) {
  // Local optimistic click count overrides keyed by listing ID
  const [clickOverrides, setClickOverrides] = useState<Record<string, number>>({});

  const handleOutboundClick = useCallback((listingId: string, baseClicks: number) => {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId }),
      keepalive: true,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && typeof json.data?.click_count === 'number') {
          setClickOverrides((prev) => ({ ...prev, [listingId]: json.data.click_count }));
        } else {
          setClickOverrides((prev) => {
            const current = prev[listingId] ?? baseClicks;
            return { ...prev, [listingId]: current + 1 };
          });
        }
      })
      .catch(() => {
        setClickOverrides((prev) => {
          const current = prev[listingId] ?? baseClicks;
          return { ...prev, [listingId]: current + 1 };
        });
      });
  }, []);

  // Group listings by CITY + STATE and compute rank independently inside each city
  const cityGroups = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    const map = new Map<string, DemoListing[]>();

    listings.forEach((item) => {
      const countrySuffix = item.country && item.country !== 'India' ? ` (${item.country})` : '';
      const cityKey = `${item.city || 'Jaipur'}, ${item.state || 'Rajasthan'}${countrySuffix}`;
      if (!map.has(cityKey)) {
        map.set(cityKey, []);
      }
      map.get(cityKey)!.push(item);
    });

    const groups: CityGroup[] = [];

    map.forEach((items, cityKey) => {
      // Sort listings within this city by cumulative bid descending
      const sortedInCity = [...items].sort((a, b) => b.cumulativeBid - a.cumulativeBid);
      const rankedInCity = sortedInCity.map((item, idx) => ({
        ...item,
        cityRank: idx + 1,
      }));

      const first = items[0];
      groups.push({
        cityState: cityKey,
        cityName: first.city || 'Jaipur',
        stateName: first.state || 'Rajasthan',
        items: rankedInCity,
      });
    });

    // Sort city groups by highest bid in that city
    return groups.sort((a, b) => b.items[0].cumulativeBid - a.items[0].cumulativeBid);
  }, [listings]);

  return (
    <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-6 text-left font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#222222] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-500" />
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Bids
            </h3>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Realtime
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Live bidding positions by city
          </p>
        </div>
      </div>

      {/* City Grouped Rankings Stream or Clean Empty State */}
      {cityGroups.length > 0 ? (
        <div className="space-y-6">
          {cityGroups.map((group) => (
            <div
              key={group.cityState}
              className="space-y-2.5 border-b border-slate-100 dark:border-[#222222] last:border-b-0 pb-5 last:pb-0"
            >
              {/* City Group Header: 🟢 Jaipur, Rajasthan */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="tracking-tight">{group.cityState}</span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono">
                  ({group.items.length} {group.items.length === 1 ? 'business' : 'businesses'})
                </span>
              </div>

              {/* City Business Rankings List */}
              <div className="space-y-1.5 sm:pl-4">
                {group.items.map((item) => {
                  const directUrl = sanitizeDestinationUrl(item.url || item.domain || item.id);
                  const isRank1 = item.cityRank === 1;

                  return (
                    <a
                      key={item.id}
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleOutboundClick(item.id, item.clicks)}
                      className="group flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#141414] hover:bg-orange-50/50 dark:hover:bg-[#1c0d06] px-3.5 py-2.5 rounded-xl border border-slate-200/70 dark:border-[#222222] hover:border-orange-300 dark:hover:border-[#4a1d0b] transition-all duration-200 cursor-pointer"
                    >
                      {/* Left: Position Rank Badge in City + Avatar + Title */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge within City (#1, #2, #3...) */}
                        <span
                          className={`text-xs font-mono font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                            isRank1
                              ? 'bg-orange-500 text-white shadow-2xs'
                              : 'bg-slate-200/70 dark:bg-[#222222] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          #{item.cityRank}
                        </span>

                        {/* Logo Avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.avatarUrl}
                          alt={item.title}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#222222] object-cover flex-shrink-0"
                        />

                        {/* Business Title */}
                        <div className="min-w-0 flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-orange-500 transition-colors truncate">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline-block truncate">
                            ({item.domain})
                          </span>
                        </div>
                      </div>

                      {/* Right: Cumulative Bid Amount in City */}
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                          {formatINR(item.cumulativeBid)}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10 text-center space-y-2 bg-slate-50/50 dark:bg-[#141414]/50 rounded-2xl border border-slate-200/60 dark:border-[#222222]">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            No live bids yet.
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            New activity will appear here when businesses start bidding.
          </p>
        </div>
      )}
    </div>
  );
}
