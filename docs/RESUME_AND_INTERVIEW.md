# Resume and Interview Content

## ATS-Friendly Project Description

SynapseHire is a production-grade AI hiring simulation platform that enables live collaborative coding interviews, WebRTC video interviews, AI-powered candidate evaluation, anti-cheating monitoring, recruiter analytics, and candidate ranking. Built with React, Tailwind CSS, Redux Toolkit, Node.js, Express, MongoDB, Redis, Socket.IO, WebRTC, Monaco Editor, OpenAI/Gemini APIs, Docker, GitHub Actions, Nginx, and cloud deployment workflows.

## STAR Resume Bullets

- **Situation:** Technical hiring workflows often rely on fragmented notes, inconsistent evaluations, and disconnected coding/video tools. **Task:** Designed and built a unified hiring simulation platform. **Action:** Implemented real-time Monaco collaboration, WebRTC video interviews, AI scoring, anti-cheating telemetry, and recruiter analytics using React, Express, MongoDB, Redis, and Socket.IO. **Result:** Delivered a startup-grade platform architecture covering assessment creation, live interviews, AI feedback, monitoring, and reporting.

- **Situation:** Live coding interviews require low-latency collaboration and reliable state recovery. **Task:** Build a Google Docs-style coding workspace. **Action:** Created Redis-backed Socket.IO room state, editor versioning, autosave, cursor tracking, typing indicators, and reconnect hydration. **Result:** Enabled multi-user collaborative coding sessions with conflict handling and durable interview event history.

- **Situation:** Recruiters need consistent technical and communication evaluation across candidates. **Task:** Build an AI interview analysis engine. **Action:** Designed structured OpenAI/Gemini prompts, JSON schema response parsing, scoring normalization, resume-job matching, GitHub evaluation, and hiring probability computation. **Result:** Produced auditable AI feedback with strengths, weaknesses, risks, and recommendation categories.

- **Situation:** Remote interviews increase cheating and identity risks. **Task:** Add real-time monitoring and recruiter visibility. **Action:** Implemented WebRTC video, screen-share monitoring, tab-switch detection, face detection alerts, audio activity monitoring, session recording, and real-time alert dashboards. **Result:** Created an anti-cheating workflow with persistent risk signals and recruiter acknowledgement.

- **Situation:** A portfolio project needed production credibility beyond local CRUD features. **Task:** Add deployment, security, and observability. **Action:** Added Docker, Docker Compose, Nginx TLS proxying, PM2 cluster config, GitHub Actions CI/CD, Vercel deployment, Prometheus/Grafana monitoring, and MongoDB backup scripts. **Result:** Shipped a cloud-ready architecture suitable for AWS, MongoDB Atlas, Redis Cloud, and Vercel.

## Short Resume Version

Built **SynapseHire**, an AI-powered hiring simulation SaaS using React, Node.js, MongoDB, Redis, Socket.IO, WebRTC, Monaco Editor, and OpenAI/Gemini APIs. Implemented live collaborative coding, video interview monitoring, AI feedback generation, candidate ranking, recruiter analytics, JWT auth, Dockerized deployment, CI/CD, and production monitoring.

## Interview Talking Points

### Architecture

- I used a modular monolith first because the product has many features but benefits from simpler deployment and shared domain models early on.
- I separated controllers, services, models, validators, providers, and sockets to keep business logic testable.
- Redis is used for ephemeral real-time state, while MongoDB is the durable source of truth.

### Real-Time Collaboration

- Editor changes include a version number so stale updates can trigger sync recovery.
- Redis stores the latest editor snapshot and room participants.
- Socket reconnect hydrates the room from server state.

### AI

- AI output is constrained through structured JSON schemas.
- Scores are normalized server-side instead of trusting raw model output.
- Prompt and rubric versions are stored for auditability.

### Security

- Refresh tokens are stored as HTTP-only cookies and rotated.
- Session metadata is persisted and revocable.
- Untrusted code is not executed in the API server.
- Monitoring events are treated as telemetry, validated server-side, and persisted.

### Scalability

- Socket.IO can scale horizontally with a Redis adapter.
- AI, code execution, and media processing are natural service extraction points.
- Analytics can move from MongoDB aggregations to ClickHouse/BigQuery as data grows.

## One-Minute Project Pitch

SynapseHire is a full-stack AI hiring platform that simulates real technical interviews. Candidates join a live coding and video room, recruiters monitor progress in real time, and AI generates structured feedback across code quality, communication, confidence, technical keywords, resume fit, and GitHub signals. The system includes production authentication, real-time collaboration, anti-cheating monitoring, analytics dashboards, Docker deployment, CI/CD, and cloud-ready infrastructure.
