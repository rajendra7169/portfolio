"use client";

// The writer's toolbar: block type, font, size, line spacing, emphasis, colour,
// highlight, alignment, lists, quote, divider, links (to the web or to another
// post) and photos.
import { useEditorState, type Editor } from "@tiptap/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Post } from "@/lib/stories/types";

// Stored as plain names (see stories.css, which maps them to the loaded fonts).
const FONTS = [
  { label: "Post font", value: "" },
  { label: "Serif", value: "Literata" },
  { label: "Sans", value: "Figtree" },
  { label: "देवनागरी", value: "Martel" },
  { label: "Mono", value: "monospace" },
];
const SIZES = ["14px", "16px", "20px", "24px", "30px", "36px", "48px"];
const SPACING = ["1.3", "1.6", "2", "2.4"];
const COLORS = ["#16171b", "#64656c", "#b4153e", "#b45309", "#2f6b4f", "#2b3f8c", "#1d7fb8", "#7a3b8f"];
const MARKS = ["#fff1a8", "#ffd6e0", "#d4f1dc", "#d8e8ff", "#eadfff"];

const I = {
  undo: "M9 7 4 12l5 5v-3.5h6.5a3.5 3.5 0 1 1 0 7H12v2h3.5a5.5 5.5 0 0 0 0-11H9V7Z",
  redo: "m15 7 5 5-5 5v-3.5H8.5a3.5 3.5 0 1 0 0 7H12v2H8.5a5.5 5.5 0 0 1 0-11H15V7Z",
  bold: "M7 4h6a4 4 0 0 1 2.9 6.8A4.3 4.3 0 0 1 14 19H7V4Zm3 3v3.5h3a1.75 1.75 0 0 0 0-3.5h-3Zm0 6.3V16h3.6a1.85 1.85 0 0 0 0-3.7H10Z",
  italic: "M10 4h8v3h-2.8l-3 10H15v3H7v-3h2.8l3-10H10V4Z",
  underline: "M7 3h3v7.5a2 2 0 0 0 4 0V3h3v7.5a5 5 0 0 1-10 0V3Zm-1 16h12v2H6v-2Z",
  strike: "M4 11h16v2H4v-2Zm8-8c2.6 0 4.6 1.2 5.3 3.3l-2.8.9c-.3-.9-1.2-1.4-2.5-1.4-1.5 0-2.4.6-2.4 1.5 0 .3.1.5.2.7H6.6a4 4 0 0 1-.2-1.2C6.4 4.6 8.7 3 12 3Zm5.5 12c.1.3.1.6.1.9 0 2.7-2.4 4.4-5.7 4.4-2.9 0-5-1.3-5.7-3.6l2.8-.9c.4 1.1 1.4 1.7 2.9 1.7 1.6 0 2.6-.6 2.6-1.6l-.1-.9h3.1Z",
  left: "M3 5h18v2H3V5Zm0 4h12v2H3V9Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Z",
  center: "M3 5h18v2H3V5Zm3 4h12v2H6V9Zm-3 4h18v2H3v-2Zm3 4h12v2H6v-2Z",
  right: "M3 5h18v2H3V5Zm6 4h12v2H9V9Zm-6 4h18v2H3v-2Zm6 4h12v2H9v-2Z",
  justify: "M3 5h18v2H3V5Zm0 4h18v2H3V9Zm0 4h18v2H3v-2Zm0 4h18v2H3v-2Z",
  bullet: "M4 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 6h13v2H8V6Zm-4 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 11h13v2H8v-2Zm-4 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 16h13v2H8v-2Z",
  ordered: "M3 4h2v5H4V5H3V4Zm5 2h13v2H8V6Zm0 5h13v2H8v-2Zm0 5h13v2H8v-2ZM3 11h3v1l-2 2h2v1H3v-1l2-2H3v-1Zm0 5h3v4H3v-1h2v-.5H4v-1h1V17H3v-1Z",
  quote: "M10 6v6H6.5c0 2 1 3.3 3.5 3.8V18c-4.3-.4-6-3-6-6.7V6h6Zm10 0v6h-3.5c0 2 1 3.3 3.5 3.8V18c-4.3-.4-6-3-6-6.7V6h6Z",
  rule: "M3 11h18v2H3v-2Z",
  link: "M10.6 13.4a3.5 3.5 0 0 1 0-4.9l2.8-2.8a3.5 3.5 0 0 1 4.9 4.9l-1.4 1.4-1.4-1.4 1.4-1.4a1.5 1.5 0 0 0-2.1-2.1l-2.8 2.8a1.5 1.5 0 0 0 0 2.1l-1.4 1.4Zm2.8-2.8a3.5 3.5 0 0 1 0 4.9l-2.8 2.8a3.5 3.5 0 0 1-4.9-4.9l1.4-1.4 1.4 1.4-1.4 1.4a1.5 1.5 0 0 0 2.1 2.1l2.8-2.8a1.5 1.5 0 0 0 0-2.1l1.4-1.4Z",
  image: "M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2v9.6l4-4 3.5 3.5 2.5-2.5 4 4V6H5Zm10 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  clear: "M6 4h13v3h-5.3l-1 3.3-2.6-2.6.2-.7H6V4Zm-2.3.9 1.4-1.4 15 15-1.4 1.4-6.3-6.3L11 19H8l1.9-6.3L3.7 4.9Z",
  break: "M4 6h12a4 4 0 0 1 0 8H8v3l-5-4 5-4v3h8a2 2 0 0 0 0-4H4V6Z",
};
const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} fill="currentColor" />
  </svg>
);

