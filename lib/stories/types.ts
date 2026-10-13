// Stories: the shapes of everything the public pages, the admin and both data
// stores (Supabase, and the in-browser demo) agree on.
import type { JSONContent } from "@tiptap/core";

export type PostType = "blog" | "story" | "gajal" | "kabita";
export const POST_TYPES: { id: PostType; label: string; plural: string; ne: string; verse: boolean }[] = [
  { id: "blog", label: "Blog", plural: "Blogs", ne: "ब्लग", verse: false },
  { id: "story", label: "Story", plural: "Stories", ne: "कथा", verse: false },
  { id: "gajal", label: "Gajal", plural: "Gajal", ne: "गजल", verse: true },
  { id: "kabita", label: "Kabita", plural: "Kabita", ne: "कविता", verse: true },
];
export const typeOf = (t: PostType) => POST_TYPES.find((x) => x.id === t)!;

export type Role = "admin" | "author" | "reader";

export type Profile = {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string | null;
  banner: string | null;
  role: Role;
  status: "active" | "banned";
  joined: string; // ISO
};

/** A post's body: a Tiptap document (see lib/stories/extensions.ts). */
export type Doc = JSONContent;

export type CoverLayout = "full" | "side" | "none";

export type Post = {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  subtitle: string;
  cover: string | null;
  coverLayout: CoverLayout;
  coverPosition: string; // CSS object-position, e.g. "50% 40%"
  content: Doc;
  lang: "en" | "ne" | "mixed";
  tags: string[];
  authorId: string;
  status: "draft" | "published";
  featured: boolean;
  refs: string[]; // ids of the posts this one points readers to
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  body: string;
  status: "visible" | "hidden";
  createdAt: string;
};
export type CommentWithAuthor = Comment & { author: Profile | null };

export const REACTIONS = [
  { id: "love", emoji: "❤️", label: "Loved it" },
  { id: "moved", emoji: "🥹", label: "Moved me" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "clap", emoji: "👏", label: "Applause" },
  { id: "think", emoji: "🤔", label: "Made me think" },
] as const;
export type ReactionKind = (typeof REACTIONS)[number]["id"];
export type Reactions = { counts: Record<ReactionKind, number>; mine: ReactionKind | null };
export const noReactions = (): Record<ReactionKind, number> => ({ love: 0, moved: 0, fire: 0, clap: 0, think: 0 });

export type Stats = Record<string, { reactions: number; comments: number }>;

export type PostQuery = {
  type?: PostType;
  authorId?: string;
  status?: "published" | "draft" | "all";
  tag?: string;
  q?: string;
  limit?: number;
};

/** What both stores provide. Reads respect who is signed in (drafts, hidden comments). */
export interface StoriesStore {
  readonly mode: "supabase" | "demo";

  listPosts(q?: PostQuery): Promise<Post[]>;
  getPost(slugOrId: string): Promise<Post | null>;
  backlinks(postId: string): Promise<Post[]>;
  stats(postIds: string[]): Promise<Stats>;

  listProfiles(): Promise<Profile[]>;
  getProfile(usernameOrId: string): Promise<Profile | null>;

  reactions(postId: string): Promise<Reactions>;
  react(postId: string, kind: ReactionKind | null): Promise<Reactions>;

  comments(postId: string, opts?: { all?: boolean }): Promise<CommentWithAuthor[]>;
  allComments(): Promise<(CommentWithAuthor & { post: Post | null })[]>;
  addComment(postId: string, body: string, parentId?: string | null): Promise<void>;
  setCommentStatus(id: string, status: Comment["status"]): Promise<void>;
  deleteComment(id: string): Promise<void>;

  me(): Promise<Profile | null>;
  onAuth(cb: () => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  /** Which ways of signing in are switched on (Google needs setting up in Supabase first). */
  authOptions(): Promise<{ google: boolean; email: boolean }>;
  signOut(): Promise<void>;
  /** Email a link for choosing a new password; the link opens /stories/signin?mode=reset signed in. */
  resetPassword(email: string): Promise<void>;
  /** Set a new password for the signed-in account (after following that link). */
  updatePassword(password: string): Promise<void>;

  savePost(p: Partial<Post> & { id?: string }): Promise<Post>;
  deletePost(id: string): Promise<void>;
  saveProfile(p: Partial<Profile> & { id: string }): Promise<Profile>;
  upload(file: File, folder: "covers" | "inline" | "avatars" | "banners"): Promise<string>;

  /** Fires after any write, so open views can refresh. */
  subscribe(cb: () => void): () => void;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-") // keep vowel signs, so Nepali titles stay readable
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";

/** A post's web address: its slug, kept clear of the section's own pages. */
const RESERVED = new Set(["admin", "signin", "authors"]);
export const postSlug = (s: string) => {
  const slug = slugify(s);
  return RESERVED.has(slug) ? `${slug}-post` : slug;
};

/** A username: lowercase letters, numbers and underscores (as the database requires). */
export const toUsername = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 32);

/** Words in a document, for the reading time. */
export function docText(doc: Doc): string {
  const out: string[] = [];
  const walk = (n: Doc) => {
    if (n.text) out.push(n.text);
    if (n.type === "hardBreak") out.push("\n");
    n.content?.forEach(walk);
    if (n.type === "paragraph" || n.type === "heading") out.push("\n");
  };
  walk(doc);
  return out.join("").replace(/\n+/g, "\n").trim();
}
export const readMinutes = (doc: Doc) => Math.max(1, Math.round(docText(doc).split(/\s+/).filter(Boolean).length / 200));
export const excerpt = (p: Post, n = 180) => {
  if (p.subtitle) return p.subtitle;
  const t = docText(p.content).replace(/\n/g, " ");
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};
/** A poem's stanzas (a gajal's shers): runs of lines between blank lines. */
export function stanzas(doc: Doc): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  const flush = () => {
    if (cur.length) out.push(cur);
    cur = [];
  };
  for (const block of doc.content ?? []) {
    const text = docText(block).trim();
    if (!text) flush();
    else cur.push(...text.split("\n").map((l) => l.trim()).filter(Boolean));
  }
  flush();
  return out;
}

/** Numbers in Devanagari digits. */
export const neNum = (n: number) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)]);

/** The first lines of a poem, for a verse card. */
export const firstLines = (p: Post, n = 2) =>
  docText(p.content)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, n);
