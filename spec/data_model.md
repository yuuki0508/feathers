# ココロの羽 — データモデル

## 概要

- データベース: Supabase (PostgreSQL)
- 認証: Supabase Auth（メールアドレス＋パスワード）
- 全テーブルにRow Level Security (RLS)を有効化
- 認証済みユーザーのみ全操作可能

---

## テーブル一覧

### categories（カテゴリ）

手紙画面の絞り込みフィルターに使用。管理画面から追加・編集・削除可能。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| name | text | カテゴリ名（例: 不安なとき） |
| created_at | timestamptz | 作成日時 |

---

### tags（タグ）

管理用・将来の検索用。現在は彼女画面に非表示。管理画面でのみ参照。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| name | text | タグ名（例: 寄り添う） |
| created_at | timestamptz | 作成日時 |

---

### messages（メッセージ・手紙）

手紙画面に表示されるメッセージ。カテゴリで絞り込み可能。タグは中間テーブルで管理。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| category_id | uuid | FK → categories.id |
| body | text | 本文 |
| created_at | timestamptz | 投稿日時 |

**リレーション**
- `category_id` → `categories.id`（多対一）
- `message_tags`経由で`tags`と多対多

---

### message_tags（メッセージ×タグ 中間テーブル）

messagesとtagsの多対多を管理。

| カラム | 型 | 説明 |
|--------|-----|------|
| message_id | uuid | FK → messages.id（CASCADE DELETE） |
| tag_id | uuid | FK → tags.id（CASCADE DELETE） |

**PK**: (message_id, tag_id) の複合主キー

---

### today_message（今日のひとこと）

ホーム画面に表示。基本的に1レコードのみ存在し、毎日更新する運用。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| body | text | 本文 |
| display_date | date | 表示日付（デフォルト: 当日） |
| updated_at | timestamptz | 更新日時 |

**運用メモ**: レコードを増やして日付で最新を取得する方式に変更することも可能。

---

### memories（思い出）

写真＋一言のセットで時系列に管理。写真はSupabase Storageに保存し、URLをphoto_urlに格納。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| caption | text | 写真に添える一言 |
| photo_url | text | Supabase StorageのURL（署名付きURL推奨） |
| memory_date | date | 思い出の日付 |
| created_at | timestamptz | 登録日時 |

---

### likes（好きなところ）

彼女の好きなところを一言ずつ追加していくリスト。display_orderで表示順を管理。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| body | text | 好きなところ（一言） |
| display_order | int | 表示順（デフォルト: 0） |
| created_at | timestamptz | 登録日時 |

---

### diaries（日記）

近況を伝えるための日記。タイトル＋本文。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| title | text | タイトル |
| body | text | 本文 |
| diary_date | date | 日記の日付（デフォルト: 当日） |
| created_at | timestamptz | 登録日時 |

---

### novels（お楽しみ・小説）

不定期に投稿する長文小説。bodyはtext型のため文字数制限なし。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| title | text | タイトル |
| body | text | 本文（数千字〜対応） |
| created_at | timestamptz | 投稿日時 |

**実装メモ**: 一覧画面では`left(body, 100)`で冒頭のみ取得し、詳細画面で全文取得する。

---

### access_logs（アクセスログ）

管理画面の分析機能用。彼女がどのページ・コンテンツを開いたかを記録。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | PK、自動生成 |
| page_type | text | ページ種別（例: 手紙 / 日記 / 思い出 / お楽しみ / 好きなところ / ホーム） |
| content_id | text | 閲覧したコンテンツのID（任意） |
| content_title | text | 閲覧したコンテンツのタイトル（任意） |
| accessed_at | timestamptz | アクセス日時 |

**実装メモ**: 彼女画面でページ遷移・コンテンツ表示のたびにINSERTする。page_typeは文字列で統一管理。

---

## リレーション図（概略）

```
categories ──< messages >──── message_tags >──── tags
today_message（独立）
memories（独立）
likes（独立）
diaries（独立）
novels（独立）
access_logs（独立）
```

---

## Supabase Storage

写真（memories）はSupabase Storageの`memories`バケットに保存。
- バケット名: `memories`
- アクセス: 認証済みユーザーのみ（privateバケット）
- URL取得: 署名付きURL（`createSignedUrl`）を使用し、URLが直接公開されないようにする

---

## 認証設計

- Supabase Authを使用
- 彼女専用の1アカウントのみ作成
- メールアドレスはダミー可（例: `kanojo@example.com`）
- パスワードのみ彼女に伝える
- セッション有効期限: 長めに設定（Supabaseダッシュボード > Auth > Settings > JWT Expiry）
- Next.jsミドルウェアで未認証リクエストをサーバー側で弾く
