"use client";

// The Supabase store: posts, profiles, reactions and comments in Postgres (see
// supabase/migrations), photos in the "stories" storage bucket, accounts with
// Supabase Auth. Row-level security does the real guarding; the checks here only
// give clearer messages. Reactions need no account: the first one signs the
// reader in anonymously (enable Anonymous sign-ins in the Supabase dashboard).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { shrinkImage } from "./image";
import { noReactions, postSlug, toUsername, type Comment, type CommentWithAuthor, type Post, type Profile, type ReactionKind, type Reactions, type Stats, type StoriesStore } from "./types";

type Row = Record<string, unknown>;

const toProfile = (r: Row): Profile => ({
  id: r.id as string,
  username: r.username as string,
  name: (r.name as string) ?? "",
  bio: (r.bio as string) ?? "",
  avatar: (r.avatar as string) ?? null,
  banner: (r.banner as string) ?? null,
  role: (r.role as Profile["role"]) ?? "reader",
  status: (r.status as Profile["status"]) ?? "active",
  joined: (r.joined as string) ?? new Date().toISOString(),
});
const toPost = (r: Row): Post => ({
  id: r.id as string,
  slug: r.slug as string,
  type: r.type as Post["type"],
  title: (r.title as string) ?? "",
  subtitle: (r.subtitle as string) ?? "",
  cover: (r.cover as string) ?? null,
  coverLayout: (r.cover_layout as Post["coverLayout"]) ?? "full",
  coverPosition: (r.cover_position as string) ?? "50% 50%",
  content: (r.content as Post["content"]) ?? { type: "doc", content: [] },
  lang: (r.lang as Post["lang"]) ?? "en",
  tags: (r.tags as string[]) ?? [],
  authorId: r.author_id as string,
  status: (r.status as Post["status"]) ?? "draft",
  featured: Boolean(r.featured),
  refs: (r.refs as string[]) ?? [],
  publishedAt: (r.published_at as string) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});
const fromPost = (p: Partial<Post>): Row => {
  const r: Row = {};
  const map: [keyof Post, string][] = [
    ["slug", "slug"], ["type", "type"], ["title", "title"], ["subtitle", "subtitle"], ["cover", "cover"], ["coverLayout", "cover_layout"],
    ["coverPosition", "cover_position"], ["content", "content"], ["lang", "lang"], ["tags", "tags"], ["authorId", "author_id"], ["status", "status"],
    ["featured", "featured"], ["refs", "refs"], ["publishedAt", "published_at"],
  ];
  map.forEach(([k, c]) => p[k] !== undefined && (r[c] = p[k]));
  return r;
};
const fail = (e: { message: string } | null) => {
  if (e) throw new Error(e.message);
};

