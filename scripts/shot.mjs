// SHOT_URL=http://localhost:3000 npm run shot
// Screenshots every page at desktop and mobile widths into shots/, and asserts
// the layout and animations hold up. Exits non-zero if any check fails.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOT_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = "shots";
const PAGES = [
  { path: "/", name: "home", h1: "Rajendra Pandey", counts: { ".wd-item": 4, ".social": 7 } },
  { path: "/education", name: "education", h1: "Education", counts: { ".ep-stop": 3, ".cv-card": 6, ".eh-arena-link": 5 } },
  { path: "/experience", name: "experience", h1: "Experience", counts: { ".xg-branch": 2, ".xg-commit": 12 } },
  { path: "/projects", name: "projects", h1: "Projects", counts: { ".project": 9 } },
  { path: "/contact", name: "contact", h1: "Contact Me", counts: { ".ch-row": 3, ".ch-blip": 7, ".cm-topic": 6 } },
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
        const sweep = document.querySelector(".ch-sweep");
        const angle = () => { const m = new DOMMatrixReadOnly(getComputedStyle(sweep).transform); return Math.atan2(m.b, m.a); };
        const a1 = angle();
        await new Promise((r) => setTimeout(r, 400));
        const a2 = angle();
        // Watch the blips for one full turn of the beam.
        const pinged = new Set();
        const obs = new MutationObserver((ms) => ms.forEach((m) => m.target.classList.contains("is-ping") && pinged.add(m.target.getAttribute("aria-label"))));
        document.querySelectorAll(".ch-blip").forEach((b) => obs.observe(b, { attributes: true, attributeFilter: ["class"] }));
        await new Promise((r) => setTimeout(r, 4600));
        obs.disconnect();
        return {
          title: document.querySelector(".ch-title-text").textContent,
          turning: Math.abs(a2 - a1) > 0.05,
          pinged: pinged.size,
          avatar: getComputedStyle(document.querySelector(".ch-avatar-img")).transform,
        };
      });
      check(scope, chState.title === "Contact Me", `contact hero decodes ("${chState.title}")`);
      const rowsFit = await page.evaluate(() => [...document.querySelectorAll(".ch-copy")].every((b) => b.getBoundingClientRect().right <= innerWidth));
      check(scope, rowsFit, "every copy button is on screen");
      check(scope, chState.turning, "the radar beam sweeps");
      check(scope, chState.pinged === 7, `every channel pings as the beam passes (${chState.pinged}/7)`);
      await page.screenshot({ path: `${OUT}/${vp.name}-contact-radar.png` });

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

      // ...a real one folds into a plane, flies to the envelope, then opens the email app.
      await page.locator(".cm-topic", { hasText: "React" }).click();
      await page.locator(".cm-field input").fill("Test Visitor");
      await page.locator(".cm-field textarea").fill("Hello Rajendra, can we talk about a React project?");
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
      await wait(2600);
      const done = await page.evaluate(() => ({
        landed: getComputedStyle(document.querySelector(".cm-check")).opacity === "1",
        overlayGone: getComputedStyle(document.querySelector(".cm-flight")).visibility === "hidden",
        mailto: document.querySelector(".cm-form-wrap").dataset.mailto ?? "",
      }));
      await page.screenshot({ path: `${OUT}/${vp.name}-contact-landed.png` });
      const decoded = decodeURIComponent(done.mailto);
      check(scope, done.landed && done.overlayGone, "it lands on the envelope with a check");
      check(
        scope,
        decoded.startsWith("mailto:rajendrapandey199971@gmail.com?subject=Portfolio message · React — from Test Visitor") && decoded.includes("can we talk about a React project?"),
        "the email opens pre-filled with topic, name and message",
      );
      // Following the mailto: link leaves headless Chrome on an error page; come back.
      await page.goto(BASE + pg.path, { waitUntil: "networkidle" });
      await wait(2600);
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
    // Toggling reduced motion reverts and re-runs every gsap.matchMedia context —
    // the moment a context cycle would recurse forever. Any error shows up below.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await wait(500);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await wait(500);
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
