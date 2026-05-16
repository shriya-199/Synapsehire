#!/usr/bin/env bash
set -euo pipefail

apt-get update
apt-get install -y git

APP_DIR=/opt/synapsehire
REPO_URL="https://github.com/YOUR_ORG/YOUR_REPO.git"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
bash ops/scripts/bootstrap-ec2.sh

echo "Copy production env files into $APP_DIR/ops/env before first deploy."
