import Motion, { Chars } from "@/components/Motion";
import { SocialLinks, TechIcons, SectionTitle } from "@/components/Bits";
import { profile, skills } from "@/lib/content";

export default function Home() {
  return (
    <Motion>
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-name" data-anim="chars">
            <Chars text={profile.name} />
          </h1>
          <p className="hero-intro" data-anim="up" data-delay="0.35">
            {profile.intro}
          </p>
          <SocialLinks />
          <a className="btn" href={profile.repo} target="_blank" rel="noreferrer" data-anim="up" data-delay="0.6" data-magnetic>
            <span aria-hidden="true">⭐</span> Star Me On Github
          </a>
        </div>
        <div className="hero-art" data-parallax="10">
          <div className="hero-blob" aria-hidden="true" />
          <picture className="hero-photo" data-anim="mask" data-delay="0.15">
            <img
              src="/images/hero-800.webp"
              srcSet="/images/hero-800.webp 800w, /images/hero-1600.webp 1600w"
              sizes="(max-width: 899px) 90vw, 45vw"
              width={800}
              height={906}
              alt="Rajendra Pandey in a suit and sunglasses"
              fetchPriority="high"
            />
          </picture>
          <span className="hero-ground" data-anim="line" data-delay="0.5" aria-hidden="true" />
        </div>
      </section>

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
