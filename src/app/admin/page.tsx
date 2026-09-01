'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { formatINR, formatDate } from '@/lib/utils';
import { ShieldCheck, Lock, Users, CreditCard, Trophy, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, MousePointerClick } from 'lucide-react';

export default function AdminDashboardPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'bids'>('listings');
  const [adminData, setAdminData] = useState<{
    listings: any[];
    bids: any[];
  } | null>(null);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/data?key=${encodeURIComponent(passcode)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid admin passcode');
      }

      setAdminData(json.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!passcode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data?key=${encodeURIComponent(passcode)}`);
      const json = await res.json();
      if (json.success) {
        setAdminData(json.data);
      }
    } catch {
      // Refresh error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onOpenBidModal={() => {}} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public App</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300/60">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Protected Admin Portal
          </div>
        </div>

        {!isAuthenticated ? (
          /* Admin Security Login Screen */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Passcode</h1>
              <p className="text-slate-500 text-xs font-medium">Enter security passcode to inspect listings, bids, and server payment status.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Passcode (Default: inbid_admin_secret_2026)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3 rounded-xl uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Unlock Admin Portal'}
              </button>
            </form>
          </div>
        ) : (
          /* Protected Admin Dashboard */
          <div className="space-y-6">
            {/* Header Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-slate-900">InBid Admin Overview</h1>
                <p className="text-slate-500 text-xs font-medium">Real-time status of listings, cumulative bids, and server payment confirmations.</p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-black uppercase">Live Listings</span>
                  <div className="text-2xl font-black text-slate-900">{adminData?.listings.length || 0}</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-black uppercase">Total Bids Processed</span>
                  <div className="text-2xl font-black text-slate-900">{adminData?.bids.length || 0}</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <MousePointerClick className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-black uppercase">Total Outbound Clicks</span>
                  <div className="text-2xl font-black text-slate-900">
                    {adminData?.listings.reduce((sum, l) => sum + (l.click_count || 0), 0).toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'listings' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                Listings Directory ({adminData?.listings.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('bids')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'bids' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                Bids & Payment Log ({adminData?.bids.length || 0})
              </button>
            </div>

            {/* Data Tables */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {activeTab === 'listings' && (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[11px] uppercase">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Normalized Destination</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Cumulative Total</th>
                      <th className="py-3 px-4 text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {adminData?.listings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold">{l.title}</td>
                        <td className="py-3.5 px-4 text-amber-700 font-mono text-xs">{l.destination_normalized}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">{l.category} · {l.city}</td>
                        <td className="py-3.5 px-4 text-right font-black font-sans">{formatINR(l.cumulative_amount)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">{l.click_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'bids' && (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[11px] uppercase">
                      <th className="py-3 px-4">Bidder</th>
                      <th className="py-3 px-4">Listing Target</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {adminData?.bids.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold">{b.bidder_name || 'Anonymous'}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                          {b.listings?.title || 'Listing'} <span className="text-slate-400">({b.listings?.destination_normalized})</span>
                        </td>
                        <td className="py-3.5 px-4 font-black font-sans">{formatINR(b.amount)}</td>
                        <td className="py-3.5 px-4">
                          {b.status === 'confirmed' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Confirmed
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> {b.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-slate-400">{formatDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
