'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Check, Copy, ExternalLink, Trophy, Crown } from 'lucide-react';
import { Listing } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  newRank: number;
  amountPaid: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  listing,
  newRank,
  amountPaid,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const listingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/listing/${listing.slug}`
    : `https://inbid.site/listing/${listing.slug}`;

  const shareText = newRank === 1
    ? `🔥 "${listing.title}" is now #1 on InBid with ${formatINR(listing.cumulative_amount)} cumulative verified bid! 🇮🇳`
    : `🚀 "${listing.title}" is now #${newRank} on InBid 🇮🇳 with ${formatINR(listing.cumulative_amount)} total!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(listingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${listingUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(listingUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(listingUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-sm">
            {newRank === 1 ? <Crown className="w-8 h-8 fill-slate-950" /> : <Trophy className="w-8 h-8" />}
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            You&apos;re now #{newRank} on InBid 🇮🇳
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Server verified payment of <strong className="text-slate-900">{formatINR(amountPaid)}</strong>.
          </p>
        </div>

        {/* Listing Card Preview */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300/60 px-3 py-0.5 rounded-full">
            INBID 🇮🇳 • VERIFIED LISTING
          </div>

          <div className="text-5xl font-black text-amber-700 font-sans tracking-tight">
            #{newRank}
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">{listing.title}</h3>
            <p className="text-slate-500 font-mono text-xs font-semibold">{listing.destination_normalized}</p>
          </div>

          <div className="inline-block bg-white border border-slate-200 px-4 py-2 rounded-xl font-black text-slate-900 text-2xl font-sans shadow-xs">
            {formatINR(listing.cumulative_amount)} total
          </div>
        </div>

        {/* Share Section */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider text-center">
            Share your position
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-colors"
            >
              <span>X</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors"
            >
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Listing CTA */}
        <div className="pt-2">
          <Link
            href={`/listing/${listing.slug}`}
            className="w-full block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs"
          >
            View Public Listing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
