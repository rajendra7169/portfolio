import type { Metadata, Viewport } from "next";
import StoriesShell from "@/components/stories/StoriesShell";
import "@/components/stories/stories.css";

// Stories reads like a book: Literata for English, Martel for Nepali (both from
// the root layout, so the welcome into Stories can use them too).
export const metadata: Metadata = {
  title: { default: "कथा Stories", template: "%s · कथा Stories" },
  description: "Stories, gajal, kabita and notes by Rajendra Pandey and friends, from Kathmandu.",
  openGraph: { title: "कथा Stories", description: "Stories, gajal, kabita and notes from Kathmandu.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#fbfbf9" };

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return <StoriesShell>{children}</StoriesShell>;
}