function Btn({ on, label, onClick, disabled, children }: { on?: boolean; label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`se-tool${on ? " is-on" : ""}`}
      aria-pressed={on === undefined ? undefined : on}
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the selection in the text
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** A small panel that opens under its button and closes on outside clicks or Escape. */
function Pop({ label, icon, on, children, wide }: { label: string; icon: ReactNode; on?: boolean; children: (close: () => void) => ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", out);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="se-pop" ref={box}>
      <button
        type="button"
        className={`se-tool${on || open ? " is-on" : ""}`}
        aria-label={label}
        title={label}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
      </button>
      {open && (
        <div className={`se-pop-panel${wide ? " is-wide" : ""}`} data-lenis-prevent>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function Swatches({ colors, current, onPick, onClear, custom }: { colors: string[]; current: string; onPick: (c: string) => void; onClear: () => void; custom?: boolean }) {
  return (
    <div className="se-swatches">
      {colors.map((c) => (
        <button key={c} type="button" className={`se-swatch${current.toLowerCase() === c ? " is-on" : ""}`} style={{ background: c }} aria-label={c} onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(c)} />
      ))}
      {custom && (
        <label className="se-swatch se-swatch--custom" title="Any colour">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(current) ? current : "#16171b"} onChange={(e) => onPick(e.target.value)} aria-label="Any colour" />
        </label>
      )}
      <button type="button" className="se-swatch se-swatch--none" aria-label="None" title="None" onMouseDown={(e) => e.preventDefault()} onClick={onClear} />
    </div>
  );
}

export default function Toolbar({ editor, posts, onImage, onLinkPost }: { editor: Editor; posts: Post[]; onImage: (file: File | string) => void; onLinkPost: (p: Post) => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const style = e.getAttributes("textStyle");
      return {
        block: e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p",
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        highlight: (e.getAttributes("highlight").color as string) ?? (e.isActive("highlight") ? "#fff1a8" : ""),
        color: (style.color as string) ?? "",
        family: (style.fontFamily as string) ?? "",
        size: (style.fontSize as string) ?? "",
        spacing: (style.lineHeight as string) ?? "",
        align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
        bullet: e.isActive("bulletList"),
        ordered: e.isActive("orderedList"),
        quote: e.isActive("blockquote"),
        link: e.isActive("link"),
        href: (e.getAttributes("link").href as string) ?? "",
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });
  const c = () => editor.chain().focus();
  const file = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [find, setFind] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const setLink = (href: string, close: () => void) => {
    const h = href.trim();
    if (!h) c().extendMarkRange("link").unsetLink().run();
    else {
      const full = /^(https?:|mailto:|\/|#)/i.test(h) ? h : `https://${h}`;
      if (editor.state.selection.empty && !s.link) c().insertContent({ type: "text", text: h, marks: [{ type: "link", attrs: { href: full } }] }).run();
      else c().extendMarkRange("link").setLink({ href: full }).run();
    }
    close();
  };
  const linkPost = (p: Post, close: () => void) => {
    const href = `/stories/${p.slug}`;
    if (editor.state.selection.empty && !s.link) c().insertContent({ type: "text", text: p.title || "Untitled", marks: [{ type: "link", attrs: { href } }] }).insertContent(" ").run();
    else c().extendMarkRange("link").setLink({ href }).run();
    onLinkPost(p);
    close();
  };
  const found = posts.filter((p) => !find.trim() || p.title.toLowerCase().includes(find.trim().toLowerCase())).slice(0, 8);

  return (
    <div className="se-toolbar" role="toolbar" aria-label="Formatting">
      <div className="se-group">
        <Btn label="Undo" onClick={() => c().undo().run()} disabled={!s.canUndo}>
          <Svg d={I.undo} />
        </Btn>
        <Btn label="Redo" onClick={() => c().redo().run()} disabled={!s.canRedo}>
          <Svg d={I.redo} />
        </Btn>
      </div>

      <div className="se-group">
        <select
          className="se-select"
          aria-label="Text style"
          value={s.block}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") c().setParagraph().run();
            else c().setHeading({ level: v === "h2" ? 2 : 3 }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
        </select>
        <select className="se-select" aria-label="Font" value={s.family} onChange={(e) => (e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run())}>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select className="se-select se-select--narrow" aria-label="Text size" value={s.size} onChange={(e) => (e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run())}>
          <option value="">Size</option>
          {SIZES.map((z) => (
            <option key={z} value={z}>
              {parseInt(z)}
            </option>
          ))}
        </select>
        <select className="se-select se-select--narrow" aria-label="Line spacing" value={s.spacing} onChange={(e) => (e.target.value ? c().setLineHeight(e.target.value).run() : c().unsetLineHeight().run())}>
          <option value="">Spacing</option>
          {SPACING.map((z) => (
            <option key={z} value={z}>
              {z}×
            </option>
          ))}
        </select>
      </div>

      <div className="se-group">
        <Btn label="Bold (Ctrl+B)" on={s.bold} onClick={() => c().toggleBold().run()}>
          <Svg d={I.bold} />
        </Btn>
        <Btn label="Italic (Ctrl+I)" on={s.italic} onClick={() => c().toggleItalic().run()}>
          <Svg d={I.italic} />
        </Btn>
        <Btn label="Underline (Ctrl+U)" on={s.underline} onClick={() => c().toggleUnderline().run()}>
          <Svg d={I.underline} />
        </Btn>
        <Btn label="Strikethrough" on={s.strike} onClick={() => c().toggleStrike().run()}>
          <Svg d={I.strike} />
        </Btn>
        <Pop
          label="Text colour"
          on={!!s.color}
          icon={
            <span className="se-letter" style={{ ["--c" as string]: s.color || "currentColor" }}>
              A
            </span>
          }
        >
          {(close) => (
            <Swatches
              colors={COLORS}
              current={s.color}
              custom
              onPick={(col) => {
                c().setColor(col).run();
                close();
              }}
              onClear={() => {
                c().unsetColor().run();
                close();
              }}
            />
          )}
        </Pop>
        <Pop
          label="Highlight"
          on={!!s.highlight}
          icon={
            <span className="se-letter se-letter--mark" style={{ ["--c" as string]: s.highlight || "#fff1a8" }}>
              H
            </span>
          }
        >
          {(close) => (
            <Swatches
              colors={MARKS}
              current={s.highlight}
              onPick={(col) => {
                c().setHighlight({ color: col }).run();
                close();
              }}
              onClear={() => {
                c().unsetHighlight().run();
                close();
              }}
            />
          )}
        </Pop>
      </div>

      <div className="se-group">
        {(["left", "center", "right", "justify"] as const).map((a) => (
          <Btn key={a} label={`Align ${a}`} on={s.align === a} onClick={() => c().setTextAlign(a).run()}>
            <Svg d={I[a]} />
          </Btn>
        ))}
      </div>

      <div className="se-group">
        <Btn label="Bulleted list" on={s.bullet} onClick={() => c().toggleBulletList().run()}>
          <Svg d={I.bullet} />
        </Btn>
        <Btn label="Numbered list" on={s.ordered} onClick={() => c().toggleOrderedList().run()}>
          <Svg d={I.ordered} />
        </Btn>
        <Btn label="Quote" on={s.quote} onClick={() => c().toggleBlockquote().run()}>
          <Svg d={I.quote} />
        </Btn>
        <Btn label="Divider" onClick={() => c().setHorizontalRule().run()}>
          <Svg d={I.rule} />
        </Btn>
        <Btn label="Line break inside a verse (Shift+Enter)" onClick={() => c().setHardBreak().run()}>
          <Svg d={I.break} />
        </Btn>
      </div>

      <div className="se-group">
        <Pop label="Link" on={s.link} icon={<Svg d={I.link} />} wide>
          {(close) => (
            <div className="se-link">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLink(url || s.href, close);
                  setUrl("");
                }}
              >
                <label>
                  <span>Web address</span>
                  <input autoFocus placeholder={s.href || "https://"} value={url} onChange={(e) => setUrl(e.target.value)} />
                </label>
                <div className="se-link-row">
                  {s.link && (
                    <button type="button" className="st-btn st-btn--quiet" onClick={() => setLink("", close)}>
                      Remove link
                    </button>
                  )}
                  <button className="st-btn">Link</button>
                </div>
              </form>
              <div className="se-link-posts">
                <label>
                  <span>Or link to a post</span>
                  <input placeholder="Search your posts" value={find} onChange={(e) => setFind(e.target.value)} />
                </label>
                <ul>
                  {found.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => linkPost(p, close)}>
                        <b>{p.title || "Untitled"}</b>
                        <small>{p.status === "draft" ? "Draft" : p.type}</small>
                      </button>
                    </li>
                  ))}
                  {!found.length && <li className="se-muted">No posts match.</li>}
                </ul>
              </div>
            </div>
          )}
        </Pop>
        <Pop label="Photo" icon={<Svg d={I.image} />} wide>
          {(close) => (
            <div className="se-link">
              <button
                type="button"
                className="st-btn st-btn--wide"
                onClick={() => {
                  file.current?.click();
                  close();
                }}
              >
                Upload a photo
              </button>
              <p className="se-muted">Or drop or paste a photo straight into the text.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (imgUrl.trim()) onImage(imgUrl.trim());
                  setImgUrl("");
                  close();
                }}
              >
                <label>
                  <span>Photo from a link</span>
                  <input placeholder="https://…/photo.jpg" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
                </label>
                <div className="se-link-row">
                  <button className="st-btn st-btn--ghost">Insert</button>
                </div>
              </form>
            </div>
          )}
        </Pop>
        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onImage(f);
          }}
        />
        <Btn label="Clear formatting" onClick={() => c().unsetAllMarks().clearNodes().run()}>
          <Svg d={I.clear} />
        </Btn>
      </div>
    </div>
  );
}
