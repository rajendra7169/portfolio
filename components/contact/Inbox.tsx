"use client";

// Where a message goes: Rajendra's phone, in Kathmandu, under the hills and a
// string of prayer flags. Its inbox shows your message as you write it, and the
// paper plane from the composer lands in it. The sky follows Kathmandu's clock.

import { useEffect, useState, type CSSProperties } from "react";

export type Draft = { name: string; topics: string[]; message: string; typing: boolean };
export type Arrival = { id: number; from: string; subject: string; text: string };

const KTM = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
// The five colours of a string of prayer flags, in their order.
const FLAGS = ["#2f6fd6", "#f8f6ef", "#e2403a", "#2e9e5b", "#f5c534"];

export const subjectOf = (topics: string[]) => (topics.length ? `Portfolio message · ${topics.join(", ")}` : "Portfolio message");
const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export default function Inbox({ draft, arrived, notify, buzz }: { draft: Draft; arrived: Arrival[]; notify: Arrival | null; buzz: number }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(KTM.format(new Date()));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);
  const hour = time ? Number(time.slice(0, 2)) : 12;
  const sky = hour >= 6 && hour < 17 ? "day" : hour >= 17 && hour < 19 ? "dusk" : "night";
  // The draft shows while you write, and goes once that very message has landed.
  const last = arrived[arrived.length - 1];
  const sent = last && last.text === draft.message.trim() && last.from === (draft.name.trim() || "You");
  const writing = (draft.message.trim() || draft.name.trim()) && !sent;

  return (
    <div className={`ib ib--${sky}`}>
      <span className="ib-sky" aria-hidden="true">
        <i className="ib-sun" />
        {sky === "night" && (
          <span className="ib-stars">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 46}%`, animationDelay: `${-i * 0.4}s` } as CSSProperties} />
            ))}
          </span>
        )}
        <i className="ib-cloud ib-cloud--a" />
        <i className="ib-cloud ib-cloud--b" />
      </span>

      {/* The hills round the valley, with the snow peaks behind them. */}
      <svg className="ib-hills" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
        <path className="ib-peaks" d="M0 150 L60 112 L96 128 L150 70 L196 112 L240 92 L292 40 L346 104 L396 82 L452 30 L512 98 L560 76 L600 104 V260 H0Z" />
        <path className="ib-snow" d="M150 70 L136 86 L148 84 L160 92 L168 80Z M292 40 L274 62 L290 58 L302 68 L312 56Z M452 30 L432 56 L450 50 L462 62 L474 48Z" />
        <path className="ib-ridge" d="M0 196 C70 160 130 178 200 158 C270 138 330 170 400 150 C470 130 530 150 600 136 V260 H0Z" />
        <path className="ib-near" d="M0 232 C90 210 170 222 260 206 C350 190 430 214 520 200 C560 194 584 198 600 196 V260 H0Z" />
      </svg>

      <svg className="ib-flags" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
        <path className="ib-flags-line" d="M-10 18 Q300 120 610 22" />
        {Array.from({ length: 13 }, (_, i) => {
          const t = (i + 0.5) / 13;
          const x = -10 + 620 * t;
          const y = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 120 + t * t * 22;
          return (
            <g key={i} className="ib-flag" style={{ "--d": `${-i * 0.23}s` } as CSSProperties} transform={`translate(${x} ${y})`}>
              <path d="M-15 0 H15 L13 34 H-13Z" fill={FLAGS[i % 5]} />
            </g>
          );
        })}
      </svg>

      <div className="ib-phone-wrap">
        <div className={`ib-phone${buzz ? " is-buzz" : ""}`} key={buzz}>
          <div className="ib-screen">
            <div className="ib-status" aria-hidden="true">
              <b>{time ?? "--:--"}</b>
              <span>
                <i />
                <i />
                <i />
              </span>
            </div>

            {notify && (
              <div className="ib-notif" key={notify.id} role="status">
                <span className="ib-notif-icon" aria-hidden="true">
                  ✉
                </span>
                <span>
                  <b>{notify.from}</b>
                  <small>{short(notify.text, 46)}</small>
                </span>
              </div>
            )}

            <p className="ib-title">
              Inbox <span className="ib-badge">{arrived.length + 4}</span>
            </p>
            <ul className="ib-mails">
              {/* The plane lands in this slot, at the top of the list. */}
              <li className="ib-slot" aria-hidden="true">
                <span className="cm-target" />
              </li>
              {writing && (
                <li className="ib-mail ib-mail--draft">
                  <i className="ib-face">{(draft.name.trim() || "You")[0].toUpperCase()}</i>
                  <span>
                    <b>
                      {draft.name.trim() || "You"} <em>writing</em>
                    </b>
                    <small>{subjectOf(draft.topics)}</small>
                    <small className="ib-preview">
                      {draft.message.trim() ? short(draft.message.trim(), 70) : "…"}
                      {draft.typing && (
                        <span className="ib-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      )}
                    </small>
                  </span>
                </li>
              )}
              {[...arrived].reverse().map((m) => (
                <li className="ib-mail ib-mail--new" key={m.id}>
                  <i className="ib-face">{m.from[0].toUpperCase()}</i>
                  <span>
                    <b>
                      {m.from} <time>now</time>
                    </b>
                    <small>{m.subject}</small>
                    <small className="ib-preview">{short(m.text, 70)}</small>
                  </span>
                </li>
              ))}
              {[0, 1, 2, 3].map((i) => (
                <li className="ib-mail ib-mail--old" key={i} aria-hidden="true">
                  <i className="ib-face" />
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span className="cm-check" aria-hidden="true">
          ✓ <small>Delivered</small>
        </span>
      </div>
    </div>
  );
}
