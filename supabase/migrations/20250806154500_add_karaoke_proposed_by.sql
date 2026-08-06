alter table public.karaoke_songs
  add column proposed_by text not null default 'viewer'
    check (proposed_by in ('admin', 'viewer'));
