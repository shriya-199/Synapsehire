#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/synapsehire}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

cd synapsehire-backend
npm ci --omit=dev
mkdir -p logs uploads/recordings

cd ..
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo "PM2 deployment complete."
