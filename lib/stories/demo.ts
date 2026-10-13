"use client";

// The demo store: everything kept in this browser's IndexedDB, seeded with sample
// writers and posts. It runs whenever Supabase isn't configured, so the whole
// site (reading, reacting, commenting, the admin and the editor) works locally.
// Accounts here are only for trying things out: passwords sit in the browser.
import { blobToDataUrl, shrinkImage } from "./image";
import { SEED_POSTS, SEED_PROFILES } from "./seed";
import { noReactions, postSlug, toUsername, type Comment, type CommentWithAuthor, type Post, type PostQuery, type Profile, type ReactionKind, type Reactions, type Stats, type StoriesStore } from "./types";

type Account = { email: string; password: string; userId: string };
type Reaction = { postId: string; userId: string; kind: ReactionKind };
type Data = { posts: Post[]; profiles: Profile[]; comments: Comment[]; reactions: Reaction[]; accounts: Account[]; session: string | null; device: string };

const DB = "rp-stories";
const KEY = "data-v1";

function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("kv");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction("kv", mode);
      const req = fn(tx.objectStore("kv"));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const now = () => new Date().toISOString();

export function demoStore(): StoriesStore {
  let data: Data | null = null;
  let loading: Promise<Data> | null = null;
  const subs = new Set<() => void>();
  const authSubs = new Set<() => void>();

  const load = () =>
    (loading ??= (async () => {
      let d: Data | undefined;
      try {
        d = await idb<Data | undefined>("readonly", (s) => s.get(KEY));
      } catch {}
      data = d ?? {
        posts: structuredClone(SEED_POSTS),
        profiles: structuredClone(SEED_PROFILES),
        comments: [
          { id: "c-1", postId: "p-bus", userId: "u-kiran", parentId: null, body: "That last line stayed with me all day.", status: "visible", createdAt: new Date(Date.now() - 864e5 * 3).toISOString() },
          { id: "c-2", postId: "p-bus", userId: "u-rajendra", parentId: "c-1", body: "Thank you. I still look for that umbrella.", status: "visible", createdAt: new Date(Date.now() - 864e5 * 2).toISOString() },
        ],
        reactions: [
          { postId: "p-bus", userId: "u-kiran", kind: "moved" },
          { postId: "p-bus", userId: "u-aarati", kind: "love" },
          { postId: "p-gajal", userId: "u-aarati", kind: "love" },
          { postId: "p-blazify", userId: "u-kiran", kind: "fire" },
        ],
        accounts: [],
        session: null,
        device: uid("d"),
      };
      return data;
    })());
  const save = async () => {
    if (!data) return;
    try {
      await idb("readwrite", (s) => s.put(data, KEY));
    } catch {}
    subs.forEach((f) => f());
  };
  const me = (d: Data) => d.profiles.find((p) => p.id === d.session) ?? null;
  const isStaff = (u: Profile | null) => u?.role === "admin" || u?.role === "author";
  const canSee = (d: Data, p: Post) => p.status === "published" || (me(d) && (me(d)!.role === "admin" || me(d)!.id === p.authorId));
  const need = (d: Data, ok: (u: Profile) => boolean, msg: string) => {
    const u = me(d);
    if (!u || !ok(u)) throw new Error(msg);
    return u;
  };
  const byDate = (a: Post, b: Post) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt);
  const signedIn = (d: Data, id: string | null) => {
    d.session = id;
    // Reactions made before signing in come along, unless the account already reacted there.
    if (id)
      d.reactions = d.reactions.flatMap((r) => (r.userId !== d.device ? [r] : d.reactions.some((x) => x.userId === id && x.postId === r.postId) ? [] : [{ ...r, userId: id }]));
    authSubs.forEach((f) => f());
  };

  const store: StoriesStore = {
    mode: "demo",

    async listPosts(q = {}) {
      const d = await load();
      let list = d.posts.filter((p) => canSee(d, p));
      const status = q.status ?? "published";
      if (status !== "all") list = list.filter((p) => p.status === status);
      if (q.type) list = list.filter((p) => p.type === q.type);
      if (q.authorId) list = list.filter((p) => p.authorId === q.authorId);
      if (q.tag) list = list.filter((p) => p.tags.includes(q.tag!));
      if (q.q) {
        const s = q.q.toLowerCase();
        list = list.filter((p) => `${p.title} ${p.subtitle} ${p.tags.join(" ")} ${JSON.stringify(p.content)}`.toLowerCase().includes(s));
      }
      list.sort(byDate);
      return structuredClone(q.limit ? list.slice(0, q.limit) : list);
    },
    async getPost(key) {
      const d = await load();
      const p = d.posts.find((x) => x.slug === key || x.id === key);
      return p && canSee(d, p) ? structuredClone(p) : null;
    },
    async backlinks(postId) {
      const d = await load();
      return structuredClone(d.posts.filter((p) => p.status === "published" && p.refs.includes(postId)).sort(byDate));
    },
    async stats(ids) {
      const d = await load();
      const out: Stats = {};
      ids.forEach((id) => (out[id] = { reactions: d.reactions.filter((r) => r.postId === id).length, comments: d.comments.filter((c) => c.postId === id && c.status === "visible").length }));
      return out;
    },

    async listProfiles() {
      const d = await load();
      return structuredClone(d.profiles);
    },
    async getProfile(key) {
      const d = await load();
      const p = d.profiles.find((x) => x.username === key || x.id === key);
      return p ? structuredClone(p) : null;
    },

    async reactions(postId): Promise<Reactions> {
      const d = await load();
      const counts = noReactions();
      d.reactions.filter((r) => r.postId === postId).forEach((r) => counts[r.kind]++);
      const who = d.session ?? d.device;
      return { counts, mine: d.reactions.find((r) => r.postId === postId && r.userId === who)?.kind ?? null };
    },
    // Reactions need no account: without one, this browser counts as one reader.
    async react(postId, kind) {
      const d = await load();
      const who = d.session ?? d.device;
      d.reactions = d.reactions.filter((r) => !(r.postId === postId && r.userId === who));
      if (kind) d.reactions.push({ postId, userId: who, kind });
      await save();
      return store.reactions(postId);
    },

    async comments(postId, opts) {
      const d = await load();
      const u = me(d);
      return d.comments
        .filter((c) => c.postId === postId && (c.status === "visible" || opts?.all || u?.role === "admin"))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((c) => ({ ...c, author: d.profiles.find((p) => p.id === c.userId) ?? null }));
    },
    async allComments() {
      const d = await load();
      need(d, (u) => u.role === "admin", "Only an admin can moderate comments.");
      return d.comments
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((c) => ({ ...c, author: d.profiles.find((p) => p.id === c.userId) ?? null, post: d.posts.find((p) => p.id === c.postId) ?? null }));
    },
    async addComment(postId, body, parentId = null) {
      const d = await load();
      const u = need(d, (x) => x.status === "active", "Sign in to comment.");
      const text = body.trim().slice(0, 4000);
      if (!text) throw new Error("Write something first.");
      d.comments.push({ id: uid("c"), postId, userId: u.id, parentId, body: text, status: "visible", createdAt: now() });
      await save();
    },
    async setCommentStatus(id, status) {
      const d = await load();
      need(d, (u) => u.role === "admin", "Only an admin can moderate comments.");
      const c = d.comments.find((x) => x.id === id);
      if (c) c.status = status;
      await save();
    },
    async deleteComment(id) {
      const d = await load();
      const u = need(d, () => true, "Sign in first.");
      const c = d.comments.find((x) => x.id === id);
      if (!c || (u.role !== "admin" && c.userId !== u.id)) throw new Error("You can only delete your own comments.");
      d.comments = d.comments.filter((x) => x.id !== id && x.parentId !== id);
      await save();
    },

    async me() {
      return me(await load());
    },
    onAuth(cb) {
      authSubs.add(cb);
      return () => authSubs.delete(cb);
    },
    async signIn(email, password) {
      const d = await load();
      const e = email.trim().toLowerCase();
      // The demo's owner account, so the admin can be tried straight away.
      if (e === "admin@demo" && password === "demo") return void (signedIn(d, "u-rajendra"), await save());
      const a = d.accounts.find((x) => x.email === e && x.password === password);
      if (!a) throw new Error("That email and password don't match an account in this demo.");
      const u = d.profiles.find((p) => p.id === a.userId);
      if (u?.status === "banned") throw new Error("This account has been suspended.");
      signedIn(d, a.userId);
      await save();
    },
    async signUp(name, email, password) {
      const d = await load();
      const e = email.trim().toLowerCase();
      if (!name.trim() || !/^\S+@\S+\.\S+$/.test(e)) throw new Error("Enter your name and a valid email.");
      if (password.length < 6) throw new Error("Use at least 6 characters for the password.");
      if (d.accounts.some((a) => a.email === e)) throw new Error("There's already an account with that email.");
      const id = uid("u");
      let username = (toUsername(name).slice(0, 24) || "reader").padEnd(2, "0");
      while (d.profiles.some((p) => p.username === username)) username += Math.floor(Math.random() * 10);
      d.profiles.push({ id, username, name: name.trim(), bio: "", avatar: null, banner: null, role: "reader", status: "active", joined: now() });
      d.accounts.push({ email: e, password, userId: id });
      signedIn(d, id);
      await save();
    },
    async authOptions() {
      return { google: false, email: true };
    },
    async signInWithGoogle() {
      throw new Error("Google sign-in works once Supabase is connected. In the demo, create an account with an email.");
    },
    async signOut() {
      const d = await load();
      signedIn(d, null);
      await save();
    },
    async resetPassword() {
      throw new Error("Password reset emails work once Supabase is connected. In the demo, create a new account instead.");
    },
    async updatePassword(password) {
      const d = await load();
      const u = need(d, () => true, "Sign in first.");
      if (password.length < 6) throw new Error("Use at least 6 characters for the password.");
      const a = d.accounts.find((x) => x.userId === u.id);
      if (!a) throw new Error("The demo's owner account has no password to change.");
      a.password = password;
      await save();
    },

    async savePost(input) {
      const d = await load();
      const u = need(d, isStaff, "Only writers can save posts.");
      const existing = input.id ? d.posts.find((p) => p.id === input.id) : undefined;
      if (existing && u.role !== "admin" && existing.authorId !== u.id) throw new Error("You can only edit your own posts.");
      const base: Post = existing ?? {
        id: uid("p"),
        slug: "",
        type: "blog",
        title: "",
        subtitle: "",
        cover: null,
        coverLayout: "full",
        coverPosition: "50% 50%",
        content: { type: "doc", content: [] },
        lang: "en",
        tags: [],
        authorId: u.id,
        status: "draft",
        featured: false,
        refs: [],
        publishedAt: null,
        createdAt: now(),
        updatedAt: now(),
      };
      const next: Post = { ...base, ...input, id: base.id, updatedAt: now() };
      if (u.role !== "admin") next.authorId = base.authorId; // only an admin can credit someone else
      let slug = postSlug(next.slug || next.title);
      while (d.posts.some((p) => p.slug === slug && p.id !== next.id)) slug += "-2";
      next.slug = slug;
      if (next.status === "published" && !next.publishedAt) next.publishedAt = now();
      d.posts = existing ? d.posts.map((p) => (p.id === next.id ? next : p)) : [...d.posts, next];
      await save();
      return structuredClone(next);
    },
    async deletePost(id) {
      const d = await load();
      const u = need(d, isStaff, "Only writers can delete posts.");
      const p = d.posts.find((x) => x.id === id);
      if (p && u.role !== "admin" && p.authorId !== u.id) throw new Error("You can only delete your own posts.");
      d.posts = d.posts.filter((x) => x.id !== id).map((x) => ({ ...x, refs: x.refs.filter((r) => r !== id) }));
      d.comments = d.comments.filter((c) => c.postId !== id);
      d.reactions = d.reactions.filter((r) => r.postId !== id);
      await save();
    },
    async saveProfile(input) {
      const d = await load();
      const u = need(d, () => true, "Sign in first.");
      if (u.role !== "admin" && u.id !== input.id) throw new Error("You can only edit your own profile.");
      const p = d.profiles.find((x) => x.id === input.id);
      if (!p) throw new Error("No such user.");
      if (u.role !== "admin") {
        delete input.role;
        delete input.status;
      }
      if (input.username) {
        input.username = toUsername(input.username);
        if (input.username.length < 2) throw new Error("Usernames need at least 2 letters or numbers.");
        if (d.profiles.some((x) => x.username === input.username && x.id !== p.id)) throw new Error("That username is taken.");
      }
      Object.assign(p, input);
      await save();
      return structuredClone(p);
    },
    async upload(file) {
      if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
      // Kept in the browser as a data URL, scaled down so a post full of photos still fits.
      return blobToDataUrl(await shrinkImage(file));
    },

    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
  return store;
}

/** Exported for the admin's "start again" button: wipe this browser's demo data. */
export async function resetDemo() {
  await idb("readwrite", (s) => s.delete(KEY));
  location.reload();
}

export type { PostQuery };
