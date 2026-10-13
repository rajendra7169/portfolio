// The document schema every post is written in: the editor uses it to write,
// the public pages to render (generateHTML), so the two always agree. The image
// is a block of our own, a figure that can sit left, centre, right, wide or full
// bleed at any width, with a caption.
import { mergeAttributes, Node, generateHTML, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

export type ImageAlign = "left" | "center" | "right" | "wide" | "full";
export const IMAGE_ALIGNS: ImageAlign[] = ["left", "center", "right", "wide", "full"];

/** Only real image sources: http(s), our own paths, data and blob images. */
export const safeSrc = (src: unknown) =>
  typeof src === "string" && /^(https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|webp|gif|avif);|blob:)/i.test(src) ? src : "";
export const clampWidth = (w: unknown) => Math.max(15, Math.min(100, Math.round(Number(w) || 100)));

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    storyImage: {
      setStoryImage: (attrs: { src: string; alt?: string; caption?: string; align?: ImageAlign; width?: number }) => ReturnType;
    };
  }
}

export const StoryImage = Node.create({
  name: "storyImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
      align: { default: "center" },
      width: { default: 100 },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure[data-story-image]",
        getAttrs: (el) => ({
          src: el.querySelector("img")?.getAttribute("src") ?? null,
          alt: el.querySelector("img")?.getAttribute("alt") ?? "",
          caption: el.querySelector("figcaption")?.textContent ?? "",
          align: el.getAttribute("data-align") ?? "center",
          width: Number(el.getAttribute("data-width")) || 100,
        }),
      },
      { tag: "img[src]", getAttrs: (el) => ({ src: el.getAttribute("src"), alt: el.getAttribute("alt") ?? "" }) },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, caption, align, width } = node.attrs as { src: string; alt: string; caption: string; align: ImageAlign; width: number };
    const a = IMAGE_ALIGNS.includes(align) ? align : "center";
    const w = a === "full" || a === "wide" ? 100 : clampWidth(width);
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-story-image": "", "data-align": a, "data-width": String(w), class: `st-fig st-fig--${a}`, style: `--fig-w:${w}%;--fig-n:${w / 100}` }),
      ["img", { src: safeSrc(src), alt: alt || caption || "", loading: "lazy", decoding: "async" }],
      ...(caption ? [["figcaption", {}, String(caption)]] : []),
    ] as never;
  },
  addCommands() {
    return {
      setStoryImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { align: "center", width: 100, ...attrs } }),
    };
  },
});

/** The schema: shared by the editor (which swaps in its own image view) and the reader. */
export const storyExtensions = (image: typeof StoryImage = StoryImage) => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer" },
      isAllowedUri: (url, ctx) => /^(https?:|mailto:|\/(?!\/)|#)/i.test(url) && ctx.defaultValidate(url),
    },
  }),
  TextStyleKit.configure({ backgroundColor: false }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  image,
];

// Anything an author types reaches other readers, so styles and links are
// checked again here, whatever wrote the document.
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|var\(--[a-z0-9-]+\))$/i;
const SIZE = /^\d{1,3}(\.\d+)?(px|rem|em|%)$/;
const FAMILY = /^[\w\s,'"-]{1,80}$/;
const HEIGHT = /^\d(\.\d+)?$/;
export function cleanDoc(doc: JSONContent): JSONContent {
  const fix = (n: JSONContent): JSONContent => {
    const out: JSONContent = { ...n };
    if (n.marks)
      out.marks = n.marks
        .map((m) => {
          if (m.type === "textStyle") {
            const a = { ...(m.attrs ?? {}) };
            if (a.color && !COLOR.test(a.color)) a.color = null;
            if (a.fontSize && !SIZE.test(a.fontSize)) a.fontSize = null;
            if (a.fontFamily && !FAMILY.test(a.fontFamily)) a.fontFamily = null;
            if (a.lineHeight && !HEIGHT.test(String(a.lineHeight))) a.lineHeight = null;
            return { ...m, attrs: a };
          }
          if (m.type === "highlight" && m.attrs?.color && !COLOR.test(m.attrs.color)) return { ...m, attrs: { color: null } };
          if (m.type === "link" && !/^(https?:|mailto:|\/(?!\/)|#)/i.test(String(m.attrs?.href ?? ""))) return null;
          return m;
        })
        .filter(Boolean) as JSONContent["marks"];
    if (n.type === "storyImage") out.attrs = { ...n.attrs, src: safeSrc(n.attrs?.src) };
    if (n.content) out.content = n.content.map(fix);
    return out;
  };
  return fix(doc);
}

/** A post's body as HTML, for the reader (browser only). */
export function renderDoc(doc: JSONContent): string {
  try {
    return generateHTML(cleanDoc(doc?.type ? doc : { type: "doc", content: [] }), storyExtensions());
  } catch {
    return "";
  }
}
