alter table public.karaoke_songs
  drop column if exists artist,
  drop column if exists note,
  drop column if exists proposed_by;
