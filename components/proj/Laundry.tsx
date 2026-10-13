// "Also on GitHub": the final-year project as a washing machine. Its dial runs
// the app's own order flow (order, pickup, wash and fold, out for delivery,
// delivered); the drum fills, tumbles and spins through it, and when the cycle
// ends the machine prints a receipt, which is the paper the project became.
// LaundryMotion.tsx plays it; without motion everything is simply on the page.
import type { CSSProperties } from "react";
import Icon from "@/components/Icon";
import { SectionTitle } from "@/components/Bits";
import { socials } from "@/lib/content";
import { laundry, laundryPaper } from "@/lib/projects";
import LaundryMotion from "./LaundryMotion";

// Clothes in the drum, each at its place (outer group) so the motion can move the inner one.
const CLOTHES = [
  // a T-shirt
  { at: "58 112", rot: -14, body: <path d="M-22-14 -10-20q10 8 20 0L22-14 30-2 20 2 18-6V22H-18V-6l-2 8-10-4Z" fill="#f26b38" /> },
  // trousers
  { at: "128 128", rot: 18, body: <path d="M-14-22H14L17 22H5L0-4-5 22H-17Z" fill="#2f7fc1" /> },
  // a sock
  { at: "112 66", rot: 32, body: <path d="M-5-18H7V6q0 10-10 12H-14q-6 0-6-6t6-6H-5Z" fill="#001c55" /> },
  // a dhaka topi, the Nepali cap
  {
    at: "66 66",
    rot: -8,
    body: (
      <>
        <path d="M-18 10-14-12Q0-18 14-12L18 10Z" fill="#c7203c" />
        <path d="M-15-2H15M-16 4H16" stroke="#111" strokeWidth="2.4" strokeDasharray="3 2" />
        <path d="M-14-8H14" stroke="#f2b134" strokeWidth="2.2" strokeDasharray="2 3" />
      </>
    ),
  },
];
const BUBBLES = [38, 62, 84, 101, 118, 137, 155, 72, 128];

