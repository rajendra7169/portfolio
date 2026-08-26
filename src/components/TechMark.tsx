/**
 * TechMark — one technology, its real brand colour, its name as real text.
 *
 * `onFocusMark` is the DOM half of the two-way link in DESIGN.md §5.4: hovering
 * a mark lights the matching cube in the lattice, and hovering a cube lights the
 * mark. Both halves write to the same store, so neither side owns the state.
 */
import type { SoftwareSkill } from '../content';
import { Brandmark } from './Brandmark';

interface TechMarkProps {
  skill: SoftwareSkill;
  active?: boolean;
  onHover?: (name: string | null) => void;
}

export function TechMark({ skill, active = false, onHover }: TechMarkProps) {
  return (
    <li
      className="mark"
      style={{ ['--mark-brand' as string]: skill.brand }}
      data-active={active ? 'true' : undefined}
      data-mark={skill.name}
      onPointerEnter={onHover ? () => onHover(skill.name) : undefined}
      onPointerLeave={onHover ? () => onHover(null) : undefined}
    >
      <Brandmark slug={skill.icon} className="mark__glyph" />
      <span>{skill.name}</span>
    </li>
  );
}
