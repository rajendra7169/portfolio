"use client";

// Pieces the Stories pages share: avatars, kind labels, bylines, the headings
// that hang from a bar, and the three shapes a post takes in a list (the lead,
// an entry in the feed, and a small item in the rail).
import Link from "next/link";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { excerpt, firstLines, readMinutes, typeOf, type Post, type Profile, type Stats } from "@/lib/stories/types";
import { fontOf, headline, whenFont } from "./headline";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const formatDate = (iso: string | null) => (iso ? DATE.format(new Date(iso)) : "Draft");
const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 11);
const href = (p: Post) => `/stories/${p.slug}`;

export function Avatar({ profile, size = 36 }: { profile: Profile | null | undefined; size?: number }) {
  const name = profile?.name || "?";
  const style = { width: size, height: size, "--h": hue(profile?.username ?? name), fontSize: size * 0.42 } as CSSProperties;
  return profile?.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host
    <img className="st-avatar" src={profile.avatar} alt="" width={size} height={size} style={style} />
  ) : (
    <span className="st-avatar st-avatar--initial" style={style} aria-hidden="true">
      {name.trim()[0]?.toUpperCase()}
    </span>
  );
}

export function TypeLabel({ post }: { post: Post }) {
  const t = typeOf(post.type);
  return (
    <span className={`st-type st-type--${post.type}`}>
      <span lang="ne">{t.ne}</span> {t.label}
    </span>
  );
}

/**
 * A section heading in two languages: the Nepali word hangs from a bar that runs
 * the width of its column, as the masthead's words do; the English sits beside it.
 */
export function Hang({ ne, en, id, as: Tag = "h2" }: { ne: string; en: string; id?: string; as?: "h2" | "h3" }) {
  const ref = useRef<HTMLHeadingElement>(null);
  // The bar goes on the word's own headline stroke, as this browser draws it (headline.ts).
  useLayoutEffect(() => {
    const h = ref.current;
    const word = h?.querySelector<HTMLElement>("[lang=ne]");
    if (!h || !word) return;
    return whenFont(word, ne, () => {
      const hl = headline(fontOf(word), ne);
      const base = word.querySelector(".st-base");
      if (!hl || !base) return;
      h.style.setProperty("--hl-top", `${base.getBoundingClientRect().top - hl.above - h.getBoundingClientRect().top}px`);
      h.style.setProperty("--hl-h", `${hl.thick}px`);
    });
  }, [ne]);
  return (
    <Tag className="st-hang" id={id} ref={ref}>
      <span lang="ne">
        {ne}
        <i className="st-base" aria-hidden="true" />
      </span>{" "}
      <small>{en}</small>
    </Tag>
  );
}

export function Byline({ post, author, stats }: { post: Post; author: Profile | null | undefined; stats?: Stats[string] }) {
  return (
    <p className="st-byline">
      {author ? (
        <Link href={`/stories/authors/${author.username}`} className="st-byline-who">
          <Avatar profile={author} size={24} />
          {author.name}
        </Link>
      ) : null}
      <span>{formatDate(post.publishedAt)}</span>
      <span>{readMinutes(post.content)} min</span>
      {stats && (stats.reactions > 0 || stats.comments > 0) ? (
        <span className="st-byline-stats" aria-label={`${stats.reactions} reactions, ${stats.comments} comments`}>
          {stats.reactions > 0 && <span>♥ {stats.reactions}</span>}
          {stats.comments > 0 && <span>💬 {stats.comments}</span>}
        </span>
      ) : null}
    </p>
  );
}

/** A post's picture: its cover, or for a poem without one, its opening lines on a slip of paper. */
export function Face({ post, lines = 2 }: { post: Post; lines?: number }) {
  if (post.cover)
    return (
      <span className="st-face">
        {/* eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host */}
        <img src={post.cover} alt="" loading="lazy" style={{ objectPosition: post.coverPosition }} />
      </span>
    );
  if (typeOf(post.type).verse)
    return (
      <span className={`st-face st-slip st-slip--${post.type}`} lang={post.lang === "en" ? "en" : "ne"}>
        {firstLines(post, lines).map((l, i) => (
          <span key={i}>{l}</span>
        ))}
        <span className="st-slip-end" aria-hidden="true">
          ॥
        </span>
      </span>
    );
  return null;
}

/** The front page's lead: big, its picture beside its words. */
export function Lead({ post, author, stats }: { post: Post; author: Profile | null | undefined; stats?: Stats[string] }) {
  const face = <Face post={post} lines={4} />;
  const hasFace = Boolean(post.cover || typeOf(post.type).verse);
  return (
    <article className={`st-lead${hasFace ? "" : " is-bare"}`}>
      {hasFace && (
        // The picture links too, for pointers; keyboards and screen readers use the title.
        <Link href={href(post)} className="st-lead-face" tabIndex={-1} aria-hidden="true">
          {face}
        </Link>
      )}
      <div className="st-lead-text">
        <TypeLabel post={post} />
        <Link href={href(post)} className="st-lead-title" lang={post.lang === "ne" ? "ne" : undefined}>
          {post.title || "Untitled"}
        </Link>
        <p className="st-lead-dek">{excerpt(post, 260)}</p>
        <Byline post={post} author={author} stats={stats} />
      </div>
    </article>
  );
}

/** One piece in the feed: prose with its picture beside it, a poem with its opening sher. */
export function Entry({ post, author, stats }: { post: Post; author: Profile | null | undefined; stats?: Stats[string] }) {
  const verse = typeOf(post.type).verse;
  return (
    <article className={`st-entry${verse ? " is-verse" : ""}${post.cover ? " has-face" : ""}`}>
      <div className="st-entry-text">
        <TypeLabel post={post} />
        <Link href={href(post)} className="st-entry-title st-stretch" lang={post.lang === "ne" ? "ne" : undefined}>
          {post.title || "Untitled"}
        </Link>
        {verse ? (
          <p className="st-entry-sher" lang={post.lang === "en" ? "en" : "ne"}>
            {firstLines(post, 2).map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </p>
        ) : (
          <p className="st-entry-dek">{excerpt(post, 200)}</p>
        )}
        <Byline post={post} author={author} stats={stats} />
      </div>
      {post.cover && (
        <span className="st-entry-face" aria-hidden="true">
          <Face post={post} />
        </span>
      )}
    </article>
  );
}

/** A small item in the rail. `mark` replaces the picture (a rank, say). */
export function Mini({ post, author, mark, note }: { post: Post; author?: Profile | null; mark?: ReactNode; note?: ReactNode }) {
  const t = typeOf(post.type);
  return (
    <li className="st-mini">
      {mark ?? (
        <span className={`st-mini-face st-type--${post.type}`} aria-hidden="true">
          {post.cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host
            <img src={post.cover} alt="" loading="lazy" style={{ objectPosition: post.coverPosition }} />
          ) : (
            <span lang="ne">{firstLines(post, 1)[0]?.split(" ")[0] ?? t.ne}</span>
          )}
        </span>
      )}
      <span className="st-mini-text">
        <Link href={href(post)} className="st-mini-title st-stretch" lang={post.lang === "ne" ? "ne" : undefined}>
          {post.title || "Untitled"}
        </Link>
        <small>
          <span lang="ne">{t.ne}</span> {t.label}
          {author ? ` · ${author.name}` : ""}
          {note}
        </small>
      </span>
    </li>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="st-empty">
      <p className="st-empty-title">{title}</p>
      {children}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="st-loading" role="status">
      <span className="st-loading-ink" aria-hidden="true" />
      {label}…
    </div>
  );
}
