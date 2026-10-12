"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";

// The HUD's pipeline ring, with the measured cost of each stage (docs/JARVIS_OVERVIEW.md).
const STAGES = [
  { id: "VOICE", ms: "" },
  { id: "MIC", ms: "echo −40 dB" },
  { id: "WAKE", ms: "~200 ms" },
  { id: "VAD", ms: "" },
  { id: "TURN", ms: "~65 ms" },
  { id: "WHO", ms: "~27 ms" },
  { id: "STT", ms: "~300 ms" },
  { id: "ROUTER", ms: "0.003 ms" },
  { id: "GATE", ms: "" },
  { id: "SKILL", ms: "~137 ms" },
];
const SAID = "turn the volume down and tell me the time";
const ktm = () => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit" }).format(new Date());

/** Ten stages around the core, lit in order as one command goes through them. */
export default function JvPipeline() {
  const root = useRef<HTMLDivElement>(null);

  // Builds the run each time, so the reply carries the current Kathmandu time.
  // A plain function, not contextSafe: the auto-run calls it from a matchMedia
  // context (through inContext), and mixing the two contexts recurses on revert.
  const run = () => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const state = q(".jv-state")[0];
    const you = q(".jv-you")[0];
    const reply = q(".jv-reply")[0];
    const stages = q(".jv-stage");
    const answer = `Done, sir. It's ${ktm()}.`;
    if (el.classList.contains("is-running")) return;

    const final = () => {
      stages.forEach((s) => s.classList.add("is-done"));
      you.textContent = SAID;
      reply.textContent = answer;
      q(".jv-log > *").forEach((n) => n.classList.add("is-on"));
      state.textContent = "IDLE";
    };
    if (!matchMedia(MOTION_OK).matches) return final();

    el.classList.add("is-running");
    stages.forEach((s) => s.classList.remove("is-on", "is-done"));
    q(".jv-log > *").forEach((n) => n.classList.remove("is-on"));
    you.textContent = "";
    reply.textContent = "";
    const lit = (i: number) => () => {
      stages.forEach((s, j) => {
        s.classList.toggle("is-on", j === i);
        s.classList.toggle("is-done", j < i);
      });
    };
    const say = (node: HTMLElement, text: string, per: number) => {
      const o = { n: 0 };
      return gsap.to(o, { n: text.length, duration: text.length * per, ease: "none", onUpdate: () => void (node.textContent = text.slice(0, Math.round(o.n))) });
    };
    const log = (sel: string) => () => q(sel)[0].classList.add("is-on");
    const set = (s: string) => () => void (state.textContent = s);

    gsap
      .timeline({ onComplete: () => el.classList.remove("is-running") })
      .add(set("LISTENING"))
      .add(lit(0))
      .add(lit(1), 0.3)
      .add(lit(2), 0.7)
      .add(log(".jv-log-wake"), 0.75)
      .add(set("YES SIR"), 0.75)
      .add(log(".jv-log-you"), 1.4)
      .add(set("HEARING"), 1.4)
      .add(say(you, SAID, 0.04), 1.4)
      .add(lit(3), 1.6)
      .add(lit(4), "+=0.1")
      .add(lit(5), "+=0.35")
      .add(log(".jv-log-who"))
      .add(lit(6), "+=0.35")
      .add(set("THINKING"))
      .add(lit(7), "+=0.45")
      .add(log(".jv-log-route"))
      .add(lit(8), "+=0.45")
      .add(log(".jv-log-gate"))
      .add(lit(9), "+=0.45")
      .add(set("SPEAKING"))
      .add(log(".jv-log-reply"))
      .add(say(reply, answer, 0.05))
      .add(() => stages.forEach((s) => s.classList.replace("is-on", "is-done")), "+=0.8")
      .add(set("IDLE"), "+=1.2");
  };

  // Runs once on its own when it first comes into view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) => {
        ScrollTrigger.create({ trigger: root.current, start: "top 65%", once: true, onEnter: inContext(ctx, () => run()) });
      });
    },
    { scope: root },
  );

  return (
    <div className="jv-demo" ref={root}>
      <div className="jv-ring-wrap">
        <svg className="jv-ring" viewBox="0 0 400 400" aria-hidden="true">
          <g className="jv-spin">
            <circle cx="200" cy="200" r="186" className="jv-r1" />
          </g>
          <circle cx="200" cy="200" r="150" className="jv-r2" />
          <circle cx="200" cy="200" r="96" className="jv-r3" />
        </svg>
        <ol className="jv-stages" aria-label="Pipeline stages">
          {STAGES.map((s, i) => {
            const a = (i / STAGES.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <li
                key={s.id}
                className="jv-stage"
                style={{ left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 37.5}%` }}
              >
                <i aria-hidden="true" />
                <b>{s.id}</b>
                {s.ms && <small>{s.ms}</small>}
              </li>
            );
          })}
        </ol>
        <button type="button" className="jv-core" onClick={run} aria-label="Run the pipeline: say hey Jarvis">
          <span className="jv-state" aria-live="polite">
            IDLE
          </span>
          <small>Press to talk</small>
        </button>
      </div>

      <div className="jv-console">
        <p className="jv-console-head">
          <span>EVENT BUS</span>
          <button type="button" className="jv-say" onClick={run}>
            Say “hey Jarvis” ↺
          </button>
        </p>
        <div className="jv-log">
          <p className="jv-log-wake">
            <i>WAKE</i> hey jarvis · 0.93 → <b>“Yes sir.”</b>
          </p>
          <p className="jv-log-you">
            <i>YOU</i> <span className="jv-you">{SAID}</span>
          </p>
          <p className="jv-log-who">
            <i>WHO</i> voiceprint matches · owner
          </p>
          <p className="jv-log-route">
            <i>ROUTER</i> tier 1 · <code>system.volume_down</code> + <code>query.time</code>
          </p>
          <p className="jv-log-gate">
            <i>GATE</i> confidence 0.97 · risk LOW → act
          </p>
          <p className="jv-log-reply">
            <i>JARVIS</i> <span className="jv-reply">Done, sir.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
