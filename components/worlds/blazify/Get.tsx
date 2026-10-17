// Where to get Blazify, and how many already have. Each button opens the
// platform's release page, never the file itself: the page says what's new and
// which file to pick. Windows goes to GitLab, where its installer lives.
import Icon from "@/components/Icon";
import { blazifyDownloads } from "@/lib/blazify-downloads";
import { PLATFORMS } from "@/lib/projects";

const GH = "https://github.com/rajendra7169";
const PAGES = [
  { key: "android", label: "Android", href: `${GH}/blazify/releases/latest` },
  { key: "ios", label: "iPhone", href: `${GH}/blazify-ios/releases/latest` },
  { key: "windows", label: "Windows", href: "https://gitlab.com/hackerraja7169/blazify/-/packages?search=blazify-desktop" },
  { key: "linux", label: "Linux", href: `${GH}/blazify-desktop/releases/latest` },
] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

export default async function Get() {
  const d = await blazifyDownloads();
  const count = { android: d.android, ios: d.iphone, windows: d.windows, linux: d.linux };
  return (
    <div className="bz-get">
      <p className="bz-get-total">
        <b>{fmt(d.total)}</b> downloads so far
      </p>
      <ul className="bz-get-list">
        {PAGES.map((pg) => (
          <li key={pg.key}>
            <a href={pg.href} target="_blank" rel="noreferrer" className="bz-get-btn" data-magnetic>
              {/* The usual Apple mark is black, and this page is too. */}
              <Icon icon={pg.key === "ios" ? "simple-icons:apple" : PLATFORMS[pg.key].icon} color={pg.key === "ios" ? "#fff4e6" : undefined} className="bz-get-ico" />
              <span className="bz-get-name">{pg.label}</span>
              <span className="bz-get-n" aria-label={`${fmt(count[pg.key])} downloads`}>
                {fmt(count[pg.key])}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
