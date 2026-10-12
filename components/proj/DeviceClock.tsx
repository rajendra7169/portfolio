"use client";

import { useEffect, useState } from "react";

const FORMATS = {
  time: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit" }),
  date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", weekday: "long", day: "numeric", month: "long" }),
  short: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", month: "short", day: "numeric" }),
  // iPhones show 12-hour time with no AM/PM: "2:21".
  ios: new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit", hour12: true }),
};

/** Kathmandu time for the device mockups' status bars, clocks and taskbars. */
export default function DeviceClock({ format = "time", className }: { format?: keyof typeof FORMATS; className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(FORMATS[format].format(new Date()).replace(/\s?[AP]M$/, ""));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [format]);
  return (
    <time className={className} suppressHydrationWarning>
      {now ?? (format === "time" || format === "ios" ? "--:--" :" ")}
    </time>
  );
}
