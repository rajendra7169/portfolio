import type { Metadata } from "next";
import Motion from "@/components/Motion";
import ContactHero from "@/components/contact/ContactHero";
import Transmit from "@/components/contact/Transmit";

export const metadata: Metadata = { title: "Contact Me" };

export default function Contact() {
  return (
    <Motion>
      <ContactHero />
      <Transmit />
    </Motion>
  );
}
