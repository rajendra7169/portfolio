/**
 * useTheme — "paper / engine", not sun / moon (DESIGN.md §1).
 *
 * The initial value is read off <html data-theme>, which the inline boot script
 * in index.html has already resolved before first paint. React never picks the
 * theme itself, so there is no flash and no hydration mismatch.
 *
 * The 3D scene reads the same tokens the DOM does. A scene that ignores the
 * toggle makes the whole site feel broken (DESIGN.md §2), so the resolved
 * colours are published here rather than duplicated as literals in the shaders.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

export interface SceneColors {
  ground: string;
  surface: string;
  rule: string;
  ink: string;
  inkDim: string;
  ledger: string;
  brass: string;
}

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  colors: SceneColors;
}

const FALLBACK: Record<Theme, SceneColors> = {
  dark: {
    ground: '#0b1114',
    surface: '#141c20',
    rule: '#2a363b',
    ink: '#e4e8e4',
    inkDim: '#8c9994',
    ledger: '#c1352b',
    brass: '#b08d4f',
  },
  light: {
    ground: '#dce4d6',
    surface: '#eaefe6',
    rule: '#b4c0ac',
    ink: '#1a211c',
    inkDim: '#5c665c',
    ledger: '#a82b22',
    brass: '#6e5426',
  },
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
  colors: FALLBACK.dark,
});

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** Pulls the live token values off :root so the scene can never drift. */
function readColors(fallback: SceneColors): SceneColors {
  if (typeof window === 'undefined') return fallback;
  const style = getComputedStyle(document.documentElement);
  const get = (name: string, dflt: string): string => {
    const v = style.getPropertyValue(name).trim();
    return v.length > 0 ? v : dflt;
  };
  return {
    ground: get('--ground', fallback.ground),
    surface: get('--surface', fallback.surface),
    rule: get('--rule', fallback.rule),
    ink: get('--ink', fallback.ink),
    inkDim: get('--ink-dim', fallback.inkDim),
    ledger: get('--ledger', fallback.ledger),
    brass: get('--brass', fallback.brass),
  };
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [colors, setColors] = useState<SceneColors>(() => FALLBACK[readInitialTheme()]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      // The only thing this site ever stores. CLAUDE.md §4.8.
      localStorage.setItem('theme', theme);
    } catch {
      /* storage disabled — the toggle still works for this session */
    }
    // Read after the attribute lands so the computed values are the new ones.
    setColors(readColors(FALLBACK[theme]));
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle, colors }),
    [theme, toggle, colors],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
