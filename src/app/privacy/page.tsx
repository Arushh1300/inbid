'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { ArrowLeft, Lock } from 'lucide-react';

function PrivacyContent() {
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
            <Lock className="w-3.5 h-3.5 text-orange-500" /> PRIVACY &amp; DATA PROTECTION
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Privacy Policy
          </h1>

          <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed font-sans max-w-2xl">
            We respect your privacy and aim to collect only the information needed to operate InBid.
          </p>
        </section>

        {/* Privacy Sections */}
        <div className="space-y-8 text-left border-t border-slate-200/60 dark:border-[#222222] pt-8 font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              1. Information we collect
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Depending on how you use InBid, we may collect information such as:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 space-y-1 font-medium">
              <li>Website or social profile submitted for a listing</li>
              <li>Business name and listing information</li>
              <li>Category and location</li>
              <li>Bid/payment information</li>
              <li>Basic usage and analytics information</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              2. How we use information
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We may use information to:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 space-y-1 font-medium">
              <li>Create and display listings</li>
              <li>Process and verify bids</li>
              <li>Maintain leaderboard rankings</li>
              <li>Track legitimate outbound clicks</li>
              <li>Improve InBid</li>
              <li>Prevent abuse and fraud</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              3. Payments
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Payments are processed through our payment provider. InBid should not store sensitive payment credentials such as full card numbers unless specifically required by the payment provider&apos;s infrastructure.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              4. Public information
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Information submitted as part of a public listing may be displayed publicly on InBid, including business name, website/social profile, category, location, ranking and bid-related information.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              5. Analytics
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We may use analytics and technical information to understand how the platform is being used and improve performance.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              6. Third-party services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              InBid may use third-party services for payments, analytics, hosting or other infrastructure. Their own privacy policies may also apply.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              7. Data security
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We take reasonable measures to protect information, but no internet service can guarantee absolute security.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              8. Your choices
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              If you want to correct or remove information associated with a listing, users can contact InBid through our official contact channels.
            </p>
          </div>

          {/* Section 9 */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              9. Changes to this policy
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              This privacy policy may be updated when InBid&apos;s features or data practices change.
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

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading Privacy Policy...</div>}>
      <PrivacyContent />
    </Suspense>
  );
}