export function supabaseStore(url: string, key: string): StoriesStore {
  const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  const subs = new Set<() => void>();
  const changed = () => subs.forEach((f) => f());

  const user = async () => (await sb.auth.getSession()).data.session?.user ?? null;
  const profileOf = async (id: string) => {
    const { data } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
    return data ? toProfile(data) : null;
  };
  const meProfile = async () => {
    const u = await user();
    if (!u || u.is_anonymous) return null;
    return profileOf(u.id);
  };
  const profilesById = async (ids: string[]) => {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return new Map<string, Profile>();
    const { data } = await sb.from("profiles").select("*").in("id", unique);
    return new Map((data ?? []).map((r) => [r.id as string, toProfile(r)]));
  };

  const store: StoriesStore = {
    mode: "supabase",

    async listPosts(q = {}) {
      let req = sb.from("posts").select("*").order("published_at", { ascending: false, nullsFirst: true }).order("updated_at", { ascending: false });
      const status = q.status ?? "published";
      if (status !== "all") req = req.eq("status", status);
      if (q.type) req = req.eq("type", q.type);
      if (q.authorId) req = req.eq("author_id", q.authorId);
      if (q.tag) req = req.contains("tags", [q.tag]);
      if (q.q) req = req.or(`title.ilike.%${q.q.replace(/[%,()]/g, " ")}%,subtitle.ilike.%${q.q.replace(/[%,()]/g, " ")}%`);
      if (q.limit) req = req.limit(q.limit);
      const { data, error } = await req;
      fail(error);
      return (data ?? []).map(toPost);
    },
    async getPost(key) {
      const isId = /^[0-9a-f-]{36}$/i.test(key);
      const { data, error } = await sb.from("posts").select("*").eq(isId ? "id" : "slug", key).maybeSingle();
      fail(error);
      return data ? toPost(data) : null;
    },
    async backlinks(postId) {
      const { data } = await sb.from("posts").select("*").eq("status", "published").contains("refs", [postId]).order("published_at", { ascending: false });
      return (data ?? []).map(toPost);
    },
    async stats(ids) {
      const out: Stats = {};
      ids.forEach((id) => (out[id] = { reactions: 0, comments: 0 }));
      if (!ids.length) return out;
      const { data } = await sb.from("post_stats").select("*").in("id", ids);
      (data ?? []).forEach((r) => (out[r.id as string] = { reactions: Number(r.reactions) || 0, comments: Number(r.comments) || 0 }));
      return out;
    },

    async listProfiles() {
      const { data, error } = await sb.from("profiles").select("*").order("joined", { ascending: true });
      fail(error);
      return (data ?? []).map(toProfile);
    },
    async getProfile(key) {
      const isId = /^[0-9a-f-]{36}$/i.test(key);
      const { data } = await sb.from("profiles").select("*").eq(isId ? "id" : "username", key).maybeSingle();
      return data ? toProfile(data) : null;
    },

    async reactions(postId): Promise<Reactions> {
      const counts = noReactions();
      const { data } = await sb.from("reactions").select("kind,user_id").eq("post_id", postId);
      const u = await user();
      let mine: ReactionKind | null = null;
      (data ?? []).forEach((r) => {
        counts[r.kind as ReactionKind]++;
        if (u && r.user_id === u.id) mine = r.kind as ReactionKind;
      });
      return { counts, mine };
    },
    async react(postId, kind) {
      let u = await user();
      if (!u) {
        const { data, error } = await sb.auth.signInAnonymously();
        if (error) throw new Error("Sign in to react.");
        u = data.user;
      }
      if (kind) fail((await sb.from("reactions").upsert({ post_id: postId, user_id: u!.id, kind }, { onConflict: "post_id,user_id" })).error);
      else fail((await sb.from("reactions").delete().eq("post_id", postId).eq("user_id", u!.id)).error);
      changed();
      return store.reactions(postId);
    },

    async comments(postId) {
      const { data, error } = await sb.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
      fail(error);
      const rows = (data ?? []) as Row[];
      const people = await profilesById(rows.map((r) => r.user_id as string));
      return rows.map(
        (r): CommentWithAuthor => ({
          id: r.id as string,
          postId: r.post_id as string,
          userId: r.user_id as string,
          parentId: (r.parent_id as string) ?? null,
          body: r.body as string,
          status: r.status as Comment["status"],
          createdAt: r.created_at as string,
          author: people.get(r.user_id as string) ?? null,
        }),
      );
    },
    async allComments() {
      const { data, error } = await sb.from("comments").select("*").order("created_at", { ascending: false }).limit(500);
      fail(error);
      const rows = (data ?? []) as Row[];
      const people = await profilesById(rows.map((r) => r.user_id as string));
      const ids = [...new Set(rows.map((r) => r.post_id as string))];
      const { data: posts } = ids.length ? await sb.from("posts").select("*").in("id", ids) : { data: [] };
      const byId = new Map((posts ?? []).map((p) => [p.id as string, toPost(p)]));
      return rows.map((r) => ({
        id: r.id as string,
        postId: r.post_id as string,
        userId: r.user_id as string,
        parentId: (r.parent_id as string) ?? null,
        body: r.body as string,
        status: r.status as Comment["status"],
        createdAt: r.created_at as string,
        author: people.get(r.user_id as string) ?? null,
        post: byId.get(r.post_id as string) ?? null,
      }));
    },
    async addComment(postId, body, parentId = null) {
      const me = await meProfile();
      if (!me) throw new Error("Sign in to comment.");
      const text = body.trim().slice(0, 4000);
      if (!text) throw new Error("Write something first.");
      fail((await sb.from("comments").insert({ post_id: postId, user_id: me.id, parent_id: parentId, body: text })).error);
      changed();
    },
    async setCommentStatus(id, status) {
      fail((await sb.from("comments").update({ status }).eq("id", id)).error);
      changed();
    },
    async deleteComment(id) {
      fail((await sb.from("comments").delete().eq("id", id)).error);
      changed();
    },

    me: meProfile,
    onAuth(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },
    async signIn(email, password) {
      fail((await sb.auth.signInWithPassword({ email: email.trim(), password })).error);
      const me = await meProfile();
      if (me?.status === "banned") {
        await sb.auth.signOut();
        throw new Error("This account has been suspended.");
      }
    },
    async signUp(name, email, password) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() }, emailRedirectTo: `${location.origin}/stories` },
      });
      fail(error);
      if (!data.session) throw new Error("Almost there: check your email and follow the link to confirm your account.");
    },
    async signInWithGoogle() {
      fail((await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/stories` } })).error);
    },
    async signOut() {
      fail((await sb.auth.signOut()).error);
    },
    async resetPassword(email) {
      fail((await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/stories/signin?mode=reset` })).error);
    },
    async updatePassword(password) {
      if (password.length < 6) throw new Error("Use at least 6 characters for the password.");
      fail((await sb.auth.updateUser({ password })).error);
    },

    async savePost(input) {
      const me = await meProfile();
      if (!me || (me.role !== "admin" && me.role !== "author")) throw new Error("Only writers can save posts.");
      const row = fromPost(input);
      if (input.title !== undefined || input.slug !== undefined) row.slug = postSlug((input.slug || input.title) ?? "");
      // published_at is stamped by the database the first time a post goes out (touch_post).
      if (!input.id) row.author_id ??= me.id;
      // A clashing slug gets a number on the end.
      for (let i = 0; i < 6; i++) {
        const { data, error } = input.id
          ? await sb.from("posts").update(row).eq("id", input.id).select("*").single()
          : await sb.from("posts").insert(row).select("*").single();
        if (!error) {
          changed();
          return toPost(data);
        }
        if (!/duplicate key.*slug/i.test(error.message)) throw new Error(error.message);
        row.slug = `${String(row.slug).replace(/-\d+$/, "")}-${i + 2}`;
      }
      throw new Error("Couldn't find a free web address for this post; change its slug.");
    },
    async deletePost(id) {
      fail((await sb.from("posts").delete().eq("id", id)).error);
      changed();
    },
    async saveProfile(input) {
      const row: Row = {};
      (["username", "name", "bio", "avatar", "banner", "role", "status"] as const).forEach((k) => input[k] !== undefined && (row[k] = input[k]));
      if (typeof row.username === "string") row.username = toUsername(row.username);
      const { data, error } = await sb.from("profiles").update(row).eq("id", input.id).select("*").single();
      if (error && /duplicate key.*username/i.test(error.message)) throw new Error("That username is taken.");
      fail(error);
      changed();
      return toProfile(data);
    },
    async upload(file, folder) {
      const u = await user();
      if (!u || u.is_anonymous) throw new Error("Sign in to upload.");
      if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
      const blob = await shrinkImage(file, folder === "avatars" ? 600 : 2000);
      const path = `${folder}/${u.id}/${crypto.randomUUID()}.webp`;
      fail((await sb.storage.from("stories").upload(path, blob, { contentType: "image/webp", upsert: false })).error);
      return sb.storage.from("stories").getPublicUrl(path).data.publicUrl;
    },

    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
  return store;
}
