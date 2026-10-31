import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

const serif = { fontFamily: "'Libre Caslon Text', Georgia, serif" };

// Soft cloud shapes layered over the sky gradient
const clouds = [
  'top-[-8%] left-[-10%] w-[45%] h-[38%] opacity-70',
  'top-[8%] right-[-12%] w-[40%] h-[34%] opacity-60',
  'top-[42%] left-[-15%] w-[50%] h-[40%] opacity-80',
  'bottom-[-12%] right-[-8%] w-[55%] h-[42%] opacity-75',
  'bottom-[18%] left-[30%] w-[35%] h-[22%] opacity-40',
  'top-[25%] left-[35%] w-[30%] h-[20%] opacity-30'
];

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetHelp, setShowResetHelp] = useState(false);

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

  const inputClass =
    'w-full px-4 py-3 bg-[#EFF6FD] border border-[#DCE8F5] rounded-lg text-sm text-[#1E2B37] placeholder:text-[#8A99A8] focus:outline-none focus:bg-white focus:border-[#2B3F52] focus:ring-2 focus:ring-[#2B3F52]/10 transition-all';

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-linear-to-b from-[#6E9DDA] via-[#93B9EA] to-[#C4DAF4]">
      {/* Sky clouds */}
      {clouds.map((pos, i) => (
        <div key={i} className={`absolute rounded-full bg-white blur-3xl pointer-events-none ${pos}`} />
      ))}

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-[36px] shadow-[0_30px_80px_-20px_rgba(30,60,110,0.35)] px-6 py-10 sm:px-12 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <img
            src="/directaid-logo.png"
            alt="DirectAid"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="mt-2 text-2xl text-[#1F3447] tracking-tight" style={serif}>
            directaid
          </span>

          <h1 className="mt-6 text-2xl text-[#141414]" style={serif}>
            Welcome Back to DirectAid
          </h1>
          <p className="mt-3 text-sm text-[#5B6672] leading-relaxed max-w-[300px]">
            Sign in to manage staff records, school divisions, and contracts.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-[#1E2B37] mb-1.5">
              Email<span className="text-rose-600">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[#1E2B37] mb-1.5">
              Password<span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password"
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2B3F52] hover:text-black transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetHelp(!showResetHelp)}
                className="text-xs text-[#1E2B37] underline underline-offset-2 hover:text-black"
              >
                Forgot Password?
              </button>
            </div>
            {showResetHelp && (
              <p className="mt-2 text-xs text-[#5B6672] bg-[#EFF6FD] border border-[#DCE8F5] rounded-lg p-2.5">
                Ask your HR administrator to reset your password in the Supabase dashboard.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#2B3F52] hover:bg-[#1F2F3E] text-white text-sm font-medium flex items-center justify-center shadow-sm transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-7 flex items-center gap-3 text-xs text-[#8A99A8]">
          <span className="flex-1 h-px bg-[#E6ECF2]" />
          <span>Hargeisa &amp; Gabiley Staff Portal</span>
          <span className="flex-1 h-px bg-[#E6ECF2]" />
        </div>

        <p className="mt-5 text-center text-sm text-[#5B6672]">
          Don&apos;t have an account? <span className="text-[#1E2B37] font-medium">Contact your HR administrator</span>
        </p>
      </div>
    </div>
  );
};
