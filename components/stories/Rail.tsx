"use client";

// The column to the right of the writing: a couplet to read now, what readers
// loved, the writers, the topics, and on a post, where to go next.
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStories } from "@/lib/stories/store";
import { neNum, stanzas, type Post, type Profile, type Stats } from "@/lib/stories/types";
import { Avatar, Hang, Mini } from "./ui";

export type Library = { posts: Post[]; people: Map<string, Profile>; stats: Stats };

/** Everything published, its writers and its counts: what the lists and the rail are made from. */
export function useLibrary() {
  return useStories(async (s): Promise<Library> => {
    const [posts, profiles] = await Promise.all([s.listPosts({ limit: 300 }), s.listProfiles()]);
    return { posts, people: new Map(profiles.map((p) => [p.id, p])), stats: await s.stats(posts.map((p) => p.id)) };
  }, []);
}

const score = (stats: Stats, p: Post) => (stats[p.id]?.reactions ?? 0) * 2 + (stats[p.id]?.comments ?? 0) * 3;
export const loved = (lib: Library, n = 4, skip: string[] = []) =>
  lib.posts
    .filter((p) => !skip.includes(p.id) && score(lib.stats, p) > 0)
    .sort((a, b) => score(lib.stats, b) - score(lib.stats, a))
    .slice(0, n);

/**
 * One sher at a time from the gajal (or, without any, a kabita's stanza), and a
 * button for another: अर्को, the same "other" as the masthead's.
 */
export function Couplet({ lib }: { lib: Library }) {
  const shers = useMemo(() => {
    const pool = lib.posts.filter((p) => p.type === "gajal");
    const from = pool.length ? pool : lib.posts.filter((p) => p.type === "kabita");
    return from.flatMap((post) => stanzas(post.content).map((lines) => ({ post, lines: lines.slice(0, 2) })).filter((s) => s.lines.length === 2));
  }, [lib.posts]);
  const [i, setI] = useState(0);
  // A different one each visit (chosen after hydration, so server and browser agree first).
  useEffect(() => setI(Math.floor(Math.random() * 1000)), []);
  if (!shers.length) return null;
  const s = shers[i % shers.length];
  const author = lib.people.get(s.post.authorId);
  return (
    <section className="st-rail-block st-sher" aria-labelledby="st-sher-h">
      <Hang ne="एक शेर" en="A couplet" id="st-sher-h" />
      <blockquote lang={s.post.lang === "en" ? "en" : "ne"} key={`${s.post.id}-${i % shers.length}`}>
        <p>{s.lines[0]}</p>
        <p>{s.lines[1]}</p>
      </blockquote>
      <p className="st-sher-from">
        From <Link href={`/stories/${s.post.slug}`}>{s.post.title}</Link>
        {author ? `, ${author.name}` : ""}
      </p>
      {shers.length > 1 && (
        <button type="button" className="st-sher-next" onClick={() => setI((n) => n + 1 + Math.floor(Math.random() * (shers.length - 1)))}>
          <span lang="ne">अर्को शेर</span> Another
        </button>
      )}
    </section>
  );
}

export function Loved({ lib, skip = [] }: { lib: Library; skip?: string[] }) {
  const list = loved(lib, 4, skip);
  if (!list.length) return null;
  return (
    <section className="st-rail-block" aria-labelledby="st-loved-h">
      <Hang ne="मन पर्ने" en="Most loved" id="st-loved-h" />
      <ol className="st-minis">
        {list.map((p, i) => (
          <Mini
            key={p.id}
            post={p}
            author={lib.people.get(p.authorId)}
            mark={
              <span className="st-rank" lang="ne" aria-hidden="true">
                {neNum(i + 1)}
              </span>
            }
            note={<> · ♥ {lib.stats[p.id]?.reactions ?? 0}</>}
          />
        ))}
      </ol>
    </section>
  );
}

export function Writers({ lib }: { lib: Library }) {
  const list = [...lib.people.values()]
    .filter((p) => p.status === "active" && p.role !== "reader")
    .map((p) => ({ p, n: lib.posts.filter((x) => x.authorId === p.id).length }))
    .filter((w) => w.n > 0)
    .sort((a, b) => b.n - a.n);
  if (!list.length) return null;
  return (
    <section className="st-rail-block" aria-labelledby="st-writers-h">
      <Hang ne="लेखक" en="Writers" id="st-writers-h" />
      <ul className="st-writers">
        {list.map(({ p, n }) => (
          <li key={p.id}>
            <Link href={`/stories/authors/${p.username}`}>
              <Avatar profile={p} size={40} />
              <span>
                <b>{p.name}</b>
                <small>
                  <span lang="ne">{neNum(n)} रचना</span> · {n} {n === 1 ? "piece" : "pieces"}
                </small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Topics({ lib, only }: { lib: Library; only?: string[] }) {
  const counts = new Map<string, number>();
  lib.posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const tags = (only ?? [...counts.keys()]).filter((t) => counts.has(t) || only).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)).slice(0, 14);
  if (!tags.length) return null;
  return (
    <section className="st-rail-block" aria-labelledby="st-topics-h">
      <Hang ne="विषय" en="Topics" id="st-topics-h" />
      <ul className="st-tags">
        {tags.map((t) => (
          <li key={t}>
            <Link href={`/stories?tag=${encodeURIComponent(t)}`}>
              #{t}
              {counts.get(t) ? <small>{counts.get(t)}</small> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A list of posts in the rail under a hanging heading. */
export function Shelf({ ne, en, id, posts, lib }: { ne: string; en: string; id: string; posts: Post[]; lib: Library }) {
  if (!posts.length) return null;
  return (
    <section className="st-rail-block" aria-labelledby={id}>
      <Hang ne={ne} en={en} id={id} />
      <ul className="st-minis">
        {posts.map((p) => (
          <Mini key={p.id} post={p} author={lib.people.get(p.authorId)} />
        ))}
      </ul>
    </section>
  );
}

/**
 * The rail's frame. It stays in view while the writing scrolls: pinned under
 * the header when it fits the window, and when it's taller, scrolling along
 * until its last section is in view and holding there.
 */
export function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const place = () => {
      const head = parseFloat(getComputedStyle(el).getPropertyValue("--head-h")) || 112;
      const room = window.innerHeight - head - 44;
      el.style.top = `${el.offsetHeight <= room ? head + 20 : window.innerHeight - el.offsetHeight - 24}px`;
    };
    const ro = new ResizeObserver(place);
    ro.observe(el);
    window.addEventListener("resize", place);
    place();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);
  return (
    <aside className="st-rail" aria-label={label}>
      <div className="st-rail-in" ref={inner}>
        {children}
      </div>
    </aside>
  );
}
