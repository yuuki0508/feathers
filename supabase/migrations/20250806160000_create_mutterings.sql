create table public.mutterings (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) <= 300),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.muttering_replies (
  id uuid primary key default gen_random_uuid(),
  muttering_id uuid not null references public.mutterings(id) on delete cascade,
  body text not null check (char_length(body) <= 300),
  author_type text not null check (author_type in ('admin', 'viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index muttering_replies_muttering_id_idx on public.muttering_replies (muttering_id);

alter table public.mutterings enable row level security;
alter table public.muttering_replies enable row level security;

create policy "authenticated users only" on public.mutterings
  for all to authenticated using (true) with check (true);

create policy "authenticated users only" on public.muttering_replies
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.mutterings to anon, authenticated, service_role;
grant select, insert, update, delete on public.muttering_replies to anon, authenticated, service_role;

drop trigger if exists set_updated_at on public.mutterings;
create trigger set_updated_at before update on public.mutterings
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.muttering_replies;
create trigger set_updated_at before update on public.muttering_replies
  for each row execute function public.set_updated_at();
