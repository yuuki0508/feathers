-- ============================================================
-- ココロの羽 — Supabase CREATE文
-- ============================================================

-- カテゴリ（手紙の絞り込みに使用）
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- タグ（管理用・将来の検索用、彼女画面には非表示）
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- メッセージ・手紙
create table messages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- メッセージ×タグ 中間テーブル
create table message_tags (
  message_id uuid references messages(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  updated_at timestamptz default now(),
  primary key (message_id, tag_id)
);

-- 今日のひとこと（1レコードを更新し続ける）
create table today_message (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  display_date date default current_date,
  updated_at timestamptz default now()
);

-- 思い出（写真＋一言）
create table memories (
  id uuid primary key default gen_random_uuid(),
  caption text not null,
  photo_url text,
  memory_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 好きなところ
create table likes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 日記
create table diaries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  diary_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- お楽しみ（小説）
create table novels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- アクセスログ（分析用）
create table access_logs (
  id uuid primary key default gen_random_uuid(),
  page_type text not null,
  content_id text,
  content_title text,
  accessed_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security（全テーブル有効化）
-- 認証済みユーザーのみ読み書き可能
-- ============================================================

alter table categories   enable row level security;
alter table tags         enable row level security;
alter table messages     enable row level security;
alter table message_tags enable row level security;
alter table today_message enable row level security;
alter table memories     enable row level security;
alter table likes        enable row level security;
alter table diaries      enable row level security;
alter table novels       enable row level security;
alter table access_logs  enable row level security;

-- 認証済みユーザーに全操作を許可するポリシー
create policy "authenticated users only" on categories   for all to authenticated using (true) with check (true);
create policy "authenticated users only" on tags         for all to authenticated using (true) with check (true);
create policy "authenticated users only" on messages     for all to authenticated using (true) with check (true);
create policy "authenticated users only" on message_tags for all to authenticated using (true) with check (true);
create policy "authenticated users only" on today_message for all to authenticated using (true) with check (true);
create policy "authenticated users only" on memories     for all to authenticated using (true) with check (true);
create policy "authenticated users only" on likes        for all to authenticated using (true) with check (true);
create policy "authenticated users only" on diaries      for all to authenticated using (true) with check (true);
create policy "authenticated users only" on novels       for all to authenticated using (true) with check (true);
create policy "authenticated users only" on access_logs  for all to authenticated using (true) with check (true);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on categories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on tags
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on messages
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on message_tags
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on today_message
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on memories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on likes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on diaries
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on novels
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on access_logs
  for each row execute function public.set_updated_at();

-- ============================================================
-- API ロールへの権限付与（RLS と併用必須）
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to anon, authenticated, service_role;

alter default privileges in schema public
grant usage, select on sequences to anon, authenticated, service_role;
