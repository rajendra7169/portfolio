"use client";

import { useLayoutEffect } from "react";
import { syncRoot } from "@/lib/rootFlags";

/** Rendered with a page that sets what the site chrome wears (lib/rootFlags.ts): syncs as it comes and goes. */
export default function RootFlags() {
  useLayoutEffect(() => {
    syncRoot();
    // Cleanup runs before React removes the page's elements: look again once it has.
    return () => queueMicrotask(syncRoot);
  }, []);
  return null;
}
