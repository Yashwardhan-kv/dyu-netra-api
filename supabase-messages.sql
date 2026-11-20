-- ============================================================
-- Contact form storage — run ONCE in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organisation text,
  interest text,
  message text not null,
  received_at timestamptz not null default now(),
  read boolean not null default false
);

alter table public.messages enable row level security;

-- Public can INSERT a message (contact form). Cannot read/update/delete.
create policy "public can submit messages"
on public.messages for insert
to anon
with check (true);

-- Rate-limit-ish guard: reject >5 messages from same email per hour (do in app layer too)
