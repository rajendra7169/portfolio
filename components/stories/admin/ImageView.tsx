"use client";

// A photo inside the editor: drag it to move it, pull its edge to resize it, pick
// where it sits (left or right with text wrapping round it, centred, wide, or
// full bleed) and give it a caption, all in place.
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { clampWidth, IMAGE_ALIGNS, StoryImage, type ImageAlign } from "@/lib/stories/extensions";

const ALIGN_LABEL: Record<ImageAlign, string> = { left: "Left, text wraps", center: "Centre", right: "Right, text wraps", wide: "Wide", full: "Full bleed" };
const WIDTHS = [25, 33, 50, 66, 100];

function AlignIcon({ a }: { a: ImageAlign }) {
  // A page: lines of text, and the photo where it would sit.
  const photo = { left: [3, 5, 8, 7], center: [7, 5, 10, 7], right: [13, 5, 8, 7], wide: [2, 5, 20, 7], full: [0, 5, 24, 7] }[a];
  const lines = a === "left" ? [[13, 6], [13, 9], [13, 11]] : a === "right" ? [[3, 6], [3, 9], [3, 11]] : [];
  return (
    <svg viewBox="0 0 24 18" aria-hidden="true">
      <rect x={photo[0]} y={photo[1]} width={photo[2]} height={photo[3]} rx="1" fill="currentColor" />
      {lines.map(([x, y]) => (
        <rect key={y} x={x} y={y} width="8" height="1.4" rx=".7" fill="currentColor" opacity=".45" />
      ))}
      <rect x="3" y="1.5" width="18" height="1.4" rx=".7" fill="currentColor" opacity=".45" />
      <rect x="3" y="14.5" width="18" height="1.4" rx=".7" fill="currentColor" opacity=".45" />
    </svg>
  );
}

function ImageView({ node, updateAttributes, deleteNode, selected, editor }: ReactNodeViewProps) {
  const { src, alt, caption } = node.attrs as { src: string; alt: string; caption: string };
  const align = (IMAGE_ALIGNS.includes(node.attrs.align) ? node.attrs.align : "center") as ImageAlign;
  const width = clampWidth(node.attrs.width);
  const sized = align !== "wide" && align !== "full";
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<number | null>(null);
  const [altOpen, setAltOpen] = useState(false);

  // Pull an edge: the photo follows the pointer (a centred one grows from both
  // sides), and the new width is saved when it's let go.
  const resize = (e: RPointerEvent<HTMLSpanElement>, side: "start" | "end") => {
    e.preventDefault();
    e.stopPropagation();
    const fig = box.current!.closest<HTMLElement>(".st-fig")!;
    const column = editor.view.dom.getBoundingClientRect().width;
    const startX = e.clientX;
    const startW = fig.getBoundingClientRect().width;
    const k = (side === "end" ? 1 : -1) * (align === "center" ? 2 : 1);
    let w = width;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      w = clampWidth(((startW + (ev.clientX - startX) * k) / column) * 100);
      setLive(w);
      fig.style.setProperty("--fig-w", `${w}%`);
      fig.style.setProperty("--fig-n", String(w / 100));
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      setLive(null);
      updateAttributes({ width: w });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  return (
    <NodeViewWrapper className={`se-fig${selected ? " is-selected" : ""}`} ref={box}>
      {selected && (
        <div className="se-fig-bar" contentEditable={false} role="toolbar" aria-label="Photo">
          {IMAGE_ALIGNS.map((a) => (
            <button
              key={a}
              type="button"
              className={a === align ? "is-on" : undefined}
              aria-pressed={a === align}
              title={ALIGN_LABEL[a]}
              aria-label={ALIGN_LABEL[a]}
              onClick={() => updateAttributes({ align: a, width: a === "left" || a === "right" ? Math.min(width, 50) : a === "center" ? width : 100 })}
            >
              <AlignIcon a={a} />
            </button>
          ))}
          {sized && (
            <>
              <span className="se-fig-sep" />
              {WIDTHS.map((w) => (
                <button key={w} type="button" className={w === width ? "is-on" : undefined} aria-pressed={w === width} onClick={() => updateAttributes({ width: w })} title={`${w}% of the column`}>
                  {w === 33 ? "⅓" : w === 66 ? "⅔" : w === 25 ? "¼" : w === 50 ? "½" : "1"}
                </button>
              ))}
            </>
          )}
          <span className="se-fig-sep" />
          <button type="button" className={altOpen ? "is-on" : undefined} onClick={() => setAltOpen((v) => !v)} title="Describe the photo for screen readers">
            Alt
          </button>
          <button type="button" onClick={() => deleteNode()} title="Remove the photo" aria-label="Remove the photo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
      <div className="se-fig-img">
        {/* eslint-disable-next-line @next/next/no-img-element -- writers' own photos, any host */}
        <img src={src} alt={alt} draggable={false} data-drag-handle />
        {sized && selected && (
          <>
            <span className="se-fig-handle se-fig-handle--start" onPointerDown={(e) => resize(e, "start")} aria-hidden="true" />
            <span className="se-fig-handle se-fig-handle--end" onPointerDown={(e) => resize(e, "end")} aria-hidden="true" />
          </>
        )}
        {live !== null && <span className="se-fig-size">{live}%</span>}
      </div>
      {altOpen && selected && (
        <input className="se-fig-alt" value={alt} onChange={(e) => updateAttributes({ alt: e.target.value })} placeholder="What's in the photo? (for screen readers)" aria-label="Alt text" />
      )}
      <input
        className="se-fig-caption"
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder={selected ? "Add a caption (optional)" : ""}
        aria-label="Caption"
      />
    </NodeViewWrapper>
  );
}

/** The image block with the editing view above (the document stays the same). */
export const EditorImage = StoryImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView, {
      as: "figure",
      className: "st-fig",
      attrs: ({ node }) => {
        const a = IMAGE_ALIGNS.includes(node.attrs.align) ? node.attrs.align : "center";
        const w = a === "wide" || a === "full" ? 100 : clampWidth(node.attrs.width);
        return { "data-align": a, style: `--fig-w:${w}%;--fig-n:${w / 100}` };
      },
    });
  },
});
