'use client';

import React from 'react';
import { Sparkles, Search, TrendingUp, Cpu, Info } from 'lucide-react';

interface AIVisibilityReportProps {
  score?: number;
  queries?: string[];
  opportunity?: string;
  title?: string;
}

export function AIVisibilityReport({
  score = 72,
  queries = ['top indian businesses', 'best tools & startups in india'],
  opportunity = 'Optimize search authority and regional Tier-1 city discovery',
  title = 'Your Business',
}: AIVisibilityReportProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300/60">
            <Cpu className="w-3.5 h-3.5 text-amber-700" /> Value Proposition Insight
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            See how AI understands your business
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            AI recognition analysis for &quot;{title}&quot;.
          </p>
        </div>

        {/* Score Badge */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center min-w-[120px]">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
            AI Visibility
          </span>
          <span className="text-3xl font-black text-amber-700 font-sans">{score}/100</span>
        </div>
      </div>

      {/* 3 Insight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* AI Recognition */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Recognition</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Indexed by AI search models as a verified entity in India.
          </p>
        </div>

        {/* Relevant Discovery Queries */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <Search className="w-4 h-4 text-amber-600" />
            <span>Discovery Queries</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {queries.map((q, idx) => (
              <span
                key={idx}
                className="bg-white border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
              >
                &quot;{q}&quot;
              </span>
            ))}
          </div>
        </div>

        {/* Biggest Opportunity */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Biggest Opportunity</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {opportunity}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>InBid provides visibility analysis insights. We do not claim guaranteed AI search recommendations.</span>
      </div>
    </div>
  );
}
