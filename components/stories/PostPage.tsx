"use client";

// One piece of writing, on the left: its header and cover (full width, beside
// the title, or none), the body as written in the editor, the reactions and the
// comments. On the right, the rail: the writer, the pieces it points to, the
// pieces that point to it, and more of the same kind. A line across the top of
// the window draws itself as you read.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import { useNavigate } from "@/components/PageTransition";
import { renderDoc } from "@/lib/stories/extensions";
import { isWriter, useMe, useStories } from "@/lib/stories/store";
import { neNum, readMinutes, typeOf, type Post } from "@/lib/stories/types";
import Comments from "./Comments";
import Reactions from "./Reactions";
import { Loved, Rail, Shelf, Topics, useLibrary } from "./Rail";
import { Avatar, Empty, formatDate, Hang, Loading, TypeLabel } from "./ui";

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

function Share({ post }: { post: Post }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {}
  };
  return (
    <button type="button" className="st-btn st-btn--ghost st-share" onClick={share}>
      {done ? "Link copied" : "Share"}
    </button>
  );
}

/** The line along the top of the window, drawn as far as you've read. */
function ReadingLine({ target }: { target: RefObject<HTMLElement | null> }) {
  const line = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = 0;
      const el = target.current;
      if (!el || !line.current) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight * 0.6)));
      line.current.style.transform = `scaleX(${p})`;
    };
    const on = () => (raf ||= requestAnimationFrame(draw));
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    draw();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [target]);
  return <div className="st-readline" ref={line} aria-hidden="true" />;
}

export default function PostPage({ slug }: { slug: string }) {
  const key = decode(slug);
  const me = useMe();
  const router = useRouter();
  const navigate = useNavigate();
  const article = useRef<HTMLElement>(null);
  const { data: post, loading, error } = useStories((s) => s.getPost(key), [key]);
  const { data: lib } = useLibrary();
  const html = useMemo(() => (post ? renderDoc(post.content) : ""), [post]);

  useEffect(() => {
    if (post) document.title = `${post.title || "Untitled"} · कथा Stories`;
  }, [post]);

  // Links inside the writing: stories pages switch in place, other pages of the
  // site get the page transition, and other sites open in a new tab.
  const follow = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as Element).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (href.startsWith("#")) return;
    e.preventDefault();
    if (href.startsWith("/stories")) router.push(href);
    else if (href.startsWith("/")) navigate(href);
    else window.open(href, "_blank", "noopener,noreferrer");
  };

  if (loading) return <Loading label="Opening" />;
  if (error) return <Empty title="Couldn't open this piece">{error}</Empty>;
  if (!post)
    return (
      <Empty title="This piece isn't here">
        It may have been moved, unpublished or never written. <Link href="/stories">Browse everything</Link>
      </Empty>
    );

  const t = typeOf(post.type);
  const layout = post.cover ? post.coverLayout : "none";
  const canEdit = isWriter(me) && (me!.role === "admin" || me!.id === post.authorId);
  const lang = post.lang === "en" ? "en" : "ne";
  const author = lib?.people.get(post.authorId);

  // Where to go next: the pieces this one points to, the pieces that point
  // here, and more of the same kind, each shown once.
  const shown = new Set([post.id]);
  const take = (list: Post[], n: number) => {
    const out = list.filter((p) => !shown.has(p.id)).slice(0, n);
    out.forEach((p) => shown.add(p.id));
    return out;
  };
  const posts = lib?.posts ?? [];
  const next = take(post.refs.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => !!p), 4);
  const mentions = take(posts.filter((p) => p.refs.includes(post.id)), 3);
  const alike = take(posts.filter((p) => p.type === post.type), 3);
  const mine = posts.filter((p) => p.authorId === post.authorId).length;

  return (
    <>
      <ReadingLine target={article} />
      <div className={`st-wrap st-cols st-cols--post st-post--${post.type}${t.verse ? " is-verse" : ""}`}>
        <article className={`st-main st-post st-post--${layout}`} ref={article} lang={post.lang === "mixed" ? undefined : lang}>
          {post.status === "draft" && (
            <p className="st-draft-note">
              Draft: only its writer and admins can see this. <Link href={`/stories/admin/write/${post.id}`}>Keep editing</Link>
            </p>
          )}

          <header className="st-post-head">
            <div className="st-post-headtext">
              <TypeLabel post={post} />
              <h1 className="st-post-title">{post.title || "Untitled"}</h1>
              {post.subtitle && <p className="st-post-dek">{post.subtitle}</p>}
              <div className="st-post-meta">
                {author && (
                  <Link href={`/stories/authors/${author.username}`} className="st-post-who">
                    <Avatar profile={author} size={40} />
                    <span>
                      <b>{author.name}</b>
                      <small>
                        <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time> · {readMinutes(post.content)} min read
                      </small>
                    </span>
                  </Link>
                )}
                {canEdit && (
                  <Link className="st-btn st-btn--ghost" href={`/stories/admin/write/${post.id}`}>
                    Edit
                  </Link>
                )}
              </div>
            </div>
            {layout === "side" && (
              <figure className="st-post-cover st-post-cover--side">
                {/* eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host */}
                <img src={post.cover!} alt="" style={{ objectPosition: post.coverPosition }} />
              </figure>
            )}
          </header>

          {layout === "full" && (
            <figure className="st-post-cover st-post-cover--full">
              {/* eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host */}
              <img src={post.cover!} alt="" style={{ objectPosition: post.coverPosition }} />
            </figure>
          )}

          <div className={`st-prose${t.verse ? " is-verse" : ""}`} onClick={follow} dangerouslySetInnerHTML={{ __html: html }} />

          <footer className="st-post-foot">
            {post.tags.length > 0 && (
              <ul className="st-tags" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/stories?tag=${encodeURIComponent(tag)}`}>#{tag}</Link>
                  </li>
                ))}
              </ul>
            )}
            <Share post={post} />
          </footer>

          <Reactions postId={post.id} />
        </article>

        <Rail label="Where to go next">
          {author && (
            <section className="st-rail-block st-writer" aria-labelledby="st-writer-h">
              <Hang ne="लेखक" en="The writer" id="st-writer-h" />
              <Link href={`/stories/authors/${author.username}`} className="st-writer-who">
                <Avatar profile={author} size={56} />
                <span>
                  <b>{author.name}</b>
                  <small>
                    <span lang="ne">{neNum(mine)} रचना</span> · {mine} {mine === 1 ? "piece" : "pieces"}
                  </small>
                </span>
              </Link>
              {author.bio && <p className="st-writer-bio">{author.bio}</p>}
            </section>
          )}
          {lib && (
            <>
              <Shelf ne="अर्को पढ्नुहोस्" en="Read next" id="st-next-h" posts={next} lib={lib} />
              <Shelf ne="यहाँ चर्चा" en="Mentioned in" id="st-mentions-h" posts={mentions} lib={lib} />
              <Shelf ne={`यस्तै ${t.ne}`} en={`More ${t.plural.toLowerCase()}`} id="st-alike-h" posts={alike} lib={lib} />
              {next.length + mentions.length + alike.length < 3 && <Loved lib={lib} skip={[...shown]} />}
              <Topics lib={lib} />
            </>
          )}
        </Rail>

        <div className="st-after">
          <Comments post={post} />
        </div>
      </div>
    </>
  );
}
