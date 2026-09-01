'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { ActivityEvent, PaginatedResult } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Activity, ArrowLeft, Trophy, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

function ActivityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;
  const [data, setData] = useState<PaginatedResult<ActivityEvent>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      try {
        const res = await fetch(`/api/activity?page=${currentPage}&pageSize=20`);
        const json = await res.json();
        if (json.success) {
          setData({
            data: json.data,
            total: json.total,
            page: json.page,
            pageSize: json.pageSize,
            totalPages: json.totalPages,
          });
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    router.push(`/activity?page=${newPage}`);
  };

  const startCount = (data.page - 1) * data.pageSize + 1;
  const endCount = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-700 bg-orange-50 px-3 py-0.5 rounded-full border border-orange-200">
            <Activity className="w-3.5 h-3.5 text-orange-500" /> Real-time Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            Live Activity
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Real-time activity from India&apos;s InBid marketplace. Only confirmed verified bids appear.
          </p>
        </div>

        {/* Activity Items List or Empty State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase text-slate-400">Loading activity feed...</p>
          </div>
        ) : data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {act.listing_title.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {act.listing_title}
                      </span>
                      {act.category && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {act.category}
                        </span>
                      )}
                      {act.new_rank === 1 && (
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> #1 Position
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {act.event_type === 'position_taken'
                        ? `Took #1 position with a confirmed bid of ${formatINR(act.amount || 0)}`
                        : act.event_type === 'rank_changed'
                        ? `Climbed from #${act.previous_rank || 0} → #${act.new_rank} after adding ${formatINR(act.amount || 0)}`
                        : `Placed a confirmed bid of ${formatINR(act.amount || 0)}`}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 sm:self-center">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {formatDate(act.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-2xs">
            <Sparkles className="w-10 h-10 text-orange-500 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">No activity yet.</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Activity will appear when real businesses start bidding.
            </p>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {data.total > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
            <div>
              Showing {startCount}–{endCount} of {data.total} activities
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  disabled={data.page <= 1}
                  onClick={() => handlePageChange(data.page - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-slate-900 font-black font-mono">
                  Page {data.page} of {data.totalPages}
                </span>

                <button
                  disabled={data.page >= data.totalPages}
                  onClick={() => handlePageChange(data.page + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <CreatorBadge />
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">Loading Live Activity...</div>}>
      <ActivityContent />
    </Suspense>
  );
}
