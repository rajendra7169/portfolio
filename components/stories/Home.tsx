"use client";

// The Stories front page: the masthead across the whole page, then the writing
// on the left (the lead, then everything else, newest first) and the rail on
// the right. With ?type=, ?tag= or ?q= the left side becomes that list.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { docText, neNum, POST_TYPES, type PostType } from "@/lib/stories/types";
import { Couplet, Loved, Rail, Topics, useLibrary, Writers } from "./Rail";
import { headline, fontOf, whenFont } from "./headline";
import { Empty, Entry, Hang, Lead, Loading } from "./ui";
import { welcome } from "./welcome";

const ABOUT: Record<PostType, string> = {
  blog: "Notes on work, tools and the things I build.",
  story: "Short fiction, and true things told like fiction.",
  gajal: "Couplets held together by rhyme and refrain.",
  kabita: "Poems, mostly in Nepali.",
};
const WORDS = [
  { ne: "मेरो", en: "my" },
  { ne: "अर्को", en: "other" },
  { ne: "संसार", en: "world" },
];

/** The masthead's own entrance: the bar draws across, the words drop from it. Skipped when the welcome hands over to it. */
function useHang() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const h = ref.current;
    if (!h || welcome.handoff || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const out = "cubic-bezier(0.2, 0.8, 0.2, 1)";
    const anims = [
      h.querySelector(".st-mast-bar")!.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 900, easing: "cubic-bezier(0.6, 0, 0.3, 1)", fill: "backwards" }),
      ...[...h.querySelectorAll(".st-mast-word")].map((w, i) =>
        w.animate(
          [
            { clipPath: "inset(0 0 100% 0)", transform: "translateY(-0.12em)" },
            { clipPath: "inset(0 0 -25% 0)", transform: "none" },
          ],
          { duration: 820, delay: 300 + i * 140, easing: out, fill: "backwards" },
        ),
      ),
    ];
    return () => anims.forEach((a) => a.cancel());
  }, []);
  return ref;
}

/**
 * Puts the bar exactly on the words' own headline stroke, wherever this browser
 * draws it (see headline.ts), and hangs the ear from the bar's lower edge.
 */
