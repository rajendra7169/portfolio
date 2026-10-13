"use client";

// The frame around every Stories page: its own header (the portfolio's is hidden
// here), the categories, and a footer. The admin has a frame of its own.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TransitionLink } from "@/components/PageTransition";
import { isWriter, stories, useDemo, useMe } from "@/lib/stories/store";
import { POST_TYPES } from "@/lib/stories/types";
import { Avatar } from "./ui";

function Tabs() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const type = pathname === "/stories" ? sp.get("type") : null;
  return (
    <nav className="st-tabs" aria-label="Kinds of writing">
      <Link href="/stories" aria-current={pathname === "/stories" && !type && !sp.get("q") && !sp.get("tag") ? "page" : undefined}>
        All
      </Link>
      {POST_TYPES.map((t) => (
        <Link key={t.id} href={`/stories?type=${t.id}`} aria-current={type === t.id ? "page" : undefined}>
          <span lang="ne">{t.ne}</span>
          {t.plural}
        </Link>
      ))}
    </nav>
  );
}

function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/stories?q=${encodeURIComponent(q.trim())}` : "/stories");
  };
  return (
    <form className="st-search" role="search" onSubmit={submit}>
      <label className="st-search-icon" htmlFor="st-q">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10.5 4a6.5 6.5 0 0 1 5.2 10.4l4.4 4.4-1.4 1.4-4.4-4.4A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
        </svg>
        <span className="sr-only">Search writing</span>
      </label>
      <input id="st-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search writing" />
    </form>
  );
}

function Account() {
  const me = useMe();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  if (me === undefined) return <span className="st-account-wait" aria-hidden="true" />;
  if (!me)
    return (
      <Link className="st-btn st-btn--ghost" href={`/stories/signin?next=${encodeURIComponent(pathname)}`}>
        Sign in
      </Link>
    );
  return (
    <div className="st-account" ref={box}>
      <button type="button" className="st-account-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
        <Avatar profile={me} size={34} />
        <span className="sr-only">Your account</span>
      </button>
      {open && (
        <div className="st-menu" role="menu">
          <p className="st-menu-who">
            <b>{me.name}</b>
            <small>@{me.username}</small>
          </p>
          <Link role="menuitem" href={`/stories/authors/${me.username}`} onClick={() => setOpen(false)}>
            Your profile
          </Link>
          {isWriter(me) && (
            <Link role="menuitem" href="/stories/admin" onClick={() => setOpen(false)}>
              {me.role === "admin" ? "Admin panel" : "Your writing"}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false);
              await stories().signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoriesShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const me = useMe();
  const demo = useDemo();
  if (pathname.startsWith("/stories/admin")) return <div className={`st-root st-root--admin ${className}`}>{children}</div>;

  return (
    <div className={`st-root ${className}`}>
      <header className="st-top">
        <div className="st-top-in">
          <TransitionLink href="/" className="st-back">
            <span aria-hidden="true">←</span>
            <span className="st-back-text">Rajendra Pandey</span>
          </TransitionLink>
          <Link href="/stories" className="st-brand" aria-label="Stories, home">
            <span lang="ne">कथा</span>
            <small>Stories</small>
          </Link>
          <div className="st-top-actions">
            <Search />
            {isWriter(me) && (
              <Link className="st-btn" href="/stories/admin/write">
                Write
              </Link>
            )}
            <Account />
          </div>
        </div>
        <Suspense fallback={<nav className="st-tabs" />}>
          <Tabs />
        </Suspense>
      </header>

      <div className="st-page" key={pathname}>
        {children}
      </div>

      <footer className="st-foot">
        <p>
          <span lang="ne">कथा</span> Stories by Rajendra Pandey and friends.{" "}
          <TransitionLink href="/">Back to the portfolio</TransitionLink>
        </p>
        {demo && (
          <p className="st-demo-note">
            Demo mode: posts, accounts and photos are kept in this browser only. Connect Supabase (see <code>supabase/README.md</code>) to publish for everyone.
          </p>
        )}
      </footer>
    </div>
  );
}
