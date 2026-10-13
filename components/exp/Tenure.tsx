"use client";

import { useEffect, useState } from "react";

const KTM = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }); // "2026-10-13"
const unit = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** Years, months and days from `start` to today in Kathmandu ("1 year, 4 months, 25 days"). */
function since(start: string, today: string) {
  const [y0, m0, d0] = start.split("-").map(Number);
  const [y1, m1, d1] = today.split("-").map(Number);
  let months = (y1 - y0) * 12 + (m1 - m0);
  let days = d1 - d0;
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(y1, m1 - 1, 0)).getUTCDate(); // days in the month before this one
  }
  const parts = [];
  if (months >= 12) parts.push(unit(Math.floor(months / 12), "year"));
  if (months % 12) parts.push(unit(months % 12, "month"));
  if (days || !parts.length) parts.push(unit(days, "day"));
  return parts.join(", ");
}

/** How long he's been in a role, counted up to today. Rendered after mount, so the server's date never disagrees with the reader's. */
export default function Tenure({ start }: { start: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setText(since(start, KTM.format(new Date())));
    tick();
    const id = setInterval(tick, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [start]);
  return (
    <span className="xp-tenure-count" suppressHydrationWarning>
      {text ?? " "}
    </span>
  );
}
