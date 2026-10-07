import { tracks } from "@/lib/content";

/** Section header styled as a track on the tracklist. */
export default function TrackHead({ id, title, note }: { id: string; title: string; note?: string }) {
  const n = tracks.findIndex((t) => t.id === id) + 1;
  return (
    <header className="trk-head">
      <span className="trk-no">TRK {String(n).padStart(2, "0")}</span>
      <h2 className="trk-title">{title}</h2>
      {note && <span className="trk-note">{note}</span>}
      <span className="trk-rule" aria-hidden="true" />
    </header>
  );
}
