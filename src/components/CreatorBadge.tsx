'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles, ExternalLink, Globe } from 'lucide-react';

export function CreatorBadge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 font-sans">
      {/* 1. EXPANDED CREATOR PROFILE CARD (Pop-over above badge) */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-xl space-y-4 text-left animate-in slide-in-from-bottom-3 fade-in duration-200 relative">
          {/* Close X Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white w-7 h-7 rounded-full bg-slate-100 dark:bg-[#181818] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Profile Header (Rebalanced without avatar) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between gap-2 pr-6">
              <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight truncate">
                Arush Dwivedi
              </h4>
              <span className="inline-block text-[11px] font-bold uppercase text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-[#1c0d06] px-2.5 py-0.5 rounded-md border border-orange-200/80 dark:border-[#4a1d0b] tracking-wider flex-shrink-0">
                FOUNDER & BUILDER
              </span>
            </div>
            <p className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">
              @ArushDwivediX
            </p>
          </div>

          {/* Short Bio */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            &quot;Building products and experimenting with the internet.&quot;
          </p>

          {/* Social Media Links Row (X, Instagram, LinkedIn) */}
          <div className="flex items-center gap-2 pt-0.5">
            {/* 1. X Link */}
            <a
              href="https://x.com/ArushDwivediX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#181818] hover:bg-orange-50 dark:hover:bg-[#2a1710] text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200/80 dark:border-[#222222] flex items-center justify-center transition-colors cursor-pointer"
              title="X → @ArushDwivediX"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* 2. Instagram Link */}
            <a
              href="https://instagram.com/aarushbuilds"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#181818] hover:bg-orange-50 dark:hover:bg-[#2a1710] text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200/80 dark:border-[#222222] flex items-center justify-center transition-colors cursor-pointer"
              title="Instagram → @aarushbuilds"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* 3. LinkedIn Link */}
            <a
              href="https://linkedin.com/in/arushdwivedi07"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#181818] hover:bg-orange-50 dark:hover:bg-[#2a1710] text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200/80 dark:border-[#222222] flex items-center justify-center transition-colors cursor-pointer"
              title="LinkedIn → @arushdwivedi07"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>

          {/* Primary Connect Button */}
          <a
            href="https://x.com/ArushDwivediX"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-900 dark:bg-[#1c0d06] hover:bg-slate-800 dark:hover:bg-[#2a1710] text-white dark:text-orange-400 font-extrabold text-xs py-2.5 rounded-xl border border-transparent dark:border-[#4a1d0b] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>Connect on X</span>
            <ExternalLink className="w-3 h-3 text-slate-400 dark:text-orange-400" />
          </a>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-[#222222] pt-1" />

          {/* PROJECTS SECTION */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Projects
            </span>

            <div className="space-y-2">
              {/* InBid Project Item */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#141414] hover:bg-orange-50/60 dark:hover:bg-[#1c0d06] border border-slate-200/80 dark:border-[#222222] hover:border-orange-200 dark:hover:border-[#4a1d0b] transition-all cursor-pointer"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 dark:text-white text-xs group-hover:text-orange-600 transition-colors">
                      InBid
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" /> Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    India&apos;s live business leaderboard
                  </p>
                </div>
                <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 flex-shrink-0 ml-2" />
              </Link>

              {/* EasyManage Project Item */}
              <a
                href="https://easymanage.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#141414] hover:bg-orange-50/60 dark:hover:bg-[#1c0d06] border border-slate-200/80 dark:border-[#222222] hover:border-orange-200 dark:hover:border-[#4a1d0b] transition-all cursor-pointer"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 dark:text-white text-xs group-hover:text-orange-600 transition-colors">
                      EasyManage
                    </span>
                    <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-bold">
                      easymanage.in
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" /> Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Business management software
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 flex-shrink-0 ml-2" />
              </a>
            </div>
          </div>

          {/* Bottom Maker Badge */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold border-t border-slate-100 dark:border-[#222222]">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3 h-3 text-orange-500" /> Built by Arush
            </span>
            <span className="font-mono text-orange-600 dark:text-orange-400">inbid.site</span>
          </div>
        </div>
      )}

      {/* 2. FLOATING BOTTOM-RIGHT MAKER BADGE (Default collapsed state) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 bg-white dark:bg-[#0d0d0d] hover:bg-slate-50 dark:hover:bg-[#141414] text-slate-900 dark:text-white border border-slate-200/90 dark:border-[#222222] shadow-md hover:shadow-lg rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          isOpen ? 'ring-2 ring-orange-500/30 border-orange-400' : ''
        }`}
      >
        <span className="font-extrabold text-slate-800 dark:text-slate-200">Built by Arush Dwivedi</span>
        <Sparkles className={`w-3.5 h-3.5 text-orange-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
