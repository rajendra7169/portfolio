"use client";

import { useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, inContext } from "@/lib/gsap";
import { afterReveal, useNavigate } from "@/components/PageTransition";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";

export default function LauncherMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const router = useRouter();

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const laptop = q(".dv-laptop")[0] as HTMLElement;
      const os = q(".pl-os")[0] as HTMLElement;
      const motion = () => matchMedia(MOTION_OK).matches;
      let launching = false;

      // ── Windows / Linux. Works with or without motion; with it, the screen reboots.
      const setOs = (to: string) => {
        laptop.dataset.os = to;
        os.dataset.os = to;
        q(".pl-os-btn").forEach((b) => b.setAttribute("aria-checked", String((b as HTMLElement).dataset.os === to)));
      };
      let booting: gsap.core.Timeline | null = null;
      const onOs = (e: Event) => {
        const btn = (e.target as Element).closest<HTMLElement>(".pl-os-btn");
        if (!btn || btn.dataset.os === laptop.dataset.os || launching) return;
        const to = btn.dataset.os!;
        if (!motion()) return setOs(to);
        booting?.progress(1);
        os.dataset.os = to; // the pill moves at once; the screen catches up
        q(".pl-os-btn").forEach((b) => b.setAttribute("aria-checked", String((b as HTMLElement).dataset.os === to)));
        booting = gsap
          .timeline()
          .to(q(".pl-boot"), { autoAlpha: 1, duration: 0.22, ease: "power2.in" })
          .add(() => setOs(to))
          .fromTo(q(`.pl-boot-${to === "linux" ? "tux" : "win"}`), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" })
          .to(q(".pl-boot"), { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, "+=0.35")
          .fromTo(
            q(`.pl-icons .pl-icon[data-${to}] .pl-app`),
            { scale: 0.4, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.2)", stagger: 0.06 },
            "-=0.2",
          )
          .set(q(".pl-boot-win, .pl-boot-tux"), { autoAlpha: 0 });
      };
      os.addEventListener("click", onOs);

      // ── An app's world is fetched once someone shows interest in it.
      const fetched = new Set<string>();
      const intent = (e: Event) => {
        const href = (e.target as Element).closest?.(".pl-app")?.getAttribute("href");
        if (!href || fetched.has(href)) return;
        fetched.add(href);
        router.prefetch(href);
      };
      el.addEventListener("pointerover", intent);
      el.addEventListener("pointerdown", intent);
      el.addEventListener("focusin", intent);

      // ── Open an app out of its icon, then follow it to its page.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>(".pl-app");
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (launching) return;
        const href = a.getAttribute("href")!;
        if (!motion()) return navigate(href);
        launching = true;
        el.classList.add("is-launching");
        const slug = a.dataset.slug!;
        // It opens on the device it was tapped on: the same app looks different on each.
        const phone = a.closest<HTMLElement>(".dv-phone");
        const box = (phone ? phone.querySelector(".dv-phone-view") : q(".dv-desk-area")[0]) as HTMLElement;
        const layer = (phone ? phone.querySelector(`.pl-open[data-slug="${slug}"]`) : q(`.pl-peek[data-slug="${slug}"]`)[0]) as HTMLElement;
        const tile = (a.querySelector(".dv-tile") ?? a) as HTMLElement;
        const ir = tile.getBoundingClientRect();
        const br = box.getBoundingClientRect();
        q(".pl-peek").forEach((p) => p !== layer && gsap.to(p, { autoAlpha: 0, duration: 0.2 }));
        gsap.killTweensOf(layer);
        layer.classList.add("is-max");
        // Then the screen becomes a portal into the app's own world.
        gsap
          .timeline({ onComplete: () => navigate(href, { from: box.getBoundingClientRect(), color: a.dataset.world ?? "#001c55", icon: a.dataset.icon }) })
          .to(tile, { scale: 0.86, duration: 0.12, ease: "power2.out" })
          .fromTo(
            layer,
            { x: ir.left - br.left, y: ir.top - br.top, scale: ir.width / br.width, autoAlpha: 0, transformOrigin: "0 0" },
            { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.75, ease: "expo.inOut" },
            0.05,
          )
          .to(tile, { scale: 1, duration: 0.3 }, 0.2)
          .to({}, { duration: 0.15 });
      };
      el.addEventListener("click", onClick);

      // Point at an app and it lights up on every device it runs on.
      const twinText = q(".pl-twin-text")[0];
      const twin = (e: Event) => {
        const a = (e.target as Element).closest<HTMLElement>(".pl-app");
        if (!a) return;
        q(".pl-app").forEach((x) => x.classList.toggle("is-twin", (x as HTMLElement).dataset.slug === a.dataset.slug));
        const devices = new Set(q(`.pl-app[data-slug="${a.dataset.slug}"]`).filter((x) => x.checkVisibility()).map((x) => x.closest(".pl-dev")));
        twinText.textContent = `${a.dataset.name} runs on ${a.dataset.runs}${devices.size > 1 ? ` · lit on ${devices.size} devices` : ""}`;
        el.classList.add("is-twinning");
      };
      const untwin = (e: Event) => {
        const to = (e as PointerEvent).relatedTarget as Element | null;
        if (to?.closest?.(".pl-app")) return;
        q(".pl-app").forEach((x) => x.classList.remove("is-twin"));
        el.classList.remove("is-twinning");
      };
      el.addEventListener("pointerover", twin);
      el.addEventListener("pointerout", untwin);
      el.addEventListener("focusin", twin);
      el.addEventListener("focusout", untwin);

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, fine: `${MOTION_OK} and (hover: hover) and (pointer: fine)` }, (ctx) => {
        const { motion: ok, fine } = ctx.conditions as Record<string, boolean>;
        if (!ok) return;

        // Intro: the scene builds, both screens power on, the icons pop in.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        intro
          .set(q(".pl-bg, .pl-inner"), { opacity: 1 })
          .from(q(".hx-glow"), { scale: 0.4, autoAlpha: 0, duration: 2, stagger: 0.2 }, 0)
          .from(q(".hx-floor-grid"), { rotationX: 88, autoAlpha: 0, duration: 1.8, ease: "expo.inOut" }, 0)
          .from(q(".hx-field"), { autoAlpha: 0, duration: 1.4 }, 0.2)
          .from(q(".pl-eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
          .from(q(".pl-title-text"), { yPercent: 105, duration: 1.2 }, 0.3)
          .to(q(".pl-title-text"), { scrambleText: { text: "Projects", chars: GLYPHS, revealDelay: 0.35, speed: 0.55 }, duration: 1.5, ease: "none" }, 0.3)
          .from(q(".pl-intro"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.8)
          .from(q(".pl-os, .pl-twin"), { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1)
          .from(q(".pl-dev--laptop"), { y: 90, rotationX: -18, autoAlpha: 0, transformPerspective: 1400, duration: 1.4 }, 0.25)
          // The lid swings up on its hinge, the phones flip up off their edges.
          .fromTo(q(".pl-laptop .dv-lid"), { rotationX: -86, transformOrigin: "50% 100%", transformPerspective: 2200 }, { rotationX: 0, duration: 1.6, ease: "expo.inOut" }, 0.35)
          .from(q(".pl-dev--iphone"), { x: -70, y: 130, rotation: -8, rotationY: 70, transformPerspective: 1400, autoAlpha: 0, duration: 1.5 }, 0.55)
          .from(q(".pl-dev--android"), { x: 70, y: 130, rotation: 8, rotationY: -70, transformPerspective: 1400, autoAlpha: 0, duration: 1.5 }, 0.7)
          .from(q(".pl-cap"), { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.5)
          .from(q(".pl-lock > :not(.pl-lock-wall)"), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.25)
          .from(q(".dv-display, .dv-phone-screen"), { filter: "brightness(0)", duration: 0.9, ease: "power2.inOut", stagger: 0.2 }, 0.9)
          .from(q(".pl-widget > *"), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.3)
          .from(q(".pl-icon .pl-app, .pl-np"), { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "back.out(2.2)", stagger: 0.05 }, 1.4)
          .from(q(".dv-taskbar, .dv-topbar"), { autoAlpha: 0, duration: 0.6 }, 1.2);
        afterReveal(() => intro.play());

        // Now and then each device gets a notification from one of its apps.
        // (Only apps that run there, and on the laptop only the current OS's.)
        const posts = [
          { box: q(".pl-notifs--android")[0], first: 3.2, every: 6, from: { yPercent: -70, scale: 0.94 } },
          { box: q(".pl-notifs--desk")[0], first: 5, every: 7, from: { xPercent: 40, scale: 0.96 }, os: true },
          { box: q(".pl-notifs--ios")[0], first: 7.5, every: 11, from: { yPercent: -70, scale: 0.94 } },
        ];
        // The waits (between notifications, and while one shows) are timers, not
        // tweens, so GSAP's ticker can sleep through them; and nothing posts while
        // the devices are off screen.
        const timers: number[] = [];
        const later = (s: number, f: () => void) => void timers.push(window.setTimeout(f, s * 1000));
        const devices = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top" });
        posts.forEach((g) => {
          let i = 0;
          const post = inContext(ctx, () => {
            let items = Array.from(g.box.children) as HTMLElement[];
            if (g.os) items = items.filter((n) => n.dataset[laptop.dataset.os!] !== undefined);
            if (!items.length || launching || document.hidden || !devices.isActive) return later(g.every, post);
            const n = items[i++ % items.length];
            gsap.fromTo(n, { autoAlpha: 0, ...g.from }, { autoAlpha: 1, xPercent: 0, yPercent: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)" });
            later(0.6 + 2.8, inContext(ctx, () => {
              gsap.to(n, { autoAlpha: 0, yPercent: g.os ? 0 : -40, xPercent: g.os ? 30 : 0, duration: 0.4, ease: "power2.in" });
              later(0.4 + Math.max(1, g.every - 3.6), post);
            }));
          });
          later(g.first, post);
        });

        const stopPosts = () => timers.forEach(clearTimeout);
        if (!fine) return stopPosts;

        // Hover a desktop app: its window peeks open on the laptop.
        const peekOf = (a: Element) => q(`.pl-peek[data-slug="${(a as HTMLElement).dataset.slug}"]`)[0];
        const show = inContext(ctx, (e: Event) => {
          const a = (e.target as Element).closest(".pl-icons .pl-app");
          if (!a || launching) return;
          const peek = peekOf(a);
          q(".pl-peek").forEach((p) => p !== peek && gsap.to(p, { autoAlpha: 0, scale: 0.94, duration: 0.2, overwrite: "auto" }));
          gsap.fromTo(peek, { autoAlpha: 0, scale: 0.9, y: 14 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "expo.out", overwrite: "auto" });
        });
        const hide = inContext(ctx, (e: Event) => {
          const a = (e.target as Element).closest(".pl-icons .pl-app");
          if (!a || launching) return;
          gsap.to(peekOf(a), { autoAlpha: 0, scale: 0.94, duration: 0.25, overwrite: "auto" });
        });
        const icons = q(".pl-icons")[0];
        icons.addEventListener("pointerover", show);
        icons.addEventListener("pointerout", hide);
        icons.addEventListener("focusin", show);
        icons.addEventListener("focusout", hide);

        // The devices lean a touch toward the cursor.
        const tilt = q(".pl-tilt")[0];
        gsap.set(tilt, { transformPerspective: 1600 });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
        const move = inContext(ctx, (e: PointerEvent) => {
          if (launching) return;
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
        });
        const leave = () => {
          ry(0);
          rx(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);

        return () => {
          stopPosts();
          icons.removeEventListener("pointerover", show);
          icons.removeEventListener("pointerout", hide);
          icons.removeEventListener("focusin", show);
          icons.removeEventListener("focusout", hide);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      }, el);

      return () => {
        el.removeEventListener("pointerover", intent);
        el.removeEventListener("pointerdown", intent);
        el.removeEventListener("focusin", intent);
        os.removeEventListener("click", onOs);
        el.removeEventListener("click", onClick);
        el.removeEventListener("pointerover", twin);
        el.removeEventListener("pointerout", untwin);
        el.removeEventListener("focusin", twin);
        el.removeEventListener("focusout", untwin);
      };
    },
    { scope: root },
  );

  return (
    <section className="pl" ref={root}>
      {children}
    </section>
  );
}
