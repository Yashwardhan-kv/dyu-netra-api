# How to post a blog article (no code, no deploy)

Setup status: code is live on the website. One-time SQL needs to be run (below).
After that, posting = filling a form in Supabase. Nothing else.

---

## ONE-TIME SETUP (already done? skip to "Posting")

1. Open https://supabase.com/dashboard → your project (rvppydncsdfyhjiuvart)
2. Left sidebar → **SQL Editor** → **New query**
3. Paste this and click **Run**:

```sql
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('forensics','detection','ai')),
  excerpt text not null,
  body text not null,
  read_time text default '3 min read',
  published boolean default true,
  published_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "public read published posts"
on public.posts for select
to anon
using (published = true);
```

---

## POSTING AN ARTICLE (the everyday workflow)

1. Supabase Dashboard → **Table Editor** → `posts` table
2. Click **Insert row** (+ button)
3. Fill in:
   - **slug** — short url-ish id, e.g. `windows-event-log-triage` (must be unique)
   - **title** — the headline
   - **category** — exactly one of: `forensics` / `detection` / `ai`
   - **excerpt** — one-line teaser shown on the card
   - **body** — the article text. Separate paragraphs with a blank line (or single newlines). Plain text only — no HTML needed.
   - **read_time** — e.g. `4 min read` (optional)
   - **published** — leave ON to publish, OFF to save as draft
   - **published_at** — defaults to now; set a past/future date if you want to order posts manually
4. Click **Save**.

The post appears on dyunetra.dpdns.org/blog.html within seconds (it is fetched live on every visit; new posts appear at the top, above the sample articles).

## Editing / unpublishing

- Edit a row's text → Save → site updates on next visit.
- Unpublish: toggle `published` off. The post disappears from the site (draft remains in DB).

## Categories

The blog filter buttons map to categories: Forensics, Detection, AI.
To add a new category later you must also add a filter button in `src/pages/blog.html`
(ask your assistant when needed) — the schema check constraint must be updated too:

```sql
alter table public.posts drop constraint posts_category_check;
alter table public.posts add constraint posts_category_check check (category in ('forensics','detection','ai','newcat'));
```

## Security notes

- Only the publishable ("anon") key is used in the website — it can ONLY read rows marked published=true. It cannot insert/update/delete.
- The service_role key must never be placed in website code.
- Row Level Security ensures unpublished drafts are invisible to the public.

## Troubleshooting

- New post not visible? Check `published` is true, refresh with Ctrl+F5.
- Formatting: each paragraph is one block, separated by a blank line. No bold/links supported yet (plain text is sanitised for security).
