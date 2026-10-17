// sitemap.xml: every page, each project, and each published story, so search
// engines find the lot without having to crawl their way to it. Photos and
// screens ride along with their pages, which is how they reach Google Images.
import type { MetadataRoute } from "next";
import media from "@/lib/media.json";
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

// Each page's pictures: the photos on the pages they appear on, and every
// screen of a project on that project's page.
const PHOTOS: Record<string, string[]> = {
  "": ["/images/rajendra-pandey-1600.webp"],
  "/contact": ["/images/rajendra-pandey-contact-1600.webp"],
};
const screens = (slug: string) =>
  Object.entries(media as Record<string, { src: string }>)
    .filter(([key]) => key.startsWith(`${slug}/`))
    .map(([, m]) => `${SITE}${m.src}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/projects", "/experience", "/education", "/resume", "/contact", "/stories"].map((path) => ({
    url: `${SITE}${path}`,
    priority: path === "" ? 1 : 0.8,
    images: (PHOTOS[path] ?? []).map((src) => `${SITE}${src}`),
  }));
  const work = projects.map((p) => ({ url: `${SITE}/projects/${p.slug}`, priority: p.slug === "blazify" ? 0.9 : 0.7, images: screens(p.slug) }));
  return [...pages, ...work, ...(await stories())];
}
