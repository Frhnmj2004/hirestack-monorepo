-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL,
    "job_description" TEXT,
    "culture_fit" TEXT,
    "role_level" TEXT,
    "competency_requirements" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_topics" (
    "id" UUID NOT NULL,
    "interview_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" UUID NOT NULL,
    "interview_id" UUID,
    "candidate_id" TEXT NOT NULL,
    "interviewer_id" TEXT NOT NULL,
    "meeting_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_turns" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "active_question" TEXT,
    "candidate_answer" TEXT,
    "transcript_snippet" TEXT,
    "turn_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" UUID NOT NULL,
    "turn_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "claim_text" TEXT NOT NULL,
    "predicate" TEXT,
    "object" TEXT,
    "confidence" DECIMAL(5,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "turn_id" UUID,
    "claim_id" UUID,
    "type" TEXT NOT NULL,
    "transcript_snippet" TEXT,
    "resume_evidence" TEXT,
    "explanation" TEXT,
    "suggested_question" TEXT,
    "confidence" DECIMAL(5,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_triples" (
    "id" UUID NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "confidence" DECIMAL(5,4),
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_triples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_chunks" (
    "id" UUID NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "text_chunk" TEXT NOT NULL,
    "embedding" vector,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_topics_interview_id_idx" ON "interview_topics"("interview_id");

-- CreateIndex
CREATE INDEX "interview_questions_topic_id_idx" ON "interview_questions"("topic_id");

-- CreateIndex
CREATE INDEX "interview_sessions_candidate_id_idx" ON "interview_sessions"("candidate_id");

-- CreateIndex
CREATE INDEX "interview_sessions_status_idx" ON "interview_sessions"("status");

-- CreateIndex
CREATE INDEX "interview_turns_session_id_idx" ON "interview_turns"("session_id");

-- CreateIndex
CREATE INDEX "claims_session_id_idx" ON "claims"("session_id");

-- CreateIndex
CREATE INDEX "claims_candidate_id_idx" ON "claims"("candidate_id");

-- CreateIndex
CREATE INDEX "alerts_session_id_idx" ON "alerts"("session_id");

-- CreateIndex
CREATE INDEX "knowledge_triples_candidate_id_idx" ON "knowledge_triples"("candidate_id");

-- CreateIndex
CREATE INDEX "knowledge_triples_candidate_id_predicate_idx" ON "knowledge_triples"("candidate_id", "predicate");

-- CreateIndex
CREATE INDEX "resume_chunks_candidate_id_idx" ON "resume_chunks"("candidate_id");

-- AddForeignKey
ALTER TABLE "interview_topics" ADD CONSTRAINT "interview_topics_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "interview_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_turns" ADD CONSTRAINT "interview_turns_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "interview_turns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "interview_turns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;
