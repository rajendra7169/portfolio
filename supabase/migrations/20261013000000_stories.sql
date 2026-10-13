-- Stories: writers, posts, reactions and comments, with row-level security.
-- Run this in the Supabase SQL editor (or `supabase db push`) on a new project,
-- then make yourself the admin:
--   update public.profiles set role = 'admin' where username = '<your username>';
-- Also, in the dashboard: Authentication > Sign In / Providers, turn on
-- "Allow anonymous sign-ins" (reactions without an account) and, if you like, Google.

-- ── Profiles ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{2,32}$'),
  name text not null default '',
  bio text not null default '' check (char_length(bio) <= 600),
  avatar text,
  banner text,
  role text not null default 'reader' check (role in ('admin', 'author', 'reader')),
  status text not null default 'active' check (status in ('active', 'banned')),
  joined timestamptz not null default now()
);

-- Who may do what, for the policies below. Security definer so they can read
-- profiles regardless of the caller's own access.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and status = 'active');
$$;
create function public.is_writer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'author') and status = 'active');
$$;
create function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active');
$$;

-- Every new (non-anonymous) account gets a profile, with a free username.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  if new.is_anonymous then return new; end if;
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'reader'), '[^a-zA-Z0-9]+', '', 'g'));
  if char_length(base) < 2 then base := 'reader'; end if;
  base := left(base, 24);
  candidate := base;
  while exists (select 1 from profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;
  insert into profiles (id, username, name, avatar)
  values (new.id, candidate,
          coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
          new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only an admin can change anyone's role or status, including their own.
create function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;
create trigger guard_profile before update on public.profiles
  for each row execute function public.guard_profile();

alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "edit your own profile, or any as admin" on public.profiles for update
  using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());
create policy "admins remove profiles" on public.profiles for delete using (is_admin());

-- ── Posts ────────────────────────────────────────────────────────────────
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 120 and slug !~ '[\s/?#%]'),
  type text not null default 'blog' check (type in ('blog', 'story', 'gajal', 'kabita')),
  title text not null default '',
  subtitle text not null default '',
  cover text,
  cover_layout text not null default 'full' check (cover_layout in ('full', 'side', 'none')),
  cover_position text not null default '50% 50%',
  content jsonb not null default '{"type":"doc","content":[]}',
  lang text not null default 'en' check (lang in ('en', 'ne', 'mixed')),
  tags text[] not null default '{}',
  author_id uuid references public.profiles (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  refs uuid[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_feed on public.posts (status, published_at desc);
create index posts_author on public.posts (author_id);
create index posts_refs on public.posts using gin (refs);
create index posts_tags on public.posts using gin (tags);

create function public.touch_post() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end;
$$;
create trigger touch_post before insert or update on public.posts
  for each row execute function public.touch_post();

alter table public.posts enable row level security;
create policy "published posts are public; drafts to their author and admins" on public.posts for select
  using (status = 'published' or author_id = auth.uid() or is_admin());
create policy "writers add their own posts; admins credit anyone" on public.posts for insert
  with check (is_admin() or (is_writer() and author_id = auth.uid()));
create policy "writers edit their own posts; admins edit any" on public.posts for update
  using (is_admin() or (is_writer() and author_id = auth.uid()))
  with check (is_admin() or (is_writer() and author_id = auth.uid()));
create policy "writers delete their own posts; admins delete any" on public.posts for delete
  using (is_admin() or (is_writer() and author_id = auth.uid()));

-- ── Reactions: one per reader per post (anonymous readers included) ──────
create table public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('love', 'moved', 'fire', 'clap', 'think')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.reactions enable row level security;
create policy "reactions are public" on public.reactions for select using (true);
create policy "react as yourself" on public.reactions for insert with check (user_id = auth.uid());
create policy "change your reaction" on public.reactions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "take your reaction back" on public.reactions for delete using (user_id = auth.uid());

-- ── Comments: members only (not anonymous), admins moderate ──────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);
create index comments_post on public.comments (post_id, created_at);
alter table public.comments enable row level security;
create policy "visible comments are public; hidden ones to their writer and admins" on public.comments for select
  using (status = 'visible' or user_id = auth.uid() or is_admin());
create policy "members comment as themselves" on public.comments for insert
  with check (user_id = auth.uid() and is_member() and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);
create policy "admins moderate comments" on public.comments for update using (is_admin()) with check (is_admin());
create policy "delete your own comment, or any as admin" on public.comments for delete using (user_id = auth.uid() or is_admin());

-- ── Counts for cards and the admin, under the same rules as the tables ───
create view public.post_stats with (security_invoker = on) as
  select p.id,
         (select count(*) from public.reactions r where r.post_id = p.id) as reactions,
         (select count(*) from public.comments c where c.post_id = p.id and c.status = 'visible') as comments
  from public.posts p;

-- ── Photos: the public "stories" bucket ──────────────────────────────────
-- Paths are <folder>/<user id>/<file>: writers upload anywhere, everyone else
-- only into their own folders (avatars, banners). A public bucket serves its
-- files by URL without any read policy; having none also keeps anyone from
-- listing every file through the API.
insert into storage.buckets (id, name, public) values ('stories', 'stories', true)
  on conflict (id) do nothing;
create policy "writers upload; members upload their own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'stories'
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false -- anonymous readers only react
    and (is_writer() or (storage.foldername(name))[2] = auth.uid()::text)
  );
create policy "remove your own photos, or any as admin" on storage.objects for delete to authenticated
  using (bucket_id = 'stories' and (owner_id = auth.uid()::text or is_admin()));

-- ── Housekeeping ─────────────────────────────────────────────────────────
-- The trigger functions run as triggers only; nobody calls them through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile() from public, anon, authenticated;
revoke execute on function public.touch_post() from public, anon, authenticated;
