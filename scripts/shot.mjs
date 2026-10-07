// SHOT_URL=http://localhost:3000 npm run shot
// Screenshots every page at desktop and mobile widths into shots/, and asserts
// the layout and animations hold up. Exits non-zero if any check fails.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOT_URL ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = "shots";
const PAGES = [
  { path: "/", name: "home", h1: "Rajendra Pandey", counts: { ".skill": 4, ".social": 7 } },
  { path: "/education", name: "education", h1: "Education", counts: { ".degree": 2, ".cert": 6, ".profile-link": 5 } },
  { path: "/experience", name: "experience", h1: "Experience", counts: { ".role": 2 } },
  { path: "/projects", name: "projects", h1: "Projects", counts: { ".project": 9 } },
  { path: "/contact", name: "contact", h1: "Contact Me", counts: { ".details dt": 3, ".social": 7 } },
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
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
      return { text: h1.innerText.replace(/\s+/g, " ").trim(), left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight };
    });
    check(scope, top.text === pg.h1, `h1 reads "${top.text}"`);
    check(scope, top.left >= 0 && top.right <= top.vw && top.top >= 0, "h1 is fully on screen");
    await page.screenshot({ path: `${OUT}/${vp.name}-${pg.name}-top.png` });

    await scrollThrough(page);
    const after = await page.evaluate((counts) => {
      const hidden = [...document.querySelectorAll("[data-anim]")].filter((el) => {
        const s = getComputedStyle(el);
        return s.visibility === "hidden" || parseFloat(s.opacity) < 0.99;
      });
      const stuckChars = [...document.querySelectorAll(".char")].filter((c) => getComputedStyle(c).transform !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(c).transform));
      const spill = [...document.querySelectorAll("h1, h2, h3, .btn, .project-desc")].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim().slice(0, 30));
      return {
        hidden: hidden.map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 40)),
        stuckChars: stuckChars.length,
        overflow: document.documentElement.scrollWidth - innerWidth,
        spill,
        counts: Object.fromEntries(Object.keys(counts).map((sel) => [sel, document.querySelectorAll(sel).length])),
        brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      };
    }, pg.counts);
    check(scope, after.hidden.length === 0, `every animated element ends visible${after.hidden.length ? ` (stuck: ${after.hidden.slice(0, 4).join(", ")})` : ""}`);
    check(scope, after.stuckChars === 0, `split-text letters settle (${after.stuckChars} stuck)`);
    check(scope, after.overflow <= 0, `no horizontal overflow (${after.overflow}px)`);
    check(scope, after.spill.length === 0, `text fits its boxes${after.spill.length ? ` (spilling: ${after.spill.join(" | ")})` : ""}`);
    check(scope, after.brokenImgs.length === 0, `all images load${after.brokenImgs.length ? ` (broken: ${after.brokenImgs.join(", ")})` : ""}`);
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
      h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim(),
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
