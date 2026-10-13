// One project world as a page of its own (app/projects/<slug>/page.tsx). Each
// world has its own route, rather than all seven behind one dynamic route, so a
// project page loads only its own world's fonts and styles: behind one route,
// every project page preloaded all seven worlds' (over half a megabyte of fonts).
import type { Metadata } from "next";
import type { ComponentType } from "react";
import Motion from "@/components/Motion";
import RootFlags from "@/components/RootFlags";
import { projectBySlug, type Project } from "@/lib/projects";

export function worldPage(slug: string, World: ComponentType<{ p: Project }>) {
  const p = projectBySlug(slug)!;
  const metadata: Metadata = { title: p.name, description: `${p.tagline} ${p.summary}` };
  function Page() {
    return (
      <Motion>
        <World p={p} />
        <RootFlags />
      </Motion>
    );
  }
  return { metadata, Page };
}
