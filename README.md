# SynapseHire

AI-powered hiring simulation and developer evaluation platform for live coding interviews, recruiter assessments, collaborative coding, video monitoring, AI feedback, and hiring analytics.

SynapseHire is built like a funded startup product: real-time collaboration, production authentication, AI evaluation workflows, anti-cheating telemetry, role-aware dashboards, Dockerized deployment, CI/CD, monitoring, and cloud-ready infrastructure.

## Product Snapshot

SynapseHire helps hiring teams run realistic technical interviews and convert fragmented candidate signals into structured, auditable hiring intelligence.

Core users:

- **Candidates** attend live coding and video interviews, upload resumes, and review feedback.
- **Recruiters** create assessments, monitor interviews, review AI insights, and rank candidates.
- **Admins** manage organization-level controls, security, analytics, and deployment settings.

## Highlights

- Real-time collaborative Monaco coding editor
- WebRTC video interviews with screen, tab, face, and audio monitoring
- AI interview analysis using OpenAI/Gemini provider abstraction
- Resume-job matching and GitHub profile evaluation
- JWT auth with refresh rotation, Google OAuth, email verification, OTP, and session management
- Recruiter, candidate, AI, and admin analytics dashboards
- Redis-backed Socket.IO room state and autosave
- MongoDB Atlas-ready schema design
- Docker, Docker Compose, Nginx, PM2, GitHub Actions, Vercel, AWS deployment assets
- Prometheus/Grafana monitoring and MongoDB backup scripts

## Tech Stack

Frontend:

- React
- Tailwind CSS
- Redux Toolkit
- Socket.IO Client
- Monaco Editor
- Recharts
- Framer Motion
- WebRTC

Backend:

- Node.js
- Express
- MongoDB / Mongoose
- Redis
- Socket.IO
- JWT
- Multer
- Nodemailer
- OpenAI/Gemini APIs

Infrastructure:

- Docker
- Nginx
- GitHub Actions
- PM2
- Vercel
- AWS EC2/ECS-ready deployment
- MongoDB Atlas
- Redis Cloud
- Prometheus/Grafana

## Repository Layout

```txt
.
├── synapsehire-backend/     # Express API, Socket.IO, MongoDB, Redis, AI, monitoring
├── synapsehire-frontend/    # React frontend, dashboards, video, editor, auth
├── ops/                     # Nginx, monitoring, AWS, backups, deployment scripts
├── docs/                    # Architecture, API, resume, interview, security docs
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.prod.yml  # Production Docker Compose stack
└── ecosystem.config.cjs     # PM2 production process config
```

## Quick Start

Backend:

```bash
cd synapsehire-backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd synapsehire-frontend
cp .env.example .env
npm install
npm run dev
```

Production Docker:

```bash
cp ops/env/backend.production.env.example ops/env/backend.production.env
docker compose -f docker-compose.prod.yml up --build -d
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Security and Scalability](docs/SECURITY_AND_SCALABILITY.md)
- [Resume and Interview Content](docs/RESUME_AND_INTERVIEW.md)
- [GitHub Showcase Content](docs/GITHUB_SHOWCASE.md)
- [Operations Runbook](ops/README.md)

Swagger UI is served by the backend at:

```txt
GET /api/docs
GET /api/openapi.json
```

## Portfolio Positioning

SynapseHire demonstrates end-to-end full-stack engineering depth:

- System design beyond CRUD
- Real-time collaboration
- AI product integration
- Security-sensitive auth and monitoring
- Analytics and data modeling
- Production deployment and observability
- Clean architecture and reusable frontend modules

It is suitable for resume, portfolio, GitHub, and interview discussion as a startup-grade SaaS platform.
