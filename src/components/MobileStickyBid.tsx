'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface MobileStickyBidProps {
  highestBid: number;
  onOpenBidModal: () => void;
}

export function MobileStickyBid({ highestBid, onOpenBidModal }: MobileStickyBidProps) {
  const minBid = Math.max(100, highestBid + 1);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-xl">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block font-sans">
            Target #1 Cumulative
          </span>
          <span className="text-lg font-black text-amber-700 font-sans">
            {formatINR(minBid)}
          </span>
        </div>

        <button
          onClick={onOpenBidModal}
          className="flex-1 bg-amber-500 active:bg-amber-600 text-slate-950 font-black text-sm py-3 px-4 rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Bid now</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
