// Light / dark theme for the signed-in portal. The choice is a per-device preference, so it lives in
// localStorage; `system` follows the operating system setting.
export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'directaid_theme';
const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export const getThemePreference = (): ThemePreference => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // Storage unavailable (private mode); fall back to light
  }
  return 'light';
};

const applyTheme = (pref: ThemePreference) => {
  const dark = pref === 'dark' || (pref === 'system' && !!darkQuery?.matches);
  document.documentElement.classList.toggle('dark', dark);
};

export const setThemePreference = (pref: ThemePreference) => {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // Not saved, but still applied for this visit
  }
  applyTheme(pref);
};

// Called once at startup, before the first render
export const initTheme = () => {
  applyTheme(getThemePreference());
  darkQuery?.addEventListener('change', () => {
    if (getThemePreference() === 'system') applyTheme('system');
  });
};
