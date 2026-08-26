/**
 * Evidence — ENTRY 06. Six curated projects in the accordion, everything else
 * in the fetch as plain cards below it.
 *
 * The repo list comes from src/data/repos.ts, written at build time by
 * scripts/fetch-repos.mjs. A curated project whose repo is missing from the
 * snapshot is dropped rather than rendered empty, so a renamed or deleted
 * repository degrades to five panels instead of a broken one.
 */
import { featuredProjects, acts } from '../content';
import { repos, reposFetchedAt } from '../data/repos';
import { EntryLabel } from '../components/EntryLabel';
import { ProjectAccordion, type PanelData } from '../components/ProjectAccordion';

const act = acts[5];

const byName = new Map(repos.map((r) => [r.name, r]));

const panels: PanelData[] = featuredProjects
  .map((project) => {
    const repo = byName.get(project.repo);
    return repo ? { project, repo } : null;
  })
  .filter((p): p is PanelData => p !== null);

const featuredNames = new Set(panels.map((p) => p.repo.name));
/** Everything not in the accordion, minus this site's own two repos. */
const rest = repos.filter(
  (r) => !featuredNames.has(r.name) && r.name !== 'portfolio' && r.name !== 'rajendra7169',
);

export function Evidence() {
  return (
    <section className="act" id={act.id} aria-labelledby="evidence-title">
      <div className="shell">
        <header className="act__head" data-reveal>
          <EntryLabel entry={act.entry} qualifier={act.qualifier} title="Projects" />
          <h2 className="act__title" id="evidence-title">
            Evidence
          </h2>
          <p className="act__standfirst">
            {repos.length} public repositories, read from the GitHub API when this page
            was built. {panels.length} of them have an interface worth opening; the rest
            are listed underneath with their language and date so you can judge the
            spread rather than take my word for it.
          </p>
        </header>

        <ProjectAccordion panels={panels} />

        {rest.length > 0 ? (
          <>
            <h3 className="act__subtitle" data-reveal>
              Everything else on GitHub
            </h3>
            <ul className="repos">
              {rest.map((repo) => (
                <li key={repo.name} data-reveal>
                  <a
                    className="repo"
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={
                      repo.languageColor
                        ? ({ ['--lang-color' as string]: repo.languageColor })
                        : undefined
                    }
                  >
                    <span className="repo__name">{repo.name}</span>
                    {/* A repo with no description renders without one rather
                        than with filler. the brief §5. */}
                    {repo.description ? (
                      <span className="repo__desc">{repo.description}</span>
                    ) : null}
                    <span className="repo__foot">
                      {repo.language ? (
                        <span className="repo__lang">
                          <span className="repo__swatch" aria-hidden="true" />
                          {repo.language}
                        </span>
                      ) : null}
                      {repo.stars > 0 ? (
                        <span>
                          {repo.stars} star{repo.stars === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      <span>{repo.pushedAt}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="act__footnote figures" data-reveal>
          Repository data fetched {reposFetchedAt}.
        </p>
      </div>
    </section>
  );
}
