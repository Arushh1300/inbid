'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { CATEGORIES } from '@/lib/types';
import { ExtractedMetadata } from '@/lib/metadataExtractor';
import { ArrowRight, Globe, Plus, ArrowUpRight } from 'lucide-react';

interface HeroSubmissionBarProps {
  highestBid: number;
  onOpenBidModal: (destination?: string, category?: string, initialMeta?: ExtractedMetadata | null) => void;
}

export function HeroSubmissionBar({ highestBid, onOpenBidModal }: HeroSubmissionBarProps) {
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('Startups');
  const [detectedMeta, setDetectedMeta] = useState<ExtractedMetadata | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // 500ms debounced detection in background while typing on hero bar
  useEffect(() => {
    const clean = destination.trim();
    if (!clean) {
      setDetectedMeta(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(clean)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setDetectedMeta(json.data);
        }
      } catch {
        // Silent fallback
      } finally {
        setIsDetecting(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBidModal(destination.trim(), category, detectedMeta);
  };

  const claimAmountToShow = highestBid > 0 ? highestBid + 100 : 99;

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 font-sans">
      {/* Live visitor status pill */}
      <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-[#222222] text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-full">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span>Live verified board • Real-time leaderboard</span>
        <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
        <button
          onClick={() => {
            const el = document.getElementById('stats');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-slate-800 dark:text-white font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
        >
          <span>see stats</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Headline: Be #1 in your city for ₹99 (if empty) or highestBid + 100 */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
          Be #1 in your city for <span className="text-orange-500 font-extrabold">{formatINR(claimAmountToShow)}</span>
          <button
            onClick={() => onOpenBidModal('', 'Startups', null)}
            className="inline-flex items-center justify-center w-8 h-8 ml-2 sm:ml-3 rounded-full bg-orange-100 dark:bg-[#1c0d06] hover:bg-orange-200 text-orange-700 dark:text-orange-400 transition-colors align-middle cursor-pointer"
            title="Outbid #1"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          New spots start at ₹99. Bid higher to climb the leaderboard.
        </p>
      </div>

      {/* Wide Horizontal Submission Input Bar */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pt-2 space-y-2">
        <div className="bg-white p-2.5 rounded-2xl sm:rounded-full border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Input field */}
          <div className="flex-1 relative flex items-center">
            <Globe className="w-5 h-5 absolute left-4 text-slate-400" />
            <input
              id="hero-destination-input"
              type="text"
              placeholder="Your website URL, @instagram or @x"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-0 rounded-xl sm:rounded-none pl-12 pr-4 py-3.5 text-xs sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono"
            />
          </div>

          {/* Category dropdown */}
          <div className="sm:border-l sm:border-slate-200 sm:pl-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-0 rounded-xl sm:rounded-none px-4 py-3.5 text-xs sm:text-sm font-extrabold text-slate-700 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* BID Button */}
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl sm:rounded-full shadow-xs hover:shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>BID</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle status indicator under bar */}
        {isDetecting && (
          <div className="text-[11px] text-orange-500 font-semibold animate-pulse text-left pl-6">
            Fetching preview...
          </div>
        )}
      </form>
    </div>
  );
}
