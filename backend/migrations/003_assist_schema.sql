-- Assist service & interview copilot schema
-- Run after 002_enable_pgvector.sql

-- Phase 1: Human interview templates (dashboard)
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_description TEXT,
  culture_fit TEXT,
  role_level TEXT,
  competency_requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_topics_interview_id ON interview_topics(interview_id);

CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES interview_topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_topic_id ON interview_questions(topic_id);

-- Interview sessions (active copilot session)
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
  candidate_id TEXT NOT NULL,
  interviewer_id TEXT NOT NULL,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_id ON interview_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);

-- Turns within a session (one per candidate answer)
CREATE TABLE IF NOT EXISTS interview_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  active_question TEXT,
  candidate_answer TEXT,
  transcript_snippet TEXT,
  turn_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_turns_session_id ON interview_turns(session_id);

-- Claims extracted from candidate answers
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id UUID NOT NULL REFERENCES interview_turns(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  predicate TEXT,
  object TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_session_id ON claims(session_id);
CREATE INDEX IF NOT EXISTS idx_claims_candidate_id ON claims(candidate_id);

-- Alerts (contradictions, evidence, etc.)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  turn_id UUID REFERENCES interview_turns(id) ON DELETE SET NULL,
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  transcript_snippet TEXT,
  resume_evidence TEXT,
  explanation TEXT,
  suggested_question TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON alerts(session_id);

-- Knowledge graph triples (candidate facts from resume/answers)
CREATE TABLE IF NOT EXISTS knowledge_triples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT NOT NULL,
  predicate TEXT NOT NULL,
  object TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  confidence DECIMAL(5,4),
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_triples_candidate_id ON knowledge_triples(candidate_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_triples_predicate ON knowledge_triples(candidate_id, predicate);

-- Resume chunks with embeddings (pgvector)
CREATE TABLE IF NOT EXISTS resume_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT NOT NULL,
  text_chunk TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_chunks_candidate_id ON resume_chunks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resume_chunks_embedding ON resume_chunks 
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
