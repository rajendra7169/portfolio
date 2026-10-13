"use client";

// The washing machine in "Also on GitHub" (Laundry.tsx). Each stage of the app's
// order is a part of a wash: clothes drop into the drum (order), the door opens
// for them (pickup), water rises, bubbles and a slow tumble (wash and fold), a
// fast spin that shakes the machine while a rider crosses the display (out for
// delivery), and the drum winding down as the receipt prints (delivered).
// It runs once by itself when the machine scrolls into view; Start runs it
// again, the dial and the lights pick a stage. Scrolling past gives the drum a
// push. With reduced motion the controls just change the display and the notes.
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext, pauseOffscreen } from "@/lib/gsap";

const EMPTY = 222; // water level (the wave's top, in the drum's 200-unit box): below the glass
const LEVEL = [EMPTY, EMPTY, 104, 150, EMPTY]; // per stage
const SPEED = [0.12, 0, 1, 7, 0]; // drum turns per 4 seconds, per stage
const STAY = [1.7, 1.9, 3, 3, 0]; // seconds on each stage when the cycle runs by itself
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+0123456789";

export default function LaundryMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const leds = q(".lw-leds button");
      const notes = q(".lw-note");
      const lcd = q(".lw-lcd-text")[0];
      const knob = q(".lw-dial-knob")[0];
      const startLabel = q(".lw-start-label")[0];
      const count = leds.length;
      let step = 0;

      // What every mode shares: the lights, the notes and the dial's pointer.
      const mark = (i: number) => {
        step = i;
        el.dataset.step = String(i);
        leds.forEach((b, n) => {
          b.classList.toggle("is-on", n === i);
          b.classList.toggle("is-past", n < i);
          b.setAttribute("aria-pressed", String(n === i));
        });
        notes.forEach((n, k) => n.classList.toggle("is-on", k === i));
      };

      const mm = gsap.matchMedia();
      const listen = (go: (i: number) => void, run: () => void) => {
        const onLed = (e: Event) => go(Number((e.currentTarget as HTMLElement).dataset.step));
        const onDial = () => go((step + 1) % count);
        leds.forEach((b) => b.addEventListener("click", onLed));
        q(".lw-dial")[0].addEventListener("click", onDial);
        q(".lw-start")[0].addEventListener("click", run);
        return () => {
          leds.forEach((b) => b.removeEventListener("click", onLed));
          q(".lw-dial")[0]?.removeEventListener("click", onDial);
          q(".lw-start")[0]?.removeEventListener("click", run);
        };
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const go = (i: number) => {
          mark(i);
          lcd.textContent = leds[i].dataset.lcd ?? "";
          gsap.set(knob, { rotation: -120 + i * 60 });
        };
        go(0);
        return listen(go, () => go(count - 1));
      });

      mm.add(MOTION_OK, (ctx) => {
        const body = q(".lw-body")[0];
        const door = q(".lw-door-in")[0];
        const cloths = q(".lw-cloth");
        const bike = q(".lw-route-bike")[0];
        const receipt = q(".lw-receipt")[0];
        gsap.set(knob, { rotation: -120 });
        gsap.set(receipt, { yPercent: -101 });
        gsap.set(q(".lw-level, .lw-level-back"), { y: EMPTY });
        gsap.set(cloths, { y: -190 });

        // Always moving underneath: the drum turning, the water's surface rolling.
        const drum = gsap.to(q(".lw-drum"), { rotation: 360, svgOrigin: "100 100", duration: 4, ease: "none", repeat: -1 });
        drum.timeScale(SPEED[0]);
        let base = SPEED[0];
        const waves = [
          gsap.to(q(".lw-wave"), { x: -100, duration: 2.2, ease: "none", repeat: -1 }),
          gsap.to(q(".lw-wave--back"), { x: -100, duration: 3.4, ease: "none", repeat: -1 }),
        ];
        const bubbles = q(".lw-bubble").map((b, i) =>
          gsap.fromTo(
            b,
            { y: 0, autoAlpha: 0 },
            { keyframes: { y: [0, -60, -120], autoAlpha: [0, 0.9, 0] }, duration: 1.6 + (i % 4) * 0.35, delay: (i * 0.23) % 1.4, ease: "none", repeat: -1, paused: true },
          ),
        );
        let shake: gsap.core.Tween | null = null;
        let printed = false;
        let ride: gsap.core.Tween | null = null;
        // All of it rests while the machine is off screen.
        pauseOffscreen(el, () => [drum, ...waves, ...bubbles, shake, ride]);

        const speed = (to: number, duration = 1) => {
          base = to;
          gsap.to(drum, { timeScale: to, duration, ease: to > 0 ? "power2.in" : "power3.out", overwrite: true });
        };
        const level = (y: number, duration = 1.3) => gsap.to(q(".lw-level, .lw-level-back"), { y, duration, ease: "power2.inOut", stagger: 0.08, overwrite: true });
        const lcdSay = (text: string) => gsap.to(lcd, { scrambleText: { text, chars: GLYPHS, speed: 0.7 }, duration: 0.6, ease: "none", overwrite: true });
        const print = () => {
          if (printed) return;
          printed = true;
          gsap
            .timeline()
            .to(q(".lw-slot-hint"), { autoAlpha: 0, duration: 0.3 })
            .to(receipt, { yPercent: 0, duration: 2.1, ease: "steps(18)" })
            .fromTo(receipt, { rotation: 0 }, { keyframes: { rotation: [0, 1.6, -0.8, 0.4, 0] }, duration: 0.9, ease: "power1.out", transformOrigin: "50% 0" });
        };

        // One stage: everything the machine does to show it.
        const go = inContext(ctx, (i: number) => {
          mark(i);
          lcdSay(leds[i].dataset.lcd ?? "");
          gsap.to(knob, { rotation: -120 + i * 60, duration: 0.7, ease: "back.out(2.2)", overwrite: true });
          speed(SPEED[i], i === 3 ? 1.6 : i === 4 ? 2.2 : 1);
          level(LEVEL[i], i === 2 ? 1.6 : 1.2);
          bubbles.forEach((b) => (i === 2 ? b.play() : b.pause(0)));
          el.classList.toggle("is-route", i === 3);
          shake?.kill();
          gsap.to(body, { x: 0, rotation: 0, duration: 0.3, overwrite: true });
          ride?.kill();
          if (i === 0) gsap.fromTo(cloths, { y: -190 }, { y: 0, duration: 1, stagger: 0.14, ease: "bounce.out", overwrite: true });
          else gsap.to(cloths, { y: 0, duration: 0.4, overwrite: true });
          if (i === 1)
            gsap
              .timeline()
              .to(door, { rotationY: -62, duration: 0.7, ease: "power2.out", transformPerspective: 900, transformOrigin: "0% 50%" })
              .to(door, { rotationY: 0, duration: 0.6, ease: "bounce.out" }, "+=0.35");
          if (i === 3) {
            shake = gsap.fromTo(body, { x: -1.5, rotation: -0.4 }, { x: 1.5, rotation: 0.4, duration: 0.06, ease: "none", repeat: -1, yoyo: true, delay: 0.9 });
            ride = gsap.fromTo(bike, { "--p": 0 }, { "--p": 1, duration: STAY[3], ease: "power1.inOut" });
          }
          if (i === 4) {
            gsap.fromTo(q(".lw-ring"), { "--glow": 1 }, { "--glow": 0, duration: 1.8, ease: "power2.out" });
            gsap.delayedCall(0.6, print);
          }
        });

        // The whole cycle, start to finish.
        let cycle: gsap.core.Timeline | null = null;
        const run = inContext(ctx, () => {
          cycle?.kill();
          cycle = gsap.timeline({ onComplete: () => void (startLabel.textContent = "Run the wash cycle again") });
          let t = 0;
          for (let i = 0; i < count; i++) {
            cycle.add(() => go(i), t);
            t += STAY[i];
          }
          el.classList.add("is-running");
          cycle.add(() => el.classList.remove("is-running"), t + 0.5);
        });
        const pick = (i: number) => {
          cycle?.kill();
          el.classList.remove("is-running");
          go(i);
        };

        // It runs once by itself when the machine comes into view.
        ScrollTrigger.create({ trigger: q(".lw-machine")[0], start: "top 70%", once: true, onEnter: () => run() });
        // Scrolling past pushes the drum round; it settles back to the stage's own pace.
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = Math.min(Math.abs(self.getVelocity()) / 1600, 1);
            if (v < 0.08) return;
            gsap.to(drum, {
              timeScale: base + v * 4 * (self.direction || 1),
              duration: 0.25,
              overwrite: true,
              onComplete: () => void gsap.to(drum, { timeScale: base, duration: 1.2, ease: "power2.out" }),
            });
          },
        });

        mark(0);
        return listen(pick, run);
      });
    },
    { scope: root },
  );

  return (
    <section className="section lw" aria-labelledby="lw-title" ref={root}>
      {children}
    </section>
  );
}
