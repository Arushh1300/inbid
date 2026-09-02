'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Trophy, Menu, X, ChevronRight, Layers, HelpCircle, Info, ShieldCheck, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  onSelectNav?: (nav: string) => void;
  onFocusInput?: () => void;
  onOpenBidModal?: () => void;
}

export function Navbar({ activeTab = 'leaderboard', onSelectNav }: NavbarProps) {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today'>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

  const handleNavClick = (tabName: string) => {
    setIsMobileMenuOpen(false);
    if (onSelectNav) {
      onSelectNav(tabName);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070707]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#222222] shadow-2xs transition-colors duration-200 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left Section: Hamburger Icon (Mobile < md) + Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-6">
          {/* Hamburger Menu Toggle Button (Mobile < md only) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#141414] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
            )}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
            {/* 3-Bar Horizontal Leaderboard Icon */}
            <div className="flex flex-col items-start justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-3.5 sm:w-4 h-1.5 bg-orange-500 rounded-full" />
              <div className="w-5 sm:w-6 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
              <div className="w-7 sm:w-8 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
            </div>

            {/* Brand Logo Text */}
            <span className="font-extrabold text-xl sm:text-3xl tracking-tight text-slate-900 dark:text-white lowercase font-sans">
              inbid<span className="text-orange-500 font-black">.site</span>
            </span>
          </Link>

          {/* Desktop Segmented Pill Control: [ 🏆 All-time ] [ 🔴 Today ] (hidden on mobile < sm) */}
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

        {/* Right Section: Desktop Navigation Links (hidden on mobile < md) & Theme Toggle Button */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300">
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
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent"
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

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-[#222222] bg-slate-50 dark:bg-[#141414] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center flex-shrink-0"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE FLYOUT / SLIDE-DOWN DRAWER MENU (< md) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Drawer Panel */}
          <div className="relative z-10 bg-white dark:bg-[#0c0c0c] border-b border-slate-200 dark:border-[#222222] shadow-2xl p-5 space-y-5 animate-in slide-in-from-top duration-200 font-sans max-h-[90vh] overflow-y-auto">
            {/* Top Bar of Drawer: Logo + Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222222]">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex flex-col items-start justify-center gap-1 w-7 h-7">
                  <div className="w-3.5 h-1.5 bg-orange-500 rounded-full" />
                  <div className="w-5 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
                  <div className="w-7 h-1.5 bg-slate-900 dark:bg-white rounded-full" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white lowercase font-sans">
                  inbid<span className="text-orange-500 font-black">.site</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Filter Segmented Control for Mobile */}
            <div className="flex items-center justify-between bg-orange-50/60 dark:bg-[#141414] p-1.5 rounded-2xl border border-orange-200/50 dark:border-[#222222] text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
                  timeFilter === 'all'
                    ? 'bg-white dark:bg-[#222222] text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Trophy className="w-4 h-4 text-orange-500" />
                <span>All-time</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('today')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans ${
                  timeFilter === 'today'
                    ? 'bg-white dark:bg-[#222222] text-orange-600 dark:text-orange-400 shadow-xs font-extrabold'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Today</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 text-sm font-bold">
              <Link
                href="/"
                onClick={() => handleNavClick('leaderboard')}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-4.5 h-4.5 text-orange-500" />
                  <span>Leaderboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/categories"
                onClick={() => handleNavClick('categories')}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'categories'
                    ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4.5 h-4.5 text-orange-500" />
                  <span>Categories</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onSelectNav) {
                    onSelectNav('how-it-works');
                  } else {
                    window.location.href = '/#how-it-works';
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4.5 h-4.5 text-orange-500" />
                  <span>How it works</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <Link
                href="/about"
                onClick={() => handleNavClick('about')}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'about'
                    ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-600 dark:text-orange-400 font-extrabold border border-orange-200/60 dark:border-[#4a1d0b]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4.5 h-4.5 text-orange-500" />
                  <span>About</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/rules"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-500" />
                  <span>Leaderboard Rules</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/terms"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4.5 h-4.5 text-orange-500" />
                  <span>Terms & Privacy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
