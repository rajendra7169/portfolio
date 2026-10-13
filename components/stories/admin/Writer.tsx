"use client";

// Writing a post. The page looks like the published piece (same type, same photo
// placement), with the toolbar above and the post's settings beside it: kind,
// language, cover, address, tags, the posts it points readers to, and who wrote it.
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent } from "react";
import { cleanDoc, storyExtensions } from "@/lib/stories/extensions";
import { isWriter, stories, useMe, useStories } from "@/lib/stories/store";
import { POST_TYPES, postSlug, typeOf, type CoverLayout, type Post, type PostType, type Profile } from "@/lib/stories/types";
import { Empty, Loading } from "../ui";
import AdminFrame from "./AdminFrame";
import { EditorImage } from "./ImageView";
import Toolbar from "./Toolbar";

type Meta = Pick<Post, "type" | "title" | "subtitle" | "cover" | "coverLayout" | "coverPosition" | "lang" | "tags" | "authorId" | "featured" | "refs" | "slug" | "status">;
const blank = (authorId: string): Meta => ({
  type: "blog",
  title: "",
  subtitle: "",
  cover: null,
  coverLayout: "full",
  coverPosition: "50% 50%",
  lang: "en",
  tags: [],
  authorId,
  featured: false,
  refs: [],
  slug: "",
  status: "draft",
});
const ART = ["/stories/art/hills.svg", "/stories/art/rain.svg", "/stories/art/flags.svg"];
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

function Grow({ value, onChange, className, placeholder, label, onEnter }: { value: string; onChange: (v: string) => void; className: string; placeholder: string; label: string; onEnter?: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current!;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      className={className}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e: RKeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}

/** Click the cover to choose the point that stays in view when it's cropped. */
function CoverFocus({ src, position, onChange }: { src: string; position: string; onChange: (p: string) => void }) {
  const [x, y] = position.split(" ").map((v) => parseFloat(v) || 50);
  return (
    <button
      type="button"
      className="se-cover-focus"
      title="Click the part of the photo that should stay in view"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onChange(`${Math.round(((e.clientX - r.left) / r.width) * 100)}% ${Math.round(((e.clientY - r.top) / r.height) * 100)}%`);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host */}
      <img src={src} alt="" />
      <span className="se-cover-dot" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
    </button>
  );
}

