#!/usr/bin/env sh
set -eu

SUPABASE_URL="${1:-http://127.0.0.1:55421}"
MAX_ATTEMPTS="${2:-60}"

attempt=0
until wget -qO- "${SUPABASE_URL}/auth/v1/health" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "Supabase が ${SUPABASE_URL} で応答しません。" >&2
    echo "別ターミナルで npx supabase start を実行してください。" >&2
    exit 1
  fi
  echo "Supabase の起動を待っています... (${attempt}/${MAX_ATTEMPTS})"
  sleep 2
done

echo "Supabase is ready."
