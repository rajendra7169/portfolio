/**
 * Brandmark — one inline 24x24 path from src/data/brandmarks.ts.
 *
 * Decorative by default: the mark always sits beside a real text label, so
 * announcing it again would just double every entry for a screen reader.
 */
import { brandmarks } from '../data/brandmarks';

interface BrandmarkProps {
  slug: string;
  className?: string;
  /** Set only when the mark stands alone with no adjacent text. */
  title?: string;
}

export function Brandmark({ slug, className, title }: BrandmarkProps) {
  const path = brandmarks[slug];
  // A slug with no path renders nothing rather than an empty box.
  if (!path) return null;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}
