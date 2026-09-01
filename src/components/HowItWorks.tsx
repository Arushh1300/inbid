'use client';

import React from 'react';
import { Target, Zap, Share2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit your business',
      desc: 'Enter your website URL, X handle, or Instagram profile.',
      icon: Target,
    },
    {
      num: '02',
      title: 'Place your bid',
      desc: 'Bid to increase your cumulative total. Server verifies payment instantly.',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Climb & share',
      desc: 'Climb the live rank, get discovered by users, and share your position.',
      icon: Share2,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-10">
        <div className="space-y-2">
          <span className="text-amber-700 font-mono font-black text-xs uppercase tracking-widest">
            3 SIMPLE STEPS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 relative hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-sans text-amber-600">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
