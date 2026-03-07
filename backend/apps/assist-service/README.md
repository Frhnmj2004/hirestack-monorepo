# Assist Service

Human Interview Copilot backend for HireLens. Assists interviewers in real time during Google Meet (or other) interviews via a Chrome extension.

## Architecture

- **WebSocket gateway**: Chrome extension connects over WebSocket; sends audio chunks and session metadata; receives transcript updates, insights, evidence cards, and alerts.
- **NATS**: API Gateway forwards session lifecycle (start/end/get) to this service via NATS request-response.
- **Streaming**: Audio is streamed to Deepgram for real-time STT; turn detection (silence threshold) triggers the analysis pipeline.
- **Pipeline A (follow-up generation)**: Active question + candidate answer → OpenAI → key insights, skill signals, follow-up questions, competency questions.
- **Pipeline B (evidence + contradiction)**: Candidate answer → claim extraction (OpenAI) → RAG search (pgvector) + knowledge triples comparison → evidence cards, new claims, contradiction alerts with suggested clarifying questions.

## Latency

Target 1–3 seconds after candidate stops speaking:

- Deepgram streaming reduces time-to-first-transcript.
- Pipeline A and B run in parallel (`Promise.all`).
- Embeddings cached in Redis; vector search indexed (HNSW).

## Event flow

1. Extension opens WebSocket; sends `session` with `sessionId`, `candidateId`, `activeQuestion`.
2. Extension sends `audio` (base64 or binary); service forwards to Deepgram.
3. On final transcript + silence, service runs Pipeline A and B; emits `insights`, `evidence`, `new_claims`, `alerts` to client.
4. Extension can send `set_question` to update active question.
5. Session start/end/get are handled via API Gateway → NATS → this service.

## Environment

- `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `NATS_URL`
- `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`
- Optional: `OPENAI_ANALYSIS_MODEL`, `OPENAI_EMBEDDING_MODEL`, `DEEPGRAM_MODEL`, `PORT` (default 3002)

## Run

```bash
npm run prisma:generate
npm run start:dev
```

Ensure PostgreSQL (with pgvector), Redis, and NATS are up (e.g. `docker compose up -d` from `backend/infra/docker`).
