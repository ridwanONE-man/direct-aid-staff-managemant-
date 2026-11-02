import React, { useEffect, useState } from 'react';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';

// "Are you sure?" step before signing out
export const LogoutDialog: React.FC<{ email: string | null; onConfirm: () => Promise<void>; onCancel: () => void }> = ({
  email,
  onConfirm,
  onCancel
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSigningOut) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSigningOut, onCancel]);

  const confirm = async () => {
    setIsSigningOut(true);
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-[#0B2016]/55 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={() => !isSigningOut && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        className="login-card-enter bg-white rounded-3xl max-w-sm w-full border border-[#E2EAE4] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green header; the logo sits fully inside it */}
        <div className="relative bg-linear-to-br from-[#0B4F2E] via-[#147D4A] to-[#35B86B] px-6 pt-6 pb-7 text-center text-white overflow-hidden">
          <span className="absolute -top-12 -right-10 w-40 h-40 rounded-full border-[20px] border-white/10" />
          <span className="absolute -bottom-14 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute top-12 left-6 w-2 h-2 rounded-full bg-white/40" />
          <span className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-white/50" />

          <span className="relative mx-auto w-20 h-20 rounded-full bg-white shadow-lg ring-4 ring-white/30 flex items-center justify-center">
            <img src="/favicon-192.png" alt="DirectAid" className="w-16 h-16" />
          </span>
          <h3 id="logout-title" className="relative mt-4 font-black text-xl tracking-tight">Log out of DirectAid?</h3>
          <p className="relative mt-1 text-sm text-white/85">Staff &amp; HR Portal</p>
        </div>

        <div className="px-6 pt-5 pb-6 text-center">
          <p className="text-sm text-[#57685D]">
            You'll need your email and password to sign in again.
          </p>
          {email && (
            <span className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-[#147D4A] bg-[#EBF7EE] border border-[#C5E8D2] px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </span>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSigningOut}
              className="py-2.5 text-sm font-semibold text-[#147D4A] bg-white border-2 border-[#C5E8D2] hover:border-[#147D4A] hover:bg-[#EBF7EE] rounded-xl transition-colors disabled:opacity-50"
              autoFocus
            >
              Stay signed in
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={isSigningOut}
              className="py-2.5 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 rounded-xl shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-70"
            >
              {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {isSigningOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
