// Server component: renders an Iconify icon to inline SVG at build time, so no
// icon data or fetches reach the browser. Don't import this from client components.
// Flat icons draw from a file of their own instead (public/icons/, built by
// scripts/icons.mjs and cached for good): a page carries only a <use> for each,
// not the whole drawing twice over (in its HTML and in React's copy of it).
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";
import logos from "@iconify-json/logos/icons.json";
import simpleIcons from "@iconify-json/simple-icons/icons.json";
import files from "@/lib/icons.json";

const sets: Record<string, IconifyJSON> = {
  logos: logos as IconifyJSON,
  "simple-icons": simpleIcons as IconifyJSON,
};
const hashes: Record<string, string> = files;

export default function Icon({ icon, color, className }: { icon: string; color?: string; className?: string }) {
  const [prefix, name] = icon.split(":");
  const data = sets[prefix] && getIconData(sets[prefix], name);
  if (!data) throw new Error(`Unknown icon "${icon}"`);
  const { attributes, body } = iconToSVG(data, { height: "1em" });
  const common = { ...attributes, className, style: color ? { color } : undefined, "aria-hidden": true, focusable: "false" } as const;
  if (hashes[icon])
    return (
      <svg {...common}>
        <use href={`/icons/${icon.replace(":", "--")}.svg?v=${hashes[icon]}#i`} />
      </svg>
    );
  return <svg {...common} dangerouslySetInnerHTML={{ __html: replaceIDs(body) }} />;
}
