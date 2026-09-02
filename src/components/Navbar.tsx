'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Trophy } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  onSelectNav?: (nav: string) => void;
  onFocusInput?: () => void;
  onOpenBidModal?: () => void;
}

export function Navbar({ activeTab = 'leaderboard', onSelectNav }: NavbarProps) {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today'>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme: default to LIGHT mode for first-time visitors.
  // Theme preference is only saved in localStorage after manual user action.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle Dark Mode
  const toggleTheme = () => {
    const nextState = !isDarkMode;
    setIsDarkMode(nextState);
    if (nextState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070707]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#222222] shadow-2xs transition-colors duration-200 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Left: Brand Logo & Segmented Pill */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            {/* 3-Bar Horizontal Leaderboard Icon (Left-aligned) */}
            <div className="flex flex-col items-start justify-center gap-1 w-8 h-8 group-hover:scale-105 transition-transform">
              <div className="w-4 h-1.5 bg-orange-500 rounded-full" />
              <div className="w-6 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
              <div className="w-8 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
            </div>

            {/* Brand Logo Text */}
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white lowercase font-sans">
              inbid<span className="text-orange-500 font-black">.site</span>
            </span>
          </Link>

          {/* Segmented Pill Control: [ 🏆 All-time ] [ 🔴 Today ] */}
          <div className="hidden sm:flex items-center bg-orange-50/40 dark:bg-[#141414] p-1 rounded-full border border-orange-200/50 dark:border-[#222222] text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
                timeFilter === 'all'
                  ? 'bg-white dark:bg-[#222222] text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200/60 dark:border-transparent'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-orange-500" />
              <span>All-time</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
                timeFilter === 'today'
                  ? 'bg-white dark:bg-[#222222] text-orange-600 dark:text-orange-400 shadow-xs font-extrabold border border-slate-200/60 dark:border-transparent'
                  : 'text-orange-600 dark:text-orange-400 hover:text-orange-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Today</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Navigation Links & Dark Mode Toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Navigation Links (Leaderboard, Categories, How it works, About) */}
          <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            <Link
              href="/"
              onClick={() => onSelectNav && onSelectNav('leaderboard')}
              className={`transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'border-orange-500 text-orange-500 font-extrabold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/categories"
              className={`transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'categories'
                  ? 'border-orange-500 text-orange-500 font-extrabold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categories
            </Link>
            <button
              type="button"
              onClick={() => onSelectNav ? onSelectNav('how-it-works') : (window.location.href = '/#how-it-works')}
              className="hidden min-[480px]:inline-block hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent"
            >
              How it works
            </button>
            <Link
              href="/about"
              className={`transition-colors cursor-pointer py-1 border-b-2 ${
                activeTab === 'about'
                  ? 'border-orange-500 text-orange-500 font-extrabold'
                  : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Professional Sun/Moon Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#141414] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
