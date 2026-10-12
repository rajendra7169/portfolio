// SHOT_URL=http://localhost:3000 npm run shot
// SHOT_ONLY=/projects npm run shot   checks only the pages whose path starts with that
// Screenshots every page at desktop and mobile widths into shots/, and asserts
// the layout and animations hold up. Exits non-zero if any check fails.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOT_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = "shots";
const ALL_PAGES = [
  { path: "/", name: "home", h1: "Rajendra Pandey", counts: { ".wd-item": 4, ".social": 7 } },
  { path: "/education", name: "education", h1: "Education", counts: { ".ep-stop": 3, ".cv-card": 6, ".eh-arena-link": 5 } },
  { path: "/experience", name: "experience", h1: "Experience", counts: { ".xg-branch": 2, ".xg-commit": 12 } },
  { path: "/projects", name: "projects", h1: "Projects", counts: { ".project": 9 } },
  { path: "/contact", name: "contact", h1: "Contact Me", counts: { ".ch-row": 3, ".ch-blip": 7, ".cm-topic": 6 } },
];
const PAGES = ALL_PAGES.filter((p) => !process.env.SHOT_ONLY || p.path.startsWith(process.env.SHOT_ONLY));
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
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });

  for (const pg of PAGES) {
    const scope = `${vp.name} ${pg.path}`;
    console.log(`\n${scope}`);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Headless Chrome has no email app, so following a mailto: link logs an error; that one is expected.
    page.on("console", (m) => {
      if (m.type() === "error" && !/mailto:/.test(m.text())) errors.push(m.text());
      // A GSAP "target not found" means an animation points at a class that isn't rendered.
      if (m.type() === "warning" && /GSAP target .* not found/.test(m.text())) errors.push(m.text());
    });

    const res = await page.goto(BASE + pg.path, { waitUntil: "networkidle" });
    check(scope, res?.ok(), `loads (${res?.status()})`);
    await page.evaluate(() => document.fonts.ready);
    await wait(2600); // first entrance animations

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
      await wait(2200); // the hero intro
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

    if (pg.name === "education") {
      await wait(1600); // intro + automatic cap toss
      const eh = await page.evaluate(() => ({
        title: document.querySelector(".eh-title-text").textContent,
        counts: [...document.querySelectorAll(".eh-count")].every((c) => c.textContent === c.dataset.to),
        inner: getComputedStyle(document.querySelector(".eh-inner")).opacity,
      }));
      check(scope, eh.inner === "1" && eh.title === "Education", `education hero decodes ("${eh.title}")`);
      check(scope, eh.counts, "education counters land on their values");
      await page.locator(".eh-toss").scrollIntoViewIfNeeded();
      const toss = await page.locator(".eh-toss").boundingBox();
      await page.mouse.click(toss.x + toss.width / 2, toss.y + toss.height / 2);
      await wait(1150);
      const flying = await page.evaluate(() => [...document.querySelectorAll(".eh-confetti i")].filter((c) => parseFloat(getComputedStyle(c).opacity) > 0.5).length);
      await page.screenshot({ path: `${OUT}/${vp.name}-edu-toss.png` });
      check(scope, flying > 20, `cap toss fires confetti (${flying} pieces in the air)`);

      const STAMPS = ["2017", "2024", "Dec 2024"];
      const YEARS = ["2015", "2021", "2024"];
      if (!vp.isMobile) {
        const rail = await page.evaluate(() => document.querySelector(".ep").classList.contains("is-rail") && !!document.querySelector(".pin-spacer .ep-viewport"));
        check(scope, rail, "degrees path is a pinned horizontal rail");
        for (let i = 0; i < 3; i++) {
          await page.evaluate((i) => {
            const vpEl = document.querySelector(".ep-viewport");
            const spacer = vpEl.parentElement;
            const track = document.querySelector(".ep-track");
            const stop = document.querySelectorAll(".ep-stop")[i];
            const distance = track.scrollWidth - innerWidth;
            const centre = stop.getBoundingClientRect().left - track.getBoundingClientRect().left + stop.offsetWidth / 2;
            const p = Math.max(0, (centre - innerWidth / 2) / distance);
            const top = spacer.getBoundingClientRect().top + scrollY;
            scrollTo(0, top + p * (spacer.offsetHeight - innerHeight));
          }, i);
          await wait(2000);
          const st = await page.evaluate((i) => {
            const card = document.querySelectorAll(".ep-card")[i];
            const r = card.getBoundingClientRect();
            const line = document.querySelector(".ep-line").getBoundingClientRect();
            const rider = document.querySelector(".ep-rider").getBoundingClientRect();
            const stamp = card.querySelector(".ep-stamp-in");
            return {
              stamp: getComputedStyle(stamp).opacity,
              stampText: stamp.querySelector("b").textContent,
              year: document.querySelector(".ep-year").textContent,
              fits: r.top >= 0 && r.bottom <= line.top + 30 && r.left >= 0 && r.right <= innerWidth,
              rect: `card ${Math.round(r.top)}–${Math.round(r.bottom)}, line at ${Math.round(line.top)}`,
              riderCentred: Math.abs(rider.left + rider.width / 2 - innerWidth / 2) < 4,
              // The stamp must not land on his text.
              stampClear: (() => {
                const a = stamp.getBoundingClientRect();
                const b = card.querySelector(".ep-points").getBoundingClientRect();
                return a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom;
              })(),
            };
          }, i);
          check(scope, st.stamp === "1" && st.stampText === STAMPS[i], `stop ${i + 1}: stamp "${st.stampText}" has landed`);
          check(scope, st.year === YEARS[i], `stop ${i + 1}: year counter reads ${st.year}`);
          check(scope, st.fits, `stop ${i + 1}: card fits above the path (${st.rect})`);
          check(scope, st.riderCentred, `stop ${i + 1}: rider rides the centre of the path`);
          check(scope, st.stampClear, `stop ${i + 1}: stamp clears the text`);
          await page.screenshot({ path: `${OUT}/${vp.name}-edu-stop-${i + 1}.png` });
        }
      } else {
        for (let i = 0; i < 3; i++) {
          await page.locator(".ep-card").nth(i).evaluate((c) => c.scrollIntoView({ block: "start" }));
          await page.evaluate(() => scrollBy(0, -120));
          await wait(1400);
          const stamp = await page.evaluate((i) => getComputedStyle(document.querySelectorAll(".ep-stamp-in")[i]).opacity, i);
          check(scope, stamp === "1", `stop ${i + 1}: stamp lands on arrival`);
        }
        await page.screenshot({ path: `${OUT}/${vp.name}-edu-stop.png` });
      }

      // The vault: cards dealt into place, and a click flips one.
      await page.locator(".cv-grid").scrollIntoViewIfNeeded();
      await wait(2600);
      const dealt = await page.evaluate(() =>
        [...document.querySelectorAll(".cv-card")].every((c) => {
          // Settled = fully visible, unrotated, unscaled, and within a pixel of its slot.
          const m = new DOMMatrixReadOnly(getComputedStyle(c).transform === "none" ? undefined : getComputedStyle(c).transform);
          return getComputedStyle(c).opacity === "1" && Math.abs(m.a - 1) < 0.01 && Math.abs(m.b) < 0.01 && Math.abs(m.e) < 1 && Math.abs(m.f) < 1;
        }),
      );
      check(scope, dealt, "all six certificate cards are dealt into place");
      await page.locator(".cv-flip").first().click();
      await wait(1100);
      const flipped = await page.evaluate(() => {
        const card = document.querySelector(".cv-card");
        return card.classList.contains("is-flipped") && card.querySelector(".cv-flip").getAttribute("aria-pressed") === "true";
      });
      await page.screenshot({ path: `${OUT}/${vp.name}-edu-vault.png` });
      check(scope, flipped, "clicking a certificate flips it");
      await page.locator(".cv-flip").first().click();
      await page.evaluate(() => scrollTo(0, 0));
      await wait(800);
    }

    if (pg.name === "experience") {
      await wait(1800); // intro + the badge settling
      const xh = await page.evaluate(() => {
        const b = document.querySelector(".xh-badge").getBoundingClientRect();
        return {
          title: document.querySelector(".xh-title-text").textContent,
          counts: [...document.querySelectorAll(".xh-count")].every((c) => c.textContent === c.dataset.to),
          badgeOn: b.left >= 0 && b.right <= innerWidth && b.width > 150,
          hintClear: b.bottom <= document.querySelector(".xh-hint").getBoundingClientRect().top + 2,
        };
      });
      check(scope, xh.title === "Experience", `experience hero decodes ("${xh.title}")`);
      check(scope, xh.counts, "experience counters land on their values");
      check(scope, xh.badgeOn, "the ID badge hangs on screen");
      check(scope, xh.hintClear, "the badge clears the hint below it");
      if (vp.isMobile) {
        // On a phone the lanyard is screen-tall, so a scroll's kick must stay small:
        // the card stays below the buttons and on screen through a quick flick.
        const swing = await page.evaluate(async () => {
          const badge = document.querySelector(".xh-badge");
          const ctas = document.querySelector(".xh-ctas");
          let ok = true;
          let maxShift = 0;
          const rest = badge.getBoundingClientRect().left;
          for (let i = 0; i < 40; i++) {
            if (i < 8) scrollTo(0, i * 60);
            else if (i < 16) scrollTo(0, (15 - i) * 60);
            await new Promise((r) => setTimeout(r, 40));
            const b = badge.getBoundingClientRect();
            ok &&= b.top >= ctas.getBoundingClientRect().bottom && b.left >= -2 && b.right <= innerWidth + 2;
            maxShift = Math.max(maxShift, Math.abs(b.left - rest));
          }
          scrollTo(0, 0);
          return { ok, maxShift: Math.round(maxShift) };
        });
        check(scope, swing.ok, `on a phone the card stays below the buttons while it swings (moves ${swing.maxShift}px at most)`);
      }
      const lan = await page.evaluate(() => ({
        top: document.querySelector(".xh-strap-a").getBoundingClientRect().top,
        below: document.querySelector(".xh-anchor").getBoundingClientRect().top - document.querySelector(".xh-ctas").getBoundingClientRect().bottom,
        ink: getComputedStyle(document.querySelector(".xh-ink")).clipPath,
        head: getComputedStyle(document.querySelector(".header-ink")).clipPath,
      }));
      if (vp.isMobile) check(scope, lan.below >= 0 && lan.below < 60, `on a phone the strap starts just below the buttons (${Math.round(lan.below)}px under them)`);
      else check(scope, lan.top <= 1, `the lanyard hangs from the top of the screen (${Math.round(lan.top)}px)`);
      check(scope, lan.ink.startsWith("polygon") && lan.head.startsWith("polygon"), "text the lanyard passes behind turns light (ink clipped to the strap)");

      const rot = () => page.evaluate(() => { const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".xh-swing")).transform); return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI); });
      if (!vp.isMobile) {
        // Grab the badge and fling it sideways: it swings, then settles near centre without flipping.
        await page.locator(".xh-badge").evaluate((b) => b.scrollIntoView({ block: "center" })); // it sways, so never "stable"
        await wait(400);
        const b = await page.locator(".xh-badge").boundingBox();
        await page.mouse.move(b.x + b.width / 2, b.y + b.height * 0.7);
        await page.mouse.down();
        await page.mouse.move(b.x + b.width / 2 + 220, b.y + b.height * 0.6, { steps: 12 });
        const held = await rot();
        await page.screenshot({ path: `${OUT}/${vp.name}-exp-drag.png` });
        await page.mouse.up();
        await wait(3200);
        const settled = await rot();
        const flippedByDrag = await page.evaluate(() => document.querySelector(".xh").classList.contains("is-flipped"));
        check(scope, Math.abs(held) > 15, `dragging swings the badge (${held}°)`);
        check(scope, Math.abs(settled) <= 4, `the badge settles back (${settled}°)`);
        check(scope, !flippedByDrag, "a drag does not flip the badge");
      }
      // The badge never stops swaying, so click where it is rather than waiting for it to be "stable".
      const clickBadge = async () => {
        const bb = await page.locator(".xh-badge").boundingBox();
        await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height * 0.6);
      };
      await page.locator(".xh-badge").evaluate((b) => b.scrollIntoView({ block: "center" }));
      await wait(400);
      await clickBadge();
      await wait(1100);
      const flipped = await page.evaluate(() => document.querySelector(".xh").classList.contains("is-flipped") && document.querySelector(".xh-badge").getAttribute("aria-pressed") === "true");
      await page.screenshot({ path: `${OUT}/${vp.name}-exp-badge-back.png` });
      check(scope, flipped, "clicking the badge flips it to the Blazify pass");
      await clickBadge();

      // The git graph: every commit dot sits on its lane line.
      await page.locator(".xg-graph").scrollIntoViewIfNeeded();
      await wait(600);
      const onLines = await page.evaluate(() => {
        const svg = document.querySelector(".xg-svg").getBoundingClientRect();
        const lanes = { main: ".xg-lane--main", side: ".xg-lane--side", blazify: ".xg-lane--blazify" };
        return [...document.querySelectorAll(".xg-commit")].every((row) => {
          const lane = Object.keys(lanes).find((l) => row.classList.contains(`xg-commit--${l}`));
          const path = document.querySelector(lanes[lane]);
          const dot = row.querySelector(".xg-dot").getBoundingClientRect();
          const cx = dot.left + dot.width / 2 - svg.left;
          const cy = dot.top + dot.height / 2 - svg.top;
          // Nearest point on the path to the dot centre.
          const len = path.getTotalLength();
          let best = Infinity;
          for (let d = 0; d <= len; d += 2) {
            const p = path.getPointAtLength(d);
            best = Math.min(best, Math.hypot(p.x - cx, p.y - cy));
          }
          return best < 3;
        });
      });
      check(scope, onLines, "every commit dot sits on its branch line");

      const rows = await page.locator(".xg-commit").count();
      for (const i of [0, 6, rows - 1]) {
        // Centre the row on the "in view" line (58%), or scroll as far as the page allows.
        await page.locator(".xg-commit").nth(i).evaluate((r) => { const b = r.getBoundingClientRect(); scrollTo(0, b.top + scrollY + b.height / 2 - innerHeight * 0.58); });
        await wait(1500);
        const g = await page.evaluate((i) => {
          const row = document.querySelectorAll(".xg-commit")[i];
          const show = document.querySelectorAll(".xg-show")[i];
          const ptr = document.querySelector(".xg-ptr").getBoundingClientRect();
          return {
            rowIn: getComputedStyle(row.querySelector(".xg-c-msg")).opacity === "1",
            termOn: show.classList.contains("is-on"),
            termVisible: getComputedStyle(document.querySelector(".xg-term")).display !== "none",
            textShown: row.querySelector(".xg-c-text").getBoundingClientRect().width > 50,
            ptrBelow: ptr.top > row.getBoundingClientRect().top - 40,
          };
        }, i);
        check(scope, g.rowIn, `commit ${i + 1} lands as the graph reaches it`);
        check(scope, g.ptrBelow, `HEAD has travelled down to commit ${i + 1}`);
        if (vp.isMobile) check(scope, !g.termVisible && g.textShown, `commit ${i + 1} shows its text inline (no terminal on phones)`);
        else check(scope, g.termVisible && g.termOn, `terminal runs git show for commit ${i + 1}`);
        await page.screenshot({ path: `${OUT}/${vp.name}-exp-log-${i + 1}.png` });
      }
      await page.evaluate(() => scrollTo(0, 0));
      await wait(800);
    }

    if (pg.name === "contact") {
      await wait(1600);
      const chState = await page.evaluate(async () => {
        const stage = document.querySelector(".ch-stage");
        const read = () => ({ on: stage.dataset.on, name: document.querySelector(".cc-hand-name").textContent, cc: getComputedStyle(stage).getPropertyValue("--cc").trim() });
        const a = read();
        // The hand ticks round by itself to the next channel (within a few seconds of the intro).
        let b = read();
        for (let t = 0; t < 40 && b.on === a.on; t++) {
          await new Promise((r) => setTimeout(r, 200));
          b = read();
        }
        return { title: document.querySelector(".ch-title-text").textContent, a, b };
      });
      check(scope, chState.title === "Contact Me", `contact hero decodes ("${chState.title}")`);
      const rowsFit = await page.evaluate(() => [...document.querySelectorAll(".ch-copy")].every((b) => b.getBoundingClientRect().right <= innerWidth));
      check(scope, rowsFit, "every copy button is on screen");
      check(scope, chState.a.on !== chState.b.on && chState.a.name !== chState.b.name, `the clock's hand ticks to the next channel (${chState.a.name} → ${chState.b.name})`);
      // Each channel, reached from the keyboard, swings the hand to it, paints its
      // name on the hand and gives the clock its colour.
      const marks = await page.evaluate(async () => {
        const out = [];
        for (const m of document.querySelectorAll(".cc-mark")) {
          m.focus();
          await new Promise((r) => setTimeout(r, 120));
          const stage = document.querySelector(".ch-stage");
          out.push(stage.dataset.on === m.dataset.i && document.querySelector(".cc-hand-name").textContent === m.dataset.name && document.querySelector(".cc-now").href === m.href && stage.style.getPropertyValue("--cc") === m.dataset.c);
        }
        document.activeElement.blur();
        return out;
      });
      check(scope, marks.length === 7 && marks.every(Boolean), `every channel can be pointed at, and themes the clock (${marks.filter(Boolean).length}/7)`);
      await page.screenshot({ path: `${OUT}/${vp.name}-contact-clock.png` });

      // Copy the email address.
      await page.locator(".ch-copy").first().click();
      await wait(200);
      const copied = await page.evaluate(async () => ({
        label: document.querySelector(".ch-copy").textContent,
        clip: await navigator.clipboard.readText().catch(() => ""),
      }));
      check(scope, copied.label.startsWith("Copied") && copied.clip === "rajendrapandey199971@gmail.com", `copy puts the email on the clipboard ("${copied.clip}")`);

      // The composer: an empty send is refused...
      await page.locator(".cm-card").scrollIntoViewIfNeeded();
      await wait(500);
      await page.locator(".cm-send").click();
      await wait(300);
      const refused = await page.evaluate(() => ({
        error: document.querySelector(".cm-error").textContent,
        flying: getComputedStyle(document.querySelector(".cm-flight")).visibility === "visible",
      }));
      check(scope, refused.error.length > 0 && !refused.flying, `an empty message is refused ("${refused.error}")`);

      // ...a real one shows on the phone as it's written, folds into a plane, flies
      // into the phone's inbox, then opens the email app.
      await page.locator(".cm-topic", { hasText: "React" }).click();
      await page.locator(".cm-field input").fill("Test Visitor");
      await page.locator(".cm-field textarea").fill("Hello Rajendra, can we talk about a React project?");
      await wait(200);
      const draft = await page.evaluate(() => document.querySelector(".ib-mail--draft")?.textContent ?? "");
      check(scope, draft.includes("Test Visitor") && draft.includes("React"), "the phone shows the message as it's written");
      await page.locator(".cm-send").click();
      await wait(1500);
      const mid = await page.evaluate(() => ({
        flying: getComputedStyle(document.querySelector(".cm-flight")).visibility === "visible",
        plane: parseFloat(getComputedStyle(document.querySelector(".cm-plane")).opacity),
        // Fixed to the viewport: the plane must be somewhere on screen mid-flight.
        onScreen: (() => {
          const r = document.querySelector(".cm-plane").getBoundingClientRect();
          return r.left + r.width / 2 > 0 && r.left + r.width / 2 < innerWidth && r.top + r.height / 2 > -60 && r.top + r.height / 2 < innerHeight;
        })(),
      }));
      await page.screenshot({ path: `${OUT}/${vp.name}-contact-flight.png` });
      check(scope, mid.flying && mid.plane > 0.5, "the message flies as a paper plane");
      check(scope, mid.onScreen, "the plane is on screen mid-flight");
      await wait(3400); // on a phone it scrolls up to the inbox first
      const done = await page.evaluate(() => ({
        landed: getComputedStyle(document.querySelector(".cm-check")).opacity === "1" && (document.querySelector(".ib-mail--new")?.textContent ?? "").includes("Test Visitor"),
        overlayGone: getComputedStyle(document.querySelector(".cm-flight")).visibility === "hidden",
        mailto: document.querySelector(".cm-form-wrap").dataset.mailto ?? "",
      }));
      await page.screenshot({ path: `${OUT}/${vp.name}-contact-landed.png` });
      const decoded = decodeURIComponent(done.mailto);
      check(scope, done.landed && done.overlayGone, "it lands in the phone's inbox, delivered");
      check(
        scope,
        decoded.startsWith("mailto:rajendrapandey199971@gmail.com?subject=Portfolio message · React — from Test Visitor") && decoded.includes("can we talk about a React project?"),
        "the email opens pre-filled with topic, name and message",
      );
      // Following the mailto: link leaves headless Chrome on an error page; come back.
      await page.goto(BASE + pg.path, { waitUntil: "networkidle" });
      await wait(2600);
    }


    if (pg.name === "projects") {
      await wait(2200); // the launcher intro
      const pl = () =>
        page.evaluate(() => {
          const shown = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && parseFloat(getComputedStyle(e).opacity) > 0.99);
          return {
            title: document.querySelector(".pl-title-text").textContent,
            inner: getComputedStyle(document.querySelector(".pl-inner")).opacity,
            os: document.querySelector(".dv-laptop").dataset.os,
            desk: shown(".pl-icons .pl-app").map((a) => a.dataset.slug),
            phone: shown(".pl-grid .pl-app").length,
            peeks: shown(".pl-peek").map((a) => a.dataset.slug),
          };
        });
      const a = await pl();
      check(scope, a.inner === "1" && a.title === "Projects", `launcher decodes its title ("${a.title}")`);
      check(scope, a.os === "windows" && a.desk.join() === "blazify,nexterm,tally,r-ai,vocabu", `the laptop starts on Windows with its apps (${a.desk.join(", ")})`);
      check(scope, a.phone === 5, `5 apps on the Android phone (${a.phone})`);
      await page.screenshot({ path: `${OUT}/${vp.name}-projects-launcher.png` });
      if (!vp.isMobile) {
        await page.hover('.pl-icons .pl-app[data-slug="blazify"]');
        await wait(700);
        check(scope, (await pl()).peeks.join() === "blazify", "hovering an app peeks at its window");
        const twin = await page.evaluate(() => ({ n: document.querySelectorAll(".pl-app.is-twin").length, text: document.querySelector(".pl-twin-text").textContent }));
        check(scope, twin.n === 4 && twin.text.endsWith("lit on 3 devices"), `the same app lights up on every device ("${twin.text}")`);
        await page.screenshot({ path: `${OUT}/${vp.name}-projects-peek.png` });
        await page.mouse.move(10, 10);
      }
      await page.click('.pl-os-btn[data-os="linux"]');
      await wait(2000);
      const b = await pl();
      check(scope, b.os === "linux" && b.desk.join() === "blazify,jarvis,tally,r-ai", `switching to Linux swaps the apps (${b.desk.join(", ")})`);
      await page.screenshot({ path: `${OUT}/${vp.name}-projects-linux.png` });
      // Open an app: it grows out of its icon on that device, then the page follows.
      // Phones open Fitevo on the Galaxy; bigger screens open Blazify from the iPhone's lock screen.
      const [dev, slug, sel] = vp.isMobile ? [".pl-dev--android", "fitevo", '.pl-grid .pl-app[data-slug="fitevo"]'] : [".pl-dev--iphone", "blazify", ".pl-media"];
      await page.click(sel);
      await wait(400);
      const mid = await page.evaluate(([dev, slug]) => parseFloat(getComputedStyle(document.querySelector(`${dev} .pl-open[data-slug="${slug}"]`)).opacity), [dev, slug]);
      check(scope, mid > 0.2, `${slug} opens out of its icon on the ${dev.slice(8)} (opacity ${mid.toFixed(2)})`);
      await page.screenshot({ path: `${OUT}/${vp.name}-projects-launch.png` });
      await page.waitForURL(`**/projects/${slug}`, { timeout: 6000 }).catch(() => {});
      check(scope, page.url().endsWith(`/projects/${slug}`), `then lands on its page (${page.url()})`);
      await page.goto(BASE + pg.path, { waitUntil: "networkidle" });
      await wait(2600);

    if (pg.world) {
      await wait(2400); // the world's intro
      const w = await page.evaluate((pg) => ({
        root: !!document.querySelector(`[data-world="${pg.world}"]`),
        h1: document.querySelector("h1")?.textContent ?? "",
        next: !!document.querySelector(`a[href="/projects/${pg.next}"]`),
      }), pg);
      check(scope, w.root && w.h1.includes(pg.h1), `${pg.h1} opens in its own world (h1 "${w.h1.trim().slice(0, 40)}")`);
      check(scope, w.next, `its last link leads on to ${pg.next}`);
      await page.screenshot({ path: `${OUT}/${vp.name}-${pg.name}-hero.png` });

    }

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
        // The Experience hero's white ink copy is meant to be light; it only shows over the lanyard.
        faintBtns: [...document.querySelectorAll(".btn")].filter((b) => !b.closest(".xh-ink"))
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
    // Once scrolled through, every scroll-driven piece of a world has played to its end.
    if (pg.world) {
      await wait(1500); // phones play some of these once, on a timer, after they scroll in
      const end = await page.evaluate((name) => {
        const vis = (s) => [...document.querySelectorAll(s)].filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.99).length;
        if (name === "fitevo") return { ok: document.querySelectorAll(".fv-medal.is-locked").length === 0, what: "all 11 badges unlock" };
        if (name === "tally") {
          const past = document.querySelectorAll(".tl-cal li.is-past").length;
          const score = document.querySelector(".tl-score").textContent;
          return { ok: (past === 28 || !document.querySelector(".tl-month.is-live")) && score === "84", what: `the month grows all its trees (${past} days, health ${score}%)` };
        }
        if (name === "vocabu") return { ok: vis(".vc-found-list li") === 11, what: `the scanned page's words are all looked up (${vis(".vc-found-list li")})` };
        if (name === "jarvis") return { ok: vis(".jv-tele > div") === 7, what: "the boot telemetry is all on screen" };
        return null;
      }, pg.name);
      if (end) check(scope, end.ok, end.what);
    }

    await page.evaluate(() => scrollTo(0, 0));
    await wait(600);
    await page.screenshot({ path: `${OUT}/${vp.name}-${pg.name}-full.png`, fullPage: true });
    // Toggling reduced motion reverts and re-runs every gsap.matchMedia context —
    // the moment a context cycle would recurse forever. Any error shows up below.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await wait(500);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await wait(500);
    check(scope, errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 2).join(" | ")}` : ""}`);
    await page.close();
  }

  // Client-side navigation through the page transition.
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

// Reduced motion: no transition, everything readable immediately.
{
  const scope = "reduced motion";
  console.log(`\n${scope}`);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({
    motion: document.documentElement.classList.contains("motion-ok"),
    overlay: Boolean(document.querySelector(".curtain")),
    hidden: [...document.querySelectorAll("[data-anim]")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
  }));
  check(scope, !r.motion && !r.overlay, "no motion, no overlay");
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
