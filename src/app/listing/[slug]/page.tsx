'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CreatorBadge } from '@/components/CreatorBadge';
import { BidModal } from '@/components/BidModal';
import { SuccessModal } from '@/components/SuccessModal';
import { Listing, Bid } from '@/lib/types';
import { DEMO_LISTINGS } from '@/lib/demoData';
import { formatINR, formatDate } from '@/lib/utils';
import { Crown, ExternalLink, MousePointerClick, ArrowLeft, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export default function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    listing: Listing;
    newRank: number;
    amountPaid: number;
  } | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();

        if (json.success && json.data) {
          setListing(json.data);
          setBids(json.bids || []);
        } else {
          setListing(null);
          setBids([]);
        }
      } catch {
        setListing(null);
        setBids([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Handle return from Dodo Payments checkout on listing page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const paymentStatus = url.searchParams.get('payment_status');
    const orderId = url.searchParams.get('order_id');

    if (orderId && (paymentStatus === 'success' || !paymentStatus)) {
      async function verifyListingReturnPayment() {
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
            setListing(json.data.listing);
          }
        } catch (err) {
          console.warn('Listing return payment notice:', err);
        } finally {
          url.searchParams.delete('payment_status');
          url.searchParams.delete('order_id');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        }
      }
      verifyListingReturnPayment();
    }
  }, [slug]);

  const handleBidSuccess = (data: { listing: Listing; newRank: number; amountPaid: number }) => {
    setListing(data.listing);
    setSuccessData(data);
    setIsSuccessOpen(true);
    setIsBidModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase text-slate-400">Loading business details...</p>
          </div>
        ) : listing ? (
          <div className="space-y-6">
            {/* Business Hero Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 pt-1">
                    {listing.rank === 1 ? (
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                        <Crown className="w-5 h-5 fill-white text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center font-sans border border-slate-200">
                        #{listing.rank || '?'}
                      </div>
                    )}
                  </div>

                  {/* Logo Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(listing.destination_normalized)}`}
                    alt={listing.title}
                    className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 object-cover flex-shrink-0 shadow-2xs"
                  />

                  {/* Title, Domain, Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {listing.title}
                      </h1>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      {/* OUTBOUND CLICK TRACKED LINK */}
                      <a
                        href={`/api/click?id=${encodeURIComponent(listing.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline font-extrabold inline-flex items-center gap-1"
                      >
                        <span>{listing.destination_normalized}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-sans font-bold">
                        {listing.category} · {listing.city}, {listing.state}{listing.country ? `, ${listing.country}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cumulative Total Box */}
                <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 text-left sm:text-right flex-shrink-0 space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-orange-700 tracking-tight font-sans">
                    {formatINR(listing.cumulative_amount)}
                  </div>
                  <span className="text-[11px] font-extrabold text-orange-900 uppercase tracking-wider block">
                    Verified Total
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {listing.description || 'Verified business listing on InBid live board.'}
              </p>

              {/* Meta Stats Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-slate-700 font-mono">
                    <MousePointerClick className="w-4 h-4 text-orange-500" />
                    <strong className="text-slate-900">{listing.click_count.toLocaleString()}</strong> verified clicks
                  </span>
                  <span>•</span>
                  <span>Listed {formatDate(listing.created_at)}</span>
                </div>

                {/* BOOST THIS LISTING CTA BUTTON (Opens Bidding Modal prefilled for this exact listing) */}
                <button
                  onClick={() => setIsBidModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl uppercase tracking-wider shadow-xs hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>BOOST THIS LISTING →</span>
                </button>
              </div>
            </div>

            {/* Bidding History Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" /> Confirmed Bidding History
              </h3>

              {bids.length > 0 ? (
                <div className="space-y-2.5">
                  {bids.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{b.bidder_name || 'Verified Builder'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{formatDate(b.created_at)}</div>
                      </div>
                      <div className="font-black text-orange-600 font-mono text-sm">
                        +{formatINR(b.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                  Initial verified total: {formatINR(listing.cumulative_amount)}. Click &quot;BOOST THIS LISTING&quot; to add a bid!
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LISTING NOT FOUND EMPTY STATE */
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto font-black text-xl">
              🔍
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Listing not found.</h2>
              <p className="text-xs text-slate-500 font-medium">
                The requested business listing does not exist or has not been claimed yet.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to leaderboard</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <CreatorBadge />

      {/* Clean Centered Interactive Bidding Modal pre-filled for this listing */}
      {listing && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          targetListing={listing}
          initialDestination={listing.destination_normalized}
          initialCategory={listing.category}
          highestBid={listing.cumulative_amount}
          onBidSuccess={handleBidSuccess}
        />
      )}

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
