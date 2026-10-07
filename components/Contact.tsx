"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { contact, profile } from "@/lib/content";
import { scrollToTarget, useLenis } from "./SmoothScroll";
import TrackHead from "./TrackHead";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        MOTION_OK,
        () => {
          // The headline stretches open as it scrolls into place.
          gsap.fromTo(
            ".contact-head",
            { "--wdth": 62, letterSpacing: "-0.02em" },
            {
              "--wdth": 125,
              letterSpacing: "-0.045em",
              ease: "none",
              scrollTrigger: { trigger: ".contact-head", start: "top bottom", end: "top 35%", scrub: 0.5 },
            },
          );
          gsap.from(".contact-grid > *, .socials li", {
            y: 24,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: ".contact-grid", start: "top 85%", once: true },
          });
        },
        root.current!,
      );
    },
    { scope: root },
  );

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  }

  return (
    <section id="contact" className="track contact" ref={root}>
      <TrackHead id="contact" title="Contact" note="Replies within 24 hours" />

      <h2 className="contact-head">
        Write
        <br />
        to me<span className="acid">.</span>
      </h2>

      <div className="contact-mail">
        <a className="contact-email" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
        <button type="button" className="btn" onClick={copyEmail}>
          {copied ? "Copied" : "Copy email"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
      <p className="contact-pitch">{contact.pitch}</p>

      <dl className="contact-grid">
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
          </dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>
            <a href={contact.maps} target="_blank" rel="noreferrer">
              {contact.address} <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
        <div>
          <dt>Resume</dt>
          <dd>
            <a href={contact.resume} target="_blank" rel="noreferrer">
              Open resume <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
        <div>
          <dt>Stories</dt>
          <dd>
            <a href={contact.blog} target="_blank" rel="noreferrer">
              Read the blog <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
      </dl>

      <ul className="socials">
        {contact.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.label} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <footer className="foot">
        <span>
          © {new Date().getFullYear()} {profile.name} · Built in {profile.city}
        </span>
        <button type="button" className="foot-top" onClick={() => scrollToTarget(lenis, 0)}>
          End of tracklist · Play again <span aria-hidden="true">↺</span>
        </button>
      </footer>
    </section>
  );
}
