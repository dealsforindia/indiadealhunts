import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Palette,
  Volume2,
  VolumeX,
  Bell,
  Mail,
  Send,
  Bookmark,
  Sparkles,
  Check,
  LogIn,
  LogOut,
  Sliders,
  TrendingDown,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  Trash2,
  RefreshCw,
  Plus,
  Target,
  ArrowDownRight,
  CheckCircle2,
  Activity,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme, ThemePreference } from '../utils/themeManager';
import { getSavedDealIds } from '../utils/savedDeals';
import { TelegramIcon } from './TelegramIcon';
import { playTactileClick, playSuccessChime } from '../utils/audio';
import { PUBLIC_API_BASE } from '../utils/publicLinks';

interface ProfilePageProps {
  onNavigateTab: (tab: any) => void;
  onOpenLookup?: () => void;
  onOpenSubmit?: () => void;
  onShowToast?: (msg: string) => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

interface TrackedAlert {
  id: string;
  product_url: string;
  target_price: number;
  current_price?: number;
  product_title: string;
  store?: string;
  image_url?: string;
  status: string;
  created_at: number;
  last_checked_at?: number;
  triggered_at?: number;
  email_status?: string;
}

const ACCENT_PRESETS = [
  { id: 'emerald', name: 'Emerald Loot', color: '#10b981', ring: 'ring-emerald-500' },
  { id: 'violet', name: 'Electric Violet', color: '#8b5cf6', ring: 'ring-purple-500' },
  { id: 'crimson', name: 'Crimson Deal', color: '#f43f5e', ring: 'ring-rose-500' },
  { id: 'amber', name: 'Amber Gold', color: '#f59e0b', ring: 'ring-amber-500' },
  { id: 'blue', name: 'Stripe Royal', color: '#2563eb', ring: 'ring-blue-500' },
  { id: 'cyan', name: 'Cyber Cyan', color: '#06b6d4', ring: 'ring-cyan-500' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigateTab,
  onOpenLookup,
  onOpenSubmit,
  onShowToast,
  isAudioEnabled = true,
  onToggleAudio,
}) => {
  const { preference, setTheme } = useTheme();

  // User auth state
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('idh_user_email') || '';
    } catch {
      return '';
    }
  });

  // Auth dialog state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'email' | 'code'>('email');
  const [inputEmail, setInputEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Theme Accent state
  const [accent, setAccent] = useState<string>(() => {
    try {
      return localStorage.getItem('idh_accent_theme') || 'emerald';
    } catch {
      return 'emerald';
    }
  });

  // Alert preferences
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    try {
      return localStorage.getItem('idh_email_alerts') !== 'false';
    } catch {
      return true;
    }
  });
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('idh_alert_threshold')) || 20;
    } catch {
      return 20;
    }
  });

  // Saved deals count
  const [savedCount, setSavedCount] = useState<number>(0);

  // ── Scraper & Watchlist State ──
  const [trackedAlerts, setTrackedAlerts] = useState<TrackedAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Add Scraper Form state
  const [inputUrl, setInputUrl] = useState('');
  const [inputTargetPrice, setInputTargetPrice] = useState('');
  const [inputScraperEmail, setInputScraperEmail] = useState(userEmail || '');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectPreview, setInspectPreview] = useState<{
    title: string;
    price?: number;
    mrp?: number;
    image?: string;
    store?: string;
  } | null>(null);
  const [isArmingScraper, setIsArmingScraper] = useState(false);
  const [checkingAlertId, setCheckingAlertId] = useState<string | null>(null);

  // Sync user email to input email
  useEffect(() => {
    if (userEmail && !inputScraperEmail) {
      setInputScraperEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    setSavedCount(getSavedDealIds().length);
  }, []);

  // Fetch active alerts for current user
  const fetchUserAlerts = async (emailToFetch: string) => {
    if (!emailToFetch.trim() || !emailToFetch.includes('@')) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts?contact=${encodeURIComponent(emailToFetch.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.alerts)) {
          setTrackedAlerts(data.alerts);
        }
      }
    } catch (e) {
      console.warn('Could not fetch user alerts:', e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserAlerts(userEmail);
    }
  }, [userEmail]);

  const handleSelectAccent = (colorId: string, hexColor: string) => {
    playTactileClick();
    setAccent(colorId);
    try {
      localStorage.setItem('idh_accent_theme', colorId);
      document.documentElement.style.setProperty('--accent-primary-custom', hexColor);
    } catch {}
    onShowToast?.(`Accent theme updated to ${colorId.charAt(0).toUpperCase() + colorId.slice(1)}`);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    setIsSendingCode(true);
    playTactileClick();

    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Failed to send verification code');
      }
      playSuccessChime();
      setAuthStep('code');
      if (data.dev_code) {
        setDevCodeHint(data.dev_code);
      }
      onShowToast?.(`6-digit verification code sent to ${cleanEmail}`);
    } catch (err: any) {
      setAuthError(err.message || 'Could not connect to auth service');
      onShowToast?.(err.message || 'Error sending code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setAuthError('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifyingCode(true);
    playTactileClick();

    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Invalid or expired verification code');
      }

      if (data.token) {
        try {
          localStorage.setItem('idh_auth_token', data.token);
        } catch {}
      }
      setUserEmail(cleanEmail);
      setInputScraperEmail(cleanEmail);
      try {
        localStorage.setItem('idh_user_email', cleanEmail);
      } catch {}

      playSuccessChime();
      setShowAuthModal(false);
      setAuthStep('email');
      setInputCode('');
      setDevCodeHint(null);
      fetchUserAlerts(cleanEmail);
      onShowToast?.(`Signed in successfully as ${cleanEmail}`);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired verification code');
      onShowToast?.(err.message || 'Verification failed');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSignOut = () => {
    playTactileClick();
    setUserEmail('');
    setTrackedAlerts([]);
    try {
      localStorage.removeItem('idh_user_email');
      localStorage.removeItem('idh_auth_token');
    } catch {}
    onShowToast?.('Signed out of Deal Hunter session');
  };

  const handleToggleEmailAlerts = () => {
    playTactileClick();
    const next = !emailAlerts;
    setEmailAlerts(next);
    try {
      localStorage.setItem('idh_email_alerts', String(next));
    } catch {}
    onShowToast?.(next ? 'Email price drop alerts enabled' : 'Email alerts paused');
  };

  const handleSelectThreshold = (pct: number) => {
    playTactileClick();
    setAlertThreshold(pct);
    try {
      localStorage.setItem('idh_alert_threshold', String(pct));
    } catch {}
    onShowToast?.(`Drop alert set to ≥${pct}% reduction`);
  };

  // Inspect any store URL to fetch live product metadata
  const handleInspectUrl = async (urlToInspect?: string) => {
    const targetUrl = (urlToInspect || inputUrl).trim();
    if (!targetUrl || !targetUrl.startsWith('http')) {
      onShowToast?.('Please paste a valid product link (Amazon, Flipkart, Myntra, etc.)');
      return;
    }
    setIsInspecting(true);
    playTactileClick();
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/deals/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title || data.product_name || data.price) {
          const preview = {
            title: data.title || data.product_name || 'Verified Product',
            price: data.price ? Number(data.price) : undefined,
            mrp: data.mrp ? Number(data.mrp) : undefined,
            image: data.image || undefined,
            store: data.store || 'Store',
          };
          setInspectPreview(preview);
          if (preview.price && !inputTargetPrice) {
            setInputTargetPrice(String(Math.round(preview.price * 0.85)));
          }
          playSuccessChime();
          onShowToast?.(`Detected: ${preview.title.slice(0, 30)}... (₹${preview.price?.toLocaleString('en-IN') || 'Live'})`);
          return;
        }
      }
      onShowToast?.('Product link verified. Enter your desired target price below.');
    } catch {
      onShowToast?.('Could not pre-fetch store details. You can still arm the price alert.');
    } finally {
      setIsInspecting(false);
    }
  };

  // Arm scraper and save price drop alert
  const handleAddScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      onShowToast?.('Please enter a valid store product link');
      return;
    }
    const cleanEmail = (inputScraperEmail || userEmail).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      onShowToast?.('Please enter your email to receive price drop notifications');
      return;
    }
    const targetP = parseFloat(inputTargetPrice);
    if (isNaN(targetP) || targetP <= 0) {
      onShowToast?.('Please enter a target price greater than ₹0');
      return;
    }

    setIsArmingScraper(true);
    playTactileClick();

    try {
      const payload = {
        product_url: cleanUrl,
        target_price: targetP,
        contact: cleanEmail,
        product_title: inspectPreview?.title || 'Tracked Product',
        current_price: inspectPreview?.price || null,
        store: inspectPreview?.store || 'Store',
        image_url: inspectPreview?.image || null,
      };

      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      playSuccessChime();
      onShowToast?.(`🎯 Scraper active! We will email ${cleanEmail} when price drops to ≤₹${targetP.toLocaleString('en-IN')}`);

      // Auto-save user email session if not yet saved
      if (!userEmail) {
        setUserEmail(cleanEmail);
        try {
          localStorage.setItem('idh_user_email', cleanEmail);
        } catch {}
      }

      // Reset form & reload alerts list
      setInputUrl('');
      setInputTargetPrice('');
      setInspectPreview(null);
      fetchUserAlerts(cleanEmail);
    } catch (err: any) {
      onShowToast?.('Could not arm price drop scraper. Please check connection and retry.');
    } finally {
      setIsArmingScraper(false);
    }
  };

  // Run live scraper check on demand for an alert
  const handleCheckAlertNow = async (alert: TrackedAlert) => {
    setCheckingAlertId(alert.id);
    playTactileClick();
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts/${alert.id}/check`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.triggered) {
          playSuccessChime();
          onShowToast?.(`🎉 PRICE DROPPED! New Price: ₹${data.live_price}. Email notification dispatched to ${userEmail}!`);
        } else {
          onShowToast?.(data.message || `Current price is ₹${data.live_price || 'unconfirmed'}. Target is ₹${alert.target_price}. Radar active.`);
        }
        if (userEmail) fetchUserAlerts(userEmail);
      } else {
        onShowToast?.('Scanner check completed.');
      }
    } catch {
      onShowToast?.('Could not complete live check. 24/7 background scanner remains active.');
    } finally {
      setCheckingAlertId(null);
    }
  };

  // Delete an alert
  const handleDeleteAlert = async (alertId: string) => {
    playTactileClick();
    try {
      const res = await fetch(`${PUBLIC_API_BASE}/api/v1/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
        onShowToast?.('Price scraper stopped and removed from radar.');
      } else {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
      {/* ── Top Header Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-10 mb-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white">
                  {userEmail ? (
                    <span className="text-2xl font-bold uppercase">{userEmail.charAt(0)}</span>
                  ) : (
                    <User size={34} className="text-emerald-400" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {userEmail ? userEmail.split('@')[0] : 'Guest Shopper'}
                </h1>
                {userEmail ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Member
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 border border-slate-400/40 text-slate-300 flex items-center gap-1">
                    <User size={12} /> Guest
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm max-w-md">
                {userEmail
                  ? `Signed in as ${userEmail} · 24/7 personal price drop scraper active`
                  : 'Sign in with your email to track custom products, receive instant price drop alerts, and sync saved deals.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputEmail('');
                  setShowAuthModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <LogIn size={16} /> Sign in / Register
              </button>
            )}
          </div>
        </div>

        {/* ── Quick Stats Strip ── */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div
            onClick={() => onNavigateTab('saved')}
            className="cursor-pointer bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Bookmark size={14} className="text-amber-400" /> Saved Loot
            </div>
            <div className="text-lg font-bold text-white">{savedCount} deals</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-emerald-400" /> Est. Savings
            </div>
            <div className="text-lg font-bold text-emerald-400">₹{(savedCount * 850).toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Bell size={14} className="text-blue-400" /> Active Scrapers
            </div>
            <div className="text-lg font-bold text-white">
              {trackedAlerts.length > 0 ? `${trackedAlerts.length} Products` : emailAlerts ? 'Active' : 'Paused'}
            </div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck size={14} className="text-emerald-400" /> Account Status
            </div>
            <div className="text-lg font-bold text-emerald-300">{userEmail ? 'Verified Member' : 'Guest'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Live Scraper & Watchlist Radar (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Add Scraper Card (The Core Feature Requested) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Target size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Track Any Product Link
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    24/7 Live Scraper
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste Amazon, Flipkart, Myntra, or any store URL. When price drops, get an instant email!
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>24/7 Autonomous Radar: Continuous background sweeps · Instant email delivery on price drops</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddScraper} className="mt-5 space-y-4">
              {/* Product URL Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Store Product Link (URL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      required
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInspectUrl()}
                    disabled={isInspecting || !inputUrl.trim()}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
                    title="Inspect product live"
                  >
                    {isInspecting ? (
                      <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    ) : (
                      <Search size={14} />
                    )}
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              {/* Scraped Product Live Preview Card */}
              {inspectPreview && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {inspectPreview.image ? (
                      <img src={inspectPreview.image} alt={inspectPreview.title} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {inspectPreview.store || 'Verified Store'}
                      </span>
                      {inspectPreview.price && (
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Live: ₹{inspectPreview.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {inspectPreview.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Price & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Alert Me If Price Drops Below (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={inputTargetPrice}
                      onChange={(e) => setInputTargetPrice(e.target.value)}
                      placeholder="e.g. 1499"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Quick percentage drop pills */}
                  {inspectPreview?.price && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {[0.9, 0.8, 0.7].map((pct) => {
                        const val = Math.round((inspectPreview.price || 0) * pct);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              playTactileClick();
                              setInputTargetPrice(String(val));
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            -{Math.round((1 - pct) * 100)}% (₹{val.toLocaleString('en-IN')})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Email for price drops */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Notification Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={inputScraperEmail}
                      onChange={(e) => setInputScraperEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isArmingScraper}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isArmingScraper ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Arming 24/7 Scraper...</span>
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    <span>Arm Price Drop Scraper & Email Radar</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. Active Tracked Scrapers Watchlist */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Tracked Scrapers ({trackedAlerts.length})
                  </h3>
                  <p className="text-xs text-slate-500">Live scanners active on IndiaDealHunts server</p>
                </div>
              </div>

              {userEmail && (
                <button
                  type="button"
                  onClick={() => fetchUserAlerts(userEmail)}
                  disabled={loadingAlerts}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  title="Refresh list"
                >
                  <RefreshCw size={14} className={loadingAlerts ? 'animate-spin text-blue-500' : ''} />
                </button>
              )}
            </div>

            {trackedAlerts.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center">
                <Target size={28} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No active scrapers yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Paste any Amazon, Flipkart, or store product link in the tool above to start automated 24/7 price scanning with email alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackedAlerts.map((alert) => {
                  const isChecking = checkingAlertId === alert.id;
                  const isTriggered = alert.status === 'triggered';
                  return (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {alert.image_url ? (
                            <img src={alert.image_url} alt={alert.product_title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg">📱</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {alert.store || 'Store'}
                            </span>
                            {isTriggered ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Price Dropped! (Emailed)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                <Clock size={10} /> 5-Min Radar Active
                              </span>
                            )}
                          </div>
                          <a
                            href={alert.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-900 dark:text-white truncate block hover:text-emerald-500 transition-colors"
                          >
                            {alert.product_title}
                          </a>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>
                              Target: <strong className="text-emerald-600 dark:text-emerald-400">≤ ₹{alert.target_price.toLocaleString('en-IN')}</strong>
                            </span>
                            {alert.current_price && (
                              <span>
                                · Last check: ₹{alert.current_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCheckAlertNow(alert)}
                          disabled={isChecking}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                          title="Check store price now"
                        >
                          <RefreshCw size={12} className={isChecking ? 'animate-spin text-emerald-500' : ''} />
                          <span>{isChecking ? 'Checking...' : 'Check Price'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete scraper"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Appearance & Theme Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Palette size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Choose between light, dark obsidian, or device system theme</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light' as ThemePreference, label: 'Light', desc: 'Pristine bright', Icon: Sun },
                { id: 'dark' as ThemePreference, label: 'Dark', desc: 'Obsidian OLED', Icon: Moon },
                { id: 'system' as ThemePreference, label: 'System', desc: 'Device auto', Icon: Monitor },
              ].map(({ id, label, desc, Icon }) => {
                const active = preference === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setTheme(id);
                    }}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/40'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon size={22} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'} />
                      {active && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Accent Color Palette */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                Accent Highlight Palette
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {ACCENT_PRESETS.map((p) => {
                  const isSelected = accent === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectAccent(p.id, p.color)}
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? `border-slate-900 dark:border-white bg-slate-100 dark:bg-white/10 ring-2 ${p.ring}`
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                      {isSelected && <Check size={12} className="ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Interactive Audio & Accessibility Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interaction & Feedback</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Audio chimes, tactile sounds, and responsiveness</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                {isAudioEnabled ? (
                  <Volume2 size={20} className="text-emerald-500" />
                ) : (
                  <VolumeX size={20} className="text-slate-400" />
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Tactile Click Audio</div>
                  <div className="text-xs text-slate-500">Audio chime on deal saves, copies, and filter toggles</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                  isAudioEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Email Preferences, Radar Guide & Shortcuts (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Global Price Drop Email Preferences */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Drop Alert Radar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated notification delivery parameters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <Mail size={18} className="text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Email Drop Notifications</div>
                    <div className="text-[11px] text-slate-500">
                      {userEmail ? `Delivering to ${userEmail}` : 'Requires email login'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEmailAlerts}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    emailAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Drop Notification Threshold
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 40].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSelectThreshold(pct)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        alertThreshold === pct
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Drops ≥{pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Telegram Instant Sync */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TelegramIcon />
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200">Telegram VIP Channel</div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-300">Live loot drops before web post</div>
                  </div>
                </div>
                <a
                  href="https://t.me/dealsforindiachannel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Join <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* 2. How 24/7 Price Radar Works */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <Target size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">How 24/7 Price Radar Works</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Track any product on Amazon, Flipkart, Myntra, Swiggy, or any store without installing browser extensions.
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>Paste Product Link:</strong> Paste any store URL in the tracker on the left.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>Set Target Price:</strong> Specify the exact price you want to pay.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>24/7 Background Sweeps:</strong> Our server continuously checks prices every few minutes.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                  <span><strong>Instant Email Alert:</strong> As soon as the price drops to or below your target, you get an email.</span>
                </div>
              </div>

              {!userEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setInputEmail('');
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={14} /> Sign In to Link Scrapers
                </button>
              )}
            </div>
          </div>

          {/* 3. Fast Shopping Tool Shortcuts */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Fast Shopping Shortcuts
            </div>
            <button
              type="button"
              onClick={onOpenLookup}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={15} className="text-blue-500" /> Analyze Any Store URL
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500" /> Submit a Verified Deal
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('saved')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Bookmark size={15} className="text-emerald-500" /> View Saved Loot ({savedCount})
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Auth / Sign In Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to IndiaDealHunts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {authStep === 'email'
                  ? 'Passwordless & secure email authentication. Enter your email to receive a 6-digit verification code.'
                  : `Enter the 6-digit verification code sent to ${inputEmail}.`}
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authStep === 'email' ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow hover:from-emerald-400 hover:to-teal-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Sending Verification Code...
                      </>
                    ) : (
                      <>
                        <Mail size={16} /> Send 6-Digit Code
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xl font-mono font-black text-center tracking-[8px] text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {devCodeHint && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mr-2">Testing Code:</span>
                      <button
                        type="button"
                        onClick={() => setInputCode(devCodeHint)}
                        className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-500/30 transition-colors"
                      >
                        Auto-fill {devCodeHint}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingCode || inputCode.length < 4}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow hover:from-emerald-400 hover:to-teal-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingCode ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Verifying Code...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Verify & Access Profile
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('email');
                        setInputCode('');
                        setAuthError(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium cursor-pointer"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={isSendingCode}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
