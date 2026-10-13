"use client";

// Comments under a post. Reading is open to everyone; writing needs an account.
// One level of replies: a reply to a reply joins the same thread.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { stories, useMe, useStories } from "@/lib/stories/store";
import type { CommentWithAuthor, Post, Profile } from "@/lib/stories/types";
import { Avatar, formatDate, Hang } from "./ui";

function Composer({ post, parentId, onDone, autoFocus }: { post: Post; parentId?: string | null; onDone?: () => void; autoFocus?: boolean }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await stories().addComment(post.id, body, parentId);
      setBody("");
      onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="st-composer" onSubmit={submit}>
      <label className="sr-only" htmlFor={`c-${parentId ?? "new"}`}>
        {parentId ? "Your reply" : "Your comment"}
      </label>
      <textarea
        id={`c-${parentId ?? "new"}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply" : "Say something about this piece"}
        rows={parentId ? 2 : 3}
        maxLength={4000}
        autoFocus={autoFocus}
        required
      />
      <div className="st-composer-row">
        {error && (
          <p className="st-error" role="alert">
            {error}
          </p>
        )}
        {onDone && parentId && (
          <button type="button" className="st-btn st-btn--quiet" onClick={onDone}>
            Cancel
          </button>
        )}
        <button className="st-btn" disabled={busy || !body.trim()}>
          {busy ? "Posting…" : parentId ? "Reply" : "Post comment"}
        </button>
      </div>
    </form>
  );
}

function One({ c, post, me, replies }: { c: CommentWithAuthor; post: Post; me: Profile | null | undefined; replies?: CommentWithAuthor[] }) {
  const [replying, setReplying] = useState(false);
  const mine = me && me.id === c.userId;
  const admin = me?.role === "admin";
  const act = (fn: () => Promise<void>) => fn().catch((e: Error) => alert(e.message));
  return (
    <li className={`st-comment${c.status === "hidden" ? " is-hidden" : ""}`} id={`comment-${c.id}`}>
      <div className="st-comment-head">
        {c.author ? (
          <Link href={`/stories/authors/${c.author.username}`} className="st-comment-who">
            <Avatar profile={c.author} size={30} />
            <b>{c.author.name}</b>
          </Link>
        ) : (
          <span className="st-comment-who">
            <Avatar profile={null} size={30} />
            <b>Former reader</b>
          </span>
        )}
        {c.author?.id === post.authorId && <span className="st-comment-badge">Author</span>}
        <time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time>
        {c.status === "hidden" && <span className="st-comment-badge st-comment-badge--hidden">Hidden</span>}
      </div>
      <p className="st-comment-body">{c.body}</p>
      <div className="st-comment-actions">
        {me && me.status === "active" && (
          <button type="button" onClick={() => setReplying((v) => !v)} aria-expanded={replying}>
            Reply
          </button>
        )}
        {admin && (
          <button type="button" onClick={() => act(() => stories().setCommentStatus(c.id, c.status === "hidden" ? "visible" : "hidden"))}>
            {c.status === "hidden" ? "Show" : "Hide"}
          </button>
        )}
        {(mine || admin) && (
          <button type="button" onClick={() => confirm("Delete this comment?") && act(() => stories().deleteComment(c.id))}>
            Delete
          </button>
        )}
      </div>
      {(replies?.length || replying) && (
        <ul className="st-replies">
          {replies?.map((r) => <One key={r.id} c={r} post={post} me={me} />)}
          {replying && (
            <li>
              <Composer post={post} parentId={c.id} onDone={() => setReplying(false)} autoFocus />
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

export default function Comments({ post }: { post: Post }) {
  const me = useMe();
  const pathname = usePathname();
  const { data, loading } = useStories((s) => s.comments(post.id), [post.id]);
  const all = data ?? [];
  const top = all.filter((c) => !c.parentId || !all.some((x) => x.id === c.parentId));
  // Replies to replies hang under the thread they started in.
  const rootOf = (c: CommentWithAuthor): string => {
    const parent = all.find((x) => x.id === c.parentId);
    return parent ? rootOf(parent) : c.id;
  };
  const threads = new Map<string, CommentWithAuthor[]>();
  all.filter((c) => !top.includes(c)).forEach((c) => threads.set(rootOf(c), [...(threads.get(rootOf(c)) ?? []), c]));
  const count = all.filter((c) => c.status === "visible").length;
  const next = encodeURIComponent(`${pathname}#comments`);

  return (
    <section className="st-comments" id="comments" aria-labelledby="st-comments-h">
      <Hang ne="टिप्पणी" en={count ? `${count} ${count === 1 ? "comment" : "comments"}` : "Comments"} id="st-comments-h" />
      {me === undefined ? null : me ? (
        me.status === "active" ? (
          <div className="st-composer-wrap">
            <Avatar profile={me} size={36} />
            <Composer post={post} />
          </div>
        ) : (
          <p className="st-note">Your account can't comment right now.</p>
        )
      ) : (
        <div className="st-join">
          <p>
            <b>Join the conversation.</b> Reacting needs nothing; to comment, sign in so other readers know who's talking.
          </p>
          <div>
            <Link className="st-btn" href={`/stories/signin?mode=signup&next=${next}`}>
              Create an account
            </Link>
            <Link className="st-btn st-btn--ghost" href={`/stories/signin?next=${next}`}>
              Sign in
            </Link>
          </div>
        </div>
      )}
      {loading ? null : top.length ? (
        <ul className="st-comment-list">
          {top.map((c) => (
            <One key={c.id} c={c} post={post} me={me} replies={threads.get(c.id)} />
          ))}
        </ul>
      ) : (
        <p className="st-note">No comments yet. Start the conversation.</p>
      )}
    </section>
  );
}
