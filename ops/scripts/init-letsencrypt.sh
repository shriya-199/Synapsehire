#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-synapsehire.example.com}"
API_DOMAIN="${API_DOMAIN:-api.synapsehire.example.com}"
EMAIL="${EMAIL:-admin@synapsehire.example.com}"
STAGING="${STAGING:-0}"

if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
else
  STAGING_ARG=""
fi

mkdir -p ops/certbot/www ops/certbot/conf

docker run --rm \
  -v "$(pwd)/ops/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/ops/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  $STAGING_ARG \
  -d "$DOMAIN" \
  -d "$API_DOMAIN"

echo "Certificates issued. Restart nginx with: docker compose -f docker-compose.prod.yml restart nginx"
