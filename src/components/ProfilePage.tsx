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
  GraduationCap,
  Check,
  LogIn,
  LogOut,
  Sliders,
  TrendingDown,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useTheme, ThemePreference } from '../utils/themeManager';
import { getSavedDealIds } from '../utils/savedDeals';
import { TelegramIcon } from './TelegramIcon';
import { playTactileClick, playSuccessChime } from '../utils/audio';

interface ProfilePageProps {
  onNavigateTab: (tab: any) => void;
  onOpenLookup?: () => void;
  onOpenSubmit?: () => void;
  onShowToast?: (msg: string) => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
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
  const { preference, resolvedTheme, setTheme } = useTheme();

  // User state (Email-based Auth with Free / Student Plan support)
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('idh_user_email') || '';
    } catch {
      return '';
    }
  });
  const [isStudentPlan, setIsStudentPlan] = useState<boolean>(() => {
    try {
      return localStorage.getItem('idh_is_student') === 'true';
    } catch {
      return false;
    }
  });

  // Auth modal/dialog state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputStudent, setInputStudent] = useState(false);

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

  useEffect(() => {
    setSavedCount(getSavedDealIds().length);
  }, []);

  const handleSelectAccent = (colorId: string, hexColor: string) => {
    playTactileClick();
    setAccent(colorId);
    try {
      localStorage.setItem('idh_accent_theme', colorId);
      document.documentElement.style.setProperty('--accent-primary-custom', hexColor);
    } catch {}
    onShowToast?.(`Accent theme updated to ${colorId.charAt(0).toUpperCase() + colorId.slice(1)}`);
  };

  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputEmail.includes('@')) {
      onShowToast?.('Please enter a valid email address');
      return;
    }
    const cleanEmail = inputEmail.trim().toLowerCase();
    setUserEmail(cleanEmail);
    setIsStudentPlan(inputStudent);
    try {
      localStorage.setItem('idh_user_email', cleanEmail);
      localStorage.setItem('idh_is_student', inputStudent ? 'true' : 'false');
    } catch {}
    playSuccessChime();
    setShowAuthModal(false);
    onShowToast?.(inputStudent ? '🎓 Student Plan activated with Free perks!' : 'Signed in successfully!');
  };

  const handleSignOut = () => {
    playTactileClick();
    setUserEmail('');
    setIsStudentPlan(false);
    try {
      localStorage.removeItem('idh_user_email');
      localStorage.removeItem('idh_is_student');
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
              {isStudentPlan && (
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1 rounded-full border-2 border-slate-900 shadow" title="Verified Student Plan">
                  <GraduationCap size={16} />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {userEmail ? userEmail.split('@')[0] : 'Guest Shopper'}
                </h1>
                {isStudentPlan ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center gap-1">
                    <GraduationCap size={12} /> Student Free Plan
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={12} /> Free Member
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm max-w-md">
                {userEmail
                  ? `Signed in as ${userEmail} · Price drop tracking active`
                  : 'Sign in with your email to unlock saved deal syncing, student perks, and instant price drop alerts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold border border-white/10 transition-colors flex items-center gap-2"
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <LogIn size={16} /> Sign in / Register (Free)
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
              <Bell size={14} className="text-blue-400" /> Price Watches
            </div>
            <div className="text-lg font-bold text-white">{emailAlerts ? 'Active' : 'Paused'}</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <GraduationCap size={14} className="text-purple-400" /> Plan Status
            </div>
            <div className="text-lg font-bold text-purple-300">{isStudentPlan ? 'Student' : 'Free Forever'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Theme & Interface Studio (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Theme Mode Switcher */}
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
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
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
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
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

          {/* 2. Interactive Audio & Accessibility Settings */}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
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

        {/* ── Right Column: Price Drop Tracker & Student Plan (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Price Drop Email Tracker (#13) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Price Drop Tracker</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts for your saved and watched products</p>
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
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
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500 transition-colors flex items-center gap-1"
                >
                  Join <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* 2. Student & Community Perks Plan (#12) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/90 to-indigo-950 text-white border border-purple-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <GraduationCap size={20} className="text-purple-300" />
                <h3 className="text-base font-bold text-white">Student & College Perks</h3>
              </div>
              <p className="text-xs text-purple-200/90 leading-relaxed mb-4">
                IndiaDealHunts is 100% free for all students. Get priority notifications on student laptop deals, textbooks, and hostel gadgets.
              </p>

              <button
                type="button"
                onClick={() => {
                  setInputEmail(userEmail || '');
                  setInputStudent(true);
                  setShowAuthModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={14} /> {isStudentPlan ? 'Student Status Active ✓' : 'Verify Student Free Perks'}
              </button>
            </div>
          </div>

          {/* 3. Fast Tool Shortcuts */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Fast Shopping Shortcuts
            </div>
            <button
              type="button"
              onClick={onOpenLookup}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Search size={15} className="text-blue-500" /> Analyze Any Store URL
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500" /> Submit a Verified Deal
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Auth / Sign In Modal (#12) ── */}
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
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deal Hunter Account</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                100% Free Forever. No credit card required. Track price drops and sync your saved bookmarks.
              </p>

              <form onSubmit={handleSaveAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="name@gmail.com or campus.edu"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputStudent}
                      onChange={(e) => setInputStudent(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                        <GraduationCap size={14} /> Student / College Perks
                      </div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-300">
                        Enable free student plan for verified campus deals & gear.
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow hover:from-emerald-400 hover:to-teal-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Continue as Deal Hunter
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ProfilePage;
