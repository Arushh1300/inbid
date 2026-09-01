'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { Listing } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Rocket,
  Cpu,
  Laptop,
  Utensils,
  Coffee,
  Scissors,
  Building,
  ShoppingBag,
  Gem,
  Home,
  Palette,
  Briefcase,
  Video,
  Code,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Dumbbell,
  Calendar,
  Film,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CategoryItemConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_ITEMS: CategoryItemConfig[] = [
  { id: 'startups', name: 'Startups', icon: Rocket },
  { id: 'ai', name: 'AI', icon: Cpu },
  { id: 'saas', name: 'SaaS', icon: Laptop },
  { id: 'restaurants', name: 'Restaurants', icon: Utensils },
  { id: 'cafes', name: 'Cafés', icon: Coffee },
  { id: 'salons', name: 'Salons', icon: Scissors },
  { id: 'hotels', name: 'Hotels', icon: Building },
  { id: 'fashion', name: 'Fashion', icon: ShoppingBag },
  { id: 'jewellery', name: 'Jewellery', icon: Gem },
  { id: 'realestate', name: 'Real Estate', icon: Home },
  { id: 'interior', name: 'Interior Design', icon: Palette },
  { id: 'agencies', name: 'Agencies', icon: Briefcase },
  { id: 'creators', name: 'Creators', icon: Video },
  { id: 'developers', name: 'Developers', icon: Code },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'healthcare', name: 'Healthcare', icon: HeartPulse },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'events', name: 'Events', icon: Calendar },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
];

function CategoriesContent() {
  const [realListings, setRealListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      try {
        const res = await fetch('/api/listings');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRealListings(json.data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, []);

  // Map real listings to categories
  const categoryData = CATEGORY_ITEMS.map((cat) => {
    const matching = realListings
      .filter((l) => l.category.toLowerCase() === cat.name.toLowerCase() || l.category.toLowerCase() === cat.id.toLowerCase())
      .sort((a, b) => b.cumulative_amount - a.cumulative_amount);

    const topListing = matching.length > 0 ? matching[0] : null;
    const highestBid = topListing ? topListing.cumulative_amount : 0;
    const count = matching.length;

    return {
      ...cat,
      topListing,
      highestBid,
      count,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-200">
      <Navbar activeTab="categories" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
        <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-[#222222] shadow-2xs space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-[#1c0d06] px-3 py-1 rounded-full border border-orange-200 dark:border-[#4a1d0b]">
            <Layers className="w-3.5 h-3.5 text-orange-500" /> Marketplace Taxonomy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Categories
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            Every category has its own ranking. Pick one to see who leads it.
          </p>
        </div>

        {/* Category Grid (3 columns desktop, 2 tablet, 1 mobile) */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase text-slate-400">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryData.map((cat) => {
              const IconComp = cat.icon;

              return (
                <Link
                  key={cat.id}
                  href={`/?category=${encodeURIComponent(cat.id)}`}
                  className="block bg-white dark:bg-[#0d0d0d] rounded-2xl p-5 border border-slate-200 dark:border-[#222222] shadow-2xs hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500/80 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer text-left space-y-4"
                >
                  {/* Top Row: Icon, Title & Highest Bid Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-orange-50 dark:bg-[#1c0d06] border border-orange-200/60 dark:border-[#4a1d0b] text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate font-sans">
                          {cat.name}
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                          {cat.count} {cat.count === 1 ? 'listing' : 'listings'}
                        </span>
                      </div>
                    </div>

                    {/* Highest Bid Pill */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-black text-orange-500 bg-orange-50 dark:bg-[#1c0d06] border border-orange-200/60 dark:border-[#4a1d0b] px-2.5 py-1 rounded-full">
                        {cat.highestBid > 0 ? formatINR(cat.highestBid) : '₹0'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Preview (#1 Leading Business or Clean Empty State) */}
                  {cat.topListing ? (
                    <div className="bg-slate-50 dark:bg-[#141414] rounded-xl p-3 border border-slate-100 dark:border-[#222222] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.topListing.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cat.topListing.destination_normalized)}`}
                          alt={cat.topListing.title}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#222222] object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="font-extrabold text-slate-900 dark:text-white truncate">
                            {cat.topListing.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                            {cat.topListing.destination_normalized}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-black text-orange-500 bg-orange-100 dark:bg-[#2a1710] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5" /> #1
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/60 dark:bg-[#141414]/60 rounded-xl p-3 border border-slate-100 dark:border-[#222222] flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <span>No listings yet</span>
                      <span className="text-orange-500 font-bold flex items-center gap-0.5 text-[11px]">
                        <span>Claim #1 for ₹99</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <CreatorBadge />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading Categories...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
