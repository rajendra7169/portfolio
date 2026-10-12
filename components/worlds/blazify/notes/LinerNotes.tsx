"use client";

// The liner notes as a jukebox: eight tracks down the back of the sleeve, and the
// one that's on plays its own small piece of the app. While nobody touches it,
// it plays through the tracks by itself; a tap anywhere hands it over.

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { loadLook, paint, unpaint } from "./paint";
import { AutoEq, Colours, Import, Lyrics, NoStrings, Offline, Search, Together, type ToyIcons } from "./toys";
import "./notes.css";

const TOYS = [Search, Offline, Lyrics, AutoEq, Colours, Together, Import, NoStrings];
const HINTS = ["Type anything", "Switch off the signal", "Tap a line", "Pick your headphones", "Repaint the page", "Let them in", "Import, then share", "Cut the strings"];
const RUN = 11; // seconds a track plays by itself
const two = (n: number) => String(n).padStart(2, "0");

export default function LinerNotes({ notes, icons }: { notes: { title: string; text: string }[]; icons: ToyIcons }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const [hold, setHold] = useState(false);
  const n = Math.min(notes.length, TOYS.length);

  // The colour someone picked last time is on from the start, and leaves with the page.
  useEffect(() => {
    const w = root.current!.closest<HTMLElement>(".w-bz")!;
    paint(w, loadLook());
    return () => unpaint(w);
  }, []);
  // It plays by itself only on screen, and not at all for reduced motion.
  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting && !still), { threshold: 0.3 });
    io.observe(root.current!);
    if (still) requestAnimationFrame(() => setAuto(false));
    return () => io.disconnect();
  }, []);
  // On a phone the tracks are a strip: keep the one that's on in view.
  useEffect(() => {
    const s = list.current;
    const b = s?.children[cur] as HTMLElement | undefined;
    if (s && b && s.scrollWidth > s.clientWidth + 2) s.scrollTo({ left: b.offsetLeft - (s.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
  }, [cur]);

  const go = (i: number, mine = true) => {
    setCur((i + n) % n);
    if (mine) setAuto(false);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    const to = step ? (cur + step + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    go(to);
    (list.current?.querySelectorAll<HTMLButtonElement>(".ln-track")[to])?.focus();
  };
  const Toy = TOYS[cur];
  const playing = auto && seen && !hold;

  return (
    <div ref={root} className={`ln${auto ? " is-auto" : ""}`}>
      <ol ref={list} className="ln-list" role="tablist" aria-label="Liner notes">
        {notes.slice(0, n).map((x, i) => (
          <li key={x.title}>
            <button type="button" role="tab" id={`ln-tab-${i}`} aria-selected={i === cur} aria-controls="ln-stage" tabIndex={i === cur ? 0 : -1} className="ln-track" onClick={() => go(i)} onKeyDown={onKey}>
              <span className="ln-no" aria-hidden="true">
                {two(i + 1)}
              </span>
              <span className="ln-eqbars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>{x.title}</b>
              <small>{HINTS[i]}</small>
              {i === cur && auto && (
                <span className="ln-run" aria-hidden="true">
                  <i style={{ animationDuration: `${RUN}s`, animationPlayState: playing ? "running" : "paused" }} onAnimationEnd={() => go(cur + 1, false)} />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div
        id="ln-stage"
        className="ln-stage"
        role="tabpanel"
        aria-labelledby={`ln-tab-${cur}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
        onPointerLeave={() => setHold(false)}
        onPointerDown={() => setAuto(false)}
        onKeyDown={() => setAuto(false)}
      >
        <header className="ln-head" key={`h${cur}`}>
          <span className="ln-head-no">Track {two(cur + 1)}</span>
          <h3>{notes[cur].title}</h3>
          <p>{notes[cur].text}</p>
        </header>
        <div className="ln-toy" key={`t${cur}`}>
          {/* A track demonstrates itself only while it's on screen: the colours one repaints the whole page. */}
          <Toy demo={auto && seen} icons={icons} />
        </div>
        <nav className="ln-nav" aria-label="Tracks">
          <button type="button" className="ln-iconbtn" onClick={() => go(cur - 1)} aria-label="Previous track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6v12l-8.5-6L18 6ZM8 6v12H6V6h2Z" />
            </svg>
          </button>
          <span>
            {two(cur + 1)} / {two(n)}
            {auto ? <small>{playing ? " · playing by itself" : " · paused"}</small> : null}
          </span>
          <button type="button" className="ln-iconbtn" onClick={() => go(cur + 1)} aria-label="Next track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6v12l8.5-6L6 6Zm9.5 0v12h2V6h-2Z" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
