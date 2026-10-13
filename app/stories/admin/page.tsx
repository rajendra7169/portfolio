import type { Metadata } from "next";
import Admin from "@/components/stories/admin/Admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function Page() {
  return <Admin tab="dashboard" />;
}
