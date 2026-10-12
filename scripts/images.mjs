// npm run images
// 1. Turns every photo in assets/source/ into WebP at two widths in public/images/:
//      assets/source/portrait.jpg → public/images/portrait-800.webp, portrait-1600.webp
//    Then set `profile.photo = "portrait"` in lib/content.ts.
// 2. Turns the project screens in assets/projects/<slug>/ into public/projects/<slug>/<name>.webp,
//    and writes lib/media.json (size and top colour of each, for the device frames):
//      phone-*  real Android screenshots, iphone-* real iPhone ones. They stay full screen
//               (the apps draw edge to edge); only the phone's own status bar is painted
//               out, with the colour right under it, because the mockup draws a clean one
//               on top. 720px wide.
//      icon     the app icon, trimmed to its artwork, 256px.
//      anything else (desktop screenshots, sheets) 1600px wide.
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const IMAGE = /\.(jpe?g|png|webp|avif|tiff?)$/i;
let failed = 0;

// ── 1. Photos ───────────────────────────────────────────────────────────────
{
  const SRC = "assets/source";
  const OUT = "public/images";
  const WIDTHS = [800, 1600];
  const files = (await readdir(SRC).catch(() => [])).filter((f) => IMAGE.test(f));
  if (files.length === 0) console.log(`No photos found in ${SRC}/.`);
  await mkdir(OUT, { recursive: true });
  for (const file of files) {
    const { name } = parse(file);
    for (const width of WIDTHS) {
      const dest = join(OUT, `${name}-${width}.webp`);
      try {
        const info = await sharp(join(SRC, file))
          .rotate() // respect EXIF orientation
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 6 })
          .toFile(dest);
        console.log(`✓ ${dest}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
      } catch (err) {
        failed++;
        console.error(`✗ ${file} @ ${width}px: ${err.message}`);
      }
    }
  }
}

// ── 2. Project screens ──────────────────────────────────────────────────────
{
  const SRC = "assets/projects";
  const OUT = "public/projects";
  // Share of a screenshot's height taken by the phone's status bar.
  const STATUS = { "phone-": 0.034, "iphone-": 0.05 };
  const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  const media = {};
  const slugs = (await readdir(SRC, { withFileTypes: true }).catch(() => [])).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const slug of slugs.sort()) {
    await mkdir(join(OUT, slug), { recursive: true });
    const files = (await readdir(join(SRC, slug))).filter((f) => IMAGE.test(f)).sort();
    for (const file of files) {
      const { name } = parse(file);
      const dest = join(OUT, slug, `${name}.webp`);
      try {
        let img = sharp(join(SRC, slug, file)).rotate();
        const meta = await img.metadata();
        const kind = Object.keys(STATUS).find((k) => name.startsWith(k));
        const phone = !!kind;
        // Icons are trimmed to their artwork, so the launcher tiles can pad them evenly.
        if (name === "icon") img = sharp(await img.trim().png().toBuffer());
        if (kind) {
          // Stretch the first row under the status bar up over it, softened a touch.
          const bar = Math.round(meta.height * STATUS[kind]);
          const src = await img.png().toBuffer();
          const fill = await sharp(src)
            .extract({ left: 0, top: bar, width: meta.width, height: 1 })
            .resize(meta.width, bar, { fit: "fill", kernel: "nearest" })
            .blur(2)
            .png()
            .toBuffer();
          img = sharp(await sharp(src).composite([{ input: fill, top: 0, left: 0 }]).png().toBuffer());
        }
        const width = name === "icon" ? 256 : phone ? 720 : 1600;
        const { data, info } = await img
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: name === "icon" ? 90 : 80, effort: 6 })
          .toBuffer({ resolveWithObject: true });
        await writeFile(dest, data);
        // The colour along the top edge paints the mockup's status bar to match.
        const strip = await sharp(data).extract({ left: 0, top: 0, width: info.width, height: Math.max(2, Math.round(info.height * 0.01)) }).stats();
        media[`${slug}/${name}`] = { src: `/projects/${slug}/${name}.webp`, w: info.width, h: info.height, top: hex(strip.channels.slice(0, 3).map((c) => c.mean)) };
        console.log(`✓ ${dest}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
      } catch (err) {
        failed++;
        console.error(`✗ ${slug}/${file}: ${err.message}`);
      }
    }
  }
  await writeFile("lib/media.json", JSON.stringify(media, null, 1) + "\n");
  console.log(`✓ lib/media.json  ${Object.keys(media).length} images`);
}

process.exit(failed ? 1 : 0);
