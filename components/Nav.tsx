"use client";

import { useEffect, useState } from "react";
import { contact } from "@/lib/content";

const ktm = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit" });

function KathmanduClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTime(ktm.format(new Date()));
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);
  const [h, m] = (time ?? "--:--").split(":");
  return (
    <span className="nav-clock" aria-label={time ? `Kathmandu time ${time}` : "Kathmandu time"}>
      KTM {h}
      <span className="nav-colon">:</span>
      {m}
    </span>
  );
}

export default function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav-mark" aria-label="Rajendra Pandey, back to top">
        &lt;RP<span className="acid">/</span>&gt;
      </a>
      <nav aria-label="Sections" className="nav-links">
        <a href="#work">Work</a>
        <a href="#path">Path</a>
        <a href="#contact">Contact</a>
        <a href={contact.blog} target="_blank" rel="noreferrer">
          Stories<span aria-hidden="true">↗</span>
        </a>
      </nav>
      <div className="nav-status">
        <span className="pulse" aria-hidden="true" />
        <span className="nav-avail">Open to work</span>
        <KathmanduClock />
      </div>
    </header>
  );
}
