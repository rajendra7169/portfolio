"use client";

import { useState } from "react";

// The confidence gate's rules (JARVIS_SPEC.md): act at ≥ 0.85, offer choices from
// 0.55, escalate below; HIGH-risk actions always ask, whatever the confidence.
const RISKS = [
  { id: "NONE", say: "what time is it", skill: "query.time", act: "It's a quarter to ten, sir.", offer: "The time here, or in another city?" },
  { id: "LOW", say: "turn the volume down", skill: "system.volume_down", act: "Volume down, sir.", offer: "A little quieter, or mute it?" },
  { id: "MEDIUM", say: "close all the windows", skill: "window.close_all", act: "All windows closed, sir.", offer: "Every window, or just this app?" },
  { id: "HIGH", say: "shut down the laptop", skill: "system.shutdown", act: "That can't be undone. Shut down now, sir?", offer: "Shut down, or just suspend?" },
] as const;

// A point on the gauge's half circle, for a confidence 0–1.
const at = (c: number, r = 80) => [100 - r * Math.cos(Math.PI * c), 100 - r * Math.sin(Math.PI * c)].map((v) => v.toFixed(2)).join(" ");
const arc = (a: number, b: number) => `M ${at(a)} A 80 80 0 0 1 ${at(b)}`;

export default function JvGate() {
  const [risk, setRisk] = useState(1);
  const [conf, setConf] = useState(0.92);
  const r = RISKS[risk];
  const mode = conf < 0.55 ? "escalate" : conf < 0.85 ? "offer" : r.id === "HIGH" ? "ask" : "act";
  const verdict = {
    escalate: { title: "Escalates", word: "Escalate", to: "The LLM takes a closer look", text: "Not sure enough to guess, so the LLM takes a closer look first." },
    offer: { title: "Offers choices", word: "Offer", to: "You: two choices", text: `“${r.offer}”` },
    ask: { title: "Asks first", word: "Ask", to: "You: a spoken yes", text: `“${r.act}”` },
    act: { title: "Acts", word: "Act", to: r.skill, text: `“${r.act}”` },
  }[mode];

  return (
    <div className="jv-gate">
      <div className="jv-gate-ctrl">
        <div className="jv-gate-row">
          <span className="jv-gate-label">You say</span>
          <div className="jv-gate-risks" role="radiogroup" aria-label="Command risk">
            {RISKS.map((x, i) => (
              <button key={x.id} type="button" role="radio" aria-checked={i === risk} className="jv-gate-risk" data-risk={x.id} onClick={() => setRisk(i)}>
                <b>{x.id}</b>
                <span>“{x.say}”</span>
              </button>
            ))}
          </div>
        </div>

        <div className="jv-gate-row">
          <label className="jv-gate-label" htmlFor="jv-conf">
            Confidence <b>{conf.toFixed(2)}</b>
          </label>
          <div className="jv-gate-meter">
            <span className="jv-gate-zones" aria-hidden="true">
              <i>escalate</i>
              <i>offer</i>
              <i>act</i>
            </span>
            <input id="jv-conf" type="range" min={0} max={1} step={0.01} value={conf} onChange={(e) => setConf(Number(e.target.value))} />
          </div>
        </div>

        <output className={`jv-gate-out jv-gate-out--${mode}`} htmlFor="jv-conf" aria-live="polite">
          <b>{verdict.title}</b>
          <span>{verdict.text}</span>
        </output>
        <p className="jv-gate-fine">One question at a time. No answer in 15 seconds cancels it: silence is never consent.</p>
      </div>

      {/* What the HUD shows for it: the verdict, the needle, and where the command goes. */}
      <div className={`jv-gate-view is-${mode}`} aria-hidden="true">
        <div className="jv-gv-core">
          <i />
          <i />
          <i />
          <b key={mode}>{verdict.word}</b>
        </div>
        <svg className="jv-gv-gauge" viewBox="0 0 200 112">
          <path d={arc(0, 0.545)} className="jv-gv-z jv-gv-z--esc" />
          <path d={arc(0.555, 0.845)} className="jv-gv-z jv-gv-z--off" />
          <path d={arc(0.855, 1)} className="jv-gv-z jv-gv-z--act" />
          <line x1="100" y1="100" x2="100" y2="30" className="jv-gv-needle" style={{ transform: `rotate(${-90 + conf * 180}deg)` }} />
          <circle cx="100" cy="100" r="5" className="jv-gv-hub" />
          <text x="100" y="86" className="jv-gv-num">
            {conf.toFixed(2)}
          </text>
        </svg>
        <ol className="jv-gv-path">
          <li>You</li>
          <li>Router</li>
          <li>Gate</li>
          <li className="is-to">{verdict.to}</li>
        </ol>
        <p className="jv-gv-say" key={`${mode}-${risk}`}>
          {verdict.text}
        </p>
      </div>
    </div>
  );
}
