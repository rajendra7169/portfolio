"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useNavigate } from "@/components/PageTransition";

/** A link into another project's world: the link itself grows into a portal in that world's colour. */
export default function WorldNext({ href, color, icon, className, children }: { href: string; color: string; icon?: string; className?: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Link
      href={href}
      className={className}
      data-cursor="Open"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href, { from: e.currentTarget.getBoundingClientRect(), color, icon });
      }}
    >
      {children}
    </Link>
  );
}
