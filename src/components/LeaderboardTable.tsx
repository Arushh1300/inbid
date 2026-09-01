'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import { formatINR, timeAgo } from '@/lib/utils';
import { Crown, ExternalLink, Sparkles, MousePointerClick, ArrowUpRight } from 'lucide-react';

interface LeaderboardTableProps {
  listings: Listing[];
  onBoostListing: (listing: Listing) => void;
}

export function LeaderboardTable({ listings, onBoostListing }: LeaderboardTableProps) {
  const handleDestinationClick = async (e: React.MouseEvent, listing: Listing) => {
    e.preventDefault();
    try {
      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      });
    } catch {
      // background
    }

    const targetUrl = /^https?:\/\//i.test(listing.destination_raw)
      ? listing.destination_raw
      : `https://${listing.destination_raw.replace(/^@/, 'x.com/')}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="leaderboard" className="py-8 max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {listings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-700 font-bold text-base">No listings found</p>
            <p className="text-slate-400 text-xs">Be the very first to get your business on the live board!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listings.map((item) => {
              const isRank1 = item.rank === 1;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                    isRank1 ? 'bg-amber-50/30 border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  {/* Rank Number & Avatar & Info */}
                  <div className="flex items-center gap-3.5 sm:gap-5 overflow-hidden">
                    {/* Rank Typography */}
                    <div className="w-8 sm:w-10 text-center font-black flex-shrink-0">
                      {isRank1 ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                          <Crown className="w-4.5 h-4.5 fill-slate-950" />
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm sm:text-base font-sans font-black">
                          {item.rank && item.rank < 10 ? `0${item.rank}` : item.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.destination_normalized)}`}
                      alt={item.title}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-200 object-cover flex-shrink-0"
                    />

                    {/* Listing Title, Category, City, Clicks */}
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listing/${item.slug}`}
                          className="font-extrabold text-slate-900 text-base sm:text-lg hover:text-amber-600 transition-colors truncate"
                        >
                          {item.title}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="font-semibold text-slate-700">
                          {item.category} · {item.city || 'India'}
                        </span>
                        <span>•</span>
                        <a
                          href={item.destination_raw}
                          onClick={(e) => handleDestinationClick(e, item)}
                          className="text-amber-700 font-mono hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>{item.destination_normalized}</span>
                          <ExternalLink className="w-3 h-3 text-amber-600" />
                        </a>
                        <span>•</span>
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {item.click_count.toLocaleString()} clicks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cumulative Verified Amount & Boost Action */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-lg sm:text-xl font-sans tracking-tight">
                        {formatINR(item.cumulative_amount)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        updated {timeAgo(item.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onBoostListing(item)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl uppercase transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                        <span className="hidden sm:inline">Boost</span>
                      </button>

                      <Link
                        href={`/listing/${item.slug}`}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                        title="View Listing Page"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
