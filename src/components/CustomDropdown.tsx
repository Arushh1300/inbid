'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, Search, X, Loader2 } from 'lucide-react';

export interface DropdownOption {
  name: string;
  code?: string;
  flag?: string;
  icon?: React.ReactNode;
}

export interface CustomDropdownProps {
  label?: string;
  labelClassName?: string;
  value: string;
  placeholder?: string;
  options: (string | DropdownOption)[];
  onSelect: (option: string, rawItem?: DropdownOption) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  containerClassName?: string;
  isLoading?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  isCustomActive?: boolean;
  onCustomToggle?: (active: boolean) => void;
  onCustomChange?: (val: string) => void;
  customButtonText?: string;
}

export function CustomDropdown({
  label,
  labelClassName,
  value,
  placeholder = 'Select...',
  options,
  onSelect,
  searchable = true,
  searchPlaceholder = 'Search...',
  triggerClassName,
  popoverClassName,
  containerClassName,
  isLoading = false,
  disabled = false,
  allowCustom = false,
  isCustomActive = false,
  onCustomToggle,
  onCustomChange,
  customButtonText = '+ Enter Custom Option',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to DropdownOption objects
  const normalizedOptions: DropdownOption[] = useMemo(() => {
    return options.map((opt) => (typeof opt === 'string' ? { name: opt } : opt));
  }, [options]);

  // Click outside and Escape key listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Viewport-aware direction check
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 240px and space above is sufficient, open upwards
      if (spaceBelow < 240 && rect.top > 240) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }
    setIsOpen(!isOpen);
    setSearchQuery('');
  };

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (q === 'usa' && (item.name.toLowerCase().includes('united states') || item.code === 'US')) ||
        (q === 'uk' && (item.name.toLowerCase().includes('united kingdom') || item.code === 'GB')) ||
        (q === 'uae' && (item.name.toLowerCase().includes('united arab emirates') || item.code === 'AE'))
    );
  }, [normalizedOptions, searchQuery]);

  // Selected item object
  const selectedItem = normalizedOptions.find((i) => i.name.toLowerCase() === (value || '').toLowerCase());

  return (
    <div ref={containerRef} className={`relative text-left font-sans ${containerClassName || 'space-y-1'}`}>
      {label && (
        <span className={labelClassName || 'text-[10px] font-bold text-slate-400 block'}>
          {label}
        </span>
      )}

      {isCustomActive ? (
        <div className="space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onCustomChange?.(e.target.value)}
            placeholder="Type value..."
            className="w-full bg-slate-50 border border-orange-400 rounded-xl px-2.5 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            autoFocus
          />
          <button
            type="button"
            onClick={() => onCustomToggle?.(false)}
            className="text-[9px] font-bold text-orange-500 hover:underline block pt-0.5 cursor-pointer"
          >
            ← Choose from list
          </button>
        </div>
      ) : (
        <>
          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className={
              triggerClassName ||
              `w-full bg-slate-50 border rounded-xl px-2.5 py-2 text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer group text-left ${
                isOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/20 text-slate-900 shadow-2xs'
                  : 'border-slate-200 hover:border-orange-400 text-slate-800'
              }`
            }
          >
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              {selectedItem?.flag && <span className="text-sm flex-shrink-0">{selectedItem.flag}</span>}
              {selectedItem?.icon && <span className="flex-shrink-0">{selectedItem.icon}</span>}
              <span className="truncate">{value || placeholder}</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1.5 ${
                isOpen ? 'rotate-180 text-orange-500' : 'group-hover:text-slate-600'
              }`}
            />
          </button>

          {isOpen && (
            <div
              className={
                popoverClassName ||
                `absolute left-0 right-0 z-50 w-full min-w-[180px] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 font-sans box-border ${
                  openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                }`
              }
            >
              {/* Search Bar */}
              {searchable && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-7 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable list */}
              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                {isLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                    <span>Loading...</span>
                  </div>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((item) => {
                    const isSelected = item.name.toLowerCase() === (value || '').toLowerCase();
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          onSelect(item.name, item);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 text-orange-700 font-extrabold border border-orange-200/60'
                            : 'text-slate-800 hover:bg-slate-50 hover:text-orange-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {item.flag && <span className="text-sm flex-shrink-0">{item.flag}</span>}
                          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                          <span className="truncate">{item.name}</span>
                          {item.code && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              ({item.code})
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-[11px] text-slate-400 font-semibold">
                    No results for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>

              {/* Allow Custom Option if allowed (e.g. for City) */}
              {allowCustom && (
                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onCustomToggle?.(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-black text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{customButtonText}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
