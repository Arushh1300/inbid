'use client';

import React, { useState } from 'react';
import { DEMO_CATEGORIES, DemoListing } from '@/lib/demoData';
import { formatINR } from '@/lib/utils';
import {
  Layers, Rocket, Cpu, Laptop, Utensils, Coffee, Scissors, Hotel,
  ShoppingBag, Gem, Home, Palette, Briefcase, Video, Code, ShoppingCart,
  Film, Sparkles, HelpCircle, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: string;
  listings: DemoListing[];
  onSelectCategory: (catName: string) => void;
  onOpenHowItWorks: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers, Rocket, Cpu, Laptop, Utensils, Coffee, Scissors, Hotel,
  ShoppingBag, Gem, Home, Palette, Briefcase, Video, Code, ShoppingCart,
  Film, Sparkles,
};

export function CategorySidebar({
  selectedCategory,
  listings,
  onSelectCategory,
  onOpenHowItWorks,
}: CategorySidebarProps) {
  const isAllSelected = !selectedCategory || selectedCategory.toLowerCase() === 'all';
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <aside id="categories" className="w-full space-y-4 font-sans scroll-mt-24">
      {/* Category Directory Card */}
      <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl border border-slate-200 dark:border-[#222222] shadow-2xs overflow-hidden p-3 sm:p-3.5 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222222] mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-[#1c0d06] border border-orange-200/60 dark:border-[#4a1d0b] text-orange-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white font-sans">
              Explore Categories
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 font-mono bg-orange-50 dark:bg-[#1c0d06] px-2 py-0.5 rounded-full border border-orange-200/50 dark:border-[#4a1d0b]">
              {listings.length} live
            </span>

            {/* Mobile Expand/Collapse toggle button (< lg screens) */}
            <button
              type="button"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className="lg:hidden min-w-[32px] min-h-[32px] p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#181818] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle categories list"
            >
              {isMobileExpanded ? (
                <ChevronUp className="w-4 h-4 text-orange-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Selected Category Pill on Mobile when collapsed */}
        <div className="lg:hidden">
          {!isMobileExpanded && (
            <div className="flex items-center justify-between py-2 px-3 bg-orange-50/60 dark:bg-[#1c0d06] rounded-xl border border-orange-200/50 dark:border-[#4a1d0b] mb-2">
              <div className="flex items-center gap-2 text-xs font-black text-orange-700 dark:text-orange-400">
                <span className="text-slate-400">Active:</span>
                <span>{selectedCategory || 'All Categories'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileExpanded(true)}
                className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                View all ({DEMO_CATEGORIES.length}) ↓
              </button>
            </div>
          )}
        </div>

        {/* Categories Vertical List (Always visible on lg desktop; collapsible or scrollable on mobile) */}
        <div className={`space-y-1 ${isMobileExpanded ? 'block' : 'hidden lg:block'} max-h-[600px] overflow-y-auto scrollbar-none pt-1`}>
          {DEMO_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Layers;
            const isSelected =
              (cat.id === 'all' && isAllSelected) ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.id.toLowerCase();

            // Calculate real count and highest bid
            let highestBid = 0;
            let count = 0;

            if (cat.id === 'all') {
              count = listings.length;
              highestBid = listings.length > 0 ? Math.max(...listings.map((l) => l.cumulativeBid)) : 0;
            } else {
              const matched = listings.filter(
                (l) => l.category.toLowerCase() === cat.name.toLowerCase()
              );
              count = matched.length;
              highestBid = count > 0 ? Math.max(...matched.map((l) => l.cumulativeBid)) : 0;
            }

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id === 'all' ? 'All' : cat.name);
                  setIsMobileExpanded(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-sans text-left ${
                  isSelected
                    ? 'bg-orange-50 dark:bg-[#1c0d06] text-orange-700 dark:text-orange-400 font-extrabold border border-orange-200/80 dark:border-[#4a1d0b] shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>

                <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-medium flex-shrink-0 ml-2">
                  {count > 0 ? `— ${formatINR(highestBid)}` : '— ₹0'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom How It Works Widget */}
      <div className="bg-orange-50/50 dark:bg-[#141414] rounded-2xl border border-orange-100 dark:border-[#222222] p-4 space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-900 dark:text-orange-300 font-sans">
          <HelpCircle className="w-4 h-4 text-orange-500" />
          <span>How it works</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Bid, climb the ranks, get discovered & drive real outbound clicks.
        </p>
        <button
          type="button"
          onClick={onOpenHowItWorks}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
