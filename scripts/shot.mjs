// SHOT_URL=http://localhost:3000 npm run shot
// Screenshots every page at desktop and mobile widths into shots/, and asserts
// the layout and animations hold up. Exits non-zero if any check fails.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOT_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = "shots";
const PAGES = [
  { path: "/", name: "home", h1: "Rajendra Pandey", counts: { ".wd-item": 4, ".social": 7 } },
  { path: "/education", name: "education", h1: "Education", counts: { ".degree": 2, ".cert": 6, ".profile-link": 5 } },
  { path: "/experience", name: "experience", h1: "Experience", counts: { ".role": 2 } },
  { path: "/projects", name: "projects", h1: "Projects", counts: { ".project": 9 } },
  { path: "/contact", name: "contact", h1: "Contact Me", counts: { ".details dt": 3, ".social": 7 } },
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

const failures = [];
const check = (scope, ok, msg) => {
  console.log(`  ${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failures.push(`[${scope}] ${msg}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Is the transition curtain out of the way at the centre of the screen?
const curtainClear = (page) =>
  page.evaluate(() => !document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest(".curtain"));

// Scroll through the whole page so every scroll-triggered animation fires.
const scrollThrough = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight / 2) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    await new Promise((r) => setTimeout(r, 1800));
  });

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile ?? false,
    hasTouch: vp.hasTouch ?? false,
  });

  for (const pg of PAGES) {
    const scope = `${vp.name} ${pg.path}`;
    console.log(`\n${scope}`);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    const res = await page.goto(BASE + pg.path, { waitUntil: "networkidle" });
    check(scope, res?.ok(), `loads (${res?.status()})`);
    await page.evaluate(() => document.fonts.ready);
    await wait(2600); // intro curtain + first entrance animations

    check(scope, await curtainClear(page), "intro curtain has lifted");
    const top = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const r = h1.getBoundingClientRect();
      // Split headings carry their readable text in .sr-only.
      const text = (h1.querySelector(".sr-only") ?? h1).textContent.replace(/\s+/g, " ").trim();
      return { text, left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight };
    });
    check(scope, top.text === pg.h1, `h1 reads "${top.text}"`);
    check(scope, top.left >= 0 && top.right <= top.vw && top.top >= 0, "h1 is fully on screen");
    // Before anything scrolls in, elements wait off to the side; they must not widen the page.
    const early = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, innerWidth) - document.documentElement.clientWidth);
    check(scope, early <= 0, `no horizontal overflow on load (${early}px)`);

    if (pg.name === "home") {
      await wait(2200); // the hero intro runs ~3s after the curtain
      const hxState = () =>
        page.evaluate(() => {
          const r = (s) => document.querySelector(s).getBoundingClientRect();
          const copy = r(".hx-copy");
          return {
            a: document.querySelector(".hx-line--a").textContent,
            b: document.querySelector(".hx-line--b").textContent,
            linesFit: [...document.querySelectorAll(".hx-line")].every((l) => l.getBoundingClientRect().right <= copy.right + 1),
            counts: [...document.querySelectorAll(".hx-count")].every((c) => c.textContent === c.dataset.to),
            orbs: [...document.querySelectorAll(".hx-orb-pop")].filter((o) => parseFloat(getComputedStyle(o).opacity) > 0.99).length,
            inner: getComputedStyle(document.querySelector(".hx-inner")).opacity,
            chipsOff: [...document.querySelectorAll(".hx-chip")].filter((c) => {
              const b = c.getBoundingClientRect();
              return b.left < 0 || b.right > innerWidth;
            }).length,
            build: document.querySelector(".hx-build-text").textContent,
            pinned: !!document.querySelector(".pin-spacer .hx"),
          };
        });
      const hx = await hxState();
      check(scope, hx.inner === "1", "hero copy is revealed");
      check(scope, hx.a === "Rajendra" && hx.b === "Pandey", `name finishes decoding ("${hx.a} ${hx.b}")`);
      check(scope, hx.linesFit, "name lines fit their column");
      check(scope, hx.counts, "stat counters land on their values");
      check(scope, hx.orbs === 10, `10 logos on orbit (${hx.orbs})`);
      check(scope, hx.chipsOff === 0, `glass cards stay on screen (${hx.chipsOff} off)`);
      check(scope, hx.pinned === !vp.isMobile, `hero ${vp.isMobile ? "is not" : "is"} pinned for the scroll exit`);
      await page.screenshot({ path: `${OUT}/${vp.name}-home-hero.png` });
      await wait(3400);
      const later = await hxState();
      check(scope, later.build !== hx.build, `"I build" line cycles ("${hx.build}" → "${later.build}")`);
      // Cyber reveal: how much of the canvas is painted (share of pixels with alpha).
      const painted = () =>
        page.evaluate(() => {
          const c = document.querySelector(".hx-cyber-canvas");
          const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
          let n = 0;
          for (let i = 3; i < d.length; i += 16) if (d[i] > 40) n++;
          return n / (d.length / 16);
        });
      await page.locator(".hx-cyber-btn").scrollIntoViewIfNeeded();
      await wait(600);
      const btn = await page.locator(".hx-cyber-btn").boundingBox();
      if (!vp.isMobile) {
        // Sweep the lens across his face and chest.
        await page.mouse.move(btn.x + btn.width * 0.3, btn.y + btn.height * 0.2);
        await page.mouse.move(btn.x + btn.width * 0.6, btn.y + btn.height * 0.45, { steps: 12 });
        await wait(250);
        await wait(450); // lens grows in
        const lens = await page.evaluate(() => {
          const ring = document.querySelector(".hx-lens-ring").getBoundingClientRect().width;
          const box = document.querySelector(".hx-cyber").getBoundingClientRect().width;
          return { opacity: getComputedStyle(document.querySelector(".hx-lens-in")).opacity, share: ring / box };
        });
        const trail = await painted();
        await page.screenshot({ path: `${OUT}/${vp.name}-home-cyber-lens.png` });
        check(scope, lens.opacity === "1", "cyber lens appears on hover");
        check(scope, lens.share > 0.28, `lens is full size (${(lens.share * 100).toFixed(0)}% of photo width)`);
        check(scope, trail > 0.03, `hover reveals the cyber look (${(trail * 100).toFixed(1)}% painted)`);
        await page.mouse.move(5, 300); // leave the photo
        await wait(2600);
        const faded = await painted();
        check(scope, faded < 0.002, `revealed patches fade after 2s (${(faded * 100).toFixed(2)}% left)`);
      }
      // Click / tap: full-suit scan, held, then wiped back.
      await page.mouse.click(btn.x + btn.width / 2, btn.y + btn.height * 0.4);
      await wait(1300);
      const full = await painted();
      await page.screenshot({ path: `${OUT}/${vp.name}-home-cyber-full.png` });
      check(scope, full > 0.25, `click scans into the full suit (${(full * 100).toFixed(1)}% painted)`);
      await page.mouse.move(5, 300);
      await wait(2400);
      const back = await painted();
      check(scope, back < 0.002, `full suit wipes back after its hold (${(back * 100).toFixed(2)}% left)`);

      if (!vp.isMobile) {
        // Halfway through the pinned exit the hero should be coming apart.
        await page.evaluate(() => scrollTo(0, innerHeight * 0.4));
        await wait(1200);
        await page.screenshot({ path: `${OUT}/${vp.name}-home-exit.png` });
        const exit = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".hx-copy")).opacity));
        check(scope, exit < 0.8, `copy fades during the scroll exit (opacity ${exit.toFixed(2)})`);
        await page.evaluate(() => scrollTo(0, 0));
        await wait(800);
      }

      // What I Do? — four live modules.
      const SCENE_OK = [
        // editor: the phone preview has assembled, but the build hasn't "succeeded"
        // yet — the code is still being typed at this point.
        () =>
          [...document.querySelectorAll(".wd-item:nth-child(1) .wd-ph-el")].every((e) => getComputedStyle(e).opacity === "1") &&
          getComputedStyle(document.querySelector(".wd-item:nth-child(1) .wd-ok")).opacity === "0",
        // cloud: the hub is up and at least one service is lit
        () => document.querySelectorAll(".wd-item:nth-child(2) .wd-node[data-on=\"1\"]").length > 0,
        // design: blocks have landed on the artboard
        () => [...document.querySelectorAll(".wd-item:nth-child(3) .wd-ab-el")].some((e) => getComputedStyle(e).opacity === "1"),
        // video: clips are on the timeline and the timecode runs
        () => getComputedStyle(document.querySelector(".wd-item:nth-child(4) .wd-clip--b")).opacity === "1" && document.querySelector(".wd-item:nth-child(4) .wd-tc").textContent !== "00:00:00:00",
      ];
      const NAMES = ["editor", "cloud", "design", "video"];
      if (!vp.isMobile) {
        const deck = await page.evaluate(() => ({ deck: document.querySelector(".wd").classList.contains("is-deck"), pinned: !!document.querySelector(".pin-spacer .wd") }));
        check(scope, deck.deck && deck.pinned, "What I Do? is a pinned deck");
        for (let i = 0; i < 4; i++) {
          await page.evaluate((i) => {
            const spacer = document.querySelector(".wd").parentElement;
            const top = spacer.getBoundingClientRect().top + scrollY;
            scrollTo(0, top + (spacer.offsetHeight - innerHeight) * ((i + 0.5) / 4));
          }, i);
          await wait(2800);
          const m = await page.evaluate((i) => {
            const item = document.querySelectorAll(".wd-item")[i];
            const panel = item.querySelector(".wd-panel").getBoundingClientRect();
            const win = item.querySelector(".wd-win").getBoundingClientRect();
            return {
              live: item.classList.contains("is-live"),
              onlyLive: document.querySelectorAll(".wd-item.is-live").length === 1,
              panelShown: getComputedStyle(item.querySelector(".wd-panel")).opacity === "1",
              fits: panel.bottom <= innerHeight + 1 && win.bottom <= innerHeight + 1 && win.right <= innerWidth + 1 && panel.top >= 0,
              rect: `panel ${Math.round(panel.top)}–${Math.round(panel.bottom)}, window to ${Math.round(win.bottom)} of ${innerHeight}`,
              current: document.querySelector(".wd-rail-btn[aria-current]")?.dataset.i,
            };
          }, i);
          const played = await page.evaluate(SCENE_OK[i]);
          check(scope, m.live && m.onlyLive && m.panelShown, `module ${i + 1} (${NAMES[i]}) is the live one`);
          check(scope, m.fits, `module ${i + 1} fits the screen (${m.rect})`);
          check(scope, played, `module ${i + 1} scene plays`);
          check(scope, m.current === String(i), `rail marks module ${i + 1}`);
          await page.screenshot({ path: `${OUT}/${vp.name}-wid-${i + 1}-${NAMES[i]}.png` });
        }
        await page.evaluate(() => scrollTo(0, 0));
        await wait(800);
      } else {
        for (let i = 0; i < 4; i++) {
          await page.locator(".wd-win").nth(i).scrollIntoViewIfNeeded();
          await wait(2800);
          const live = await page.evaluate((i) => document.querySelectorAll(".wd-item")[i].classList.contains("is-live"), i);
          const played = await page.evaluate(SCENE_OK[i]);
          check(scope, live && played, `module ${i + 1} (${NAMES[i]}) plays when scrolled to`);
          await page.screenshot({ path: `${OUT}/${vp.name}-wid-${i + 1}-${NAMES[i]}.png` });
        }
        await page.evaluate(() => scrollTo(0, 0));
        await wait(800);
      }
    }
    await page.screenshot({ path: `${OUT}/${vp.name}-${pg.name}-top.png` });

    await scrollThrough(page);
    const after = await page.evaluate((counts) => {
      const hidden = [...document.querySelectorAll("[data-anim]")].filter((el) => {
        const s = getComputedStyle(el);
        return s.visibility === "hidden" || parseFloat(s.opacity) < 0.99;
      });
      // Only letters you can see: hidden deck modules keep theirs rolled away on purpose.
      const stuckChars = [...document.querySelectorAll(".char")].filter((c) => c.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && getComputedStyle(c).transform !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(c).transform));
      const spill = [...document.querySelectorAll("h1, h2, h3, .btn, .project-desc")].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim().slice(0, 30));
      return {
        hidden: hidden.map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 40)),
        stuckChars: stuckChars.length,
        // innerWidth grows with the layout viewport on mobile; clientWidth is the real screen.
        overflow: Math.max(document.documentElement.scrollWidth, innerWidth) - document.documentElement.clientWidth,
        spill,
        counts: Object.fromEntries(Object.keys(counts).map((sel) => [sel, document.querySelectorAll(sel).length])),
        brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
        // A button whose background got overridden turns invisible on the light page.
        faintBtns: [...document.querySelectorAll(".btn")]
          .filter((b) => {
            const rgba = (c) => c.match(/[\d.]+/g).map(Number);
            const bg = rgba(getComputedStyle(b).backgroundColor);
            const fg = rgba(getComputedStyle(b).color);
            const lightBg = (bg[3] ?? 1) < 0.9 || (bg[0] > 200 && bg[1] > 200 && bg[2] > 200);
            const lightText = fg[0] > 160 && fg[1] > 160 && fg[2] > 160;
            // Faint = light text on a light/transparent background. Outline buttons use navy text.
            return lightBg && lightText;
          })
          .map((b) => b.textContent.trim()),
        // Logos should be icons, not long wordmarks. Wide icons (PHP, Cloudflare) sit
        // around 2:1; wordmarks like "Flutter" or "Go" are 2.7:1 and wider.
        wordmarks: [...document.querySelectorAll(".tech svg")]
          .filter((s) => { const r = s.getBoundingClientRect(); return r.width > r.height * 2.4; })
          .map((s) => s.closest(".tech").querySelector(".sr-only").textContent),
      };
    }, pg.counts);
    check(scope, after.hidden.length === 0, `every animated element ends visible${after.hidden.length ? ` (stuck: ${after.hidden.slice(0, 4).join(", ")})` : ""}`);
    check(scope, after.stuckChars === 0, `split-text letters settle (${after.stuckChars} stuck)`);
    check(scope, after.overflow <= 0, `no horizontal overflow (${after.overflow}px)`);
    check(scope, after.spill.length === 0, `text fits its boxes${after.spill.length ? ` (spilling: ${after.spill.join(" | ")})` : ""}`);
    check(scope, after.brokenImgs.length === 0, `all images load${after.brokenImgs.length ? ` (broken: ${after.brokenImgs.join(", ")})` : ""}`);
    check(scope, after.faintBtns.length === 0, `buttons are visible${after.faintBtns.length ? ` (faint: ${after.faintBtns.join(", ")})` : ""}`);
    check(scope, after.wordmarks.length === 0, `tech logos are icons${after.wordmarks.length ? ` (wordmarks: ${after.wordmarks.join(", ")})` : ""}`);
    for (const [sel, n] of Object.entries(pg.counts)) check(scope, after.counts[sel] === n, `${n} × ${sel} (${after.counts[sel]})`);

    await page.evaluate(() => scrollTo(0, 0));
    await wait(600);
    await page.screenshot({ path: `${OUT}/${vp.name}-${pg.name}-full.png`, fullPage: true });
    check(scope, errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 2).join(" | ")}` : ""}`);
    await page.close();
  }

  // Client-side navigation through the curtain transition.
  {
    const scope = `${vp.name} navigation`;
    console.log(`\n${scope}`);
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await wait(2400);
    if (vp.isMobile) {
      await page.click(".menu-btn");
      await wait(700);
      const shown = await page.evaluate(() => getComputedStyle(document.querySelector(".nav")).visibility === "visible");
      check(scope, shown, "menu opens");
      await page.screenshot({ path: `${OUT}/${vp.name}-menu.png` });
    }
    await page.click(".nav-list a[href='/projects']");
    await wait(450);
    const midway = await curtainClear(page);
    await page.screenshot({ path: `${OUT}/${vp.name}-transition.png` });
    await page.waitForURL("**/projects", { timeout: 5000 }).catch(() => {});
    await wait(2200);
    check(scope, !midway, "curtain covers the screen mid-transition");
    check(scope, page.url().endsWith("/projects"), `lands on /projects (${page.url()})`);
    check(scope, await curtainClear(page), "curtain lifts after navigating");
    const state = await page.evaluate(() => ({
      h1: document.querySelector("h1 .sr-only")?.textContent.trim(),
      h1Visible: [...document.querySelectorAll("h1 .char")].every((c) => getComputedStyle(c).transform === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(c).transform)),
      scrollY,
      active: document.querySelector(".nav-list a[aria-current='page']")?.textContent,
    }));
    check(scope, state.h1 === "Projects" && state.h1Visible, "new page heading animates in");
    check(scope, state.scrollY === 0, `starts at the top (${state.scrollY})`);
    check(scope, state.active === "Projects", `nav marks Projects active (${state.active})`);
    await page.close();
  }
  await context.close();
}

// Reduced motion: no curtain, everything readable immediately.
{
  const scope = "reduced motion";
  console.log(`\n${scope}`);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({
    motion: document.documentElement.classList.contains("motion-ok"),
    curtain: getComputedStyle(document.querySelector(".curtain")).display,
    hidden: [...document.querySelectorAll("[data-anim]")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
  }));
  check(scope, !r.motion && r.curtain === "none", "no curtain");
  check(scope, r.hidden === 0, `all content visible without scrolling (${r.hidden} hidden)`);
  await page.screenshot({ path: `${OUT}/reduced-home.png` });
  await context.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll checks passed. Screenshots in ${OUT}/`);
