// npm run github: save the current GitHub contribution calendar to
// lib/github-contributions.json, the copy the Projects page falls back on.
import { writeFile } from "node:fs/promises";

const USER = "rajendra7169";
const html = await (await fetch(`https://github.com/users/${USER}/contributions`, { headers: { "User-Agent": "rajendrapandey.info.np" } })).text();
const counts = new Map();
for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
  const n = /^([\d,]+) contributions?/.exec(m[2].trim());
  counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
}
const days = [];
for (const m of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d\d-\d\d)"[^>]*>/g)) {
  const id = /\bid="([^"]+)"/.exec(m[0])?.[1] ?? "";
  const level = Number(/\bdata-level="(\d)"/.exec(m[0])?.[1] ?? 0);
  days.push({ date: m[1], count: counts.get(id) ?? (level ? 1 : 0), level });
}
if (days.length < 300) throw new Error(`Only ${days.length} days found; GitHub's page may have changed.`);
days.sort((a, b) => a.date.localeCompare(b.date));
const stated = /([\d,]+)\s+contributions?\s+in the last year/.exec(html)?.[1];
const total = stated ? Number(stated.replace(/,/g, "")) : days.reduce((s, d) => s + d.count, 0);
await writeFile(new URL("../lib/github-contributions.json", import.meta.url), JSON.stringify({ user: USER, total, days, fetched: new Date().toISOString() }) + "\n");
console.log(`${days.length} days, ${total} contributions, saved.`);
