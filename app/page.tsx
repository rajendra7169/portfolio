import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Lyrics from "@/components/Lyrics";
import Craft from "@/components/Craft";
import Work from "@/components/Work";
import Path from "@/components/Path";
import Contact from "@/components/Contact";
import Transport from "@/components/Transport";

export default function Home() {
  return (
    <SmoothScroll>
      <a className="skip" href="#lyrics">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Lyrics />
        <Craft />
        <Work />
        <Path />
        <Contact />
      </main>
      {/* Last, so its ScrollTrigger is created after every section's. */}
      <Transport />
      <div className="grain" aria-hidden="true" />
    </SmoothScroll>
  );
}
