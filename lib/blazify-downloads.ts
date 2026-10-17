// Blazify's downloads for its project page: the counts GitHub keeps for every
// release file, read from its public API (no token needed) and refreshed every
// six hours. If GitHub can't be reached, the copy saved in
// lib/blazify-downloads.json stands in, so the page never breaks.
import saved from "./blazify-downloads.json";

export type Downloads = { android: number; iphone: number; windows: number; linux: number; total: number; fetched: string };

type Release = { assets: { name: string; download_count: number }[] };

async function files(repo: string) {
  const res = await fetch(`https://api.github.com/repos/rajendra7169/${repo}/releases?per_page=100`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "rajendrapandey.info.np" },
    next: { revalidate: 21600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${repo}`);
  return ((await res.json()) as Release[]).flatMap((r) => r.assets);
}

const sum = (list: { download_count: number }[]) => list.reduce((n, a) => n + a.download_count, 0);

export async function blazifyDownloads(): Promise<Downloads> {
  try {
    const [android, iphone, desktop] = await Promise.all([files("blazify"), files("blazify-ios"), files("blazify-desktop")]);
    const isWindows = (name: string) => /\.(exe|msi)$/i.test(name);
    // Each count is at least the saved one: a file taken down from GitHub (the
    // Windows installer now lives on GitLab, which keeps no count) takes its
    // downloads with it, and those still happened.
    const d = {
      android: Math.max(sum(android), saved.android),
      iphone: Math.max(sum(iphone), saved.iphone),
      windows: Math.max(sum(desktop.filter((a) => isWindows(a.name))), saved.windows),
      linux: Math.max(sum(desktop.filter((a) => !isWindows(a.name))), saved.linux),
    };
    return { ...d, total: d.android + d.iphone + d.windows + d.linux, fetched: new Date().toISOString() };
  } catch {
    return saved;
  }
}
