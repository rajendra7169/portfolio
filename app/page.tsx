import Motion from "@/components/Motion";
import Hero from "@/components/hero/Hero";
import { TechIcons, SectionTitle } from "@/components/Bits";
import { skills } from "@/lib/content";

export default function Home() {
  return (
    <Motion>
      <Hero />

      <section className="skills" aria-labelledby="what-i-do">
        <SectionTitle id="what-i-do">What I Do?</SectionTitle>
        {skills.map((s) => (
          <article className="skill" key={s.title}>
            <div className="skill-art" data-parallax="6">
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG illustration */}
              <img src={`/illustrations/${s.art}.svg`} alt="" data-anim="left" />
            </div>
            <div className="skill-body">
              <h3 className="skill-title" data-anim="up">
                {s.title}
              </h3>
              <TechIcons techs={s.techs} />
              <ul className="points" data-anim-group="0.07">
                {s.points.map((p) => (
                  <li key={p} data-anim="right">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </Motion>
  );
}
