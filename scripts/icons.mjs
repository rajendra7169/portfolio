// npm run icons (also runs before every build)
// Every flat icon the site uses as a file of its own, public/icons/<set>--<name>.svg,
// so a page draws each with a tiny <use> instead of carrying the whole drawing
// inline (and again in React's copy of the page): icons were over half of the home
// page's HTML. One file each, so a page fetches only the icons it shows.
// "Flat" means no ids or url() references inside: Safari can't draw gradients,
// masks or filters from another file, so icons with those stay inline
// (components/Icon.tsx draws inline anything not listed in lib/icons.json).
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { getIconData, iconToSVG } from "@iconify/utils";
import logos from "@iconify-json/logos/icons.json" with { type: "json" };
import simpleIcons from "@iconify-json/simple-icons/icons.json" with { type: "json" };

const sets = { logos, "simple-icons": simpleIcons };
const ID = /["'`]((?:logos|simple-icons):[a-z0-9-]+)["'`]/g;

async function* sources(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* sources(p);
    else if (/\.(tsx?|mjs)$/.test(e.name)) yield p;
  }
}

const used = new Set();
for (const dir of ["app", "components", "lib"]) for await (const file of sources(dir)) for (const m of (await readFile(file, "utf8")).matchAll(ID)) used.add(m[1]);

// Each file is one <symbol id="i">; the hash of its contents goes in its address
// (components/Icon.tsx), so browsers can keep it for good.
// (Clears out only its own files, <set>--<name>.svg, from an earlier run.)
await mkdir("public/icons", { recursive: true });
for (const f of await readdir("public/icons")) if (/^[a-z-]+--[a-z0-9-]+\.svg$/.test(f)) await rm(join("public/icons", f));
const icons = {};
let bytes = 0;
for (const icon of [...used].sort()) {
  const [prefix, name] = icon.split(":");
  const data = getIconData(sets[prefix], name);
  if (!data) throw new Error(`Unknown icon "${icon}"`);
  const { attributes, body } = iconToSVG(data, { height: "1em" });
  if (/\bid=|url\(/.test(body)) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><symbol id="i" viewBox="${attributes.viewBox}">${body}</symbol></svg>\n`;
  const file = icon.replace(":", "--");
  await writeFile(`public/icons/${file}.svg`, svg);
  icons[icon] = createHash("sha256").update(svg).digest("hex").slice(0, 8);
  bytes += svg.length;
}
await writeFile("lib/icons.json", JSON.stringify(icons, null, 2) + "\n");
console.log(`✓ public/icons/: ${Object.keys(icons).length} of ${used.size} icons (${(bytes / 1024).toFixed(1)} KB in all)`);
