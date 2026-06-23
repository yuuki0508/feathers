-- 思い出写真用 Storage バケット（private）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated insert memories photos" on storage.objects;
drop policy if exists "authenticated select memories photos" on storage.objects;
drop policy if exists "authenticated update memories photos" on storage.objects;
drop policy if exists "authenticated delete memories photos" on storage.objects;

create policy "authenticated insert memories photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'memories');

create policy "authenticated select memories photos"
on storage.objects for select to authenticated
using (bucket_id = 'memories');

create policy "authenticated update memories photos"
on storage.objects for update to authenticated
using (bucket_id = 'memories');

create policy "authenticated delete memories photos"
on storage.objects for delete to authenticated
using (bucket_id = 'memories');
