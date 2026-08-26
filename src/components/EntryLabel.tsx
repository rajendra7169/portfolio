/**
 * EntryLabel — "ENTRY 04 · 17 TOOLS · SYSTEMS".
 *
 * DESIGN.md §3: structural numbering is justified because the content really is
 * a chronological sequence, but a bare 01 / 02 / 03 carries nothing. Every entry
 * therefore takes a qualifier — a year span where one exists, a count or a place
 * where it does not.
 */
interface EntryLabelProps {
  entry: string;
  qualifier: string;
  title: string;
}

export function EntryLabel({ entry, qualifier, title }: EntryLabelProps) {
  return (
    <p className="entry figures">
      <span>Entry {entry}</span>
      <span className="entry__sep" aria-hidden="true">
        ·
      </span>
      <span>{qualifier}</span>
      <span className="entry__sep" aria-hidden="true">
        ·
      </span>
      <span>{title}</span>
    </p>
  );
}
