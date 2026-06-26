-- Run this once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists public.dojo_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dojo_state enable row level security;

create policy "own row select" on public.dojo_state
  for select using (auth.uid() = user_id);
create policy "own row insert" on public.dojo_state
  for insert with check (auth.uid() = user_id);
create policy "own row update" on public.dojo_state
  for update using (auth.uid() = user_id);
