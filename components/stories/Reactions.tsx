"use client";

// The reactions at the end of a post: one per reader, changeable, no account
// needed (see the stores). Updates show at once and settle when the store answers.
import { useState } from "react";
import { stories, useStories } from "@/lib/stories/store";
import { REACTIONS, type ReactionKind, type Reactions as R } from "@/lib/stories/types";

export default function Reactions({ postId }: { postId: string }) {
  const { data } = useStories((s) => s.reactions(postId), [postId]);
  const [local, setLocal] = useState<R | null>(null);
  const [error, setError] = useState("");
  const shown = local ?? data;

  const pick = async (kind: ReactionKind) => {
    if (!shown) return;
    const next = shown.mine === kind ? null : kind;
    const counts = { ...shown.counts };
    if (shown.mine) counts[shown.mine]--;
    if (next) counts[next]++;
    setLocal({ counts, mine: next });
    setError("");
    try {
      setLocal(await stories().react(postId, next));
    } catch (e) {
      setLocal(null);
      setError((e as Error).message);
    }
  };

  const total = shown ? Object.values(shown.counts).reduce((a, b) => a + b, 0) : 0;
  return (
    <section className="st-react" aria-labelledby="st-react-h">
      <h2 id="st-react-h" className="st-react-h">
        How did this land?
      </h2>
      <div className="st-react-row">
        {REACTIONS.map((r) => {
          const n = shown?.counts[r.id] ?? 0;
          const on = shown?.mine === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`st-react-btn${on ? " is-on" : ""}`}
              aria-pressed={on}
              aria-label={`${r.label}${n ? `, ${n}` : ""}`}
              title={r.label}
              onClick={() => pick(r.id)}
              disabled={!shown}
            >
              <span className="st-react-emoji" aria-hidden="true">
                {r.emoji}
              </span>
              {n > 0 && <span className="st-react-n">{n}</span>}
            </button>
          );
        })}
      </div>
      <p className="st-react-note" role="status">
        {error || (shown?.mine ? "Thanks for reading. Tap again to take it back." : total ? `${total} ${total === 1 ? "reader has" : "readers have"} reacted.` : "Be the first to react.")}
      </p>
    </section>
  );
}
