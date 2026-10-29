import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const error = await login(email, password);
    setIsLoading(false);
    if (error) setErrorMsg(error);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EEF7F1] via-[#F6FAF7] to-[#E3F2E9] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#147D4A]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#35B86B]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/40 blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-[#C5E8D2] rounded-3xl shadow-md mb-1 group hover:scale-105 transition-transform duration-300">
            <img
              src="/directaid-logo.png"
              alt="DirectAid Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Fallback in case of image load delay
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#192C21] tracking-tight">
            DirectAid
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#147D4A]">
            <span className="w-2 h-2 rounded-full bg-[#147D4A] animate-pulse" />
            <span>Somaliland Staff &amp; HR Portal</span>
          </div>
          <p className="text-xs text-[#57685D] max-w-xs mx-auto">
            Hargeisa &amp; Gabiley Campus Divisions Operations
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md border border-[#E2EAE4] rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
          {/* Top Emerald Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#147D4A] via-[#35B86B] to-[#147D4A]" />

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#192C21]">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E9185]" />
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@directaid.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] placeholder:text-[#8D9F94] focus:outline-none focus:ring-2 focus:ring-[#147D4A]/20 focus:border-[#147D4A] focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#192C21]">
                  Password
                </label>
                <span className="text-[11px] text-[#6B7E72] hover:text-[#147D4A] cursor-pointer">
                  Hargeisa HQ Helpdesk
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E9185]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] placeholder:text-[#8D9F94] focus:outline-none focus:ring-2 focus:ring-[#147D4A]/20 focus:border-[#147D4A] focus:bg-white transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E9185] hover:text-[#192C21] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#57685D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#C5E8D2] text-[#147D4A] focus:ring-[#147D4A] w-3.5 h-3.5 cursor-pointer accent-[#147D4A]"
                />
                <span>Remember this terminal</span>
              </label>

              <span className="text-[11px] font-semibold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
                Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-linear-to-r from-[#147D4A] to-[#2DA25D] hover:from-[#0E6139] hover:to-[#248B4E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Secure Gateway Badge */}
          <div className="mt-6 pt-4 border-t border-[#E2EAE4] flex items-center justify-center gap-2 text-[11px] text-[#6B7E72]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#147D4A]" />
            <span>Ministry of Education &amp; DirectAid Certified HR Hub</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#6B7E72] space-y-1">
          <p>DirectAid Somaliland © 2025 · Academic Term 2024/25</p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
            <span>Hargeisa Central HQ</span>
            <span>·</span>
            <span>Gabiley Regional Campus</span>
            <span>·</span>
            <span>v2.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};
