import type { Metadata } from "next";
import Motion, { Chars } from "@/components/Motion";
import { Floaties, SocialLinks } from "@/components/Bits";
import { contact } from "@/lib/content";

export const metadata: Metadata = { title: "Contact Me" };

export default function Contact() {
  return (
    <Motion>
      <section className="page-head">
        <div className="page-head-art contact-photo" data-parallax="8">
          <picture data-anim="mask">
            <img
              src="/images/contact-800.webp"
              srcSet="/images/contact-800.webp 800w, /images/contact-1600.webp 1600w"
              sizes="(max-width: 899px) 80vw, 34vw"
              width={800}
              height={1107}
              alt="Rajendra Pandey in a red kurta"
            />
          </picture>
          <span className="hero-ground" data-anim="line" data-delay="0.5" aria-hidden="true" />
        </div>
        <div className="page-head-text">
          <h1 className="page-title" data-anim="chars">
            <Chars text="Contact Me" />
          </h1>
          <p className="page-subtitle" data-anim="up" data-delay="0.25">
            {contact.blurb}
          </p>
          <SocialLinks center />
          <a className="btn" href={contact.resume} target="_blank" rel="noreferrer" data-anim="up" data-delay="0.5" data-magnetic>
            See My Resume
          </a>
        </div>
      </section>

      <section className="page-head page-head--details">
        <div className="page-head-art" data-parallax="6">
          <Floaties />
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
          <img src="/illustrations/contact.svg" alt="" data-anim="left" />
        </div>
        <div className="details" data-anim-group="0.1">
        <dl>
          <div data-anim="up">
            <dt>Address</dt>
            <dd>{contact.address}</dd>
          </div>
          <div data-anim="up">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </dd>
          </div>
          <div data-anim="up">
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
            </dd>
          </div>
        </dl>
          <div data-anim="up">
            <a className="btn" href={contact.maps} target="_blank" rel="noreferrer" data-magnetic>
              Visit on Google Maps
            </a>
          </div>
        </div>
      </section>
    </Motion>
  );
}
