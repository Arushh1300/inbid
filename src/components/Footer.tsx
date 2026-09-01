'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-white dark:bg-[#070707] border-t border-slate-200 dark:border-[#222222] py-10 text-xs text-slate-500 dark:text-slate-400 font-sans transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left wordmark & logo icon (Exact Match to Header) */}
          <div className="space-y-1 text-left">
            <Link href="/" className="flex items-center gap-3 group">
              {/* 3-Bar Horizontal Ascending Leaderboard Icon (Identical to Header Logo) */}
              <div className="flex flex-col items-start justify-center gap-1 w-7 h-7 group-hover:scale-105 transition-transform">
                <div className="w-3.5 h-1.5 bg-orange-500 rounded-full" />
                <div className="w-5 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
                <div className="w-7 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
              </div>

              {/* Brand Logo Text */}
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white lowercase font-sans">
                inbid<span className="text-orange-500 font-black">.site</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold pt-0.5">
              India&apos;s live business leaderboard.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-6 font-bold text-slate-600 dark:text-slate-300">
            <Link
              href="/"
              className={`transition-colors ${pathname === '/' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              Leaderboard
            </Link>
            <Link
              href="/categories"
              className={`transition-colors ${pathname === '/categories' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              Categories
            </Link>
            <Link href="/#how-it-works" className="hover:text-orange-500 transition-colors">
              How it works
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${pathname === '/about' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              About
            </Link>
            <Link
              href="/rules"
              className={`transition-colors ${pathname === '/rules' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              Rules
            </Link>
            <Link
              href="/terms"
              className={`transition-colors ${pathname === '/terms' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className={`transition-colors ${pathname === '/privacy' ? 'text-orange-500 font-extrabold' : 'hover:text-orange-500'}`}
            >
              Privacy
            </Link>
            <Link href="/about#stats" className="hover:text-orange-500 transition-colors">
              Live stats
            </Link>
          </div>
        </div>

        {/* Centered Attribution */}
        <div className="pt-6 border-t border-slate-100 dark:border-[#222222] text-center font-semibold text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-1">
          <span>Built by</span>
          <a
            href="https://x.com/ArushDwivediX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 dark:text-white font-extrabold hover:text-orange-500 transition-colors inline-flex items-center gap-0.5"
          >
            <span>@ArushDwivediX</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
