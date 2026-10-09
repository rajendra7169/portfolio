"use client";

import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useDust } from "@/components/home/dust/DustProvider";

export default function Lab() {
  const { engine } = useDust();
  const [t, setT] = useState(-1);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    if (!engine) return;
    // Portrait intro once the shape exists, then measure the frame cost.
    engine.whenReady(0).then(() => gsap.to(engine.state, { t: 0, duration: 1.8, ease: "power2.out", onUpdate: () => setT(engine.state.t) }));
    const id = setInterval(() => {
      const c = document.createElement("canvas");
      c.width = innerWidth;
      c.height = innerHeight;
      const ctx = c.getContext("2d")!;
      const t0 = performance.now();
      engine.draw(ctx);
      setMs(performance.now() - t0);
    }, 1500);
    return () => clearInterval(id);
  }, [engine]);

  const go = (to: number) => {
    if (!engine) return;
    gsap.to(engine.state, { t: to, duration: 2.2, ease: "none", onUpdate: () => setT(engine.state.t) });
  };

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: 24, fontFamily: "monospace" }}>
      <div style={{ position: "fixed", left: 24, bottom: 24, display: "grid", gap: 8, background: "#fff", padding: 12, borderRadius: 8 }}>
        <label>
          t = {t.toFixed(2)}
          <input
            type="range"
            min={-1}
            max={11}
            step={0.01}
            value={t}
            onChange={(e) => {
              const v = Number(e.target.value);
              setT(v);
              if (engine) engine.state.t = v;
            }}
            style={{ width: 360, display: "block" }}
          />
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => (
            <button key={k} onClick={() => go(k)} style={{ padding: "4px 8px" }}>
              {k}
            </button>
          ))}
        </div>
        <small>
          N={engine?.N ?? "-"} · draw {ms.toFixed(2)}ms · ready: {[-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((k) => engine?.has(k)).join(",")}
        </small>
      </div>
    </div>
  );
}
