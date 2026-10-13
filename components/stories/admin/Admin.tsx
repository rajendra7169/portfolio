"use client";

// The writers' room: an overview, every post, the people (roles, suspensions,
// profiles) and the comments. Writers see their own posts; the admin sees all.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { resetDemo } from "@/lib/stories/demo";
import { isWriter, stories, useMe, useStories } from "@/lib/stories/store";
import { POST_TYPES, typeOf, type Post, type PostType, type Profile, type Role, type Stats } from "@/lib/stories/types";
import ProfileForm from "../ProfileForm";
import { Avatar, Empty, formatDate, Loading } from "../ui";
import AdminFrame, { type Tab } from "./AdminFrame";

const act = (fn: () => Promise<unknown>) => fn().catch((e: Error) => alert(e.message));

function Head({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="sa-head">
      <h1>{title}</h1>
      {children && <div className="sa-head-actions">{children}</div>}
    </header>
  );
}

function Status({ post }: { post: Post }) {
  return <span className={`sa-pill sa-pill--${post.status}`}>{post.status === "published" ? "Published" : "Draft"}</span>;
}

// ── Overview ────────────────────────────────────────────────────────────
function Dashboard({ me }: { me: Profile }) {
  const admin = me.role === "admin";
  const { data, loading } = useStories(
    async (s) => {
      const posts = await s.listPosts({ status: "all", authorId: admin ? undefined : me.id });
      const [stats, people, comments] = await Promise.all([s.stats(posts.map((p) => p.id)), admin ? s.listProfiles() : Promise.resolve([]), admin ? s.allComments() : Promise.resolve([])]);
      return { posts, stats, people, comments };
    },
    [me.id, admin],
  );
  if (loading || !data) return <Loading />;
  const { posts, stats, people, comments } = data;
  const sum = (k: "reactions" | "comments") => posts.reduce((n, p) => n + (stats[p.id]?.[k] ?? 0), 0);
  const drafts = posts.filter((p) => p.status === "draft");
  const tiles = [
    { n: posts.length - drafts.length, label: "published", href: "/stories/admin/posts?status=published" },
    { n: drafts.length, label: drafts.length === 1 ? "draft" : "drafts", href: "/stories/admin/posts?status=draft" },
    { n: sum("reactions"), label: "reactions" },
    { n: sum("comments"), label: "comments", href: admin ? "/stories/admin/comments" : undefined },
    ...(admin
      ? [
          { n: people.filter((p) => p.role !== "reader").length, label: "writers", href: "/stories/admin/users?role=writers" },
          { n: people.filter((p) => p.role === "reader").length, label: "readers", href: "/stories/admin/users?role=reader" },
        ]
      : []),
  ];
  const top = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => (stats[b.id]?.reactions ?? 0) + (stats[b.id]?.comments ?? 0) - ((stats[a.id]?.reactions ?? 0) + (stats[a.id]?.comments ?? 0)))
    .slice(0, 4);

  return (
    <>
      <Head title={`Namaste, ${me.name.split(" ")[0]}`}>
        <Link className="st-btn" href="/stories/admin/write">
          Write something new
        </Link>
      </Head>
      <ul className="sa-tiles">
        {tiles.map((t) => (
          <li key={t.label}>
            {t.href ? (
              <Link href={t.href}>
                <b>{t.n}</b> {t.label}
              </Link>
            ) : (
              <span>
                <b>{t.n}</b> {t.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="sa-cols">
        <section className="sa-card">
          <h2>Pick up where you left off</h2>
          {drafts.length ? (
            <ul className="sa-list">
              {drafts.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link href={`/stories/admin/write/${p.id}`}>
                    <b>{p.title || "Untitled"}</b>
                    <small>
                      {typeOf(p.type).label} · edited {formatDate(p.updatedAt)}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sa-muted">No drafts waiting. Everything you&apos;ve started is out in the world.</p>
          )}
        </section>

        <section className="sa-card">
          <h2>Most loved</h2>
          {top.length ? (
            <ul className="sa-list">
              {top.map((p) => (
                <li key={p.id}>
                  <Link href={`/stories/${p.slug}`}>
                    <b>{p.title || "Untitled"}</b>
                    <small>
                      ♥ {stats[p.id]?.reactions ?? 0} · 💬 {stats[p.id]?.comments ?? 0}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sa-muted">Reactions and comments will show here.</p>
          )}
        </section>

        {admin && (
          <section className="sa-card">
            <h2>Latest comments</h2>
            {comments.length ? (
              <ul className="sa-list">
                {comments.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <Link href={c.post ? `/stories/${c.post.slug}#comment-${c.id}` : "/stories/admin/comments"}>
                      <b>
                        {c.author?.name ?? "Former reader"} on {c.post?.title ?? "a deleted post"}
                      </b>
                      <small className="sa-clamp">{c.body}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sa-muted">No comments yet.</p>
            )}
          </section>
        )}
      </div>

      {admin && stories().mode === "demo" && (
        <section className="sa-card sa-demo">
          <h2>Running in demo mode</h2>
          <p>
            Everything here (posts, people, photos, comments) is stored in this browser only, so you can try the whole thing before going live. Connect Supabase to
            publish for everyone: run <code>supabase/migrations/20261013000000_stories.sql</code> in a new Supabase project, then set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see <code>supabase/README.md</code>).
          </p>
          <button type="button" className="st-btn st-btn--ghost" onClick={() => confirm("Start the demo again? Your demo posts, accounts and photos in this browser are wiped.") && resetDemo()}>
            Reset demo data
          </button>
        </section>
      )}
    </>
  );
}

// ── Posts ───────────────────────────────────────────────────────────────
function Posts({ me }: { me: Profile }) {
  const admin = me.role === "admin";
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [type, setType] = useState<PostType | "">("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const s = new URLSearchParams(location.search).get("status");
    if (s === "published" || s === "draft") setStatus(s);
  }, []);
  const { data, loading } = useStories(
    async (s) => {
      const posts = await s.listPosts({ status: "all", authorId: admin ? undefined : me.id });
      const [stats, people] = await Promise.all([s.stats(posts.map((p) => p.id)), s.listProfiles()]);
      return { posts, stats, people: new Map(people.map((p) => [p.id, p])) };
    },
    [me.id, admin],
  );
  const list = useMemo(
    () =>
      (data?.posts ?? []).filter(
        (p) => (status === "all" || p.status === status) && (!type || p.type === type) && (!q.trim() || `${p.title} ${p.tags.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [data, status, type, q],
  );
  const stats: Stats = data?.stats ?? {};

  return (
    <>
      <Head title={admin ? "All posts" : "Your posts"}>
        <Link className="st-btn" href="/stories/admin/write">
          New post
        </Link>
      </Head>
      <div className="sa-filters">
        <div className="sa-seg" role="group" aria-label="Status">
          {(["all", "published", "draft"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "All" : s === "published" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
        <select value={type} onChange={(e) => setType(e.target.value as PostType | "")} aria-label="Kind">
          <option value="">Every kind</option>
          {POST_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.ne} {t.plural}
            </option>
          ))}
        </select>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and tags" aria-label="Search posts" />
      </div>

      {loading ? (
        <Loading />
      ) : !list.length ? (
        <Empty title={data?.posts.length ? "No posts match" : "No posts yet"}>
          <Link href="/stories/admin/write">Write the first one</Link>
        </Empty>
      ) : (
        <div className={`sa-table${admin ? " is-admin" : ""}`} role="table" aria-label="Posts">
          <div className="sa-tr sa-th" role="row">
            <span role="columnheader">Post</span>
            {admin && <span role="columnheader">Writer</span>}
            <span role="columnheader">Status</span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Response</span>
            <span role="columnheader">
              <span className="sr-only">Actions</span>
            </span>
          </div>
          {list.map((p) => {
            const who = data!.people.get(p.authorId);
            return (
              <div className="sa-tr" role="row" key={p.id}>
                <span role="cell" className="sa-post">
                  {p.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host
                    <img src={p.cover} alt="" style={{ objectPosition: p.coverPosition }} />
                  ) : (
                    <span className={`sa-thumb st-type--${p.type}`} lang="ne" aria-hidden="true">
                      {typeOf(p.type).ne.slice(0, 1)}
                    </span>
                  )}
                  <span>
                    <Link href={`/stories/admin/write/${p.id}`}>
                      <b>{p.title || "Untitled"}</b>
                    </Link>
                    <small>
                      <span lang="ne">{typeOf(p.type).ne}</span> {typeOf(p.type).label}
                      {p.featured && <span className="sa-star"> · ★ Featured</span>}
                    </small>
                  </span>
                </span>
                {admin && (
                  <span role="cell" className="sa-who">
                    {who ? (
                      <>
                        <Avatar profile={who} size={24} /> {who.name}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                )}
                <span role="cell">
                  <Status post={p} />
                </span>
                <span role="cell" className="sa-date">
                  {p.publishedAt ? formatDate(p.publishedAt) : `Edited ${formatDate(p.updatedAt)}`}
                </span>
                <span role="cell" className="sa-resp">
                  ♥ {stats[p.id]?.reactions ?? 0} &nbsp;💬 {stats[p.id]?.comments ?? 0}
                </span>
                <span role="cell" className="sa-acts">
                  <Link href={`/stories/admin/write/${p.id}`}>Edit</Link>
                  <a href={`/stories/${p.slug}`} target="_blank" rel="noreferrer">
                    {p.status === "published" ? "View" : "Preview"}
                  </a>
                  <button type="button" onClick={() => act(() => stories().savePost({ id: p.id, status: p.status === "published" ? "draft" : "published" }))}>
                    {p.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  {admin && (
                    <button type="button" onClick={() => act(() => stories().savePost({ id: p.id, featured: !p.featured }))} aria-pressed={p.featured}>
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="sa-danger"
                    onClick={() => confirm(`Delete “${p.title || "Untitled"}” for good? Its comments and reactions go too.`) && act(() => stories().deletePost(p.id))}
                  >
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── People ──────────────────────────────────────────────────────────────
const ROLES: { id: Role; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "author", label: "Writer" },
  { id: "reader", label: "Reader" },
];

function People({ me }: { me: Profile }) {
  const [filter, setFilter] = useState<"all" | "writers" | "reader" | "banned">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Profile | null>(null);
  useEffect(() => {
    const r = new URLSearchParams(location.search).get("role");
    if (r === "writers" || r === "reader") setFilter(r);
  }, []);
  const { data, loading } = useStories(
    async (s) => {
      const [people, posts] = await Promise.all([s.listProfiles(), s.listPosts({ status: "all" })]);
      return { people, posts };
    },
    [],
  );
  const list = (data?.people ?? []).filter(
    (p) =>
      (filter === "all" || (filter === "writers" ? p.role !== "reader" : filter === "banned" ? p.status === "banned" : p.role === "reader")) &&
      (!q.trim() || `${p.name} ${p.username}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const count = (id: string) => (data?.posts ?? []).filter((p) => p.authorId === id).length;

  if (editing)
    return (
      <>
        <Head title={`Edit ${editing.name}`} />
        <div className="sa-card sa-narrow">
          <ProfileForm profile={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
        </div>
      </>
    );

  return (
    <>
      <Head title="People" />
      <p className="sa-lede">Everyone who signs up starts as a reader (they can comment and react). Make someone a writer to let them post; suspend an account to stop it commenting.</p>
      <div className="sa-filters">
        <div className="sa-seg" role="group" aria-label="Show">
          {(
            [
              ["all", "Everyone"],
              ["writers", "Writers"],
              ["reader", "Readers"],
              ["banned", "Suspended"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}>
              {l}
            </button>
          ))}
        </div>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names" aria-label="Search people" />
      </div>
      {loading ? (
        <Loading />
      ) : !list.length ? (
        <Empty title="No one here" />
      ) : (
        <ul className="sa-people">
          {list.map((p) => {
            const self = p.id === me.id;
            return (
              <li key={p.id} className={p.status === "banned" ? "is-banned" : undefined}>
                <Link href={`/stories/authors/${p.username}`} className="sa-person">
                  <Avatar profile={p} size={44} />
                  <span>
                    <b>{p.name}</b>
                    <small>
                      @{p.username} · joined {formatDate(p.joined)}
                      {count(p.id) ? ` · ${count(p.id)} ${count(p.id) === 1 ? "post" : "posts"}` : ""}
                    </small>
                  </span>
                </Link>
                <label className="sa-role">
                  <span className="sr-only">Role for {p.name}</span>
                  <select
                    value={p.role}
                    disabled={self}
                    title={self ? "You can't change your own role" : undefined}
                    onChange={(e) => act(() => stories().saveProfile({ id: p.id, role: e.target.value as Role }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="sa-acts">
                  <button type="button" onClick={() => setEditing(p)}>
                    Edit profile
                  </button>
                  {!self && (
                    <button
                      type="button"
                      className={p.status === "active" ? "sa-danger" : undefined}
                      onClick={() =>
                        (p.status === "banned" || confirm(`Suspend ${p.name}? They won't be able to comment or post until you restore them.`)) &&
                        act(() => stories().saveProfile({ id: p.id, status: p.status === "active" ? "banned" : "active" }))
                      }
                    >
                      {p.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// ── Comments ────────────────────────────────────────────────────────────
function Moderation() {
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const { data, loading } = useStories((s) => s.allComments(), []);
  const list = (data ?? []).filter((c) => filter === "all" || c.status === filter);
  return (
    <>
      <Head title="Comments" />
      <div className="sa-filters">
        <div className="sa-seg" role="group" aria-label="Show">
          {(["all", "visible", "hidden"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}>
              {v === "all" ? "All" : v === "visible" ? "Visible" : "Hidden"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : !list.length ? (
        <Empty title="No comments here" />
      ) : (
        <ul className="sa-comments">
          {list.map((c) => (
            <li key={c.id} className={c.status === "hidden" ? "is-hidden" : undefined}>
              <Avatar profile={c.author} size={36} />
              <div>
                <p className="sa-comment-meta">
                  <b>{c.author?.name ?? "Former reader"}</b> on{" "}
                  {c.post ? <Link href={`/stories/${c.post.slug}#comment-${c.id}`}>{c.post.title || "Untitled"}</Link> : "a deleted post"} · {formatDate(c.createdAt)}
                  {c.parentId && " · reply"}
                  {c.status === "hidden" && <span className="sa-pill sa-pill--draft">Hidden</span>}
                </p>
                <p className="sa-comment-body">{c.body}</p>
              </div>
              <span className="sa-acts">
                <button type="button" onClick={() => act(() => stories().setCommentStatus(c.id, c.status === "hidden" ? "visible" : "hidden"))}>
                  {c.status === "hidden" ? "Show" : "Hide"}
                </button>
                <button type="button" className="sa-danger" onClick={() => confirm("Delete this comment and its replies?") && act(() => stories().deleteComment(c.id))}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Admin({ tab }: { tab: Exclude<Tab, "write"> }) {
  const me = useMe();
  const router = useRouter();
  useEffect(() => {
    if (me === null) router.replace(`/stories/signin?next=${encodeURIComponent(tab === "dashboard" ? "/stories/admin" : `/stories/admin/${tab}`)}`);
  }, [me, tab, router]);
  if (!me) return <Loading />;
  if (!isWriter(me))
    return (
      <div className="st-wrap">
        <Empty title="This is the writers' room">
          Your account reads and comments. If you write too, ask the admin to make you a writer. <Link href="/stories">Back to Stories</Link>
        </Empty>
      </div>
    );
  const adminOnly = tab === "users" || tab === "comments";
  return (
    <AdminFrame me={me} tab={tab}>
      {adminOnly && me.role !== "admin" ? (
        <Empty title="Only the admin manages this" />
      ) : tab === "posts" ? (
        <Posts me={me} />
      ) : tab === "users" ? (
        <People me={me} />
      ) : tab === "comments" ? (
        <Moderation />
      ) : (
        <Dashboard me={me} />
      )}
    </AdminFrame>
  );
}
