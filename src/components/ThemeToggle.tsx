/**
 * ThemeToggle — reads "paper / engine" (DESIGN.md §1). The two modes carry
 * meaning here: light is greenbar accounting stock, dark is an engine's scene
 * view. Sun and moon icons would throw that away.
 *
 * Which half is lit comes from CSS keyed on <html data-theme>, not from React
 * state. The page is prerendered, and a state-driven class would differ between
 * the prerendered markup and the first client render for anyone whose stored
 * theme is not the default.
 */
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'paper' : 'engine';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className="theme-toggle__paper">paper</span>
      <span className="theme-toggle__slash" aria-hidden="true">
        /
      </span>
      <span className="theme-toggle__engine">engine</span>
    </button>
  );
}
