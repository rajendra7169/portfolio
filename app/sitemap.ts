// sitemap.xml: every page, each project, and each published story, so search
// engines find the lot without having to crawl their way to it.
import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const SITE = "https://rajendrapandey.info.np";

async function stories(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/posts?select=slug,updated_at&status=eq.published`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    const posts = (await res.json()) as { slug: string; updated_at: string }[];
    return posts.map((p) => ({ url: `${SITE}/stories/${encodeURIComponent(p.slug)}`, lastModified: p.updated_at }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/projects", "/experience", "/education", "/resume", "/contact", "/stories"].map((path) => ({
    url: `${SITE}${path}`,
    priority: path === "" ? 1 : 0.8,
  }));
  const work = projects.map((p) => ({ url: `${SITE}/projects/${p.slug}`, priority: p.slug === "blazify" ? 0.9 : 0.7 }));
  return [...pages, ...work, ...(await stories())];
}
