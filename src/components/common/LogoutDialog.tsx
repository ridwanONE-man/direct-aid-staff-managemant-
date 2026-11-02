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
      className="fixed inset-0 bg-[#0B2016]/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={() => !isSigningOut && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        className="login-card-enter bg-white rounded-3xl max-w-sm w-full border border-[#E2EAE4] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green band with the DirectAid emblem */}
        <div className="relative h-28 bg-linear-to-br from-[#0B4F2E] via-[#147D4A] to-[#35B86B] overflow-hidden">
          <span className="absolute -top-10 -right-8 w-36 h-36 rounded-full border-[18px] border-white/10" />
          <span className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute top-4 left-5 inline-flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Secure sign-out
          </span>
        </div>
        <div className="-mt-10 flex justify-center">
          <span className="w-20 h-20 rounded-3xl bg-white shadow-xl ring-4 ring-white flex items-center justify-center">
            <img src="/favicon-192.png" alt="DirectAid" className="w-14 h-14" />
          </span>
        </div>

        <div className="px-6 pt-3 pb-5 text-center">
          <h3 id="logout-title" className="font-black text-xl text-[#192C21] tracking-tight">Log out of DirectAid?</h3>
          <p className="mt-1.5 text-sm text-[#57685D]">You'll need your email and password to sign in again.</p>
          {email && (
            <span className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-[#147D4A] bg-[#EBF7EE] border border-[#C5E8D2] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#147D4A] shrink-0" />
              <span className="truncate">{email}</span>
            </span>
          )}
        </div>

        <div className="px-6 pb-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSigningOut}
            className="py-2.5 text-sm font-semibold text-[#147D4A] bg-white border border-[#C5E8D2] hover:bg-[#EBF7EE] rounded-xl transition-colors disabled:opacity-50"
            autoFocus
          >
            Stay signed in
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={isSigningOut}
            className="py-2.5 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-70"
          >
            {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {isSigningOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
};
