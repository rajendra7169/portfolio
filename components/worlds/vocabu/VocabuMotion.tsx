"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { matchStatus } from "@/components/proj/light";

type Word = { w: string; pos: string; def: string; ex: string };
const KEY = "vocabu-theme";
const THEME = {
  light: { bg: "#f6f8fb", fg: "#0f1724", acc: "#2d8464" },
  dark: { bg: "#0f1724", fg: "#e7edf6", acc: "#ff9800" },
};
// When the scan's steps start, in timeline seconds.
const AT = [0, 1, 2, 3.6, 4.6];

export default function VocabuMotion({ className, words, children }: { className: string; words: Word[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const one = <T extends Element = HTMLElement>(s: string) => q(s)[0] as unknown as T;
      const html = document.documentElement;
      const motion = () => matchMedia(MOTION_OK).matches;
      const offs: (() => void)[] = [];
      const on = (node: Element | Document, type: string, fn: EventListener) => {
        node.addEventListener(type, fn);
        offs.push(() => node.removeEventListener(type, fn));
      };

      // ── Light and dark, like the app ─────────────────────────────────────
      const themeBtn = one(".vc-theme");
      const apply = (t: "light" | "dark") => {
        el.dataset.theme = t;
        el.dataset.tone = t;
        const c = THEME[t];
        html.style.setProperty("--w-bg", c.bg);
        html.style.setProperty("--w-fg", c.fg);
        html.style.setProperty("--w-accent", c.acc);
        themeBtn.setAttribute("aria-label", `Switch to the ${t === "light" ? "dark" : "light"} theme`);
        themeBtn.querySelector("span")!.textContent = t === "light" ? "Dark theme" : "Light theme";
        q(".vc-phone .dv-phone-screen").forEach((s) => {
          const img = s.querySelector<HTMLElement>(t === "light" ? ".vc-shot-light" : ".vc-shot-dark");
          matchStatus(s as HTMLElement, img?.dataset.top);
        });
      };
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch {}
      apply(saved === "dark" ? "dark" : "light");
      on(themeBtn, "click", () => {
        const t = el.dataset.theme === "light" ? "dark" : "light";
        apply(t);
        try {
          localStorage.setItem(KEY, t);
        } catch {}
        if (motion()) gsap.fromTo(el, { filter: "brightness(1.25)" }, { filter: "brightness(1)", duration: 0.6, ease: "power2.out", clearProps: "filter" });
      });

      // ── Hear it ──────────────────────────────────────────────────────────
      on(el, "click", (e) => {
        const b = (e.target as Element).closest<HTMLElement>("[data-say]");
        if (!b || !("speechSynthesis" in window)) return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(b.dataset.say!);
        u.lang = "en-US";
        u.rate = 0.9;
        speechSynthesis.speak(u);
        b.classList.add("is-saying");
        u.onend = () => b.classList.remove("is-saying");
        setTimeout(() => b.classList.remove("is-saying"), 2500);
      });

      // ── Save, on any card ────────────────────────────────────────────────
      const kept = new Set<string>();
      const keptEl = one(".vc-kept b");
      const showKept = () => (keptEl.textContent = kept.size ? [...kept].join(", ") : "none yet");
      on(el, "click", (e) => {
        const b = (e.target as Element).closest<HTMLElement>(".vc-save");
        if (!b) return;
        const w = b.closest("article")!.querySelector("header b")!.textContent!;
        const now = b.getAttribute("aria-pressed") !== "true";
        q(".vc-save").forEach((s) => {
          if (s.closest("article")!.querySelector("header b")!.textContent === w) {
            s.setAttribute("aria-pressed", String(now));
            s.textContent = now ? "Saved" : "Save";
          }
        });
        if (now) kept.add(w);
        else kept.delete(w);
        showKept();
      });

      // ── Search the app's own words ───────────────────────────────────────
      const card = one(".vc-card");
      const input = one<HTMLInputElement>(".vc-q");
      const look = (raw: string) => {
        const w = raw.trim().toLowerCase();
        if (!w) return;
        const hit = words.find((x) => x.w === w);
        const head = card.querySelector("header b")!;
        const hear = card.querySelector<HTMLElement>(".vc-hear")!;
        const save = card.querySelector<HTMLElement>(".vc-save")!;
        const pos = card.querySelector(".vc-card-pos")!;
        const def = card.querySelector(".vc-card-def")!;
        const ex = card.querySelector(".vc-card-ex")!;
        card.classList.toggle("is-miss", !hit);
        head.textContent = hit ? hit.w : w;
        hear.dataset.say = hit ? hit.w : w;
        hear.setAttribute("aria-label", `Hear it: ${hit ? hit.w : w}`);
        pos.textContent = hit ? hit.pos : "not in this list";
        def.innerHTML = hit ? `<span>Meaning:</span> ${hit.def}` : `<span>Not here.</span> The app would ask the Free Dictionary API. This page knows its eleven explore words.`;
        ex.textContent = hit ? `• ${hit.ex}` : `• Try ${words.slice(0, 3).map((x) => x.w).join(", ")}`;
        save.setAttribute("aria-pressed", String(kept.has(head.textContent!)));
        save.textContent = kept.has(head.textContent!) ? "Saved" : "Save";
        save.hidden = !hit;
        if (motion()) gsap.fromTo(card, { rotationX: -70, autoAlpha: 0, transformPerspective: 900, transformOrigin: "50% 0%" }, { rotationX: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(1.4)" });
      };
      on(one(".vc-search"), "submit", (e) => {
        e.preventDefault();
        look(input.value);
      });
      q(".vc-chip").forEach((c) =>
        on(c, "click", () => {
          input.value = (c as HTMLElement).dataset.word!;
          look(input.value);
        }),
      );

      // ── The deck ─────────────────────────────────────────────────────────
      const deckEl = one(".vc-deck");
      const cards = q(".vc-dcard");
      const dots = q(".vc-dots i");
      let order = cards.map((_, i) => i);
      let drags: Draggable[] = [];
      const layout = (d = 0.5, skip = -1) => {
        order.forEach((ci, k) => {
          if (ci === skip) return;
          gsap.to(cards[ci], { x: 0, y: k * 14, scale: 1 - k * 0.045, rotation: 0, autoAlpha: k < 4 ? 1 : 0, zIndex: cards.length - k, duration: d, ease: "power3.out", overwrite: "auto" });
        });
        dots.forEach((dot, i) => dot.classList.toggle("is-on", i === order[0]));
        drags.forEach((g, i) => (i === order[0] ? g.enable() : g.disable()));
      };
      const fly = (dir: number) => {
        if (dir > 0) {
          const gone = order[0];
          const top = cards[gone];
          order = [...order.slice(1), gone];
          layout(motion() ? 0.5 : 0, gone);
          gsap.to(top, {
            x: -deckEl.offsetWidth * 1.2,
            rotation: -18,
            autoAlpha: 0,
            duration: motion() ? 0.45 : 0,
            ease: "power2.in",
            overwrite: "auto",
            onComplete: () => void gsap.set(top, { x: 0, rotation: 0, y: (cards.length - 1) * 14, scale: 1 - (cards.length - 1) * 0.045, zIndex: 0 }),
          });
        } else {
          order = [order[order.length - 1], ...order.slice(0, -1)];
          const back = cards[order[0]];
          gsap.set(back, { x: -deckEl.offsetWidth * 1.2, y: 0, scale: 1, rotation: -18, autoAlpha: 1, zIndex: cards.length + 1 });
          layout(motion() ? 0.5 : 0);
        }
      };
      q(".vc-deck-btn").forEach((b) => on(b, "click", () => fly(+(b as HTMLElement).dataset.dir!)));

      // ── The scan ─────────────────────────────────────────────────────────
      const scan = one(".vc-scan");
      const steps = q(".vc-rail li");
      const size = one(".vc-size");
      const paper = one(".vc-paper");
      const setStep = (t: number) => {
        const k = AT.filter((a) => t >= a).length - 1;
        steps.forEach((s, i) => {
          s.classList.toggle("is-on", i === k);
          s.classList.toggle("is-done", i < k);
        });
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion: ok, desktop } = ctx.conditions as Record<string, boolean>;
        if (!ok) return;

        // The entry prints itself.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .from(q(".vc-guide span"), { autoAlpha: 0, y: -10, duration: 0.8, stagger: 0.08 }, 0)
          .from(q(".vc-head > span[aria-hidden]"), { clipPath: "inset(0 100% 0 0)", duration: 1.4, ease: "power3.inOut" }, 0.1)
          .from(q(".vc-say, .vc-senses li, .vc-ex, .vc-lede, .vc-links"), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.08 }, 0.7)
          .from(q(".vc-look"), { autoAlpha: 0, y: 30, duration: 1 }, 0.8);
        afterReveal(() => intro.play());

        // The deck stacks up; the top card can be thrown.
        deckEl.classList.add("is-live");
        drags = Draggable.create(cards, {
          type: "x",
          minimumMovement: 6,
          onDrag: function (this: Draggable) {
            gsap.set(this.target, { rotation: this.x / 18 });
          },
          // Only the top card is enabled, so it is the one released.
          onRelease: inContext(ctx, () => {
            if (Math.abs(drags[order[0]].x) > 110) fly(1);
            else layout();
          }),
          dragClickables: false,
          zIndexBoost: false,
        });
        layout(0);

        // Photograph, compress, read, pick, look up.
        const all = q(".vc-w");
        const skip = q('.vc-w[data-k="skip"]');
        const cand = q('.vc-w[data-k="cand"]');
        const pick = q('.vc-w[data-k="pick"]');
        const found = q(".vc-found-list li");
        const sz = { mb: 3.8 };
        gsap.set(all, { "--read": 0, "--dim": 0, "--hl": 0 });
        const tl = gsap.timeline({ defaults: { ease: "none" }, onUpdate: () => setStep(tl.time()) });
        tl.fromTo(paper, { rotation: -4, skewX: 3, scale: 0.92 }, { rotation: 0, skewX: 0, scale: 1, duration: 0.5, ease: "power3.out" }, 0.45)
          .fromTo(q(".vc-flash"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, yoyo: true, repeat: 1 }, 0.4)
          .fromTo(sz, { mb: 3.8 }, { mb: 0.94, duration: 0.8, ease: "power2.inOut", onUpdate: () => void (size.textContent = `${sz.mb.toFixed(2)} MB`) }, AT[1])
          .fromTo(q(".vc-scanline"), { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.1 }, AT[2])
          .to(q(".vc-scanline"), { y: () => paper.offsetHeight, duration: 1.4 }, AT[2])
          .to(all, { "--read": 1, duration: 0.15, stagger: 1.25 / all.length }, AT[2] + 0.05)
          .to(q(".vc-scanline"), { autoAlpha: 0, duration: 0.1 }, AT[3] - 0.1)
          .to(all, { "--read": 0, duration: 0.4 }, AT[3])
          .to([...skip, ...cand, ...pick], { "--dim": 1, duration: 0.5 }, AT[3])
          .to(pick, { "--hl": 1, duration: 0.3, stagger: 0.05 }, AT[3] + 0.3)
          .fromTo(q(".vc-count"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, AT[3] + 0.2)
          .fromTo(found, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.13, ease: "power2.out" }, AT[4])
          .to({}, { duration: 0.6 });
        setStep(0);
        // On phones the looked-up words rise over the photo as a sheet.
        if (!desktop) tl.fromTo(q(".vc-found")[0], { yPercent: 105 }, { yPercent: 0, duration: 0.5, ease: "power3.out", immediateRender: true }, AT[4] - 0.2);
        scan.classList.add("is-pinned");
        ScrollTrigger.create({ animation: tl, trigger: scan, start: "top top", end: desktop ? "+=260%" : "+=300%", pin: true, scrub: 0.6, refreshPriority: 1, invalidateOnRefresh: true });

        q(".vc-shead").forEach((h) => {
          if (h.closest(".vc-scan")) return;
          gsap.from(h.children, { y: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 85%", once: true } });
        });

        return () => {
          deckEl.classList.remove("is-live");
          drags.forEach((d) => d.kill());
          drags = [];
          gsap.set(cards, { clearProps: "all" });
          size.textContent = "0.94 MB";
          scan.classList.remove("is-pinned");
          steps.forEach((s) => s.classList.remove("is-on", "is-done"));
        };
      }, el);

      return () => {
        offs.forEach((f) => f());
        ["--w-bg", "--w-fg", "--w-accent"].forEach((v) => html.style.removeProperty(v));
        if ("speechSynthesis" in window) speechSynthesis.cancel();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="vocabu" data-tone="light" data-theme="light">
      {children}
    </div>
  );
}
