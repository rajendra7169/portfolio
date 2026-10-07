// npm run images
// Turns every photo in assets/source/ into WebP at two widths in public/images/:
//   assets/source/portrait.jpg → public/images/portrait-800.webp, portrait-1600.webp
// Then set `profile.photo = "portrait"` in lib/content.ts.
import { readdir, mkdir } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = "assets/source";
const OUT = "public/images";
const WIDTHS = [800, 1600];

const files = (await readdir(SRC).catch(() => [])).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
if (files.length === 0) {
  console.log(`No photos found in ${SRC}/. Add a JPG or PNG there and run this again.`);
  process.exit(0);
}

await mkdir(OUT, { recursive: true });
let failed = 0;
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
process.exit(failed ? 1 : 0);
