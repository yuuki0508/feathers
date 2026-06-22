-- 全テーブルに updated_at を追加し、UPDATE 時に自動更新するトリガーを設定

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- categories
alter table public.categories
  add column if not exists updated_at timestamptz default now();
update public.categories set updated_at = created_at where updated_at is null;

-- tags
alter table public.tags
  add column if not exists updated_at timestamptz default now();
update public.tags set updated_at = created_at where updated_at is null;

-- messages
alter table public.messages
  add column if not exists updated_at timestamptz default now();
update public.messages set updated_at = created_at where updated_at is null;

-- message_tags
alter table public.message_tags
  add column if not exists updated_at timestamptz default now();
update public.message_tags set updated_at = now() where updated_at is null;

-- today_message（既存カラムがあればスキップ）
alter table public.today_message
  add column if not exists updated_at timestamptz default now();
update public.today_message set updated_at = coalesce(updated_at, now());

-- memories
alter table public.memories
  add column if not exists updated_at timestamptz default now();
update public.memories set updated_at = created_at where updated_at is null;

-- likes
alter table public.likes
  add column if not exists updated_at timestamptz default now();
update public.likes set updated_at = created_at where updated_at is null;

-- diaries
alter table public.diaries
  add column if not exists updated_at timestamptz default now();
update public.diaries set updated_at = created_at where updated_at is null;

-- novels
alter table public.novels
  add column if not exists updated_at timestamptz default now();
update public.novels set updated_at = created_at where updated_at is null;

-- access_logs
alter table public.access_logs
  add column if not exists updated_at timestamptz default now();
update public.access_logs set updated_at = accessed_at where updated_at is null;

-- トリガー（既存があれば置き換え）
drop trigger if exists set_updated_at on public.categories;
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tags;
create trigger set_updated_at before update on public.tags
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.messages;
create trigger set_updated_at before update on public.messages
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.message_tags;
create trigger set_updated_at before update on public.message_tags
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.today_message;
create trigger set_updated_at before update on public.today_message
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.memories;
create trigger set_updated_at before update on public.memories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.likes;
create trigger set_updated_at before update on public.likes
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.diaries;
create trigger set_updated_at before update on public.diaries
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.novels;
create trigger set_updated_at before update on public.novels
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.access_logs;
create trigger set_updated_at before update on public.access_logs
  for each row execute function public.set_updated_at();
