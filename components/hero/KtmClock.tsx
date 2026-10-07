"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Live Kathmandu time. Renders a placeholder on the server to avoid a hydration mismatch. */
export default function KtmClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className="ktm-clock" suppressHydrationWarning>
      {now ?? "--:--:--"}
    </time>
  );
}
