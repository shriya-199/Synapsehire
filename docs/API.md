# SynapseHire API Documentation

Base URL:

```txt
/api/v1
```

Swagger:

```txt
GET /api/docs
GET /api/openapi.json
```

## Authentication

```txt
POST /auth/signup/candidate
POST /auth/signup/recruiter
POST /auth/login
POST /auth/google
POST /auth/refresh-token
POST /auth/logout
POST /auth/verify-email
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/otp/request
POST /auth/otp/verify
GET  /auth/me
GET  /auth/sessions
DELETE /auth/sessions
DELETE /auth/sessions/:sessionId
```

Security:

- Access token: Bearer JWT
- Refresh token: HTTP-only secure cookie
- Refresh tokens are rotated and tracked as sessions

## Interviews

```txt
GET  /interviews
POST /interviews
GET  /interviews/:id
POST /interviews/:id/start
POST /interviews/:id/end
```

## Collaborative Coding

Socket namespace: default Socket.IO namespace.

Client events:

```txt
interview:join
editor:change
editor:cursor
editor:typing
editor:language-change
editor:autosave
chat:message
video:signal
video:media-state
monitoring:event
```

Server events:

```txt
interview:state
interview:presence
editor:change
editor:sync-required
editor:cursor
editor:typing
editor:saved
code:run-result
monitoring:flag
video:offer
video:answer
video:ice-candidate
```

## Code Execution

```txt
POST /code/run
GET  /code/interviews/:interviewId/runs
```

The API does not execute untrusted code locally. Configure `CODE_RUNNER_URL` to forward code to an isolated runner service.

## AI

```txt
POST /ai/interviews/analyze
POST /ai/answers/analyze
POST /ai/resume-job-match
POST /ai/github/evaluate
GET  /ai/evaluations/:id
GET  /ai/dashboard
```

AI responses are normalized into structured scoring dimensions:

- technical correctness
- problem solving
- code quality
- communication
- debugging
- efficiency
- confidence
- keyword coverage
- hiring probability

## Monitoring

```txt
GET   /monitoring/interviews/:interviewId/dashboard
GET   /monitoring/interviews/:interviewId/alerts
PATCH /monitoring/alerts/:alertId/acknowledge
POST  /monitoring/recordings/chunks
POST  /monitoring/recordings/complete
GET   /monitoring/interviews/:interviewId/recordings
```

## Analytics

```txt
GET /analytics/overview
GET /analytics/funnel
GET /analytics/performance
GET /analytics/skills
GET /analytics/reports
GET /analytics/export/reports.csv
GET /analytics/candidate
GET /analytics/admin
```

Common filters:

```txt
from=YYYY-MM-DD
to=YYYY-MM-DD
status=COMPLETED
assessmentId=<id>
recruiterId=<id>
```
