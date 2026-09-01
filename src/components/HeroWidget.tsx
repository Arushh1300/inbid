'use client';

import React, { useState, useEffect } from 'react';
import { BidQuote } from '@/lib/types';
import { ExtractedMetadata } from '@/lib/metadataExtractor';
import { normalizeDestination } from '@/lib/normalization';
import { formatINR } from '@/lib/utils';
import { Globe, ArrowRight, Loader2, Sparkles, Trophy, Lock } from 'lucide-react';

interface HeroWidgetProps {
  highestCurrentBid?: number;
  onProceedToPayment: (
    destination: string,
    amount: number,
    quote: BidQuote,
    metadata: ExtractedMetadata | null
  ) => void;
}

export function HeroWidget({
  highestCurrentBid = 12500,
  onProceedToPayment,
}: HeroWidgetProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [quote, setQuote] = useState<BidQuote | null>(null);

  // Debounced metadata fetch
  useEffect(() => {
    const clean = destination.trim();
    if (!clean) {
      setMetadata(null);
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingMeta(true);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(clean)}`);
        const json = await res.json();
        if (json.success) {
          setMetadata(json.data);
        } else {
          setMetadata(null);
        }

        const currentAmt = isCustom ? Number(customAmount) || 100 : amount;
        const qRes = await fetch('/api/bids/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: clean, amount: currentAmt }),
        });
        const qJson = await qRes.json();
        if (qJson.success) {
          setQuote(qJson.data);
        }
      } catch {
        // Silently handle preview fallback
      } finally {
        setIsLoadingMeta(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, amount, customAmount, isCustom]);

  const minBidToTake1 = Math.max(100, highestCurrentBid + 100);
  const quickOptions = [99, 250, 500, 1000, minBidToTake1];

  const handleSelectQuick = (val: number) => {
    setIsCustom(false);
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    const norm = normalizeDestination(destination);
    if (!norm.normalized) return;

    if (quote) {
      onProceedToPayment(norm.normalized, amount, quote, metadata);
    } else {
      const fallbackQuote: BidQuote = {
        destination_normalized: norm.normalized,
        title: metadata?.title || norm.displayUrl,
        category: 'Other',
        country: 'India',
        state: 'Rajasthan',
        city: 'Jaipur',
        current_total: 0,
        amount_adding: amount,
        new_total: amount,
        projected_rank: amount > highestCurrentBid ? 1 : 2,
        min_amount_required: Math.max(100, highestCurrentBid + 1),
        is_new_listing: true,
      };
      onProceedToPayment(norm.normalized, amount, fallbackQuote, metadata);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-xl mx-auto space-y-6 text-left font-sans">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Instant Live Submission
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Get on the Leaderboard
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Enter your website or handle, set your bid, and claim your position instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Input URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
            1. Enter Destination URL or @Handle
          </label>
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. easymanage.in or @handle"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
            />
            {isLoadingMeta && (
              <Loader2 className="w-4 h-4 absolute right-3.5 text-orange-500 animate-spin" />
            )}
          </div>
        </div>

        {/* Live Preview Card if metadata detected */}
        {metadata && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-start gap-3 animate-in fade-in duration-150">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={metadata.logo}
              alt={metadata.title}
              className="w-10 h-10 rounded-lg bg-white border border-slate-200 object-cover flex-shrink-0"
            />
            <div className="space-y-0.5 overflow-hidden">
              <div className="font-extrabold text-xs text-slate-900 truncate">
                {metadata.title}
              </div>
              <div className="text-[11px] font-mono text-orange-600 truncate">
                {metadata.domain}
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                {metadata.description}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Bid Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              2. Select Bid Amount
            </label>
            <button
              type="button"
              onClick={() => handleSelectQuick(minBidToTake1)}
              className="text-[11px] font-black text-orange-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Trophy className="w-3 h-3" /> Take #1 for {formatINR(minBidToTake1)}
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {quickOptions.map((opt) => {
              const isSelected = !isCustom && amount === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectQuick(opt)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ₹{opt.toLocaleString()}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isCustom
                  ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <input
              type="number"
              min={99}
              placeholder="Enter custom amount in ₹"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-50 border border-orange-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-sans mt-1"
            />
          )}
        </div>

        {/* Live Rank Calculation Bar */}
        <div className="bg-orange-50/50 rounded-xl p-3.5 border border-orange-100 flex items-center justify-between text-xs font-medium text-slate-700">
          <div>
            <span>Projected Rank: </span>
            <strong className="text-orange-700 font-black text-sm">
              #{quote ? quote.projected_rank : (amount >= minBidToTake1 ? 1 : 2)}
            </strong>
          </div>
          <div className="font-mono text-slate-500">
            Total: <strong className="text-slate-900 font-bold">{formatINR(amount)}</strong>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans"
        >
          <span>PROCEED TO BID {formatINR(amount)} →</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Instant verification & status update</span>
        </div>
      </form>
    </div>
  );
}
