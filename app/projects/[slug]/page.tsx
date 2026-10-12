import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Motion from "@/components/Motion";
import { WORLDS } from "@/components/worlds";
import { projectBySlug, projects } from "@/lib/projects";

// Every project page is its own world (components/worlds).

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: p.name, description: `${p.tagline} ${p.summary}` } : {};
}

export default async function ProjectPage({ params }: Props) {
  const p = projectBySlug((await params).slug);
  const World = p && WORLDS[p.slug];
  if (!p || !World) notFound();
  return (
    <Motion>
      <World p={p} />
    </Motion>
  );
}
