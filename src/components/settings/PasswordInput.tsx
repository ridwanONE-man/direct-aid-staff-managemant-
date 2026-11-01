import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const settingsInputClass =
  'w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all';

export const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  autoFocus?: boolean;
}> = ({ value, onChange, placeholder, autoComplete = 'new-password', autoFocus }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${settingsInputClass} pr-10`}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
