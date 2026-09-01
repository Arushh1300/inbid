'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { ExternalLink, Lock, ArrowRight, CheckCircle2, Globe, Sparkles } from 'lucide-react';

interface RightBidPanelProps {
  highestBid: number;
  initialDestination?: string;
  onContinuePayment: (amount: number, destination: string) => void;
}

export function RightBidPanel({ highestBid, initialDestination = '', onContinuePayment }: RightBidPanelProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [previewTitle, setPreviewTitle] = useState('EasyManage');
  const [previewDomain, setPreviewDomain] = useState('easymanage.in');
  const [previewDesc, setPreviewDesc] = useState('All-in-one management software for salons, spas & clinics.');
  const [previewCategory, setPreviewCategory] = useState('SaaS');
  const [previewCity, setPreviewCity] = useState('Jaipur');
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  useEffect(() => {
    if (!destination.trim()) {
      setPreviewTitle('EasyManage');
      setPreviewDomain('easymanage.in');
      setPreviewDesc('All-in-one management software for salons, spas & clinics.');
      setPreviewCategory('SaaS');
      setPreviewCity('Jaipur');
      setCurrentTotal(0);
      return;
    }

    const clean = destination.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    setPreviewDomain(clean);
    const parts = clean.split('.')[0];
    const capitalized = parts.charAt(0).toUpperCase() + parts.slice(1);
    setPreviewTitle(capitalized);
    setPreviewDesc(`Verified listing for ${clean} on InBid live marketplace.`);

    // Mock calculations for projected position
    if (clean.includes('zepto')) {
      setCurrentTotal(12500);
      setPreviewCategory('SaaS');
      setPreviewCity('Bengaluru');
    } else if (clean.includes('example')) {
      setCurrentTotal(10001);
      setPreviewCategory('AI');
      setPreviewCity('Delhi');
    } else {
      setCurrentTotal(0);
      setPreviewCategory('Startups');
      setPreviewCity('India');
    }
  }, [destination]);

  const quickAmounts = [99, 250, 500, 1000, 2000];
  const currentAmount = isCustomMode ? (Number(customAmount) || 99) : selectedAmount;
  const newTotal = currentTotal + currentAmount;
  const take1Amount = Math.max(12501, highestBid + 1);

  let projectedRank = '#12';
  if (newTotal > highestBid) projectedRank = '#1';
  else if (newTotal > 10000) projectedRank = '#2';
  else if (newTotal > 7000) projectedRank = '#3 - #5';
  else if (newTotal > 3000) projectedRank = '#6 - #10';

  const handleSelectQuick = (amt: number) => {
    setIsCustomMode(false);
    setSelectedAmount(amt);
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setIsCustomMode(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinuePayment(currentAmount, destination || previewDomain);
  };

  return (
    <div id="right-bidding-panel" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5 text-left transition-all">
      {/* Panel Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight font-sans">
            Get on the leaderboard
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-200">
            Live Panel
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Enter your website or social handle to get started.
        </p>
      </div>

      {/* Primary Input Field */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
            Website / Instagram / X
          </label>
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              id="right-panel-destination-input"
              type="text"
              placeholder="e.g. easymanage.in or @handle"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* WEBSITE PREVIEW CARD (Jaipur.lol + InBid Metadata) */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
          <div className="flex items-start gap-3">
            {/* Logo Avatar */}
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs font-sans">
              {previewTitle.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 text-xs truncate">{previewTitle}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100 flex-shrink-0" />
              </div>
              <a
                href={`https://${previewDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-indigo-600 hover:underline inline-flex items-center gap-0.5 truncate"
              >
                <span>{previewDomain}</span>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium line-clamp-2">
            {previewDesc}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold pt-0.5">
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-extrabold text-indigo-700">
              {previewCategory}
            </span>
            <span>•</span>
            <span>{previewCity}</span>
          </div>
        </div>

        {/* Bid Amount Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-extrabold text-slate-700 block">
            Bid amount
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            {quickAmounts.map((amt) => {
              const isSelected = !isCustomMode && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectQuick(amt)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                isCustomMode
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustomMode && (
            <div className="pt-1">
              <input
                type="number"
                min={10}
                placeholder="Enter custom amount in ₹"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="w-full bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
              />
            </div>
          )}
        </div>

        {/* Live Calculation Breakdown */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs font-medium space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span>Current total</span>
            <span className="font-bold text-slate-900 font-mono">{formatINR(currentTotal)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>You&apos;re adding</span>
            <span className="font-bold text-indigo-600 font-mono">{formatINR(currentAmount)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>New total</span>
            <span className="font-bold text-slate-900 font-mono">{formatINR(newTotal)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Projected position</span>
            <span className="font-bold text-slate-900 font-sans">{projectedRank}</span>
          </div>

          <div className="flex items-center justify-between text-indigo-700 font-bold border-t border-slate-200/80 pt-2">
            <span>Take #1 for</span>
            <button
              type="button"
              onClick={() => handleSelectQuick(take1Amount)}
              className="font-black text-indigo-600 hover:underline cursor-pointer font-sans"
            >
              {formatINR(take1Amount)}
            </button>
          </div>
        </div>

        {/* Primary Payment CTA */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer font-sans"
        >
          <span>CONTINUE TO PAYMENT →</span>
        </button>

        {/* Dodo Payments Subtext */}
        <div className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 pt-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Secure payment powered by Dodo Payments</span>
        </div>
      </form>
    </div>
  );
}
