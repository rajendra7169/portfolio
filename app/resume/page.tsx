import type { Metadata } from "next";
import Motion from "@/components/Motion";
import Resume from "@/components/resume/Resume";

export const metadata: Metadata = { title: "Résumé", description: "Rajendra Pandey's résumé: software engineer, mobile and full stack, in Kathmandu." };

export default function ResumePage() {
  return (
    <Motion>
      <Resume />
    </Motion>
  );
}