function useAlign(ref: RefObject<HTMLElement | null>, deps: unknown[]) {
  useLayoutEffect(() => {
    const mast = ref.current;
    const title = mast?.querySelector<HTMLElement>(".st-mast-title");
    if (!mast || !title) return;
    const place = () => {
      const hl = headline(fontOf(title), title.textContent ?? "");
      const base = title.querySelector(".st-base");
      if (!hl || !base) return;
      const box = mast.getBoundingClientRect();
      const top = base.getBoundingClientRect().top - hl.above - box.top;
      mast.style.setProperty("--bar-top", `${top}px`);
      mast.style.setProperty("--bar-h", `${hl.thick}px`);
      const ear = mast.querySelector<HTMLElement>(".st-mast-ear");
      const words = ear?.querySelector<HTMLElement>("[lang=ne]");
      const earBase = words?.querySelector(".st-base");
      if (!ear || !words || !earBase) return;
      if (getComputedStyle(ear).position !== "absolute") return void ear.style.removeProperty("top");
      const ehl = headline(fontOf(words), words.textContent ?? "");
      if (!ehl) return;
      // Its stroke's top meets the bar's lower edge, one pixel into it so the two join
      // (no more: the digits, which have no stroke of their own, would lose their tops).
      const strokeTop = earBase.getBoundingClientRect().top - ehl.above - box.top;
      const want = top + hl.thick - 1;
      ear.style.top = `${ear.offsetTop + (want - strokeTop)}px`;
    };
    return whenFont(title, title.textContent ?? "", place, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function Masthead({ pieces, writers }: { pieces: number; writers: number }) {
  const ref = useHang();
  useAlign(ref, [pieces, writers]);
  return (
    <header className="st-mast st-wrap" ref={ref}>
      {/* Beside the title rather than in it: it runs past the title's box, the whole width of the window. */}
      <span className="st-mast-bar" aria-hidden="true" />
      <h1 className="st-mast-title" lang="ne">
        {WORDS.map((w, i) => (
          <span key={w.ne}>
            {i > 0 && " "}
            <span className="st-mast-word" data-gloss={w.en}>
              {w.ne}
            </span>
          </span>
        ))}
        <i className="st-base" aria-hidden="true" />
      </h1>
      {pieces > 0 && (
        // Hangs from the masthead's bar at the far end, like a newspaper's ear.
        <p className="st-mast-ear">
          <span lang="ne">
            {neNum(pieces)} रचना, {neNum(writers)} लेखक
            <i className="st-base" aria-hidden="true" />
          </span>
          <small>
            {pieces} {pieces === 1 ? "piece" : "pieces"} by {writers} {writers === 1 ? "writer" : "writers"}, from Kathmandu
          </small>
        </p>
      )}
      <p className="st-mast-dek">The other side of me. Stories, gajal, kabita and notes, written between commits, alongside friends who write too.</p>
    </header>
  );
}

export default function Home() {
  const sp = useSearchParams();
  const rawType = sp.get("type");
  const type = POST_TYPES.some((t) => t.id === rawType) ? (rawType as PostType) : undefined;
  const q = sp.get("q")?.trim() || "";
  const tag = sp.get("tag")?.trim() || "";
  const filtered = Boolean(type || q || tag);
  const { data: lib, loading, error } = useLibrary();

  const all = lib?.posts ?? [];
  const needle = q.toLowerCase();
  const list = all.filter(
    (p) =>
      (!type || p.type === type) &&
      (!tag || p.tags.includes(tag)) &&
      (!needle || `${p.title} ${p.subtitle} ${p.tags.join(" ")} ${docText(p.content)}`.toLowerCase().includes(needle)),
  );
  const lead = filtered ? undefined : (list.find((p) => p.featured) ?? list[0]);
  const rest = list.filter((p) => p !== lead);
  const writers = new Set(all.map((p) => p.authorId)).size;
  const t = type && POST_TYPES.find((x) => x.id === type)!;

  return (
    <div className="st-home">
      {filtered ? (
        <header className="st-wrap st-list-head">
          {t ? (
            <>
              <h1>
                <span lang="ne">{t.ne}</span> {t.plural}
              </h1>
              <p>{ABOUT[t.id]}</p>
            </>
          ) : tag ? (
            <>
              <h1>#{tag}</h1>
              <p>Everything tagged {tag}.</p>
            </>
          ) : (
            <>
              <h1>Search</h1>
              <p>
                Writing that mentions <q>{q}</q>.
              </p>
            </>
          )}
        </header>
      ) : (
        <Masthead pieces={all.length} writers={writers} />
      )}

      <div className="st-wrap st-cols">
        <div className="st-main">
          {loading ? (
            <Loading />
          ) : error ? (
            <Empty title="Couldn't load the writing">{error}</Empty>
          ) : !list.length ? (
            <Empty title={filtered ? "Nothing here yet" : "Nothing published yet"}>
              {filtered ? <Link href="/stories">See everything</Link> : "The first piece will appear here."}
            </Empty>
          ) : (
            <>
              {lead && <Lead post={lead} author={lib!.people.get(lead.authorId)} stats={lib!.stats[lead.id]} />}
              {rest.length > 0 && (
                <section aria-labelledby="st-all-h" className="st-feed">
                  {!filtered && <Hang ne="नयाँ" en="Latest" id="st-all-h" />}
                  {filtered && (
                    <h2 id="st-all-h" className="sr-only">
                      Results
                    </h2>
                  )}
                  <div className="st-entries">
                    {rest.map((p) => (
                      <Entry key={p.id} post={p} author={lib!.people.get(p.authorId)} stats={lib!.stats[p.id]} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
        {lib && (
          <Rail label="More to read">
            <Couplet lib={lib} />
            <Loved lib={lib} />
            <Writers lib={lib} />
            <Topics lib={lib} />
          </Rail>
        )}
      </div>
    </div>
  );
}
