/**
 * Theme Manager & Controller
 * Supports 'system' (dynamic OS match), 'light' (clean Apple/Stripe), and 'dark' (Obsidian Titanium OLED).
 */
import { useState, useEffect, useCallback } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'idh_theme_preference';

/**
 * Reads stored theme preference from localStorage or defaults to 'system'.
 */
export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'system';
}

/**
 * Returns the current OS theme ('dark' or 'light').
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolves a preference to an actual visual theme.
 */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') {
    return getSystemTheme();
  }
  return pref;
}

/**
 * Applies the theme to the DOM (class="dark", data-theme="dark/light", color-scheme).
 */
export function applyTheme(pref: ThemePreference): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  const resolved = resolveTheme(pref);
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  // Update mobile browser chrome color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#070A11' : '#F8FAFC');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Ignore storage errors
  }

  return resolved;
}

/**
 * React Hook for theme management across components.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => getStoredThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredThemePreference()));

  const setTheme = useCallback((newPref: ThemePreference) => {
    setPreference(newPref);
    const resolved = applyTheme(newPref);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    // Initial sync
    const resolved = applyTheme(preference);
    setResolvedTheme(resolved);

    // If system preference is selected, dynamically update when user's OS changes theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentPref = getStoredThemePreference();
      if (currentPref === 'system') {
        const nextResolved = applyTheme('system');
        setResolvedTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [preference]);

  return { preference, resolvedTheme, setTheme };
}
