#!/usr/bin/env bash
set -euo pipefail

cd synapsehire-frontend

test -f .env.production || {
  echo "Missing synapsehire-frontend/.env.production. Create it from ops/env/frontend.production.env.example."
  exit 1
}

npm ci
npm run lint
npm run build
npx vercel deploy --prod
