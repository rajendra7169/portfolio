import type { Metadata } from "next";
import Motion from "@/components/Motion";
import EduHero from "@/components/edu/EduHero";
import EduPath from "@/components/edu/EduPath";
import CertVault from "@/components/edu/CertVault";

export const metadata: Metadata = { title: "Education" };

export default function Education() {
  return (
    <Motion>
      <EduHero />
      <EduPath />
      <CertVault />
    </Motion>
  );
}
