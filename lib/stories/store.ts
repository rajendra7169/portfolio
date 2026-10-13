"use client";

// One store for the whole Stories section: Supabase when it's configured
// (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY), otherwise the
// in-browser demo. Plus the hooks the pages read through.
import { useCallback, useEffect, useState } from "react";
import { demoStore } from "./demo";
import { supabaseStore } from "./supabase";
import type { Profile, StoriesStore } from "./types";

let instance: StoriesStore | null = null;
/** The test suite (scripts/shot.mjs) sets this so it never writes to the real database. */
const forcedDemo = () => {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem("stories-demo") === "1";
  } catch {
    return false;
  }
};
export function stories(): StoriesStore {
  if (instance) return instance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  instance = url && key && !forcedDemo() ? supabaseStore(url, key) : demoStore();
  return instance;
}

/** Run a read, and run it again whenever the store changes or someone signs in or out. */
export function useStories<T>(read: (s: StoriesStore) => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | undefined; error: string | null; loading: boolean }>({ data: undefined, error: null, loading: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(read, deps);
  const load = useCallback(() => {
    let live = true;
    run(stories())
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((e: Error) => live && setState((s) => ({ ...s, error: e.message, loading: false })));
    return () => void (live = false);
  }, [run]);
  useEffect(() => {
    const stop = load();
    const s = stories();
    const a = s.subscribe(load);
    const b = s.onAuth(load);
    return () => {
      stop();
      a();
      b();
    };
  }, [load]);
  return { ...state, reload: load };
}

/** The signed-in writer or reader (null when signed out); undefined while it's being looked up. */
export function useMe(): Profile | null | undefined {
  const { data, loading } = useStories((s) => s.me(), []);
  return loading ? undefined : (data ?? null);
}

/** Whether Stories is running its in-browser demo. Decided after the page loads, so the server's HTML and the browser's first render agree. */
export function useDemo() {
  const [demo, setDemo] = useState(false);
  useEffect(() => setDemo(stories().mode === "demo"), []);
  return demo;
}

export const isWriter = (p: Profile | null | undefined) => !!p && p.status === "active" && (p.role === "admin" || p.role === "author");
