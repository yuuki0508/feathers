# データモデル差分

## 変更箇所: today_message（今日のひとこと）

### 変更理由
「毎日のことば」画面（本棚内）で過去の「今日のひとこと」を一覧表示するため、
1レコードを更新し続ける設計から、毎日新しいレコードを追加する設計に変更。

---

### 変更前

> ホーム画面に表示。基本的に1レコードのみ存在し、毎日更新する運用。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| body | text | 本文 |
| display_date | date | 表示日付（デフォルト: 当日） |
| updated_at | timestamptz | 更新日時 |

**運用メモ**: レコードを増やして日付で最新を取得する方式に変更することも可能。

---

### 変更後

> ホーム画面に表示。毎日新しいレコードを追加する運用。最新レコード（display_date降順）をホームに表示し、過去レコードは「毎日のことば」画面で一覧表示する。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| body | text | 本文 |
| display_date | date | 表示日付（デフォルト: 当日）、ユニーク制約あり |
| created_at | timestamptz | 登録日時 |

**運用メモ**:
- ホーム画面: `display_date`降順で最新1件を取得して表示
- 毎日のことば画面: `display_date`降順で全件取得して一覧表示
- 同じ日に複数登録しないよう`display_date`にユニーク制約を設ける
- 管理画面では当日分がすでに存在する場合はUPSERT（更新）、存在しない場合はINSERT（新規追加）で運用

---

## 変更に伴うSQL修正

```sql
-- today_messageテーブルを再作成
drop table if exists today_message;

create table today_message (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  display_date date not null default current_date,
  created_at timestamptz default now(),
  unique(display_date)
);

alter table today_message enable row level security;
create policy "authenticated users only" on today_message
  for all to authenticated using (true) with check (true);
```

---

## 変更に伴う画面・API修正

| 画面 | 変更内容 |
|------|----------|
| ホーム（`/`） | `select * from today_message order by display_date desc limit 1` で最新1件取得 |
| 毎日のことば（`/shelf/today-history`） | `select * from today_message order by display_date desc` で全件取得 |
| 管理画面（`/admin`） | 当日の`display_date`でUPSERT（`on conflict (display_date) do update set body = excluded.body`） |

---

## 仕様書への追記

`spec.md`の画面構成・本棚セクションに以下を追記してください。

### `/shelf/today-history` — 毎日のことば（新規追加）

- タイトル: 毎日のことば
- サブタイトル: 〜轍〜
- `today_message`テーブルを`display_date`降順で全件取得して一覧表示
- 各レコードは日付＋本文のカード形式で表示

