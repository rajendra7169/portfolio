// Server component: renders an Iconify icon to inline SVG at build time, so no
// icon data or fetches reach the browser. Don't import this from client components.
import { getIconData, iconToSVG, replaceIDs, type IconifyJSON } from "@iconify/utils";
import logos from "@iconify-json/logos/icons.json";
import simpleIcons from "@iconify-json/simple-icons/icons.json";

const sets: Record<string, IconifyJSON> = {
  logos: logos as IconifyJSON,
  "simple-icons": simpleIcons as IconifyJSON,
};

export default function Icon({ icon, color, className }: { icon: string; color?: string; className?: string }) {
  const [prefix, name] = icon.split(":");
  const data = sets[prefix] && getIconData(sets[prefix], name);
  if (!data) throw new Error(`Unknown icon "${icon}"`);
  const { attributes, body } = iconToSVG(data, { height: "1em" });
  return (
    <svg
      {...attributes}
      className={className}
      style={color ? { color } : undefined}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: replaceIDs(body) }}
    />
  );
}
