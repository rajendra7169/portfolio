import Motion from "@/components/Motion";
import Hero from "@/components/hero/Hero";
import WhatIDo from "@/components/wid/WhatIDo";

export default function Home() {
  return (
    <Motion>
      <Hero />
      <WhatIDo />
    </Motion>
  );
}
