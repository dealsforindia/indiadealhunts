import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Trash2, ArrowUpRight, ShieldCheck, LogOut, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TrackedAlert {
  id: string;
  product_title: string;
  product_url: string;
  target_price: number;
  current_price?: number;
  store: string;
  status: string;
  created_at: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rudranil.me';

export const UserMenuDrawer: React.FC = () => {
  const { user, isUserDrawerOpen, closeUserDrawer, logout, token } = useAuth();
  const [alerts, setAlerts] = useState<TrackedAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'cards' | 'security'>('alerts');

  const fetchAlerts = useCallback(async () => {
    if (!user || !isUserDrawerOpen) return;
    setLoadingAlerts(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/v1/user/alerts?email=${encodeURIComponent(user.email)}`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingAlerts(false);
    }
  }, [user, isUserDrawerOpen, token]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleDeleteAlert = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/api/v1/user/alerts/${id}`, {
        method: 'DELETE',
        headers,
      });

      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // Fail silently
    }
  };

  if (!isUserDrawerOpen || !user) return null;

  const emailInitial = user.email.charAt(0).toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D121F] border-l border-white/10 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                {emailInitial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="user-drawer-title" className="text-sm font-bold text-white truncate">
                    {user.email}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified Deal Hunter
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={closeUserDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-emerald-500"
              aria-label="Close user profile drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/[0.06]">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'alerts'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔔 Price Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'cards'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💳 Card Savings
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 px-1 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'security'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Privacy
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* Tab 1: Price Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Continuous 5-Minute Price Monitors
                  </span>
                  <button
                    onClick={fetchAlerts}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {loadingAlerts ? (
                  <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                    Checking your active price alerts...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 p-6">
                    <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-1">No Active Price Alerts</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click the bell icon on any product card or in Link Lookup to get alerted the instant the price drops!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((al) => (
                      <div
                        key={al.id}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {al.product_title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-emerald-400 font-mono">
                              Target: ₹{Math.round(al.target_price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                              {al.store}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {al.product_url && (
                            <a
                              href={al.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors"
                              title="View Product Page"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteAlert(al.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove Alert"
                            aria-label="Remove alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Credit Card Cashback */}
            {activeTab === 'cards' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Personalized Card Discounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    IndiaDealHunts automatically calculates additional instant bank discounts (5% Flipkart Axis, 5% Amazon Pay ICICI, 5% SBI Cashback) on all deals shown to you.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Loot Stack Guarantee</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    We verify bank discount compatibility so you never pay retail price when card offers are live.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Security & Privacy */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Zero Password • 100% Privacy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    We only use your email to notify you when product prices drop below your specified target. We never share your email with third parties or send spam marketing.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-white/10 bg-slate-900/50">
            <button
              onClick={logout}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-rose-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of IndiaDealHunts</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
