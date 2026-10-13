"use client";

// A writer's (or reader's) page: banner, photo, bio, then everything they've
// published on the left and the rail on the right. Their own page lets them edit it.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMe, useStories } from "@/lib/stories/store";
import { neNum, POST_TYPES } from "@/lib/stories/types";
import ProfileForm from "./ProfileForm";
import { Couplet, Loved, Rail, Topics, useLibrary, Writers, type Library } from "./Rail";
import { Avatar, Empty, Entry, Loading } from "./ui";

const ROLE = { admin: "Editor", author: "Writer", reader: "Reader" } as const;
const JOINED = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default function AuthorPage({ username }: { username: string }) {
  const me = useMe();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { data: profile, loading } = useStories((s) => s.getProfile(username), [username]);
  const { data: lib } = useLibrary();

  useEffect(() => {
    if (profile) document.title = `${profile.name} · कथा Stories`;
  }, [profile]);

  if (loading) return <Loading />;
  if (!profile)
    return (
      <Empty title="No one by that name">
        <Link href="/stories">Back to Stories</Link>
      </Empty>
    );

  const posts = (lib?.posts ?? []).filter((p) => p.authorId === profile.id);
  const theirs: Library | null = lib ? { ...lib, posts } : null;
  const mine = me && (me.id === profile.id || me.role === "admin");
  const counts = POST_TYPES.map((t) => ({ t, n: posts.filter((p) => p.type === t.id).length })).filter((x) => x.n);

  if (editing && mine)
    return (
      <div className="st-wrap st-narrow">
        <h1 className="st-page-h">Edit profile</h1>
        <ProfileForm
          profile={profile}
          onCancel={() => setEditing(false)}
          onSaved={(p) => {
            setEditing(false);
            if (p.username !== username) router.replace(`/stories/authors/${p.username}`);
          }}
        />
      </div>
    );

  return (
    <div className="st-author">
      <div className={`st-banner${profile.banner ? "" : " is-plain"}`} style={profile.banner ? { backgroundImage: `url("${profile.banner}")` } : undefined} />
      <header className="st-author-head st-wrap">
        <Avatar profile={profile} size={128} />
        <div className="st-author-text">
          <h1>{profile.name}</h1>
          <p className="st-author-meta">
            @{profile.username} · {ROLE[profile.role]} · joined {JOINED.format(new Date(profile.joined))}
            {profile.status === "banned" && <span className="st-comment-badge st-comment-badge--hidden">Suspended</span>}
          </p>
          {profile.bio && <p className="st-author-bio">{profile.bio}</p>}
          {counts.length > 0 && (
            <ul className="st-author-counts">
              {counts.map(({ t, n }) => (
                <li key={t.id}>
                  <b lang="ne">{neNum(n)}</b> <span lang="ne">{t.ne}</span> {n === 1 ? t.label : t.plural}
                </li>
              ))}
            </ul>
          )}
        </div>
        {mine && (
          <button type="button" className="st-btn st-btn--ghost st-author-edit" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </header>

      <div className="st-wrap st-cols">
        <section className="st-main st-entries" aria-label={`Writing by ${profile.name}`}>
          {!lib ? (
            <Loading />
          ) : posts.length ? (
            posts.map((p) => <Entry key={p.id} post={p} author={profile} stats={lib.stats[p.id]} />)
          ) : (
            <Empty title={profile.role === "reader" ? `${profile.name} reads here` : "Nothing published yet"}>
              {profile.role === "reader" ? "Readers comment and react; writing comes from writers." : null}
            </Empty>
          )}
        </section>
        {lib && theirs && (
          <Rail label="More to read">
            {posts.length > 0 && <Couplet lib={theirs} />}
            {posts.length > 0 && <Loved lib={theirs} />}
            {posts.length > 0 ? <Topics lib={theirs} /> : <Writers lib={lib} />}
          </Rail>
        )}
      </div>
    </div>
  );
}
