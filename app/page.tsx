import Motion from "@/components/Motion";
import Hero from "@/components/hero/Hero";
import WhatIDo from "@/components/wid/WhatIDo";
import JsonLd from "@/components/JsonLd";
import { homeGraph } from "@/lib/seo";

export default function Home() {
  return (
    <Motion>
      <JsonLd data={homeGraph} />
      <Hero />
      <WhatIDo />
    </Motion>
  );
}
