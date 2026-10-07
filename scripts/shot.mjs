// SHOT_URL=http://localhost:3000 npm run shot
// Screenshots every section at desktop and mobile widths into shots/, and
// asserts the layout holds. Exits non-zero if any check fails.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const URL = process.env.SHOT_URL ?? "http://localhost:3000";
const OUT = "shots";
const SECTIONS = ["top", "lyrics", "craft", "work", "path", "contact"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1100, height: 720 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

const failures = [];
const check = (vp, ok, msg) => {
  console.log(`  ${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failures.push(`[${vp}] ${msg}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name} ${vp.width}×${vp.height}`);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.isMobile ?? false,
    hasTouch: vp.hasTouch ?? false,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const res = await page.goto(URL, { waitUntil: "networkidle" });
  check(vp.name, res?.ok(), `page loads (${res?.status()})`);
  await page.evaluate(() => document.fonts.ready);
  await wait(2600); // let the intro finish

  // Hero
  const hero = await page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect().toJSON();
    // Measure the letters themselves: a flex line box clamps to its container
    // even when the glyphs inside spill past it.
    const ink = (s) => {
      const g = [...document.querySelectorAll(`${s} .glyph`)].map((e) => e.getBoundingClientRect());
      return { left: g[0].left, right: g.at(-1).right, width: g.at(-1).right - g[0].left };
    };
    const name = document.querySelector(".hero-name");
    return {
      name: r(".hero-name"),
      lineA: ink(".hero-line--a"),
      lineB: ink(".hero-line--b"),
      foot: r(".hero-foot"),
      meta: r(".hero-meta"),
      visible: name && getComputedStyle(name).visibility === "visible" && getComputedStyle(name).opacity === "1",
      font: name && getComputedStyle(name).fontFamily,
      vw: innerWidth,
      vh: innerHeight,
      gutter: parseFloat(getComputedStyle(document.querySelector(".hero")).paddingLeft),
    };
  });
  check(vp.name, hero.visible, "hero name is visible after intro");
  check(vp.name, /archivo/i.test(hero.font ?? ""), `hero uses the display face (${hero.font?.split(",")[0]})`);
  check(vp.name, hero.lineA.left >= hero.gutter - 2 && hero.lineA.right <= hero.vw - hero.gutter + 2, `RAJENDRA fits inside the gutters (${hero.lineA.left.toFixed(0)}–${hero.lineA.right.toFixed(0)} of ${hero.vw})`);
  check(vp.name, hero.lineA.width >= (hero.vw - 2 * hero.gutter) * 0.9, `RAJENDRA fills ≥90% of content width (${((hero.lineA.width / (hero.vw - 2 * hero.gutter)) * 100).toFixed(0)}%)`);
  check(vp.name, hero.lineB.right <= hero.vw - hero.gutter + 2, "PANDEY stays inside the right gutter");
  check(vp.name, hero.meta.bottom <= hero.name.top + 1, "hero meta sits above the name");
  check(vp.name, hero.name.bottom <= hero.foot.top + 1, "hero name does not overlap the intro copy");
  check(vp.name, hero.foot.bottom <= hero.vh - 56 + 1, `hero copy clears the transport bar (${hero.foot.bottom.toFixed(0)} ≤ ${hero.vh - 56})`);
  await page.screenshot({ path: `${OUT}/${vp.name}-01-top.png` });

  // Global chrome
  const chrome = await page.evaluate(() => {
    const t = document.querySelector(".transport").getBoundingClientRect();
    const n = document.querySelector(".nav").getBoundingClientRect();
    return { tBottom: t.bottom, nTop: n.top, vh: innerHeight };
  });
  check(vp.name, Math.abs(chrome.tBottom - chrome.vh) < 1, "transport bar is pinned to the bottom");
  check(vp.name, chrome.nTop === 0, "nav is pinned to the top");

  const counts = await page.evaluate((ids) => ({
    missing: ids.filter((id) => !document.getElementById(id)),
    cards: document.querySelectorAll(".card").length,
    releases: document.querySelectorAll(".release").length,
    certs: document.querySelectorAll(".cert").length,
    stops: document.querySelectorAll(".stop").length,
  }), SECTIONS);
  check(vp.name, counts.missing.length === 0, `all sections render${counts.missing.length ? ` (missing ${counts.missing})` : ""}`);
  check(vp.name, counts.cards === 5 && counts.releases === 3, `5 project cards + 3 Blazify releases (${counts.cards} + ${counts.releases})`);
  const spill = await page.evaluate(() =>
    [...document.querySelectorAll(".card-name, .feature-name, .craft-name, .contact-head")]
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.textContent.trim()),
  );
  check(vp.name, spill.length === 0, `headings fit their boxes${spill.length ? ` (spilling: ${spill.join(", ")})` : ""}`);
  check(vp.name, counts.certs === 6 && counts.stops === 5, `6 certifications + 5 timeline stops (${counts.certs} + ${counts.stops})`);

  // Walk every section, screenshot it, and check nothing spills sideways.
  for (const [i, id] of SECTIONS.entries()) {
    if (id === "top") continue;
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      const box = el.parentElement.classList.contains("pin-spacer") ? el.parentElement : el;
      window.scrollTo(0, box.getBoundingClientRect().top + window.scrollY);
    }, id);
    await wait(1400);
    await page.screenshot({ path: `${OUT}/${vp.name}-0${i + 1}-${id}.png` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(vp.name, overflow <= 0, `no horizontal overflow at #${id} (${overflow}px)`);
  }

  // Projects rail: on desktop it slides; cards should travel across the viewport.
  if (!vp.isMobile) {
    const shift = await page.evaluate(async () => {
      const wrap = document.querySelector(".rail-wrap");
      const box = wrap.parentElement.classList.contains("pin-spacer") ? wrap.parentElement : wrap;
      const top = box.getBoundingClientRect().top + scrollY;
      scrollTo(0, top + 10);
      await new Promise((r) => setTimeout(r, 900));
      const before = document.querySelector(".card:last-child").getBoundingClientRect().left;
      scrollTo(0, top + box.offsetHeight - innerHeight - 10);
      await new Promise((r) => setTimeout(r, 1400));
      const card = document.querySelector(".card:last-child");
      const last = card.getBoundingClientRect();
      // Hit-test just inside the card's right edge: catches clipping by a parent, not just geometry.
      const hit = document.elementFromPoint(last.right - 6, last.top + last.height / 2);
      return { before, after: last.left, right: last.right, vw: innerWidth, visible: card.contains(hit) };
    });
    check(vp.name, shift.after < shift.before - 100, `project rail scrolls sideways (${shift.before.toFixed(0)} → ${shift.after.toFixed(0)})`);
    check(vp.name, shift.right <= shift.vw + 2 && shift.visible, `last project card is fully visible at the end (right edge ${shift.right.toFixed(0)}, ${shift.visible ? "not clipped" : "clipped"})`);
    await page.screenshot({ path: `${OUT}/${vp.name}-04b-rail-end.png` });
  }

  // Transport follows the page to the end.
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await wait(1200);
  const t = await page.evaluate(() => ({
    no: document.querySelector(".t-no").textContent,
    elapsed: document.querySelector(".t-elapsed").textContent,
  }));
  check(vp.name, t.no === "TRK 06", `transport shows the last track at the end (${t.no})`);
  check(vp.name, t.elapsed !== "00:00", `transport time advances (${t.elapsed})`);
  await page.screenshot({ path: `${OUT}/${vp.name}-07-end.png` });

  check(vp.name, errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
  await context.close();
}

// Reduced motion: everything readable without animation.
{
  console.log("\nreduced motion");
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => ({
    motionClass: document.documentElement.classList.contains("motion-ok"),
    nameVisible: getComputedStyle(document.querySelector(".hero-name")).visibility === "visible",
    pins: document.querySelectorAll(".pin-spacer").length,
    dimWords: [...document.querySelectorAll(".w")].filter((w) => parseFloat(getComputedStyle(w).opacity) < 1).length,
  }));
  check("reduced", !r.motionClass && r.nameVisible, "hero shows immediately");
  check("reduced", r.pins === 0, `nothing is pinned (${r.pins})`);
  check("reduced", r.dimWords === 0, `lyrics are fully legible (${r.dimWords} dimmed words)`);
  await page.screenshot({ path: `${OUT}/reduced-01-top.png` });
  await context.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll checks passed. Screenshots in ${OUT}/`);
