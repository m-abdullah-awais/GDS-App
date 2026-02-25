/**
 * GDS Driving School — Theme Context & Provider
 * ================================================
 *
 * Provides runtime theme switching (light / dark / system)
 * via React Context. Wraps the entire app.
 *
 * Usage:
 *   // In App.tsx
 *   import { ThemeProvider } from './src/theme/ThemeContext';
 *   <ThemeProvider> ... </ThemeProvider>
 *
 *   // In any component
 *   import { useTheme } from '../theme/ThemeContext';
 *   const { theme, colorScheme, setColorScheme } = useTheme();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { lightTheme, darkTheme, type AppTheme } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorSchemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The resolved theme object with all tokens */
  theme: AppTheme;
  /** Current user preference */
  colorScheme: ColorSchemePreference;
  /** Whether the theme is currently dark */
  isDark: boolean;
  /** Set the color scheme preference */
  setColorScheme: (scheme: ColorSchemePreference) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
  /** Initial preference. Defaults to 'system'. */
  initialScheme?: ColorSchemePreference;
}

export function ThemeProvider({
  children,
  initialScheme = 'system',
}: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreference] = useState<ColorSchemePreference>(initialScheme);

  const isDark = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark';
    }
    return preference === 'dark';
  }, [preference, systemScheme]);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      if (prev === 'system') return systemScheme === 'dark' ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colorScheme: preference,
      isDark,
      setColorScheme: setPreference,
      toggleTheme,
    }),
    [theme, preference, isDark, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}

// ─── Convenience: useColors ───────────────────────────────────────────────────

/** Shortcut to get just the resolved color tokens */
export function useColors() {
  return useTheme().theme.colors;
}

export default ThemeContext;
