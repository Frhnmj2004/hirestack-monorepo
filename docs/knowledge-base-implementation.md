# HireLens — Knowledge Base (RAG + Knowledge Graph) Implementation

This doc describes how **RAG** (vector search) and the **Knowledge Graph** (triples) work in the assist-service, what’s implemented, and how timeline/numeric contradictions are detected.

---

## 1. Overview

| System | Purpose | Storage |
|--------|--------|--------|
| **RAG** | Semantic search over resume (and JD) text | `resume_chunks` + pgvector `embedding` |
| **Knowledge Graph** | Structured facts for logical comparison (numbers, dates) | `knowledge_triples` (predicate, object, startDate, endDate) |

Both are used during **resume ingestion** (interview creation) and in the **real-time pipeline** (every transcript turn).

---

## 2. Resume ingestion (on interview creation)

When `POST /interviews` is called (via API gateway → assist-service):

1. **Interview plan** — OpenAI generates topics and questions from JD + resume.
2. **RAG seed** — Resume text is chunked (~600 chars, 80 overlap), embedded (OpenAI `text-embedding-3-small`), stored in `resume_chunks` (Redis cache 24h for embeddings).
3. **Knowledge graph seed** — `extractClaims(resumeText)` returns claims (predicate, object, confidence). Each claim is stored with `KnowledgeService.storeFact(candidateId, predicate, object, options)`.

**Important:** The Prisma schema defines `knowledge_triples.object` as `String`. The LLM sometimes returns numeric or boolean values for `object` (e.g. `api_requests_per_day: 2000000`). To avoid `PrismaClientValidationError: Expected String, provided Int`:

- **`KnowledgeService.storeFact()`** accepts `object: string | number | boolean` and coerces to string before `prisma.knowledgeTriple.create()`.
- **`AnalysisService.extractClaims()`** normalizes each claim’s `object` with `String(c.object)` so DTOs are consistently strings.

---

## 3. Real-time pipeline (every transcript turn)

In `pipeline.service.ts`, two pipelines run in parallel:

| Pipeline A | Pipeline B |
|------------|------------|
| `generateFollowUps()` — insights + follow-up questions | `extractClaims()` → `compareClaims()` (KG) + `search()` (RAG) |
| Emitted as `insights` | Emitted as `evidence`, `new_claims`, `alerts` |

- **RAG:** Query embedding from the candidate’s answer → pgvector cosine similarity (`<=>`); evidence cards with score ≥ 0.80 = strong, 0.65–0.80 = possible.
- **Knowledge graph:** For each extracted claim, `compareClaims()` loads existing triples for that candidate/predicate and decides **match** | **new_information** | **contradiction**.

---

## 4. Contradiction detection (Knowledge Graph)

`KnowledgeService.compareClaims()` and `looksContradictoryWithTriple()`:

- **Numeric:** `parseNumber()` extracts integers from existing vs claim text; if both are numbers and different → contradiction (e.g. resume “7 years” vs candidate “10 years”).
- **Date range:** If the triple has `startDate`/`endDate`, those are used; otherwise `parseDateRange()` parses from the `object` string. Supported patterns:
  - `2019-2023`, `2019–2023`, `2019 to 2023`
  - Single year: `2018`, `2020`
- **Overlap:** `dateRangesOverlap(a, b)` returns true if the two ranges share any day. If both sides have a date range and they **do not** overlap → contradiction (e.g. “worked at Acme in 2018” vs resume “Acme 2019–2023”).

Previously, `parseDateRange()` always returned `null` and `dateRangesOverlap()` always returned `true`, so timeline contradictions were never detected. Both are now implemented so timeline contradictions are reported as alerts.

---

## 5. Technologies

- **Embeddings:** OpenAI `text-embedding-3-small`; cached in Redis 24h.
- **Vector DB:** PostgreSQL + pgvector (`resume_chunks.embedding`); cosine distance for search.
- **Knowledge graph:** PostgreSQL `knowledge_triples` (candidateId, predicate, object, startDate, endDate, confidence, source).
- **Backend:** NestJS (assist-service); NATS for interview create/list/get; WebSocket gateway for live transcript and events.

---

## 6. Stubs / future work

- **Date parsing:** Current `parseDateRange()` handles year ranges and single years; more formats (e.g. “Jan 2019”, “Q2 2020”) can be added if needed.
- **Triple start/end dates:** When extracting claims from the resume, the analysis service could optionally return `startDate`/`endDate` and pass them into `storeFact()` so employment/education ranges are stored explicitly and used in `looksContradictoryWithTriple()` without parsing from text.
