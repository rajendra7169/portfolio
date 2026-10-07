// Small server-rendered building blocks shared by the pages.
import type { ReactNode } from "react";
import { socials, type Tech } from "@/lib/content";
import Icon from "./Icon";
import { Chars } from "./Motion";

/** Brand-coloured circles, as on the original site. They pop in one by one. */
export function SocialLinks({ center = false, anim = true }: { center?: boolean; anim?: boolean }) {
  // anim={false} when a parent (the home hero) choreographs them itself.
  return (
    <ul className={`socials${center ? " socials--center" : ""}`} data-anim-group={anim ? "0.06" : undefined}>
      {socials.map((s) => (
        <li key={s.name} data-anim={anim ? "pop" : undefined}>
          <a
            href={s.href}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="social"
            style={{ "--brand": s.color } as React.CSSProperties}
            aria-label={s.name}
          >
            <Icon icon={s.icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** A row of tech logos with a name tooltip on hover/focus. */
export function TechIcons({ techs, small = false }: { techs: Tech[]; small?: boolean }) {
  return (
    <ul className={`techs${small ? " techs--small" : ""}`} data-anim-group="0.04">
      {techs.map((t) => (
        <li key={t.name} className="tech" data-anim="pop" tabIndex={small ? undefined : 0}>
          <Icon icon={t.icon} color={t.color} />
          <span className="tech-tip" role="tooltip">
            {t.name}
          </span>
          <span className="sr-only">{t.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Drifting plus signs and dots around an illustration, like the original education art. */
export function Floaties() {
  const bits = [
    { k: "+", x: 6, y: 12, c: "#55d6be" }, { k: "•", x: 48, y: 4, c: "#f4978e" }, { k: "+", x: 80, y: 10, c: "#55d6be" },
    { k: "✦", x: 22, y: 8, c: "#7b9ee8" }, { k: "+", x: 92, y: 52, c: "#55d6be" }, { k: "•", x: 84, y: 76, c: "#f4978e" },
    { k: "•", x: 64, y: 92, c: "#7b9ee8" }, { k: "+", x: 4, y: 84, c: "#55d6be" }, { k: "✦", x: 44, y: 96, c: "#7b9ee8" },
  ];
  return (
    <span className="floaties" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="floatie" style={{ left: `${b.x}%`, top: `${b.y}%`, color: b.c, animationDelay: `${i * -0.7}s` }}>
          {b.k}
        </span>
      ))}
    </span>
  );
}

/** Page intro: illustration on the left, big title and subtitle on the right. */
export function PageHeading({ art, title, subtitle, children }: { art: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="page-head">
      <div className="page-head-art" data-parallax="8">
        <Floaties />
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
        <img src={`/illustrations/${art}.svg`} alt="" data-anim="zoom" />
      </div>
      <div className="page-head-text">
        <h1 className="page-title" data-anim="chars">
          <Chars text={title} />
        </h1>
        {subtitle && (
          <p className="page-subtitle" data-anim="up" data-delay="0.25">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ children, id }: { children: string; id?: string }) {
  return (
    <h2 className="section-title" id={id} data-anim="chars">
      <Chars text={children} />
    </h2>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      Made with <span className="heart" aria-label="love">❤</span> by Rajendra Pandey
    </footer>
  );
}
