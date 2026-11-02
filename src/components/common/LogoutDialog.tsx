import React, { useEffect, useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';

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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[60] flex items-center justify-center p-4"
      onClick={() => !isSigningOut && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        className="save-notice-enter bg-white rounded-2xl max-w-sm w-full border border-[#E2EAE4] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </span>
          <h3 id="logout-title" className="mt-4 font-bold text-lg text-[#192C21]">Log out?</h3>
          <p className="mt-1 text-sm text-[#57685D]">
            Are you sure you want to log out{email ? <> of <span className="font-semibold text-[#192C21] break-all">{email}</span></> : ''}?
          </p>
        </div>
        <div className="px-6 pb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSigningOut}
            className="py-2.5 text-sm font-semibold text-[#384C3F] bg-white border border-[#E2EAE4] hover:bg-[#F3F7F4] rounded-xl transition-colors disabled:opacity-50"
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={isSigningOut}
            className="py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
          >
            {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {isSigningOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
};
