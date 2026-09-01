'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { ArrowLeft, Scale } from 'lucide-react';

function TermsContent() {
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
            <Scale className="w-3.5 h-3.5 text-orange-500" /> LEGAL &amp; COMPLIANCE
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Terms of Service
          </h1>

          <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed font-sans max-w-2xl">
            By using InBid, you agree to these terms.
          </p>
        </section>

        {/* Terms Sections */}
        <div className="space-y-8 text-left border-t border-slate-200/60 dark:border-[#222222] pt-8 font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              1. Using InBid
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              InBid provides a platform for discovering businesses and participating in a competitive business leaderboard.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              2. Listings
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              You are responsible for ensuring that the information submitted for your listing is accurate and that you have the right to submit the website or social profile.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              3. Bids and payments
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Bids represent payments made to obtain or improve a leaderboard position. All payments must be completed through the available payment provider.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              4. Ranking
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Leaderboard ranking is based on the platform&apos;s verified bidding system. InBid does not guarantee traffic, sales, leads, revenue or business results from any position.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              5. Prohibited use
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              You may not use InBid for fraud, abuse, manipulation, illegal activity, automated attacks, fake traffic or attempts to interfere with the platform.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              6. Third-party websites
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Listings may link to third-party websites and social platforms. InBid is not responsible for their content, availability or policies.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              7. Changes
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              InBid may update these terms as the platform evolves.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              8. Contact
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              For questions regarding these terms, users can contact the InBid team through the official contact method provided on the website.
            </p>
          </div>
        </div>

        {/* Last Updated Date */}
        <div className="border-t border-slate-200/60 dark:border-[#222222] pt-6 text-left font-mono text-xs text-slate-400">
          Last updated: August 2026
        </div>
      </main>

      <Footer />
      <CreatorBadge />
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading Terms...</div>}>
      <TermsContent />
    </Suspense>
  );
}
