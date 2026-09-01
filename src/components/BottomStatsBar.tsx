'use client';

import React, { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';
import { PlatformStats } from '@/lib/types';
import { Layers, CreditCard, MousePointerClick, MapPin } from 'lucide-react';

export function BottomStatsBar() {
  const [stats, setStats] = useState<PlatformStats>({
    live_listings: 0,
    total_bids_amount: 0,
    outbound_clicks: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch {
        // Fallback
      }
    }
    loadStats();
  }, []);

  return (
    <div id="stats" className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#222222] shadow-2xs font-sans">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
        {/* Listings Live */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
            <Layers className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span>Listings Live</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-sans truncate">
            {stats.live_listings.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
            Real-time verified
          </div>
        </div>

        {/* Total Bids */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
            <CreditCard className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span>Total Bids</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-orange-500 font-sans truncate">
            {formatINR(stats.total_bids_amount)}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
            Confirmed payments
          </div>
        </div>

        {/* Outbound Clicks */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
            <MousePointerClick className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span>Outbound Clicks</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-sans truncate">
            {stats.outbound_clicks.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
            Tracked referrals
          </div>
        </div>

        {/* Active Locations */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider truncate">
            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span>Active Locations</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-sans truncate">
            {stats.live_listings > 0 ? 1 : 0}
          </div>
          <div className="text-[10px] font-bold text-slate-400 truncate">
            Across India
          </div>
        </div>
      </div>
    </div>
  );
}
