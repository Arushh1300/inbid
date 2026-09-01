'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { HeroSubmissionBar } from '@/components/HeroSubmissionBar';
import { CategorySidebar } from '@/components/CategorySidebar';
import { MarketplaceLeaderboard } from '@/components/MarketplaceLeaderboard';
import { LiveBidsStream } from '@/components/LiveBidsStream';
import { LiveActivityWidget } from '@/components/LiveActivityWidget';
import { BottomStatsBar } from '@/components/BottomStatsBar';
import { HowItWorksModal } from '@/components/HowItWorksModal';
import { BidModal } from '@/components/BidModal';
import { CreatorBadge } from '@/components/CreatorBadge';
import { SuccessModal } from '@/components/SuccessModal';
import { Footer } from '@/components/Footer';
import { Listing } from '@/lib/types';
import { DEMO_LISTINGS, DemoListing } from '@/lib/demoData';
import { ExtractedMetadata } from '@/lib/metadataExtractor';

function MarketplaceContent() {
  const searchParams = useSearchParams();

  const initialCategoryParam = searchParams.get('category') || 'All';
  const initialPageParam = Number(searchParams.get('page')) || 1;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);

  // GEOGRAPHIC LOCATION FILTERING (Country -> State -> City)
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  // TOP SCOPE FILTERING ([ All ] [ Top 10 ] [ Top 20 ])
  const [topScopeLimit, setTopScopeLimit] = useState<'all' | 10 | 20>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [allListings, setAllListings] = useState<DemoListing[]>([]);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPageParam);

  // Modals state
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Claim modal props state (targetRank defaults to 1)
  const [targetRank, setTargetRank] = useState<number | null>(1);
  const [requiredBid, setRequiredBid] = useState<number>(99);
  const [initialDestination, setInitialDestination] = useState('');
  const [initialCategory, setInitialCategory] = useState('Startups');
  const [initialMetadata, setInitialMetadata] = useState<ExtractedMetadata | null>(null);

  const [successData, setSuccessData] = useState<{
    listing: Listing;
    newRank: number;
    amountPaid: number;
  } | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Fetch real listings from server API on mount/page reload
  useEffect(() => {
    async function fetchServerListings() {
      try {
        const res = await fetch('/api/listings');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: DemoListing[] = json.data.map((l: Listing, idx: number) => ({
            id: l.id,
            rank: idx + 1,
            title: l.title,
            domain: l.destination_normalized,
            url: l.destination_raw || `https://${l.destination_normalized}`,
            description: l.description || '',
            category: l.category,
            country: l.country || 'India',
            state: l.state || 'Rajasthan',
            city: l.city || 'Jaipur',
            cumulativeBid: l.cumulative_amount,
            clicks: l.click_count || 0,
            badge: idx === 0 ? `#1 in ${l.category}` : undefined,
            avatarUrl: l.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(l.destination_normalized)}`,
            daysAgo: 'Just now',
          }));
          setAllListings(mapped);
          const maxVal = mapped.length > 0 ? Math.max(...mapped.map((m) => m.cumulativeBid)) : 0;
          setHighestBid(maxVal);
        }
      } catch {
        // Fallback
      }
    }
    fetchServerListings();
  }, []);

  // Sync state from URL parameters on load/change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const normalized = cat.charAt(0).toUpperCase() + cat.slice(1);
      setSelectedCategory(normalized);
    }
    const page = Number(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Handle return from Dodo Payments checkout
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const orderId = searchParams.get('order_id');

    if (orderId && (paymentStatus === 'success' || !paymentStatus)) {
      async function verifyReturnedPayment() {
        try {
          const res = await fetch('/api/bids/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_order_id: orderId }),
          });
          const json = await res.json();
          if (json.success && json.data?.listing) {
            setSuccessData({
              listing: json.data.listing,
              newRank: json.data.newRank || 1,
              amountPaid: json.data.amountPaid || 99,
            });
            setIsSuccessOpen(true);
            
            // Refresh live listings
            const listRes = await fetch('/api/listings');
            const listJson = await listRes.json();
            if (listJson.success && Array.isArray(listJson.data)) {
              const mapped: DemoListing[] = listJson.data.map((l: Listing, idx: number) => ({
                id: l.id,
                rank: idx + 1,
                title: l.title,
                domain: l.destination_normalized,
                url: l.destination_raw || `https://${l.destination_normalized}`,
                description: l.description || '',
                category: l.category,
                country: l.country || 'India',
                state: l.state || 'Rajasthan',
                city: l.city || 'Jaipur',
                cumulativeBid: l.cumulative_amount,
                clicks: l.click_count || 0,
                badge: idx === 0 ? `#1 in ${l.category}` : undefined,
                avatarUrl: l.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(l.destination_normalized)}`,
                daysAgo: 'Just now',
              }));
              setAllListings(mapped);
              const maxVal = mapped.length > 0 ? Math.max(...mapped.map((m) => m.cumulativeBid)) : 0;
              setHighestBid(maxVal);
            }
          }
        } catch (err) {
          console.warn('Return payment verification notice:', err);
        } finally {
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_status');
            url.searchParams.delete('order_id');
            url.searchParams.delete('session_id');
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
      verifyReturnedPayment();
    }
  }, [searchParams]);

  // Update URL helper without full page refresh
  const updateUrlParams = (catName: string, pageNum: number) => {
    const params = new URLSearchParams();
    if (catName && catName.toLowerCase() !== 'all') {
      params.set('category', catName.toLowerCase());
    }
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    }
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newUrl);
    }
  };

  // Category selection handler (resets page to 1)
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    updateUrlParams(catName, 1);
  };

  // Location selection handler (resets page to 1)
  const handleSelectLocation = (countryName: string, stateName: string, cityName: string) => {
    setSelectedCountry(countryName);
    setSelectedState(stateName);
    setSelectedCity(cityName);
    setCurrentPage(1);
  };

  // Top Scope Limit Selection Handler
  const handleSelectTopScope = (limit: 'all' | 10 | 20) => {
    setTopScopeLimit(limit);
    setCurrentPage(1);
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams(selectedCategory, newPage);
    const el = document.getElementById('leaderboard');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Compute filtered listings by Category AND Geographic Location (Country -> State -> City)
  const isAllCategory = !selectedCategory || selectedCategory.toLowerCase() === 'all';
  const isAllCountry = !selectedCountry || selectedCountry === 'All Countries' || selectedCountry === 'Global';

  const filteredListingsAll = allListings
    .filter((item) => {
      const matchCat = isAllCategory || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchCountry = isAllCountry || (item.country && item.country.toLowerCase() === selectedCountry.toLowerCase());
      const matchState = selectedState === 'All States' || (item.state && item.state.toLowerCase() === selectedState.toLowerCase());
      const matchCity = selectedCity === 'All Cities' || (item.city && item.city.toLowerCase() === selectedCity.toLowerCase());
      const matchSearch = !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.state && item.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.country && item.country.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchCountry && matchState && matchCity && matchSearch;
    })
    .sort((a, b) => b.cumulativeBid - a.cumulativeBid);

  // Apply Top Scope Filter Limit
  let scopedListings = filteredListingsAll;
  if (topScopeLimit === 10) {
    scopedListings = filteredListingsAll.slice(0, 10);
  } else if (topScopeLimit === 20) {
    scopedListings = filteredListingsAll.slice(0, 20);
  }

  const totalListings = scopedListings.length;
  const pageSize = 50; // 50 listings per page default
  const totalPages = Math.max(1, Math.ceil(totalListings / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const offset = topScopeLimit === 'all' ? (safePage - 1) * pageSize : 0;
  const paginatedListings = (topScopeLimit === 'all'
    ? scopedListings.slice(offset, offset + pageSize)
    : scopedListings
  ).map((item, idx) => ({
    ...item,
    rank: offset + idx + 1, // GLOBAL RANK PRESERVED ACROSS PAGES
  }));

  // FLOW A: CLAIM A SPECIFIC RANK FOR A NEW LISTING
  const handleOpenClaimModal = (rank: number, reqBid: number, cat?: string) => {
    setTargetRank(rank);
    setRequiredBid(reqBid);
    setInitialDestination(''); // ALWAYS EMPTY for new listing!
    setInitialCategory(cat || selectedCategory || 'Startups');
    setInitialMetadata(null);
    setIsBidModalOpen(true);
  };

  // HERO / GET ON THE LEADERBOARD CTA (Defaults targetRank to #1)
  const handleOpenBidModal = (dest?: string, cat?: string, meta?: ExtractedMetadata | null) => {
    // Dynamically compute #1 required bid in current geographic scope
    const topListing = filteredListingsAll.length > 0 ? filteredListingsAll[0] : null;
    const computedReq = topListing ? topListing.cumulativeBid + 100 : 99;

    setTargetRank(1); // ALWAYS DEFAULTS TO #1 POSITION
    setRequiredBid(computedReq);
    setInitialDestination(dest || '');
    setInitialCategory(cat || selectedCategory || 'Startups');
    setInitialMetadata(meta || null);
    setIsBidModalOpen(true);
  };

  // Callback when a new listing is created
  const handleBidSuccess = (result: { listing: Listing; newRank: number; amountPaid: number }) => {
    // Optimistically update local list
    const newDemoItem: DemoListing = {
      id: result.listing.id,
      rank: result.newRank,
      title: result.listing.title,
      domain: result.listing.destination_normalized,
      url: result.listing.destination_raw || `https://${result.listing.destination_normalized}`,
      description: result.listing.description || '',
      category: result.listing.category,
      country: result.listing.country || 'India',
      state: result.listing.state || 'Rajasthan',
      city: result.listing.city || 'Jaipur',
      cumulativeBid: result.listing.cumulative_amount,
      clicks: 0,
      badge: result.newRank === 1 ? `#1 in ${result.listing.category}` : undefined,
      avatarUrl: result.listing.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(result.listing.destination_normalized)}`,
      daysAgo: 'Just now',
    };

    setAllListings((prev) => {
      const existingIdx = prev.findIndex((l) => l.domain === newDemoItem.domain);
      let updatedList = [...prev];
      if (existingIdx >= 0) {
        updatedList[existingIdx] = newDemoItem;
      } else {
        updatedList.push(newDemoItem);
      }
      return updatedList.sort((a, b) => b.cumulativeBid - a.cumulativeBid);
    });

    setSuccessData(result);
    setIsSuccessOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-200">
      {/* Top Header Navbar with Dark Mode Toggle */}
      <Navbar
        activeTab="leaderboard"
        onSelectNav={(nav) => {
          if (nav === 'how-it-works') setIsHowItWorksOpen(true);
        }}
        onFocusInput={() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          input?.focus();
        }}
        onOpenBidModal={() => handleOpenBidModal()}
      />

      {/* Hero Submission Bar */}
      <HeroSubmissionBar
        highestBid={highestBid}
        onOpenBidModal={handleOpenBidModal}
      />

      {/* Main Content Layout: Sidebar + Leaderboard */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Category Filter Sidebar (3 cols) */}
          <div className="lg:col-span-3">
            <CategorySidebar
              selectedCategory={selectedCategory}
              listings={allListings}
              onSelectCategory={handleSelectCategory}
              onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            />
          </div>

          {/* Leaderboard Stream (9 cols) */}
          <div id="leaderboard" className="lg:col-span-9 space-y-8">
            <MarketplaceLeaderboard
              selectedCategory={selectedCategory}
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              selectedCity={selectedCity}
              listings={paginatedListings}
              totalListings={totalListings}
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              topScopeLimit={topScopeLimit}
              onSelectTopScope={handleSelectTopScope}
              onPageChange={handlePageChange}
              onSelectLocation={handleSelectLocation}
              onOpenClaimModal={handleOpenClaimModal}
              onOpenBidModal={handleOpenBidModal}
            />

            {/* SEPARATE LIVE BIDS STREAM COMPONENT */}
            <LiveBidsStream listings={filteredListingsAll} />

            {/* Live Activity Feed */}
            <div id="activity">
              <LiveActivityWidget />
            </div>

            {/* Platform Stats Bar */}
            <BottomStatsBar />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Creator Attribution Badge & Profile Card */}
      <CreatorBadge />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenBidModal={() => {
          setIsHowItWorksOpen(false);
          setIsBidModalOpen(true);
        }}
      />

      {/* Clean Centered Interactive Bidding Modal for NEW LISTING CLAIM */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        targetRank={targetRank}
        requiredBid={requiredBid}
        initialDestination={initialDestination}
        initialCategory={initialCategory}
        initialMetadata={initialMetadata}
        highestBid={highestBid}
        onBidSuccess={handleBidSuccess}
      />

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          listing={successData.listing}
          newRank={successData.newRank}
          amountPaid={successData.amountPaid}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center text-xs font-bold text-slate-500">Loading Leaderboard...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
