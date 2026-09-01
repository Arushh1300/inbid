'use client';

import React from 'react';
import { DEMO_CATEGORIES, DemoListing } from '@/lib/demoData';
import { formatINR } from '@/lib/utils';
import { Layers, Rocket, Cpu, Laptop, Utensils, Coffee, Scissors, Hotel, ShoppingBag, Gem, Home, Palette, Briefcase, Video, Code, ShoppingCart, Film, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: string;
  listings: DemoListing[];
  onSelectCategory: (catName: string) => void;
  onOpenHowItWorks: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Rocket,
  Cpu,
  Laptop,
  Utensils,
  Coffee,
  Scissors,
  Hotel,
  ShoppingBag,
  Gem,
  Home,
  Palette,
  Briefcase,
  Video,
  Code,
  ShoppingCart,
  Film,
  Sparkles,
};

export function CategorySidebar({
  selectedCategory,
  listings,
  onSelectCategory,
  onOpenHowItWorks,
}: CategorySidebarProps) {
  const isAllSelected = !selectedCategory || selectedCategory.toLowerCase() === 'all';

  return (
    <aside className="w-full space-y-4 font-sans">
      {/* Category Directory Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-2.5">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Explore Categories
          </span>
          <span className="text-[10px] font-extrabold text-orange-600 font-mono">
            {listings.length} live
          </span>
        </div>

        {/* Categories List (Scrollable on desktop, horizontal menu on mobile) */}
        <div className="space-y-1 max-h-[640px] overflow-y-auto scrollbar-none">
          {DEMO_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Layers;
            const isSelected =
              (cat.id === 'all' && isAllSelected) ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.id.toLowerCase();

            // Calculate REAL highest bid and count from active listings
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
                onClick={() => onSelectCategory(cat.id === 'all' ? 'All' : cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50 text-orange-700 font-extrabold border border-orange-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.name}</span>
                </div>

                <span className="font-mono text-xs text-slate-400 font-medium flex-shrink-0 ml-2">
                  {count > 0 ? `— ${formatINR(highestBid)}` : '— 0'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom How It Works Widget */}
      <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-4.5 space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-900">
          <HelpCircle className="w-4 h-4 text-orange-500" />
          <span>How it works</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Bid, climb the ranks, get discovered & drive real outbound clicks.
        </p>
        <button
          onClick={onOpenHowItWorks}
          className="text-xs font-bold text-orange-600 hover:text-orange-800 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
