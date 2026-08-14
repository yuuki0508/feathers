# ココロの羽（feathers）

彼女向け閲覧画面 + 管理画面（`/admin`）のクローズド Web サービス。  
Next.js + Supabase + Vercel。

## 前提

- Node.js 20+
- Docker（Docker Compose）
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 初回セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を用意

```bash
cp .env.local.example .env.local
```

`.env.local` を編集する。ローカル Supabase のキーは次で確認できる。

```bash
npx supabase status -o env
```

3. ローカル Supabase にログイン用ユーザーを作成（初回のみ）

Supabase Studio（http://127.0.0.1:55423）の Authentication → Users で、  
`.env.local` の `AUTH_EMAIL` と同じメールアドレスのユーザーを作成する。

---

## ローカル開発の起動

**通常はこのコマンドだけでよい。**

```bash
npm run dev:local
```

実行内容:

1. `npx supabase start` — ローカル Supabase を起動
2. Supabase の準備完了を待機
3. Docker で Next.js 開発サーバーを起動

### アクセス URL

| 用途 | URL |
|------|-----|
| アプリ（彼女側） | http://localhost:3000 |
| 管理画面 | http://localhost:3000/admin |
| Supabase Studio | http://127.0.0.1:55423 |
| Supabase API | http://127.0.0.1:55421 |

### ログイン（ローカル）

| 項目 | 値 |
|------|-----|
| ログイン URL | http://localhost:3000/login |
| メール | `.env.local` の `AUTH_EMAIL`（画面には表示されない） |
| パスワード | Supabase Auth に登録したパスワード |

> **注意:** `npm run dev` や `docker compose up` だけではなく、必ず `npm run dev:local` を使うこと。  
> Supabase の起動順・Docker 内からの接続・ブラウザからの接続は、この手順で正しく設定される。

### バックグラウンド起動（ログを見ずに起動したい場合）

```bash
npm run dev:local:detached
```

### 停止

```bash
npm run dev:local:down   # Next.js（Docker）を停止
npm run supabase:stop    # Supabase も停止する場合
```

---

## トラブルシュート

**ログインできない / `Failed to convert value to 'Response'`**

1. Supabase が起動しているか確認: `npx supabase status`
2. アプリを再起動: `npm run dev:local:down && npm run dev:local:detached`
3. ブラウザの Cookie を削除して http://localhost:3000/login を開き直す

**ポート 3000 が使えない**

Docker コンテナ `feathers-app-1` が 3000 を使用する。  
別途 `npm run dev` を実行すると 3001 になり、混乱の原因になるため避ける。

---

## 本番デプロイ

Vercel + Supabase（本番プロジェクト）。  
`.env.local` の本番用 Supabase 設定を Vercel の環境変数に設定する。
