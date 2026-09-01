'use client';

import React, { useEffect, useState } from 'react';
import { formatINR, timeAgo } from '@/lib/utils';
import { Activity, ShieldCheck } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  destination: string;
  amount: number;
  timestamp: string;
}

export function LiveActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity');
      const json = await res.json();
      if (json.success && json.data) {
        setActivity(json.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading || activity.length === 0) return null;

  return (
    <section id="activity" className="py-6 max-w-5xl mx-auto px-4">
      <div className="bg-amber-50/60 rounded-3xl p-5 border border-amber-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-700 animate-pulse" />
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider">
              Real Activity Feed
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-amber-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Database Verified
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {activity.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-xs flex items-center gap-3 flex-shrink-0"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                ₹
              </div>
              <div className="text-xs space-y-0.5 font-medium">
                <p className="font-extrabold text-slate-900">
                  {item.title} <span className="text-amber-700 font-black">+{formatINR(item.amount)}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {item.destination} • {timeAgo(item.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
