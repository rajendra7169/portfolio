import type { Metadata } from "next";
import Motion from "@/components/Motion";
import ExpHero from "@/components/exp/ExpHero";
import ExpLog from "@/components/exp/ExpLog";

export const metadata: Metadata = { title: "Experience" };

export default function Experience() {
  return (
    <Motion>
      <ExpHero />
      <ExpLog />
    </Motion>
  );
}
