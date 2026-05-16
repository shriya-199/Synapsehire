# SynapseHire Production Operations

## Production Architecture

Recommended production topology:

```txt
Vercel / CDN
  |
React frontend
  |
AWS ALB or Nginx reverse proxy
  |
Node.js API containers or PM2 cluster
  |
MongoDB Atlas + Redis Cloud
  |
Object storage for recordings and uploads
```

The provided Docker Compose stack is suitable for a single AWS EC2 host or small production deployment. For larger workloads, move the API to ECS/Fargate or EKS and keep MongoDB Atlas, Redis Cloud, S3, and observability managed.

## Required Secrets

GitHub Actions:

```txt
AWS_EC2_HOST
AWS_EC2_USER
AWS_EC2_SSH_KEY
AWS_EC2_PORT
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_API_BASE_URL
VITE_SOCKET_URL
VITE_GOOGLE_CLIENT_ID
```

Backend production env:

```txt
MONGODB_URI
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
SMTP_*
OPENAI_API_KEY or GEMINI_API_KEY
GOOGLE_CLIENT_ID
CODE_RUNNER_URL
```

## AWS EC2 Deployment

1. Provision Ubuntu 22.04/24.04 EC2.
2. Open ports `22`, `80`, and `443`.
3. Attach an Elastic IP.
4. Point DNS:
   - `synapsehire.example.com` to the EC2 IP or frontend provider.
   - `api.synapsehire.example.com` to the EC2 IP.
5. Run:

```bash
sudo mkdir -p /opt/synapsehire
sudo chown $USER:$USER /opt/synapsehire
git clone <repo-url> /opt/synapsehire
cd /opt/synapsehire
bash ops/scripts/bootstrap-ec2.sh
cp ops/env/backend.production.env.example ops/env/backend.production.env
```

Fill `ops/env/backend.production.env`, then:

```bash
bash ops/scripts/deploy-aws-docker.sh
DOMAIN=synapsehire.example.com API_DOMAIN=api.synapsehire.example.com EMAIL=admin@example.com bash ops/scripts/init-letsencrypt.sh
docker compose -f docker-compose.prod.yml restart nginx
```

## Vercel Frontend Deployment

Set these Vercel environment variables:

```txt
VITE_API_BASE_URL=https://api.synapsehire.example.com/api/v1
VITE_SOCKET_URL=https://api.synapsehire.example.com
VITE_GOOGLE_CLIENT_ID=<google-client-id>
```

The repository includes `synapsehire-frontend/vercel.json` for SPA rewrites and secure headers.

## MongoDB Atlas

Use:

- M10 or higher for production.
- Point-in-time backups enabled.
- IP access list restricted to API egress IPs.
- Database user with least privilege.
- TLS-required connection string.
- Alerts for CPU, disk, connections, replication lag.

## Redis Cloud

Use:

- TLS endpoint, referenced with `rediss://`.
- Eviction policy appropriate for cache workloads.
- Memory alerting at 70/85/95%.
- Separate production and staging databases.

## SSL

The Nginx config uses Certbot webroot challenges. In AWS, ACM + ALB is preferred for multi-instance deployments. For single EC2, Certbot is acceptable.

## Logging

Application logs are written to stdout in Docker and PM2 log files in PM2 mode. Production recommendations:

- Ship Docker logs to CloudWatch Logs.
- Add log retention policy, usually 14-30 days.
- Redact tokens and credentials.
- Alert on elevated 5xx rates and process restarts.

## Monitoring

Included:

- Prometheus
- Grafana
- Node exporter
- Redis exporter

Production additions:

- Sentry for frontend/backend exceptions.
- Uptime checks for `/api/v1/health`.
- CloudWatch alarms for CPU, memory, disk, ALB 5xx.
- MongoDB Atlas and Redis Cloud native alerts.

## Backup Strategy

MongoDB Atlas:

- Enable continuous cloud backups.
- Keep 7 days PITR minimum, 30 days for enterprise.
- Test restore monthly.

Local logical backup:

- `ops/scripts/backup-mongodb-atlas.sh`
- Cron template: `ops/cron/synapsehire-backups.cron`

Recordings/uploads:

- Prefer S3 with versioning and lifecycle rules.
- Encrypt with SSE-KMS.
- Retain interview recordings according to legal policy.

## Security Hardening

- Use HTTP-only secure cookies for refresh tokens.
- Keep `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` different.
- Enforce CORS allowlist.
- Restrict MongoDB/Redis network access.
- Run containers as non-root where possible.
- Use Docker image scanning in CI/CD.
- Keep API and monitoring dashboards behind security groups or VPN.
- Do not expose MongoDB, Redis, Prometheus, or Grafana publicly.
- Rotate secrets quarterly or after personnel changes.

## Scaling Strategy

Phase 1:

- Single EC2 host with Docker Compose.
- MongoDB Atlas and Redis Cloud.
- Vercel frontend.

Phase 2:

- Move API to ECS/Fargate behind ALB.
- Use Socket.IO Redis adapter for horizontal WebSocket scaling.
- Store recordings in S3.
- Add CloudFront for static/media delivery.

Phase 3:

- Split code execution, AI analysis, media processing, and analytics workers.
- Use SQS/BullMQ queues for async work.
- Move analytics to ClickHouse/BigQuery when MongoDB aggregations become expensive.
