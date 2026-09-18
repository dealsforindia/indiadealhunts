import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, requestCode, verifyCode } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus input on step change
  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('email');
      setError(null);
      setDevCodeHint(null);
      setOtp(['', '', '', '', '', '']);
      return;
    }

    if (step === 'email') {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else if (step === 'code') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [isAuthModalOpen, step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await requestCode(cleanEmail);
      setStep('code');
      setResendCooldown(60);
      if (res.dev_code) {
        setDevCodeHint(res.dev_code);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to request access code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      digits.forEach((digit, i) => {
        if (otpRefs.current[i]) otpRefs.current[i]!.value = digit;
      });
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyCode(email.trim().toLowerCase(), code);
      // Auth success! Modal automatically closed by AuthContext
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await requestCode(email.trim().toLowerCase());
      setResendCooldown(60);
      if (res.dev_code) setDevCodeHint(res.dev_code);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAutofill = (code: string) => {
    const digits = code.split('');
    setOtp(digits);
    handleVerify(code);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0D121F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-emerald-500"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/40">
            {step === 'email' ? (
              <Mail className="w-6 h-6" aria-hidden="true" />
            ) : (
              <KeyRound className="w-6 h-6 animate-pulse" aria-hidden="true" />
            )}
          </div>
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {step === 'email' ? 'Welcome to IndiaDealHunts' : 'Verify Your Email'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 'email'
              ? 'Passwordless sign-in • Sync price drop alerts & save loot drops'
              : `Enter the 6-digit access code dispatched to ${email}`}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email-input" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="auth-email-input"
                  ref={emailInputRef}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full min-h-[46px] py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>No password required • 100% spam-free guarantee</span>
            </div>
          </form>
        )}

        {/* Step 2: Enter 6-Digit Code */}
        {step === 'code' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-3 text-center uppercase tracking-wider">
                Enter 6-Digit Code
              </label>

              {/* Segmented OTP Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${idx + 1}`}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black font-mono rounded-xl bg-slate-900 border border-white/15 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {/* Helper message */}
            <p className="text-[11px] text-slate-400 text-center">
              Didn't receive the code? Check your spam/promotions folder or click resend below.
            </p>

            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.join('').length < 6}
              className="w-full min-h-[46px] py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Access Hub</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                onClick={() => setStep('email')}
                className="text-slate-400 hover:text-white transition-colors focus:ring-1 focus:ring-emerald-500 rounded px-1"
              >
                ← Change Email
              </button>

              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 transition-colors focus:ring-1 focus:ring-emerald-500 rounded px-1 font-semibold"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
