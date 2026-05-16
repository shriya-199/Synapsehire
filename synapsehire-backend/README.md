# SynapseHire Backend

Production-grade Node.js + Express backend scaffold for SynapseHire.

## Features

- Express MVC structure
- MongoDB with Mongoose
- Redis integration
- JWT access and refresh token auth
- Role-based access control
- Socket.IO interview room events
- Helmet, CORS, rate limiting, sanitization, HPP protection
- Joi validation middleware
- Winston logging
- Centralized error handling
- API versioning under `/api/v1`
- Docker and Docker Compose support

## Run Locally

```bash
cp .env.example .env
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Health Check

```txt
GET /api/v1/health
```
