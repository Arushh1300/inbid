'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/types';
import { Layers } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const options = ['All', ...CATEGORIES];

  return (
    <div id="categories" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
      <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex-shrink-0">
        <Layers className="w-3.5 h-3.5" />
        Categories:
      </div>

      {options.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
