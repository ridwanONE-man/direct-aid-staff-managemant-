// Portal themes for the signed-in app. The choice is a per-device preference, so it lives in localStorage.
// light: green and white · system: soft charcoal ("dim") · dark: true black with see-through panels
export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'directaid_theme';

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
  const root = document.documentElement.classList;
  root.toggle('dark', pref === 'dark');
  root.toggle('dim', pref === 'system');
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
export const initTheme = () => applyTheme(getThemePreference());
