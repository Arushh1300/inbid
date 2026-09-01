'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { formatINR } from '@/lib/utils';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface StatsData {
  live_listings: number;
  total_bids_amount: number;
  outbound_clicks: number;
  active_locations: number;
}

function AboutContent() {
  const [stats, setStats] = useState<StatsData>({
    live_listings: 0,
    total_bids_amount: 0,
    outbound_clicks: 0,
    active_locations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success && json.data) {
          setStats({
            live_listings: json.data.live_listings || 0,
            total_bids_amount: json.data.total_bids_amount || 0,
            outbound_clicks: json.data.outbound_clicks || 0,
            active_locations: json.data.active_locations || 0,
          });
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-200">
      <Navbar activeTab="about" />

      {/* Centered Editorial Container (max-width ~920px) */}
      <main className="flex-1 max-w-[920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 sm:space-y-20">
        
        {/* Back Link & Top Live Stats Pill */}
        <div className="space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Leaderboard</span>
            </Link>
          </div>

          {/* 2. TOP LIVE STATS PILL */}
          <div id="stats" className="text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-white dark:bg-[#0d0d0d] px-3.5 sm:px-4 py-2 rounded-full border border-slate-200/80 dark:border-[#222222] shadow-2xs text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span>1 online</span>
              <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
              <span>{stats.outbound_clicks.toLocaleString()} visitors since launch</span>
              <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
              <a href="#by-the-numbers" className="text-orange-600 dark:text-orange-400 hover:underline font-extrabold">
                see stats &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* 3. HERO / ABOUT SECTION (Open Editorial, No Giant Container) */}
        <section className="space-y-5 text-left max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-[#1c0d06] px-3 py-1 rounded-full border border-orange-200/60 dark:border-[#4a1d0b]">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> PLATFORM OVERVIEW
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            About InBid
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug font-sans">
            InBid is a live business leaderboard where businesses compete for visibility by bidding for positions.
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
            Businesses list their website or social profile, choose a category and location, and bid to climb the leaderboard. Higher verified bids rank higher.
          </p>
        </section>

        {/* 4. HOW IT STARTED (Editorial Narrative, Narrow & Readable) */}
        <section className="space-y-4 text-left max-w-2xl pt-4 border-t border-slate-200/60 dark:border-[#222222]">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How it started
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            InBid started with a simple idea: make business visibility competitive, transparent and measurable.
          </p>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Instead of relying only on opaque algorithms, InBid gives businesses a public leaderboard where position is determined by verified bidding.
          </p>
        </section>

        {/* 5. BY THE NUMBERS (Compact 4-Column Grid) */}
        <section id="by-the-numbers" className="space-y-5 text-left pt-4 border-t border-slate-200/60 dark:border-[#222222]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              By the numbers
            </h2>
            <span className="text-xs font-mono font-bold text-slate-400">Verified Platform Data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Stat 1: Listings */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-1">
              <div className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Listings</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.live_listings}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active businesses</p>
            </div>

            {/* Stat 2: Total Bids */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-1">
              <div className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Total bids</div>
              <div className="text-2xl sm:text-3xl font-black text-orange-500 font-mono">
                {loading ? '...' : formatINR(stats.total_bids_amount)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cumulative volume</p>
            </div>

            {/* Stat 3: Outbound Clicks */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-1">
              <div className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Outbound clicks</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.outbound_clicks.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Direct traffic delivered</p>
            </div>

            {/* Stat 4: Active Locations */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-1">
              <div className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Active locations</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {loading ? '...' : stats.active_locations}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cities &amp; States</p>
            </div>
          </div>
        </section>

        {/* 6. HOW INBID WORKS (2x2 Compact Desktop Grid) */}
        <section className="space-y-6 text-left pt-4 border-t border-slate-200/60 dark:border-[#222222]">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How InBid works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Step 01 */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 border border-slate-200/90 dark:border-[#222222] shadow-2xs space-y-2">
              <div className="text-orange-500 font-black text-base font-mono">
                01
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">List your business</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Submit your website or social profile to create a listing.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 border border-slate-200/90 dark:border-[#222222] shadow-2xs space-y-2">
              <div className="text-orange-500 font-black text-base font-mono">
                02
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Choose category &amp; location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Select the business category and geographic location.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 border border-slate-200/90 dark:border-[#222222] shadow-2xs space-y-2">
              <div className="text-orange-500 font-black text-base font-mono">
                03
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Place your bid</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Start at ₹99 and bid to claim a higher leaderboard position.
              </p>
            </div>

            {/* Step 04 */}
            <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 border border-slate-200/90 dark:border-[#222222] shadow-2xs space-y-2">
              <div className="text-orange-500 font-black text-base font-mono">
                04
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Get discovered</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Customers can discover your business and click through to your website or social profile.
              </p>
            </div>
          </div>
        </section>

        {/* 7. THE IDEA / VALUE SECTION (Visibility has a value.) */}
        <section className="space-y-3 text-left max-w-2xl pt-4 border-t border-slate-200/60 dark:border-[#222222]">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Visibility has a value.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            InBid turns business discovery into a competitive marketplace. The businesses that value visibility the most can compete for the positions customers see first.
          </p>
        </section>

        {/* 8. FOUNDER SECTION (Built by Arush — NO PHOTO/AVATAR) */}
        <section className="space-y-4 text-left pt-4 border-t border-slate-200/60 dark:border-[#222222]">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Built by Arush
            </h2>
            <p className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
              Founder &amp; Builder
            </p>
          </div>

          <p className="text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl leading-relaxed">
            InBid is being built by Arush Dwivedi — founder &amp; builder focused on creating products that make the internet more useful for businesses.
          </p>

          {/* Social Links Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://x.com/ArushDwivediX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#0d0d0d] hover:bg-orange-50 dark:hover:bg-[#1c0d06] text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-200 dark:border-[#222222] transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X — @ArushDwivediX</span>
            </a>

            <a
              href="https://instagram.com/aarushbuilds"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#0d0d0d] hover:bg-orange-50 dark:hover:bg-[#1c0d06] text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-200 dark:border-[#222222] transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Instagram — @aarushbuilds</span>
            </a>

            <a
              href="https://linkedin.com/in/arushdwivedi07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#0d0d0d] hover:bg-orange-50 dark:hover:bg-[#1c0d06] text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-200 dark:border-[#222222] transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn — @arushdwivedi07</span>
            </a>
          </div>
        </section>

      </main>

      <Footer />
      <CreatorBadge />
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading About InBid...</div>}>
      <AboutContent />
    </Suspense>
  );
}
