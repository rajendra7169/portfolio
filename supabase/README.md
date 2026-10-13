# Stories on Supabase

`/stories` (the posts, writers, reactions, comments and the admin at
`/stories/admin`) runs in two modes:

- **Demo**, when no Supabase keys are set: everything lives in the visitor's own
  browser (IndexedDB), seeded with sample posts. Good for trying it out; nothing
  is shared between visitors. "Open the demo as Rajendra (admin)" on the sign-in
  page opens the writer's side. The admin's overview has a reset button.
- **Supabase**, when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  are set: posts, accounts, comments and photos are real and shared.

## Going live

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough).
2. In **SQL Editor**, run `migrations/20261013000000_stories.sql` (or, with the
   Supabase CLI linked to the project, `supabase db push`). It creates the
   tables, the row-level security rules, the `post_stats` view and the public
   `stories` storage bucket for photos.
3. **Authentication → Sign In / Providers**:
   - keep **Email** on (readers sign up to comment);
   - turn on **Allow anonymous sign-ins**, so readers can react without an account;
   - optionally turn on **Google** (it needs a Google OAuth client; Supabase's
     page for the provider walks through it).
4. **Authentication → URL Configuration**: set the Site URL to
   `https://rajendrapandey.info.np` and add these redirect URLs (the confirmation,
   Google and password-reset links all come back into Stories):
   `https://rajendrapandey.info.np/stories/**` and, for local work,
   `http://localhost:3000/stories/**`.
5. Copy `.env.example` to `.env.local` and fill in the project URL and anon key
   (Project Settings → API). Add the same two variables wherever the site is hosted.
6. Sign up on `/stories/signin` with your own email, then make yourself the admin
   in the SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where username = 'your_username';
   ```

   (Your username is shown on your profile page, `/stories/authors/…`.)

From then on, use **People** in the admin to make other accounts writers
(`author`), or suspend them.

## Who can do what

| | Read | React | Comment | Write posts | Edit any post, manage people and comments |
|---|---|---|---|---|---|
| Visitor | ✓ | ✓ (anonymous) | | | |
| Reader (signed up) | ✓ | ✓ | ✓ | | |
| Writer (`author`) | ✓ | ✓ | ✓ | own posts | |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |

These rules are enforced by the database (row-level security), not just the
pages. Drafts are visible only to their writer and the admin. Hidden comments
are visible only to their writer and the admin.

## Photos

Uploads are scaled down in the browser (to 2000 px, WebP) before they're sent,
and stored in the `stories` bucket under `<folder>/<user id>/`.