function Settings({ meta, set, me, posts, writers, saved, onCover, coverBusy, onDelete, slugTouched, setSlugTouched }: {
  meta: Meta;
  set: <K extends keyof Meta>(k: K, v: Meta[K]) => void;
  me: Profile;
  posts: Post[];
  writers: Profile[];
  saved: Post | null;
  onCover: (f: File) => void;
  coverBusy: boolean;
  onDelete: () => void;
  slugTouched: boolean;
  setSlugTouched: (v: boolean) => void;
}) {
  const coverInput = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState("");
  const [find, setFind] = useState("");
  const addTag = () => {
    const t = tag.trim().replace(/^#/, "").toLowerCase();
    if (t && !meta.tags.includes(t)) set("tags", [...meta.tags, t].slice(0, 8));
    setTag("");
  };
  const others = posts.filter((p) => p.id !== saved?.id);
  const picked = meta.refs.map((id) => others.find((p) => p.id === id)).filter(Boolean) as Post[];
  const options = others.filter((p) => !meta.refs.includes(p.id) && (!find.trim() || p.title.toLowerCase().includes(find.trim().toLowerCase()))).slice(0, 6);

  return (
    <div className="se-settings" data-lenis-prevent>
      <section>
        <h3>Kind</h3>
        <div className="se-kinds">
          {POST_TYPES.map((t) => (
            <button key={t.id} type="button" className={meta.type === t.id ? "is-on" : undefined} aria-pressed={meta.type === t.id} onClick={() => set("type", t.id as PostType)}>
              <span lang="ne">{t.ne}</span>
              {t.label}
            </button>
          ))}
        </div>
        <label className="se-field">
          <span>Language</span>
          <select value={meta.lang} onChange={(e) => set("lang", e.target.value as Meta["lang"])}>
            <option value="en">English</option>
            <option value="ne">नेपाली Nepali</option>
            <option value="mixed">Both</option>
          </select>
        </label>
      </section>

      <section>
        <h3>Cover</h3>
        {meta.cover ? (
          <>
            <CoverFocus src={meta.cover} position={meta.coverPosition} onChange={(p) => set("coverPosition", p)} />
            <div className="se-seg" role="group" aria-label="Where the cover sits">
              {(
                [
                  ["full", "Full width"],
                  ["side", "Beside title"],
                  ["none", "Cards only"],
                ] as [CoverLayout, string][]
              ).map(([v, l]) => (
                <button key={v} type="button" className={meta.coverLayout === v ? "is-on" : undefined} aria-pressed={meta.coverLayout === v} onClick={() => set("coverLayout", v)}>
                  {l}
                </button>
              ))}
            </div>
            <div className="se-row">
              <button type="button" className="st-btn st-btn--ghost" onClick={() => coverInput.current?.click()} disabled={coverBusy}>
                {coverBusy ? "Uploading…" : "Replace"}
              </button>
              <button type="button" className="st-btn st-btn--quiet" onClick={() => set("cover", null)}>
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <button type="button" className="se-cover-empty" onClick={() => coverInput.current?.click()} disabled={coverBusy}>
              {coverBusy ? "Uploading…" : "Add a cover photo"}
            </button>
            <div className="se-art" aria-label="Or use one of these">
              {ART.map((a) => (
                <button key={a} type="button" style={{ backgroundImage: `url("${a}")` }} aria-label={`Use the ${a.split("/").pop()!.replace(".svg", "")} art`} onClick={() => set("cover", a)} />
              ))}
            </div>
          </>
        )}
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onCover(f);
          }}
        />
      </section>

      <section>
        <h3>Address and tags</h3>
        <label className="se-field">
          <span>Web address</span>
          <span className="se-slug">
            <small>/stories/</small>
            <input
              value={meta.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              onBlur={() => set("slug", postSlug(meta.slug || meta.title))}
              placeholder={postSlug(meta.title || "untitled")}
            />
          </span>
          {!slugTouched && !saved && <small>Follows the title until you change it.</small>}
        </label>
        <label className="se-field">
          <span>Tags</span>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              } else if (e.key === "Backspace" && !tag && meta.tags.length) set("tags", meta.tags.slice(0, -1));
            }}
            onBlur={addTag}
            placeholder="Type a tag, press Enter"
          />
        </label>
        {meta.tags.length > 0 && (
          <ul className="se-chips">
            {meta.tags.map((t) => (
              <li key={t}>
                #{t}
                <button type="button" aria-label={`Remove ${t}`} onClick={() => set("tags", meta.tags.filter((x) => x !== t))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Read next</h3>
        <p className="se-muted">Posts shown at the end of this one. Linking to a post in the text adds it here too.</p>
        {picked.length > 0 && (
          <ul className="se-refs">
            {picked.map((p) => (
              <li key={p.id}>
                <span>
                  <b>{p.title || "Untitled"}</b>
                  <small>{typeOf(p.type).label}</small>
                </span>
                <button type="button" aria-label={`Remove ${p.title}`} onClick={() => set("refs", meta.refs.filter((x) => x !== p.id))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {meta.refs.length < 6 && (
          <>
            <input className="se-input" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find a post to add" aria-label="Find a post to add" />
            <ul className="se-ref-options">
              {options.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => set("refs", [...meta.refs, p.id])}>
                    + {p.title || "Untitled"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {me.role === "admin" && (
        <section>
          <h3>Publishing</h3>
          <label className="se-field">
            <span>Written by</span>
            <select value={meta.authorId} onChange={(e) => set("authorId", e.target.value)}>
              {writers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (@{w.username})
                </option>
              ))}
            </select>
          </label>
          <label className="se-check">
            <input type="checkbox" checked={meta.featured} onChange={(e) => set("featured", e.target.checked)} />
            Feature on the front page
          </label>
        </section>
      )}

      {saved && (
        <section>
          <button type="button" className="st-btn st-btn--danger" onClick={onDelete}>
            Delete this post
          </button>
        </section>
      )}
    </div>
  );
}

export default function Writer({ id }: { id?: string }) {
  const me = useMe();
  const router = useRouter();
  const [saved, setSaved] = useState<Post | null>(null);
  const [meta, setMeta] = useState<Meta | null>(id ? null : blank(""));
  const [missing, setMissing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "unpublish">("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [coverBusy, setCoverBusy] = useState(false);
  const [panel, setPanel] = useState(false);
  const ed = useRef<Editor | null>(null);

  const { data: lists } = useStories(async (s) => ({ posts: await s.listPosts({ status: "all" }), people: await s.listProfiles() }), []);
  const posts = useMemo(() => lists?.posts ?? [], [lists]);
  const writers = (lists?.people ?? []).filter((p) => p.role !== "reader" && p.status === "active");

  const set = useCallback(<K extends keyof Meta>(k: K, v: Meta[K]) => {
    setMeta((m) => {
      if (!m) return m;
      const next = { ...m, [k]: v };
      return next;
    });
    setDirty(true);
  }, []);

  // A photo dropped, pasted or picked: uploaded (scaled down first), then placed.
  const placeImage = useCallback(async (input: File | string, at?: number) => {
    const editor = ed.current;
    if (!editor) return;
    let src = typeof input === "string" ? input : "";
    if (typeof input !== "string") {
      setNotice({ kind: "ok", text: "Uploading photo…" });
      try {
        src = await stories().upload(input, "inline");
        setNotice(null);
      } catch (e) {
        setNotice({ kind: "error", text: (e as Error).message });
        return;
      }
    }
    const node = { type: "storyImage", attrs: { src, align: "center", width: 100, caption: "", alt: "" } };
    const chain = editor.chain().focus();
    (at === undefined ? chain.insertContent(node) : chain.insertContentAt(at, node)).run();
  }, []);

  const editor = useEditor({
    extensions: [
      ...storyExtensions(EditorImage),
      Placeholder.configure({ placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : "Write here. Shift+Enter starts a new line in the same verse.") }),
      CharacterCount,
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "st-prose se-prose", spellcheck: "true", "aria-label": "Post body" },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        files.forEach((f) => placeImage(f));
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = [...(event.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        files.forEach((f) => placeImage(f, at));
        return true;
      },
    },
    onUpdate: () => setDirty(true),
  });
  ed.current = editor;

  // Opening an existing post.
  useEffect(() => {
    if (!editor) return;
    if (!id) {
      setMeta((m) => (m && !m.authorId && me ? { ...m, authorId: me.id } : m));
      return;
    }
    if (saved?.id === id) return;
    let live = true;
    stories()
      .getPost(id)
      .then((p) => {
        if (!live) return;
        if (!p) return setMissing(true);
        setSaved(p);
        setMeta({ type: p.type, title: p.title, subtitle: p.subtitle, cover: p.cover, coverLayout: p.coverLayout, coverPosition: p.coverPosition, lang: p.lang, tags: p.tags, authorId: p.authorId, featured: p.featured, refs: p.refs, slug: p.slug, status: p.status });
        editor.commands.setContent(p.content, { emitUpdate: false });
        setDirty(false);
      })
      .catch(() => live && setMissing(true));
    return () => void (live = false);
  }, [editor, id, me, saved?.id]);

  // The slug follows the title on a new post until it's edited by hand.
  useEffect(() => {
    if (meta && !slugTouched && !saved) setMeta((m) => (m ? { ...m, slug: m.title ? postSlug(m.title) : "" } : m));
  }, [meta?.title, slugTouched, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  // Gajal and kabita are set centred, in the editor as on the page.
  const verse = meta ? typeOf(meta.type).verse : false;
  const words = useEditorState({
    editor,
    selector: ({ editor: e }) => (e?.storage as unknown as { characterCount?: { words(): number } } | undefined)?.characterCount?.words() ?? 0,
  });

  useEffect(() => {
    if (me === null) router.replace(`/stories/signin?next=${encodeURIComponent(id ? `/stories/admin/write/${id}` : "/stories/admin/write")}`);
  }, [me, id, router]);

  const save = useCallback(
    async (status: Post["status"], kind: "save" | "publish" | "unpublish") => {
      if (!editor || !meta) return;
      if (status === "published" && !meta.title.trim()) {
        setNotice({ kind: "error", text: "Give it a title before publishing." });
        return;
      }
      setBusy(kind);
      setNotice(null);
      try {
        const p = await stories().savePost({ ...meta, id: saved?.id, status, title: meta.title.trim(), subtitle: meta.subtitle.trim(), slug: meta.slug || meta.title, content: cleanDoc(editor.getJSON()) });
        setSaved(p);
        setMeta((m) => (m ? { ...m, slug: p.slug, status: p.status } : m));
        setDirty(false);
        setSavedAt(new Date());
        setNotice({ kind: "ok", text: kind === "publish" ? (saved?.status === "published" ? "Updated." : "Published.") : kind === "unpublish" ? "Moved back to drafts." : "Draft saved." });
        // A new post gets its own address, without reopening the editor.
        if (!saved) window.history.replaceState(null, "", `/stories/admin/write/${p.id}`);
      } catch (e) {
        setNotice({ kind: "error", text: (e as Error).message });
      } finally {
        setBusy("");
      }
    },
    [editor, meta, saved],
  );

  // Ctrl/Cmd+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save(meta?.status ?? "draft", meta?.status === "published" ? "publish" : "save");
      }
    };
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("beforeunload", leave);
    };
  }, [save, dirty, meta?.status]);

  if (!me) return <Loading />;
  if (!isWriter(me))
    return (
      <AdminFrame me={me} tab="write">
        <Empty title="Writing is for writers">Your account reads and comments. Ask the admin to make you a writer.</Empty>
      </AdminFrame>
    );
  if (missing)
    return (
      <AdminFrame me={me} tab="write">
        <Empty title="That post isn't here">
          It may have been deleted. <Link href="/stories/admin/posts">Back to posts</Link>
        </Empty>
      </AdminFrame>
    );
  if (saved && me.role !== "admin" && saved.authorId !== me.id)
    return (
      <AdminFrame me={me} tab="write">
        <Empty title="This is someone else's post">Writers edit their own posts; the admin edits any.</Empty>
      </AdminFrame>
    );
  if (!meta || !editor) return <Loading label="Opening the editor" />;

  const published = meta.status === "published";
  const state = busy ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? `Saved at ${TIME.format(savedAt)}` : saved ? (published ? "Published" : "Draft") : "New post";

  return (
    <AdminFrame me={me} tab="write" bare>
      <div className={`se-page${panel ? " is-panel" : ""}`}>
        <header className="se-top">
          <Link href="/stories/admin/posts" className="se-back" onClick={(e) => dirty && !confirm("Leave without saving your changes?") && e.preventDefault()}>
            ← Posts
          </Link>
          <p className="se-state" role="status">
            <span className={`se-dot${dirty ? " is-dirty" : published ? " is-live" : ""}`} aria-hidden="true" />
            {state}
            <small>{words} words</small>
          </p>
          <div className="se-actions">
            {saved && (
              <a className="st-btn st-btn--quiet" href={`/stories/${saved.slug}`} target="_blank" rel="noreferrer">
                {published ? "View" : "Preview"}
              </a>
            )}
            <button type="button" className="st-btn st-btn--ghost se-panel-btn" aria-expanded={panel} onClick={() => setPanel((v) => !v)}>
              Settings
            </button>
            {published ? (
              <button type="button" className="st-btn st-btn--ghost" disabled={!!busy} onClick={() => save("draft", "unpublish")}>
                Unpublish
              </button>
            ) : (
              <button type="button" className="st-btn st-btn--ghost" disabled={!!busy} onClick={() => save("draft", "save")}>
                Save draft
              </button>
            )}
            <button type="button" className="st-btn" disabled={!!busy} onClick={() => save("published", "publish")}>
              {published ? "Update" : "Publish"}
            </button>
          </div>
        </header>
        {notice && (
          <p className={`se-notice is-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
            {notice.text}
            <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}>
              ×
            </button>
          </p>
        )}

        <div className="se-body">
          <div className="se-canvas">
            <Toolbar
              editor={editor}
              posts={posts.filter((p) => p.id !== saved?.id)}
              onImage={(f) => placeImage(f)}
              onLinkPost={(p) => meta.refs.includes(p.id) || p.status !== "published" || set("refs", [...meta.refs, p.id].slice(0, 6))}
            />
            <div className={`se-paper st-post--${meta.type}${verse ? " is-verse" : ""}`} lang={meta.lang === "mixed" ? undefined : meta.lang}>
              <p className="se-kind">
                <span lang="ne">{typeOf(meta.type).ne}</span> {typeOf(meta.type).label}
              </p>
              <Grow className="se-title" value={meta.title} onChange={(v) => set("title", v)} placeholder="Title" label="Title" onEnter={() => document.querySelector<HTMLTextAreaElement>(".se-dek")?.focus()} />
              <Grow className="se-dek" value={meta.subtitle} onChange={(v) => set("subtitle", v)} placeholder="A line under the title (optional)" label="Subtitle" onEnter={() => editor.commands.focus("start")} />
              <EditorContent editor={editor} className={`se-editor${verse ? " is-verse" : ""}`} />
            </div>
          </div>
          <aside className="se-side" aria-label="Post settings">
            <Settings
              meta={meta}
              set={set}
              me={me}
              posts={posts}
              writers={writers}
              saved={saved}
              coverBusy={coverBusy}
              slugTouched={slugTouched}
              setSlugTouched={setSlugTouched}
              onCover={async (f) => {
                setCoverBusy(true);
                try {
                  set("cover", await stories().upload(f, "covers"));
                } catch (e) {
                  setNotice({ kind: "error", text: (e as Error).message });
                } finally {
                  setCoverBusy(false);
                }
              }}
              onDelete={async () => {
                if (!saved || !confirm(`Delete “${saved.title || "Untitled"}” for good? Its comments and reactions go too.`)) return;
                try {
                  await stories().deletePost(saved.id);
                  setDirty(false);
                  router.replace("/stories/admin/posts");
                } catch (e) {
                  setNotice({ kind: "error", text: (e as Error).message });
                }
              }}
            />
          </aside>
        </div>
      </div>
    </AdminFrame>
  );
}
