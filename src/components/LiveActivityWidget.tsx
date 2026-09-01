'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { ActivityEvent } from '@/lib/types';
import { Activity } from 'lucide-react';

export function LiveActivityWidget() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/api/activity?page=1&pageSize=5');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setActivities(json.data);
        }
      } catch {
        // Fallback
      }
    }
    loadActivity();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-orange-500" /> Live activity
        </h3>

        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
        </span>
      </div>

      {/* Real Activity List Items */}
      {activities.length > 0 ? (
        <div className="space-y-2.5">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-start justify-between gap-2 text-xs font-medium border-b border-slate-100 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded-lg bg-orange-50 text-orange-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  {act.listing_title.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-slate-800 font-bold truncate">
                  {act.event_type === 'position_taken'
                    ? `${act.listing_title} took #1 for ${formatINR(act.amount || 0)}`
                    : act.event_type === 'rank_changed'
                    ? `${act.listing_title} moved #${act.previous_rank || 0} → #${act.new_rank}`
                    : `${act.listing_title} added ${formatINR(act.amount || 0)}`}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                Just now
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-3 text-center text-xs text-slate-400 font-medium">
          No real activity yet. Activity will appear when businesses start bidding.
        </div>
      )}

      {/* View All Activity Link -> Routes to /activity */}
      <div className="pt-1 text-center border-t border-slate-100">
        <Link
          href="/activity"
          className="text-xs font-bold text-orange-600 hover:text-orange-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View all activity →</span>
        </Link>
      </div>
    </div>
  );
}
