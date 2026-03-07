# Dynamic AI Interview Capabilities

The Dynamic AI Interview system is now fully functional and capable of end-to-end autonomous technical screening. Here is an overview of what the system can achieve right now:

### 1. Generating Tailored Interview Flows
- Given a candidate's resume and a job description, the backend uses `gpt-4o-mini` to intelligently extract context.
- It dynamically generates **5 tailored interview questions** specifically testing the candidate's alignment with the role.
- It generates a custom system prompt ensuring the AI persona acts warmly and professionally.

### 2. LiveKit Room & Avatar Creation
- It instantly spins up a unique LiveKit Room session and generates an authenticated JWT token for the candidate to join.
- It automatically emits the `interview.dynamic.start` event over NATS to awaken the Python AI worker.
- The Python worker (`agent.py`) injects a **Simli Avatar** directly into the LiveKit Room so the candidate is greeted by a speaking, lipsynced video AI.

### 3. Real-Time Conversation Handling
- Using Deepgram (STT) and OpenAI TTS, the agent conducts the interview.
- It tracks the mandatory questions and intelligently asks dynamic follow-ups based on real-time candidate answers.
- The agent strictly enforces session constraints (e.g., maximum interview duration of 1 hour, or finishing early if all questions are covered).

### 4. Autonomous Grading & Evaluation
- When the interview concludes, the agent publishes the entire dialogue structure as an `interview.dynamic.ended` event over NATS.
- The NestJS backend intercepts this event and ships the transcript back to `gpt-4o-mini` for a comprehensive evaluation.
- The LLM grades the candidate on **Technical Knowledge**, **Communication**, and **Problem Solving** (out of 10.0), generating a specific **Recommendation**.
- These final scores are strictly inserted into your Postgres database (`dynamic_interview_evaluations` table) using raw `pg` queries.

## How to Trigger It
From your frontend, simply make a POST request with the candidate's data to start the whole loop:
```json
POST http://localhost:3000/dynamic-interviews/start
{
  "resumeText": "Experienced Backend Developer...",
  "jobDescription": "Looking for a Senior Python/FastAPI engineer..."
}
```
The endpoint returns the necessary connection details (Token, Room ID, LiveKit URL) for the frontend candidate terminal.
