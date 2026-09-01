'use client';

import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBidModal: () => void;
}

export function HowItWorksModal({ isOpen, onClose, onOpenBidModal }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative p-6 sm:p-8 space-y-6 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> How InBid Works
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Simple 3-Step Bidding
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            InBid is a live public leaderboard where businesses compete for attention by placing bids.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
              01
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-xs">Enter your destination</h4>
              <p className="text-slate-500 text-xs">Submit your website URL, X handle, Instagram profile, or landing page.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
              02
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-xs">Choose your bid amount</h4>
              <p className="text-slate-500 text-xs">New listings start at ₹99. Every verified rupee increases your cumulative total.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
              03
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-xs">Climb ranks & get clicks</h4>
              <p className="text-slate-500 text-xs">Highest cumulative verified amount = #1 position on the live board.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenBidModal();
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Get on the leaderboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
