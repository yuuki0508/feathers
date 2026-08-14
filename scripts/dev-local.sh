#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Supabase を起動します"
npx supabase start

echo "==> Supabase の準備完了を待ちます"
bash scripts/wait-for-supabase.sh "http://127.0.0.1:55421"

echo "==> Next.js アプリを起動します (http://localhost:3000)"
exec docker compose up --build app
