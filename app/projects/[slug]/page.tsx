import { notFound } from "next/navigation";

// Each project has a page of its own (app/projects/<slug>, see lib/world-page.tsx);
// this only answers addresses that aren't one of them.
// (No `dynamicParams = false`: on Netlify's runtime it turns every page under it into a 404.)
export const generateStaticParams = () => [];

export default function UnknownProject() {
  notFound();
}
