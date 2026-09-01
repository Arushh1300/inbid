'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does cumulative bidding work on InBid?',
      a: 'InBid ranks listings strictly by cumulative verified amount. If an existing listing has ₹2,500 and you add ₹1,000 today, the new cumulative total becomes ₹3,500. You only pay the ₹1,000 added today!',
    },
    {
      q: 'What destinations can I submit?',
      a: 'You can submit any public destination in India including website URLs, SaaS landing pages, X handles, Instagram profiles, cafés, salons, or products.',
    },
    {
      q: 'How are outbound clicks tracked?',
      a: 'Every time a user clicks your listing link on InBid, our system routes through an outbound tracker API that atomically increments your tracked clicks counter.',
    },
    {
      q: 'What is the AI Visibility score?',
      a: 'InBid provides an AI Visibility score (e.g. 72/100) to analyze entity recognition and search discovery queries for your listing.',
    },
  ];

  return (
    <section id="faq" className="py-16 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-amber-700 font-mono font-black text-xs uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" /> FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between font-extrabold text-slate-900 text-sm sm:text-base text-left cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm font-medium border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
