'use client';

import React from 'react';
import { WebsiteMetadata } from '@/lib/types';
import { Globe, ExternalLink, AlertCircle, Sparkles, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface WebsitePreviewCardProps {
  metadata: WebsiteMetadata | null;
  loading: boolean;
  destination: string;
}

export function WebsitePreviewCard({ metadata, loading, destination }: WebsitePreviewCardProps) {
  if (!destination.trim()) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 animate-pulse">
        <div className="flex items-center gap-2 text-amber-700 text-xs font-black uppercase">
          <div className="w-4 h-4 rounded-full bg-amber-200 animate-spin" />
          <span>Fetching Website Metadata...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>
        </div>
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-left animate-in fade-in duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Website Preview
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          {metadata.domain}
        </span>
      </div>

      {/* Notice if metadata extraction fell back gracefully */}
      {metadata.isFallback && metadata.errorNotice && (
        <div className="bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{metadata.errorNotice}</span>
        </div>
      )}

      {/* Main Metadata Display */}
      <div className="flex items-start gap-4">
        {/* Website Logo / Favicon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={metadata.logo}
          alt={metadata.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(metadata.domain)}`;
          }}
          className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 object-contain p-1 flex-shrink-0 shadow-xs"
        />

        <div className="space-y-1 flex-1 overflow-hidden">
          <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">
            {metadata.title}
          </h4>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-amber-700 font-bold">{metadata.domain}</span>
            {metadata.canonicalUrl && (
              <a
                href={metadata.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5 font-mono text-[11px]"
              >
                <span>Visit site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed pt-0.5 font-medium">
            {metadata.description}
          </p>
        </div>
      </div>

      {/* OG Image Preview if present */}
      {metadata.image && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={metadata.image}
            alt="OG Preview"
            className="w-full h-36 object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-amber-400" /> OG Preview
          </div>
        </div>
      )}

      {/* Social Profile Badges if detected */}
      {(metadata.socialLinks.twitter || metadata.socialLinks.instagram || metadata.socialLinks.linkedin) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase">Detected Profiles:</span>
          {metadata.socialLinks.twitter && (
            <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-slate-200">
              X/Twitter
            </span>
          )}
          {metadata.socialLinks.instagram && (
            <span className="bg-pink-50 text-pink-700 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-pink-200">
              Instagram
            </span>
          )}
          {metadata.socialLinks.linkedin && (
            <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-sky-200">
              LinkedIn
            </span>
          )}
        </div>
      )}
    </div>
  );
}
