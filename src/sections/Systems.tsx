/**
 * Systems — ENTRY 04, and the longest section on the page.
 *
 * Four categories, fourteen bullets, seventeen technology marks, hairline rules
 * between. This section alone runs past one viewport and that is correct
 * (DESIGN.md §4). Nothing here is collapsed behind a "show more".
 *
 * Hovering a mark lights the matching cube in the lattice and the reverse — the
 * one real interactive moment on the page, and the only thing that proves the
 * geometry is wired to the information rather than being wallpaper.
 */
import { skills, acts } from '../content';
import { EntryLabel } from '../components/EntryLabel';
import { TechMark } from '../components/TechMark';
import { setHoveredSkill, useHoveredSkill } from '../hooks/latticeStore';

const act = acts[3];

export function Systems() {
  const hovered = useHoveredSkill();

  return (
    <section className="act act--right" id={act.id} aria-labelledby="systems-title">
      <div className="shell act__grid">
        <div className="act__content">
          <header className="act__head" data-reveal>
            <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Systems" />
            <h2 className="act__title" id="systems-title">
              Systems
            </h2>
            <p className="act__standfirst">
              Four categories, seventeen tools. The video and photography row is on this
              page for the same reason the accounting years are: it is where the
              framing came from, and leaving it off would be tidier and less true.
            </p>
          </header>

          <div className="stack">
            {skills.data.map((category) => (
              <section
                className="skillset"
                key={category.id}
                aria-labelledby={`skills-${category.id}`}
                data-reveal
              >
                <h3 className="skillset__title" id={`skills-${category.id}`}>
                  {category.title}
                </h3>

                <ul className="bullets bullets--hanging">
                  {category.bullets.map((line) => (
                    <li key={line.slice(0, 40)}>{line}</li>
                  ))}
                </ul>

                <ul className="marks" aria-label={`${category.title} tools`}>
                  {category.software.map((skill) => (
                    <TechMark
                      key={skill.name}
                      skill={skill}
                      active={hovered === skill.name}
                      onHover={setHoveredSkill}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
