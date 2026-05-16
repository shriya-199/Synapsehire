#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/synapsehire}"
BRANCH="${BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Expected SynapseHire git checkout at $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

test -f ops/env/backend.production.env || {
  echo "Missing ops/env/backend.production.env. Create it from ops/env/backend.production.env.example."
  exit 1
}

docker compose -f docker-compose.prod.yml pull || true
docker compose -f docker-compose.prod.yml build --pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker image prune -f

echo "Deployment complete."
