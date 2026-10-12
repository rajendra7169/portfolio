"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, Draggable, useGSAP, MOTION_OK, DESKTOP, inContext } from "@/lib/gsap";
import { afterReveal } from "@/components/PageTransition";
import { matchStatus } from "@/components/proj/light";
import { scrollToTarget, useLenis } from "@/components/SmoothScroll";

const SONG = 208; // the page plays as a 3:28 track
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;

export default function BlazifyMotion({ className, children }: { className: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);

      // ── Always: the mini player follows the scroll, and pauses the record.
      const play = q(".bz-mini-play")[0] as HTMLButtonElement;
      const togglePlay = () => {
        const paused = el.classList.toggle("is-paused");
        play.setAttribute("aria-pressed", String(!paused));
        play.setAttribute("aria-label", paused ? "Play the record" : "Pause the record");
      };
      play.addEventListener("click", togglePlay);
      const seek = q(".bz-mini-track i")[0];
      const time = q(".bz-mini-time")[0];
      gsap.set(seek, { scaleX: 0, transformOrigin: "left center" });
      const song = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => {
          gsap.set(seek, { scaleX: s.progress });
          time.textContent = clock(s.progress * SONG);
        },
      });

      // ── Always: Side B's desktop switches between Linux and Windows.
      const laptop = q(".bz-b-laptop")[0] as HTMLElement;
      const onOs = (e: Event) => {
        const b = (e.target as Element).closest<HTMLElement>(".bz-os-btn");
        if (!b) return;
        laptop.dataset.os = b.dataset.os;
        q(".bz-os-btn").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      };
      el.addEventListener("click", onOs);

      // One screen at a time on a device, with its caption.
      const stepper = (shots: Element[], caps: Element[], screen?: HTMLElement | null) => {
        let cur = 0;
        return (i: number, animate: boolean) => {
          if (i === cur) return;
          const [prev, next] = [shots[cur], shots[i]];
          caps.forEach((c, j) => c.classList.toggle("is-on", j === i));
          matchStatus(screen, (next as HTMLElement).dataset.top);
          cur = i;
          if (!animate) return void (gsap.set(prev, { autoAlpha: 0 }), gsap.set(next, { autoAlpha: 1 }));
          gsap.to(prev, { autoAlpha: 0, duration: 0.4, overwrite: "auto" });
          gsap.fromTo(next, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
        };
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, desktop: DESKTOP }, (ctx) => {
        const { motion, desktop } = ctx.conditions as Record<string, boolean>;
        const showI = stepper(q(".bz-bshot-i"), q(".bz-cap-i"), q(".bz-b-iphone .dv-phone-screen")[0] as HTMLElement);
        const showD = stepper(q(".bz-bshot-d"), q(".bz-cap-d"));
        if (!motion) return;

        // The record drops onto the deck, the arm swings over, the needle lands.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .from(q(".bz-hero-glow"), { autoAlpha: 0, scale: 0.5, duration: 2.2 }, 0)
          .from(q(".bz-disc"), { autoAlpha: 0, scale: 0.72, rotation: -140, duration: 1.9 }, 0.1)
          .fromTo(q(".bz-arm"), { rotation: -36 }, { rotation: 0, duration: 1.4, ease: "power3.inOut" }, 0.9)
          .add(() => el.classList.add("is-playing"), 2.1)
          .from(q(".bz-np"), { y: 18, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".bz-letter"), { yPercent: 118, duration: 1.2, stagger: 0.055 }, 0.25)
          .from(q(".bz-word"), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.85)
          .from(q(".bz-lede, .bz-links > *"), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 1.05)
          .from(q(".bz-deck-hint"), { autoAlpha: 0, duration: 0.8 }, 2.2)
          .from(q(".bz-mini"), { yPercent: 170, duration: 1.1 }, 1.5);
        afterReveal(() => intro.play());

        // The tagline sings itself, a word at a time, like Blazify's synced lyrics.
        const sing = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 2.4 });
        q(".bz-word").forEach((w) => sing.fromTo(w, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 0.42, ease: "none" }));
        sing.to(q(".bz-word"), { backgroundPosition: "100% 0", duration: 0.5, stagger: 0.03, ease: "power1.in" }, "+=1.6");

        // Scratch the record: drag it round, and it spins on from wherever you leave it.
        // On a touch screen the record fills the width, so only its label scratches;
        // a swipe anywhere else on it scrolls the page as usual.
        const touch = matchMedia("(pointer: coarse)").matches;
        const [scratch] = Draggable.create(q(".bz-disc"), { type: "rotation", trigger: touch ? q(".bz-label")[0] : q(".bz-deck")[0] });

        // Side A: the tracklist slides past while the section holds still.
        const sideA = q(".bz-side-a")[0] as HTMLElement;
        const tracks = q(".bz-tracks")[0] as HTMLElement;
        const items = q(".bz-track");
        const bar = q(".bz-side-progress i")[0];
        sideA.classList.add("is-pinned");
        const sideB = q(".bz-side-b")[0] as HTMLElement;
        sideB.classList.add("is-pinned");
        gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
        const dist = () => Math.max(0, tracks.scrollWidth - sideA.clientWidth + parseFloat(getComputedStyle(sideA).paddingLeft));
        gsap.to(tracks, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: sideA,
            start: "top top",
            end: () => `+=${dist() * (desktop ? 1.1 : 1.6)}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            refreshPriority: 2,
            onUpdate: inContext(ctx, (s: ScrollTrigger) => {
              const i = Math.round(s.progress * (items.length - 1));
              items.forEach((t, j) => t.classList.toggle("is-on", j === i));
              gsap.set(bar, { scaleX: s.progress });
            }),
          },
        });

        // Side B: the iPhone and the desktop turn their pages together.
        const nI = q(".bz-bshot-i").length;
        const nD = q(".bz-bshot-d").length;
        ScrollTrigger.create({
          trigger: sideB,
          start: "top top",
          end: "+=160%",
          pin: true,
          refreshPriority: 1,
          onUpdate: inContext(ctx, (s: ScrollTrigger) => {
            showI(Math.min(nI - 1, Math.floor(s.progress * nI)), true);
            showD(Math.min(nD - 1, Math.floor(s.progress * nD)), true);
          }),
        });

        // Six players: flick through the crate and the phone drops the needle on each design.
        const players = q(".bz-players")[0] as HTMLElement;
        const sleeves = q(".bz-sleeve") as HTMLElement[];
        const pshots = q(".bz-pshot");
        const caps = q(".bz-crate-cap span");
        const pScreen = q(".bz-players-phone .dv-phone-screen")[0] as HTMLElement;
        let pick = 0;
        const choose = inContext(ctx, (i: number) => {
          if (i === pick) return;
          pick = i;
          sleeves.forEach((sl, j) => {
            sl.classList.toggle("is-on", j === i);
            sl.setAttribute("aria-selected", String(j === i));
          });
          caps.forEach((c, j) => c.classList.toggle("is-on", j === i));
          pshots.forEach((sh, j) => sh.classList.toggle("is-on", j === i));
          gsap.fromTo(pshots[i], { clipPath: "circle(0% at 50% 42%)" }, { clipPath: "circle(120% at 50% 42%)", duration: 0.7, ease: "power3.out", overwrite: "auto" });
          matchStatus(pScreen, (pshots[i] as HTMLElement).dataset.top ?? "#000");
        });
        players.classList.add("is-pinned");
        const pst = ScrollTrigger.create({
          trigger: players,
          start: "top top",
          end: `+=${sleeves.length * 45}%`,
          pin: true,
          refreshPriority: 0,
          onUpdate: (st) => choose(Math.min(sleeves.length - 1, Math.floor(st.progress * sleeves.length))),
        });
        // A tap picks a sleeve, and the page scrolls to where that sleeve sits.
        const onSleeve = (e: Event) => {
          const sl = (e.target as Element).closest<HTMLElement>(".bz-sleeve");
          if (!sl) return;
          const i = +sl.dataset.i!;
          choose(i);
          const y = pst.start + ((pst.end - pst.start) * (i + 0.5)) / sleeves.length;
          scrollToTarget(lenisRef.current, y);
        };
        players.addEventListener("click", onSleeve);

        return () => {
          scratch.kill();
          players.removeEventListener("click", onSleeve);
          players.classList.remove("is-pinned");
          sideA.classList.remove("is-pinned");
          sideB.classList.remove("is-pinned");
        };
      }, el);

      return () => {
        play.removeEventListener("click", togglePlay);
        el.removeEventListener("click", onOs);
        song.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} data-world="blazify" data-tone="dark">
      {children}
    </div>
  );
}
