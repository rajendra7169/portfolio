"use client";

// The writers' room frame: a sidebar (a top bar on phones) with the sections,
// the way back to the stories, and who's signed in.
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { stories } from "@/lib/stories/store";
import type { Profile } from "@/lib/stories/types";
import { Avatar } from "../ui";

export type Tab = "dashboard" | "posts" | "write" | "users" | "comments";

const NAV: { tab: Tab; href: string; label: string; admin?: boolean; d: string }[] = [
  { tab: "dashboard", href: "/stories/admin", label: "Overview", d: "M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-3h7v10h-7V10Z" },
  { tab: "posts", href: "/stories/admin/posts", label: "Posts", d: "M5 3h10l4 4v14H5V3Zm9 1.5V8h3.5L14 4.5ZM8 11h8v1.6H8V11Zm0 3.5h8v1.6H8v-1.6Zm0 3.5h5v1.6H8V18Z" },
  { tab: "write", href: "/stories/admin/write", label: "New post", d: "m16.5 3.5 4 4L9 19l-5 1 1-5L16.5 3.5ZM14 7.5l2.5 2.5" },
  { tab: "users", href: "/stories/admin/users", label: "People", admin: true, d: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7H2Zm15-9a3 3 0 1 0 0-6v6Zm1 2c2.4.6 4 2.8 4 5.5V20h-4" },
  { tab: "comments", href: "/stories/admin/comments", label: "Comments", admin: true, d: "M4 4h16v12H9l-5 4V4Zm4 5h8v1.6H8V9Zm0 3h5v1.6H8V12Z" },
];

export default function AdminFrame({ me, tab, children, bare = false }: { me: Profile; tab: Tab; children: ReactNode; bare?: boolean }) {
  const router = useRouter();
  return (
    <div className={`sa${bare ? " sa--bare" : ""}`}>
      <aside className="sa-side">
        <Link href="/stories/admin" className="sa-brand">
          <span lang="ne">कथा</span>
          <small>{me.role === "admin" ? "Admin" : "Writing"}</small>
        </Link>
        <nav className="sa-nav" aria-label="Admin">
          {NAV.filter((n) => !n.admin || me.role === "admin").map((n) => (
            <Link key={n.tab} href={n.href} aria-current={tab === n.tab ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={n.d} />
              </svg>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sa-foot">
          <Link href="/stories" className="sa-out">
            ← Stories
          </Link>
          <div className="sa-me">
            <Avatar profile={me} size={32} />
            <span>
              <b>{me.name}</b>
              <button
                type="button"
                onClick={async () => {
                  await stories().signOut();
                  router.push("/stories");
                }}
              >
                Sign out
              </button>
            </span>
          </div>
        </div>
      </aside>
      <div className="sa-main">{children}</div>
    </div>
  );
}
