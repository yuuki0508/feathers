-- NOTE（お互いが書き込むスレッド）
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) <= 500),
  author_type text not null check (author_type in ('admin', 'viewer')),
  photo_paths text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists note_replies (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  author_type text not null check (author_type in ('admin', 'viewer')),
  photo_paths text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists note_replies_note_id_idx on note_replies (note_id);

alter table notes add column if not exists photo_paths text[] not null default '{}';
alter table note_replies add column if not exists photo_paths text[] not null default '{}';

alter table notes enable row level security;
alter table note_replies enable row level security;

drop policy if exists "authenticated users only" on notes;
create policy "authenticated users only" on notes
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users only" on note_replies;
create policy "authenticated users only" on note_replies
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on notes to anon, authenticated, service_role;
grant select, insert, update, delete on note_replies to anon, authenticated, service_role;

drop trigger if exists set_updated_at on notes;
create trigger set_updated_at before update on notes
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on note_replies;
create trigger set_updated_at before update on note_replies
  for each row execute function public.set_updated_at();

-- 写真用 Storage バケット（private）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notes',
  'notes',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated insert notes photos" on storage.objects;
drop policy if exists "authenticated select notes photos" on storage.objects;
drop policy if exists "authenticated update notes photos" on storage.objects;
drop policy if exists "authenticated delete notes photos" on storage.objects;

create policy "authenticated insert notes photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'notes');

create policy "authenticated select notes photos"
on storage.objects for select to authenticated
using (bucket_id = 'notes');

create policy "authenticated update notes photos"
on storage.objects for update to authenticated
using (bucket_id = 'notes');

create policy "authenticated delete notes photos"
on storage.objects for delete to authenticated
using (bucket_id = 'notes');
