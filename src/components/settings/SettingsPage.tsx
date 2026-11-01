import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { roleLabel } from '../../lib/roles';
import { getThemePreference, setThemePreference, ThemePreference } from '../../lib/theme';
import { AccountsPanel } from './AccountsPanel';
import { PasswordInput } from './PasswordInput';
import { CheckCircle2, Loader2, Lock, Monitor, Moon, Palette, Settings, ShieldCheck, Sun, Users } from 'lucide-react';

type SettingsTab = 'appearance' | 'security' | 'accounts';

const THEMES: { value: ThemePreference; label: string; hint: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', hint: 'Bright green and white', icon: Sun },
  { value: 'dark', label: 'Dark', hint: 'Easier on the eyes at night', icon: Moon },
  { value: 'system', label: 'System', hint: 'Follow this device', icon: Monitor }
];

const AppearancePanel: React.FC = () => {
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference());
  const choose = (value: ThemePreference) => {
    setTheme(value);
    setThemePreference(value);
  };

  return (
    <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs">
      <h2 className="text-sm font-bold text-[#192C21]">Theme</h2>
      <p className="text-xs text-[#57685D] mt-0.5">Saved on this device only.</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEMES.map(t => {
          const active = theme === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => choose(t.value)}
              className={`relative p-4 rounded-2xl border text-left transition-all ${
                active ? 'border-[#147D4A] bg-[#EBF7EE] shadow-sm' : 'border-[#E2EAE4] hover:border-[#C5E8D2]'
              }`}
            >
              {/* Mini preview of the theme */}
              <div
                className={`h-16 rounded-xl mb-3 border flex gap-1.5 p-1.5 ${
                  t.value === 'dark'
                    ? 'theme-preview-dark'
                    : t.value === 'system'
                      ? 'theme-preview-split'
                      : 'theme-preview-light'
                }`}
              >
                <span className="w-1/4 rounded-md bg-[#147D4A]/80" />
                <span className="flex-1 rounded-md theme-preview-card" />
              </div>
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#192C21]">
                <t.icon className="w-4 h-4 text-[#147D4A]" /> {t.label}
              </span>
              <span className="block text-[11px] text-[#57685D] mt-0.5">{t.hint}</span>
              {active && <CheckCircle2 className="absolute top-3 right-3 w-4.5 h-4.5 text-[#147D4A]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SecurityPanel: React.FC = () => {
  const { userEmail } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !supabase || !userEmail) return;
    setError('');
    setSuccess('');
    if (next.length < 8) return setError('The new password must be at least 8 characters.');
    if (next !== confirm) return setError('The new passwords do not match.');
    if (next === current) return setError('Choose a password different from your current one.');

    setIsSaving(true);
    // Confirm the current password before changing it
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: userEmail, password: current });
    if (signInError) {
      setIsSaving(false);
      return setError('Your current password is not correct.');
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setIsSaving(false);
    if (updateError) return setError(updateError.message);
    setCurrent('');
    setNext('');
    setConfirm('');
    setSuccess('Your password has been changed. Use the new one next time you sign in.');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs max-w-lg space-y-3">
      <div>
        <h2 className="text-sm font-bold text-[#192C21]">Change Password</h2>
        <p className="text-xs text-[#57685D] mt-0.5">For your own account ({userEmail}).</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">Current password</label>
        <PasswordInput value={current} onChange={setCurrent} placeholder="Your current password" autoComplete="current-password" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">New password</label>
        <PasswordInput value={next} onChange={setNext} placeholder="At least 8 characters" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">Confirm new password</label>
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Type the new password again" />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {success && (
        <p className="text-xs text-[#147D4A] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving || !current || !next || !confirm}
        className="px-5 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {isSaving ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  );
};

export const SettingsPage: React.FC = () => {
  const { userEmail, userRole, isAdmin } = useApp();
  const [tab, setTab] = useState<SettingsTab>('appearance');

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Password', icon: Lock },
    ...(isAdmin ? [{ id: 'accounts' as const, label: 'Accounts', icon: Users }] : [])
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-[#192C21] tracking-tight">Settings</h1>
            <p className="text-xs text-[#57685D] mt-0.5">Theme, password{isAdmin ? ' and portal accounts' : ''}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#57685D] truncate max-w-[200px]">{userEmail}</span>
          <span className="inline-flex items-center gap-1 font-bold text-[#147D4A] bg-[#EBF7EE] border border-[#C5E8D2] px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> {roleLabel(userRole)}
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-1.5 shadow-xs flex gap-1 overflow-x-auto text-xs">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`py-2 px-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              tab === t.id ? 'bg-[#147D4A] text-white shadow-sm' : 'text-[#57685D] hover:text-[#147D4A] hover:bg-[#F3F9F5]'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'appearance' && <AppearancePanel />}
      {tab === 'security' && <SecurityPanel />}
      {tab === 'accounts' && isAdmin && <AccountsPanel />}
    </div>
  );
};
