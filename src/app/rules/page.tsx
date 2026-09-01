'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

function RulesContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-200">
      <Navbar />

      {/* Centered Editorial Container (~860px) */}
      <main className="flex-1 max-w-[860px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <section className="space-y-4 text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-[#1c0d06] px-3 py-1 rounded-full border border-orange-200/60 dark:border-[#4a1d0b]">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> INBID PLATFORM GUIDELINES
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Rules
          </h1>

          <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed font-sans max-w-2xl">
            Simple rules keep InBid fair, competitive and useful for everyone.
          </p>
        </section>

        {/* Rules Content Sections */}
        <div className="space-y-8 text-left border-t border-slate-200/60 dark:border-[#222222] pt-8 font-sans">
          {/* Rule 1 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              1. One business, one listing
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Each business should only create one listing for the same website or social profile within the same category and location.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              2. Real businesses only
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Listings must represent real businesses, products, services, creators or organizations. Do not submit misleading or fabricated listings.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              3. Bids determine ranking
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Leaderboard positions are determined by verified cumulative bids. Higher verified bids rank higher.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              4. Starting bid
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Every new listing starts at ₹99.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              5. Bidding
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              When another business wants to move above an existing listing, it must place a higher cumulative bid.
            </p>
            <div className="bg-slate-100 dark:bg-[#141414] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#222222] text-xs font-medium text-slate-700 dark:text-slate-300">
              <strong className="text-orange-600 dark:text-orange-400 font-bold">Example:</strong> If the current cumulative bid is ₹99, the next bid can be ₹199 or higher.
            </div>
          </div>

          {/* Rule 6 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              6. No manipulation
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Do not use bots, automated traffic, fake clicks, payment abuse, duplicate accounts or other methods intended to manipulate rankings or statistics.
            </p>
          </div>

          {/* Rule 7 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              7. Accurate information
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Business name, website/social profile, category and location should be accurate.
            </p>
          </div>

          {/* Rule 8 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              8. Removal
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              InBid may remove listings that violate these rules, contain misleading information, or abuse the platform.
            </p>
          </div>
        </div>

        {/* Final Small Note */}
        <div className="border-t border-slate-200/60 dark:border-[#222222] pt-6 text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
            These rules may evolve as InBid grows. We will always aim to keep the leaderboard transparent and fair.
          </p>
        </div>
      </main>

      <Footer />
      <CreatorBadge />
    </div>
  );
}

export default function RulesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading Rules...</div>}>
      <RulesContent />
    </Suspense>
  );
}
