create table public.karaoke_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  proposed_by text not null
    check (proposed_by in ('him', 'her')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.karaoke_songs enable row level security;

create policy "authenticated users only" on public.karaoke_songs
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.karaoke_songs to anon, authenticated, service_role;

drop trigger if exists set_updated_at on public.karaoke_songs;
create trigger set_updated_at before update on public.karaoke_songs
  for each row execute function public.set_updated_at();
