// Download links that outlive a GitHub suspension. Every download button points
// here, and each click asks GitHub, right then, whether the release page is
// there. If it is, the visitor goes to it. If GitHub says "not found" or
// doesn't answer within three seconds, the same click goes to the copy on
// Codeberg or GitLab instead. Windows always goes to GitLab: its installer
// lives only there. Every target is a page that lists the files, never a file.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GH = "https://github.com/rajendra7169";
const GITLAB = "https://gitlab.com/hackerraja7169/blazify/-/packages";

const PLACES: Record<string, { github?: string; backup: string }> = {
  android: { github: `${GH}/blazify/releases/latest`, backup: "https://codeberg.org/rajaindra7169/blazify/releases" },
  iphone: { github: `${GH}/blazify-ios/releases/latest`, backup: `${GITLAB}?search=blazify-ios` },
  windows: { backup: `${GITLAB}?search=blazify-desktop` },
  linux: { github: `${GH}/blazify-desktop/releases/latest`, backup: `${GITLAB}?search=blazify-desktop` },
};
const ALIASES: Record<string, string> = { ios: "iphone", apk: "android" };

/** Whether GitHub serves the page now: 200, or the redirect to the newest release. */
async function answers(url: string) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      headers: { "User-Agent": "rajendrapandey.info.np" },
      signal: AbortSignal.timeout(3000),
    });
    return res.status < 400;
  } catch {
    return false;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const place = PLACES[ALIASES[platform] ?? platform];
  const to = !place ? new URL("/projects/blazify", req.url).toString() : place.github && (await answers(place.github)) ? place.github : place.backup;
  return new NextResponse(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store" } });
}
