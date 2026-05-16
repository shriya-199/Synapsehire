# SynapseHire Architecture

## System Overview

```mermaid
flowchart LR
  Candidate[Candidate Browser] --> Web[React Frontend]
  Recruiter[Recruiter Browser] --> Web
  Web --> API[Express API]
  Web <-->|Socket.IO| Realtime[Socket.IO Gateway]
  Web <-->|WebRTC Media| BrowserPeer[Peer Browser]
  API --> Mongo[(MongoDB Atlas)]
  API --> Redis[(Redis Cloud)]
  Realtime --> Redis
  API --> AI[OpenAI/Gemini]
  API --> SMTP[Email Provider]
  API --> Storage[Recording Storage]
  API --> Runner[Isolated Code Runner]
```

## Backend Architecture

The backend follows modular MVC boundaries:

```txt
routes -> controllers -> services -> models
                      -> providers
                      -> validators
```

Important modules:

- `auth`: JWT, refresh token rotation, OAuth, OTP, sessions
- `interviews`: scheduling, lifecycle, interview access control
- `sockets`: collaborative editor, WebRTC signaling, monitoring events
- `ai`: provider abstraction, prompt builder, response parser, scoring
- `monitoring`: anti-cheating alerts, recordings, recruiter dashboard
- `analytics`: recruiter/candidate/admin aggregations and CSV export

## Frontend Architecture

```mermaid
flowchart TD
  Pages --> Components
  Pages --> Hooks
  Hooks --> SocketClient
  Hooks --> ApiClient
  Components --> Redux
  Redux --> ApiClient
  ApiClient --> Backend
  SocketClient --> Backend
```

Frontend design principles:

- Pages compose feature components.
- API logic lives in `features/*/*Api.js`.
- Cross-page state lives in Redux slices.
- Real-time workflows use dedicated hooks.
- UI components are small, reusable, and responsive.

## Real-Time Collaboration

```mermaid
sequenceDiagram
  participant A as Candidate
  participant S as Socket.IO
  participant R as Redis
  participant B as Recruiter

  A->>S: interview:join
  S->>R: hydrate room/editor state
  S-->>A: interview:state
  A->>S: editor:change version=n
  S->>R: save snapshot if version valid
  S-->>B: editor:change
  A->>S: editor:autosave
  S->>R: mark savedAt
```

## AI Evaluation Flow

```mermaid
sequenceDiagram
  participant Recruiter
  participant API
  participant AI as OpenAI/Gemini
  participant DB as MongoDB

  Recruiter->>API: POST /ai/interviews/analyze
  API->>DB: create AIAnalysisJob
  API->>AI: structured JSON prompt
  AI-->>API: schema-compliant evaluation
  API->>API: normalize and score
  API->>DB: save AIEvaluation
  API-->>Recruiter: evaluation + job
```

## Monitoring Flow

```mermaid
flowchart LR
  Browser[Candidate Browser] -->|tab/face/audio/screen events| Socket[Socket.IO]
  Socket --> Service[Monitoring Service]
  Service --> Mongo[(MonitoringAlert)]
  Socket --> Dashboard[Recruiter Dashboard]
  Browser -->|MediaRecorder chunks| API[Recording API]
  API --> Storage[Recording Storage]
```

## Scalability Decisions

- Redis stores ephemeral interview room state and enables Socket.IO horizontal scaling.
- MongoDB remains source of truth for durable entities.
- AI evaluation and code execution are isolated behind service boundaries.
- Recording storage is abstracted so local disk can be replaced by S3/GCS.
- Analytics starts with MongoDB aggregations and can move to ClickHouse/BigQuery later.

## Clean Architecture Boundaries

Good interview talking point:

> Controllers are intentionally thin. Permission checks, scoring, room state, and provider logic live in services, which keeps routes stable and business logic testable.
