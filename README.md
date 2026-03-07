# HireStack

**HireStack** is an AI-powered interview intelligence platform designed to assist recruiters and interviewers during the hiring process. It enhances interviews by providing real-time insights, suggested follow-up questions, and post-interview analysis to help organizations make more informed hiring decisions.

---

## Overview

Hiring today involves evaluating candidates across resumes, interviews, and multiple signals. However, interviewers often miss important details such as inconsistencies in resumes, shallow answers, or opportunities to probe deeper into a candidate’s experience.

HireStack acts as an **AI co-pilot for interviews**, helping interviewers focus on meaningful conversations while the system continuously analyzes the discussion in the background.

The platform assists recruiters across multiple stages of the hiring pipeline—from resume screening to AI-driven interview assistance.

---

## Key Capabilities

### Resume–Job Description Matching
Recruiters can upload a job description and a batch of candidate resumes.  
HireStack analyzes the alignment between them and ranks candidates based on relevance and skill fit.

---

### AI Screening Interviews
Candidates can undergo an automated preliminary interview where an AI interviewer dynamically asks questions based on their resume and the job role.  
This helps filter candidates before human interviews.

---

### Live Interview Assistance
During real human interviews conducted on common meeting platforms, HireStack provides real-time assistance to interviewers by:

- Suggesting relevant follow-up questions
- Highlighting areas worth probing deeper
- Detecting potential inconsistencies between resume claims and interview responses
- Surfacing key skills or projects mentioned by the candidate

This allows interviewers to focus on evaluating the candidate rather than managing notes or thinking of the next question.

---

### Post-Interview Insights
After the interview, HireStack generates a structured summary that includes:

- Key discussion highlights
- Candidate strengths and weaknesses
- Skill signals extracted from the conversation
- A consolidated evaluation report

These insights help recruiters compare candidates more effectively and reduce bias in decision-making.

---

## Problem We Address

Interviews are often inconsistent and depend heavily on the experience of the interviewer. Important signals can be missed, and evaluating candidates across multiple interviews can become difficult.

HireStack aims to make interviews more **structured, intelligent, and insight-driven** by augmenting human interviewers with AI.

---

## Vision

Our goal is to build a hiring ecosystem where decisions are based on **clear signals, deeper understanding of candidate abilities, and structured insights**, rather than fragmented notes or subjective impressions.

HireStack helps teams move toward **smarter, faster, and more reliable hiring**.

---

## Team

Built as part of a hackathon project to explore how AI can meaningfully assist human interviewers and improve the hiring process.

---

## Project (hirelens) – Architecture

Monorepo for the **hirelens** AI interview intelligence platform.

**Services (Phase 1):**

- **API Gateway** (NestJS) – REST API for frontend, proxies assist session lifecycle to NATS
- **Interview Service** (NestJS) – Resume ingestion, ranking, AI interview orchestration
- **Assist Service** (NestJS) – Human interview copilot: WebSocket for Chrome extension, Deepgram STT, OpenAI analysis, pgvector RAG, knowledge-graph contradiction detection
- **LiveKit Agent** (Python) – Subscribes to NATS `interview.dynamic.start`, joins LiveKit rooms as AI interviewer
- **NATS** – Event communication
- **PostgreSQL** – Single shared database (pgvector for embeddings)
- **Redis** – Cache/sessions, embedding cache

**How to start development**

1. Start infrastructure: `cd backend/infra/docker && docker compose up -d`
2. Run migrations: apply `backend/migrations/002_enable_pgvector.sql` and `003_assist_schema.sql` to PostgreSQL (in order).
3. API Gateway: `cd backend/apps/api-gateway && npm install && npm run start:dev`
4. Interview Service: `cd backend/apps/interview-service && npm install && npm run start:dev`
5. Assist Service: `cd backend/apps/assist-service && npm install && npm run start:dev` (requires `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`; see `.env.example`)
6. LiveKit Agent: `cd backend/services/livekit-agent && pip install -r requirements.txt && python agent.py` (requires env vars; see `.env.example`)
7. Copy `.env.example` to `.env` (or `backend/.env.local`) and fill in values.