export default function Laundry() {
  const steps = laundry.cycle;
  return (
    <LaundryMotion>
      <SectionTitle id="lw-title">Also on GitHub</SectionTitle>
      <p className="section-sub" data-anim="up">
        My final-year project, and the paper it became. Press start.
      </p>

      <div className="lw-stage">
        <div className="lw-left" data-anim="up">
          <div className="lw-machine">
            <div className="lw-body">
              <div className="lw-panel">
                <div className="lw-lcd" aria-hidden="true">
                  <span className="lw-lcd-text">{steps[0].lcd}</span>
                  {/* the delivery, on the display: shop, road, rider, home */}
                  <span className="lw-route">
                    <i className="lw-route-shop" />
                    <i className="lw-route-road" />
                    <i className="lw-route-bike">
                      <svg viewBox="0 0 24 14">
                        <circle cx="5" cy="10" r="3" />
                        <circle cx="19" cy="10" r="3" />
                        <path d="M5 10h8l3-6h3M10 4h4" />
                      </svg>
                    </i>
                    <i className="lw-route-home" />
                  </span>
                </div>
                <button type="button" className="lw-dial" aria-label="Turn the dial to the next stage" data-cursor="Turn">
                  <span className="lw-dial-ticks" aria-hidden="true">
                    {steps.map((s, i) => (
                      <i key={s.id} style={{ "--a": `${-120 + i * 60}deg` } as CSSProperties} />
                    ))}
                  </span>
                  <span className="lw-dial-knob" aria-hidden="true">
                    <i />
                  </span>
                </button>
                <button type="button" className="lw-start" data-cursor="Start">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5Z" />
                  </svg>
                  <span className="sr-only lw-start-label">Start the wash cycle</span>
                </button>
              </div>

              <ol className="lw-leds" aria-label="Wash cycle: the app's order, start to finish">
                {steps.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" data-step={i} data-lcd={s.lcd} aria-pressed={i === 0} className={i === 0 ? "is-on" : undefined}>
                      <i className="lw-led" aria-hidden="true" />
                      {s.label}
                    </button>
                  </li>
                ))}
              </ol>

              <div className="lw-door" aria-hidden="true">
                <div className="lw-door-in">
                  <div className="lw-ring" />
                  <div className="lw-glass">
                    <svg viewBox="0 0 200 200" className="lw-drum-svg">
                      <defs>
                        <clipPath id="lw-clip">
                          <circle cx="100" cy="100" r="100" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#lw-clip)">
                        <rect width="200" height="200" fill="#0d2f5c" />
                        <g className="lw-level-back">
                          <path className="lw-wave lw-wave--back" d="M0 0q25-7 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V240H0Z" fill="#2f7fc1" opacity="0.55" />
                        </g>
                        <g className="lw-drum">
                          {Array.from({ length: 28 }, (_, i) => {
                            const a = (i / 28) * Math.PI * 2;
                            return <circle key={i} cx={100 + Math.cos(a) * 90} cy={100 + Math.sin(a) * 90} r="2.6" fill="#ffffff" opacity="0.14" />;
                          })}
                          {[0, 120, 240].map((r) => (
                            <path key={r} d="M92 4h16l-3 16h-10Z" fill="#9fc9e6" opacity="0.55" transform={`rotate(${r} 100 100)`} />
                          ))}
                          {CLOTHES.map((c, i) => (
                            <g key={i} transform={`translate(${c.at}) rotate(${c.rot})`}>
                              <g className="lw-cloth">{c.body}</g>
                            </g>
                          ))}
                        </g>
                        <g className="lw-level">
                          <path className="lw-wave" d="M0 0q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V240H0Z" fill="#7cc8f0" opacity="0.5" />
                        </g>
                        {BUBBLES.map((x, i) => (
                          <circle key={i} className="lw-bubble" cx={x} cy="196" r={2 + (i % 3)} fill="none" stroke="#e8f7ff" strokeWidth="1.4" />
                        ))}
                      </g>
                    </svg>
                    <span className="lw-shine" />
                  </div>
                </div>
              </div>
            </div>
            <span className="lw-feet" aria-hidden="true" />
          </div>
        </div>

        <div className="lw-right">
          <article className="lw-repo" data-anim="up">
            <p className="lw-repo-head">
              <Icon icon="simple-icons:github" className="lw-repo-mark" />
              <a href={laundry.href} target="_blank" rel="noreferrer" className="lw-repo-name">
                <span>{laundry.owner} /</span> {laundry.repo}
              </a>
              <span className="lw-repo-pill">Public</span>
            </p>
            <h3 className="lw-repo-title">{laundry.name}</h3>
            <p className="lw-repo-text">{laundry.text}</p>
            <ul className="lw-stack" aria-label="Built with">
              {laundry.stack.map((t) => (
                <li key={t.name}>
                  <Icon icon={t.icon} color={t.color} />
                  {t.name}
                </li>
              ))}
            </ul>
            <p className="lw-repo-meta">Created {laundry.date}</p>
            <div className="lw-repo-actions">
              <a className="btn" href={laundry.href} target="_blank" rel="noreferrer" data-magnetic>
                View the code
              </a>
              <a className="btn btn--ghost" href={laundry.live} target="_blank" rel="noreferrer">
                Open the app <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <div className="lw-row">
            <ol className="lw-notes" aria-live="polite" data-anim="up">
              {steps.map((s, i) => (
                <li key={s.id} className={`lw-note${i === 0 ? " is-on" : ""}`} data-i={i}>
                  <span className="lw-note-n">
                    Stage {i + 1} of {steps.length}
                  </span>
                  <span className="lw-note-title">{s.title}</span>
                  <span className="lw-note-text">{s.text}</span>
                </li>
              ))}
            </ol>

            <div className="lw-printer" data-anim="up">
              <span className="lw-slot" aria-hidden="true" />
              <span className="lw-slot-hint" aria-hidden="true">
                The receipt prints when the cycle ends
              </span>
              <div className="lw-paper">
                <figure className="lw-receipt" aria-label="The paper">
                  <p className="lw-r-shop">{laundryPaper.school}</p>
                  <p className="lw-r-meta">Receipt · {laundryPaper.date}</p>
                  <p className="lw-r-item">1 × research paper</p>
                  <p className="lw-r-title">{laundryPaper.title}</p>
                  <dl className="lw-r-rows">
                    <div>
                      <dt>Status</dt>
                      <dd>Published</dd>
                    </div>
                    <div>
                      <dt>Where</dt>
                      <dd>{laundryPaper.where}</dd>
                    </div>
                    <div>
                      <dt>Cycle</dt>
                      <dd>Order to delivered</dd>
                    </div>
                  </dl>
                  <p className="lw-r-thanks">Thank you for reading</p>
                  <span className="lw-r-code" aria-hidden="true" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="center" data-anim="up">
        <a className="btn" href={socials[0].href} target="_blank" rel="noreferrer" data-magnetic>
          More on GitHub
        </a>
      </div>
    </LaundryMotion>
  );
}
