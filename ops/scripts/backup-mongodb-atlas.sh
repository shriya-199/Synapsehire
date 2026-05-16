#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/mongodb}"
MONGODB_URI="${MONGODB_URI:?MONGODB_URI is required}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"
mongodump --uri "$MONGODB_URI" --archive="$BACKUP_DIR/synapsehire-$TIMESTAMP.archive" --gzip

find "$BACKUP_DIR" -type f -name '*.archive' -mtime +"$RETENTION_DAYS" -delete

echo "MongoDB backup created: $BACKUP_DIR/synapsehire-$TIMESTAMP.archive"
