import type { Metadata } from "next";
import "@/components/stories/admin/admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Stories admin" }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
