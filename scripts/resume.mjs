// Print the /resume page to public/Rajendra-Pandey-Resume.pdf: the same markup
// as the page, with its print styles (two A4 sheets, nothing else).
// Needs the dev server running:  npm run dev,  then  npm run resume
// (RESUME_URL overrides the address).
import { chromium } from "playwright";

const URL = process.env.RESUME_URL ?? "http://localhost:3000/resume";
const OUT = "public/Rajendra-Pandey-Resume.pdf";

const browser = await chromium.launch();
const page = await (await browser.newContext({ reducedMotion: "reduce" })).newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });
const sheets = await page.locator(".rs-page").count();
await page.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(`✓ ${OUT} (${sheets} pages)`);
