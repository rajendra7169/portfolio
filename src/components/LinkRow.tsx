/**
 * LinkRow — a labelled external link with its brand mark.
 *
 * Every social and competitive-programming link on the site renders through
 * this, which is what keeps the brief §2's "each labelled and linked" true: the
 * component has no icon-only mode to fall into.
 */
import { Brandmark } from './Brandmark';

interface LinkRowProps {
  href: string;
  name: string;
  handle: string;
  icon: string;
  brand: string;
}

export function LinkRow({ href, name, handle, icon, brand }: LinkRowProps) {
  const external = !href.startsWith('mailto:') && !href.startsWith('tel:');

  return (
    <li>
      <a
        className="linkrow"
        href={href}
        style={{ ['--mark-brand' as string]: brand }}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <Brandmark slug={icon} className="linkrow__glyph" />
        <span className="linkrow__text">
          <span className="linkrow__name">{name}</span>
          <span className="linkrow__handle">{handle}</span>
        </span>
      </a>
    </li>
  );
}
