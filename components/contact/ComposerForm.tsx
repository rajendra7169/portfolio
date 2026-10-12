"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Floaties } from "@/components/Floaties";
import { useLenis } from "@/components/SmoothScroll";
import Inbox, { subjectOf, type Arrival } from "./Inbox";

const MAX = 1200;
const COLORS = ["#001c55", "#2f7fc1", "#7cc8f0", "#f26b38", "#a6dff7"];

type Point = { x: number; y: number };
const cubic = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};
const centre = (el: Element): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export default function ComposerForm({ email, topics }: { email: string; topics: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  // The phone on the left: what you're writing, what has landed, and its buzz.
  const [typing, setTyping] = useState(false);
  const [arrived, setArrived] = useState<Arrival[]>([]);
  const [notify, setNotify] = useState<Arrival | null>(null);
  const [buzz, setBuzz] = useState(0);
  const typed = useRef(0);
  const { contextSafe } = useGSAP({ scope: root });
  const lenis = useLenis();
  useEffect(() => () => clearTimeout(typed.current), []);
  const keyed = () => {
    setTyping(true);
    clearTimeout(typed.current);
    typed.current = window.setTimeout(() => setTyping(false), 1200);
  };

  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  // It lands: a notification, a buzz, and the message at the top of the inbox.
  const land = () => {
    const m = { id: Date.now(), from: name.trim() || "You", subject: subjectOf(picked), text: message.trim() };
    setArrived((a) => [...a, m]);
    setNotify(m);
    setBuzz((b) => b + 1);
    window.setTimeout(() => setNotify((n) => (n?.id === m.id ? null : n)), 3200);
  };

  const mailto = () => {
    const subject = `${subjectOf(picked)}${name.trim() ? ` — from ${name.trim()}` : ""}`;
    const body = `${message.trim()}${name.trim() ? `\n\n— ${name.trim()}` : ""}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const open = (href: string) => {
    setSending(false);
    setStatus(`Your email app should open with the message ready to send. If it doesn't, write to ${email}.`);
    window.location.href = href;
  };

  // Fold the message into a paper plane and fly it into the phone's inbox.
  const fly = contextSafe((href: string) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const area = q("textarea")[0];
    const send = q(".cm-send")[0];
    const letter = q(".cm-letter")[0];
    const plane = q(".cm-plane")[0];
    const svg = q(".cm-flight svg")[0];
    const trail = q(".cm-trail")[0];
    const target = q(".cm-target")[0];
    const check = q(".cm-check")[0];
    const scene = q(".ib")[0];
    const box = area.getBoundingClientRect();
    // From the send button (kept on screen) to the top of the inbox.
    const s0 = centre(send);
    const p0 = { x: s0.x, y: Math.min(window.innerHeight - 40, Math.max(40, s0.y)) };
    const p3 = target ? centre(target) : { x: -80, y: -80 };
    const side = p3.x < p0.x - 120; // the phone beside the form, or above it on a phone
    const p1 = side ? { x: p0.x + 40, y: p0.y - 360 } : { x: p0.x + 160, y: p0.y - 120 };
    const p2 = side ? { x: p3.x + 300, y: p3.y - 300 } : { x: p3.x + 190, y: p3.y + 60 };

    svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    trail.setAttribute("d", `M${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`);
    const flight = { p: 0 };

    gsap
      .timeline({ defaults: { ease: "power2.inOut" }, onComplete: () => open(href) })
      .set(q(".cm-flight"), { autoAlpha: 1 })
      .set(letter, { x: box.left, y: box.top, width: box.width, height: box.height, autoAlpha: 1, scale: 1, rotation: 0, transformOrigin: "50% 50%" })
      .set(trail, { drawSVG: "0% 0%", autoAlpha: 1 })
      .to(area, { autoAlpha: 0.15, duration: 0.2 })
      // Fold flat, then whisk down to the send button.
      .to(letter, { scaleY: 0.1, duration: 0.3, ease: "power2.in" })
      .to(letter, { x: p0.x - box.width / 2, y: p0.y - box.height / 2, scale: 0.08, rotation: -25, duration: 0.35, ease: "power2.in" })
      .set(letter, { autoAlpha: 0 })
      .fromTo(plane, { x: p0.x, y: p0.y, scale: 0, rotation: -30, autoAlpha: 1 }, { scale: 1, duration: 0.25, ease: "back.out(3)" })
      // The flight: position and heading follow the curve; the trail draws behind.
      .to(flight, {
        p: 1,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate() {
          const t = flight.p;
          const a = cubic(p0, p1, p2, p3, t);
          const b = cubic(p0, p1, p2, p3, Math.min(1, t + 0.01));
          gsap.set(plane, { x: a.x, y: a.y, rotation: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
          gsap.set(trail, { drawSVG: `0% ${t * 100}%` });
        },
      })
      // Into the phone: it dives into the slot at the top of the inbox.
      .to(plane, { scale: 0.2, autoAlpha: 0, duration: 0.22, ease: "power2.in" })
      // Touchdown: the phone buzzes, a notification drops, and paper flies off it.
      .add(() => {
        land();
        // The plane's wake sets the prayer flags flying.
        scene?.classList.add("is-gust");
        window.setTimeout(() => scene?.classList.remove("is-gust"), 1800);
        if (check) gsap.fromTo(check, { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.45)" });
        const bits = q(".cm-bits i");
        gsap.set(bits, { x: p3.x, y: p3.y, autoAlpha: 1, rotation: 0, scale: () => gsap.utils.random(0.6, 1.2) });
        gsap.to(bits, {
          duration: () => gsap.utils.random(0.9, 1.4),
          physics2D: { velocity: () => gsap.utils.random(200, 420), angle: () => gsap.utils.random(200, 340), gravity: 800 },
          rotation: () => gsap.utils.random(-360, 360),
          ease: "none",
        });
        gsap.to(bits, { autoAlpha: 0, duration: 0.4, delay: 0.8 });
      })
      .to(trail, { autoAlpha: 0, duration: 0.6 }, "+=0.3")
      .to(area, { autoAlpha: 1, duration: 0.3 }, "<")
      .set(q(".cm-flight"), { autoAlpha: 0 });
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    if (message.trim().length < 2) {
      setError("Write a message before sending.");
      root.current?.querySelector("textarea")?.focus();
      if (matchMedia(MOTION_OK).matches) gsap.fromTo(root.current!.querySelector(".cm-card"), { x: 0 }, { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.45, ease: "none" });
      return;
    }
    setError("");
    const href = mailto();
    // Exposed for the layout tests, which can't follow a mailto: link.
    root.current!.dataset.mailto = href;
    if (!matchMedia(MOTION_OK).matches) return (land(), open(href));
    setSending(true);
    setStatus("Sending…");
    // On a phone the inbox is above the form: bring it into view, then fly.
    const t = root.current!.querySelector(".cm-target")!.getBoundingClientRect();
    if (t.top < 70 || t.bottom > innerHeight - 20) {
      const y = window.scrollY + t.top - innerHeight * 0.3;
      if (lenis) lenis.scrollTo(y, { duration: 0.6, onComplete: () => fly(href) });
      else {
        window.scrollTo({ top: y, behavior: "smooth" });
        window.setTimeout(() => fly(href), 700);
      }
    } else fly(href);
  };

  return (
    <div className="cm-grid cm-form-wrap" ref={root}>
      <div className="cm-art" data-anim="left">
        <Floaties />
        <Inbox draft={{ name, topics: picked, message, typing }} arrived={arrived} notify={notify} buzz={buzz} />
      </div>
      {/* The reveal animates these inner boxes, never the wrapper: a transformed ancestor
          would turn the fixed flight overlay below into an absolutely positioned one. */}
      <div data-anim="right">
      <form className="cm-card" onSubmit={submit} noValidate>
        <fieldset className="cm-topics">
          <legend>What&apos;s it about?</legend>
          {topics.map((t) => (
            <button type="button" key={t} className="cm-topic" aria-pressed={picked.includes(t)} onClick={() => toggle(t)}>
              {t}
            </button>
          ))}
        </fieldset>

        <label className="cm-field">
          <span>Your name</span>
          <input
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              keyed();
            }}
            placeholder="Optional"
          />
        </label>

        <label className="cm-field">
          <span>Message</span>
          <textarea
            name="message"
            rows={5}
            maxLength={MAX}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              keyed();
              if (error) setError("");
            }}
            placeholder="Hi Rajendra, I'd like to talk about…"
            aria-invalid={Boolean(error)}
            aria-describedby="cm-error"
          />
        </label>

        <div className="cm-meter-row">
          <span className="cm-meter" aria-hidden="true">
            <span className="cm-meter-fill" style={{ transform: `scaleX(${Math.min(1, message.length / 280)})` }} />
          </span>
          <small className="cm-count">
            {message.length} / {MAX}
          </small>
        </div>

        <p className="cm-error" id="cm-error" role="alert">
          {error}
        </p>

        <button type="submit" className="btn cm-send" disabled={sending}>
          {sending ? "Transmitting…" : "Send transmission"} <span aria-hidden="true">✈</span>
        </button>
        <p className="cm-note">
          Opens your email app with the message ready to send to <b>{email}</b>.
        </p>
        <p className="sr-only" aria-live="polite">
          {status}
        </p>
        {status && !sending && <p className="cm-status">{status}</p>}
      </form>
      </div>

      {/* Flight overlay: the folded letter, the plane, its trail and the touchdown burst. */}
      <div className="cm-flight" aria-hidden="true">
        <svg>
          <path className="cm-trail" />
        </svg>
        <span className="cm-letter">
          <i />
          <i />
          <i />
        </span>
        <span className="cm-plane">
          <svg viewBox="0 0 48 48">
            <path d="M3 22 46 4 30 44 22 28Z" className="cm-plane-body" />
            <path d="M22 28 46 4M22 28l-3 12 8-7" className="cm-plane-fold" />
          </svg>
        </span>
        <span className="cm-bits">
          {Array.from({ length: 18 }, (_, i) => (
            <i key={i} style={{ background: COLORS[i % COLORS.length] }} />
          ))}
        </span>
      </div>
    </div>
  );
}
