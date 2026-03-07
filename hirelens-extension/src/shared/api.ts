/**
 * HireLens Extension API layer.
 *
 * API_BASE points to api-gateway (default: http://localhost:3000)
 * WS_BASE  points to assist-service WebSocket (default: http://localhost:3001)
 *
 * When real API fails, mock fallback data is used for offline dev.
 */

import { io, Socket } from "socket.io-client";
import type {
  InterviewSession,
  QuestionItem,
  AlertItem,
  EvidenceCard,
} from "./types";

export const API_BASE = "http://localhost:3000";
export const WS_BASE  = "http://localhost:3001";

// ── Auth headers ──────────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      console.error(`[HireLens] API ${init?.method ?? "GET"} ${path} → ${res.status}`);
      return null;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`[HireLens] API fetch failed:`, err);
    return null;
  }
}

// ── Document parsing ──────────────────────────────────────────────────────────

/**
 * Parse a PDF/DOCX/TXT file → extracted text.
 * .txt files are read locally; PDF/DOCX are sent to POST /files/parse.
 */
export interface ParsedProfile {
  name: string;
  email: string;
  role: string;
}

async function readTextFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export async function parseDocument(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith(".txt")) {
    return readTextFile(file);
  }
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${API_BASE}/files/parse`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { text: string };
    return data.text;
  } catch (err) {
    console.error("[HireLens] parseDocument failed:", err);
    throw new Error("Failed to parse document. Make sure the backend is running.");
  }
}

/** Parse resume and extract candidate profile (name, email, role). */
export async function parseResume(file: File): Promise<{ text: string; profile: ParsedProfile }> {
  if (file.name.toLowerCase().endsWith(".txt")) {
    const text = await readTextFile(file);
    return { text, profile: { name: "", email: "", role: "" } };
  }
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${API_BASE}/files/parse?type=resume`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { text: string; profile?: ParsedProfile };
    return { text: data.text, profile: data.profile ?? { name: "", email: "", role: "" } };
  } catch (err) {
    console.error("[HireLens] parseResume failed:", err);
    throw new Error("Failed to parse document. Make sure the backend is running.");
  }
}

// ── Interview endpoints ───────────────────────────────────────────────────────

export interface CreateInterviewInput {
  candidateName: string;
  candidateEmail?: string;
  resumeText: string;
  jdText: string;
  roleTitle: string;
  department: string;
  level: string;
  interviewerId?: string;
}

export interface BackendInterview {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  roleTitle: string;
  department: string;
  level: string;
  candidateSummary: string;
  candidateSkills: string[];
  previousCompanies: string[];
  topics: Array<{
    id: string;
    name: string;
    questionIds: string[];
    questions: Array<{
      id: string;
      text: string;
      type: "technical" | "behavioral" | "situational" | "competency";
      competency: string;
      order: number;
    }>;
  }>;
  createdAt: string;
}

export interface InterviewListItem {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  candidateSkills: string[];
  candidateSummary: string;
  roleTitle: string;
  department: string;
  level: string;
  questionCount: number;
  topicCount: number;
  createdAt: string;
}

/** POST /interviews */
export async function createInterview(input: CreateInterviewInput): Promise<BackendInterview | null> {
  return apiFetch<BackendInterview>("/interviews", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      interviewerId: input.interviewerId ?? "default-interviewer",
    }),
  });
}

/**
 * Fallback when backend is down or returns no interviews — always show at least one
 * demo interview so the sidebar flow can be demoed without the backend.
 */
export const DEMO_FALLBACK_INTERVIEWS: InterviewListItem[] = [
  {
    interviewId: "demo-int-1",
    candidateId: "demo-cand-1",
    candidateName: "Demo Candidate",
    candidateSkills: ["Python", "FastAPI", "System Design"],
    candidateSummary: "Sample interview for demo. Open this to try the full flow — questions, follow-ups, and flags.",
    roleTitle: "Backend Engineer",
    department: "Engineering",
    level: "Mid",
    questionCount: 5,
    topicCount: 3,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

/** GET /interviews — uses DEMO_FALLBACK_INTERVIEWS when backend fails or returns empty (for demo flow). */
export async function listInterviews(): Promise<InterviewListItem[]> {
  const res = await apiFetch<{ interviews: InterviewListItem[] }>("/interviews");
  const list = res?.interviews ?? [];
  if (list.length === 0) return DEMO_FALLBACK_INTERVIEWS;
  return list;
}

/** GET /interviews/:id */
export async function getInterview(id: string): Promise<BackendInterview | null> {
  return apiFetch<BackendInterview>(`/interviews/${id}`);
}

// ── Assist session endpoints ──────────────────────────────────────────────────

/** POST /assist/session/start */
export async function startAssistSession(payload: {
  candidateId: string;
  interviewerId: string;
  interviewId?: string;
  meetingLink?: string;
}): Promise<{ sessionId: string; status: string; startedAt: string } | null> {
  const res = await apiFetch<{ sessionId: string; status: string; startedAt: string }>(
    "/assist/session/start",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res ?? { sessionId: `local-${Date.now()}`, status: "active", startedAt: new Date().toISOString() };
}

/** POST /assist/session/end */
export async function endAssistSession(sessionId: string): Promise<void> {
  await apiFetch("/assist/session/end", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

// ── Build InterviewSession from backend data ──────────────────────────────────

export function buildSessionFromInterview(
  interview: BackendInterview,
  sessionId: string,
): InterviewSession {
  const questions: QuestionItem[] = [];
  interview.topics.forEach((topic) => {
    topic.questions.forEach((q) => {
      questions.push({
        id: q.id,
        text: q.text,
        competency: q.competency,
        type: q.type,
        order: q.order,
        answered: false,
      });
    });
  });

  const topics = interview.topics.map((t) => ({
    id: t.id,
    name: t.name,
    questionIds: t.questionIds,
    covered: false,
  }));

  return {
    sessionId,
    status: "active",
    jobRole: {
      id: interview.interviewId,
      title: interview.roleTitle,
      department: interview.department,
      level: interview.level as InterviewSession["jobRole"]["level"],
      requiredSkills: interview.candidateSkills.slice(0, 6),
    },
    candidate: {
      id: interview.candidateId,
      name: interview.candidateName,
      email: interview.candidateEmail,
      experience: "",
      key_skills: interview.candidateSkills,
      previous_companies: interview.previousCompanies,
      summary: interview.candidateSummary,
    },
    questions,
    topics,
    currentQuestionIndex: 0,
    followUps: [],
    alerts: [],
    transcript: [],
    insights: [],
    skillSignals: [],
    evidenceCards: [],
    scores: [...new Set(interview.topics.map((t) => t.name))].map((label) => ({
      label,
      score: 0,
      outOf: 10,
    })),
    startedAt: new Date().toISOString(),
    durationSeconds: 0,
    interviewStarted: false,
  };
}

/** Open an interview from the list — real backend or mock fallback */
export async function openInterview(item: InterviewListItem): Promise<InterviewSession | null> {
  const [interview, sessionRes] = await Promise.all([
    getInterview(item.interviewId),
    startAssistSession({
      candidateId: item.candidateId,
      interviewerId: "default-interviewer",
      interviewId: item.interviewId,
    }),
  ]);

  if (interview && sessionRes) {
    return buildSessionFromInterview(interview, sessionRes.sessionId);
  }

  return makeMockSession(item);
}

// ── Real-time WebSocket manager ───────────────────────────────────────────────

/** Backend can send competency scores per turn; extension merges into session.scores */
export interface CompetencyScorePayload {
  questionId?: string;
  scores: Array<{ label: string; score: number; outOf?: number }>;
}

export interface RealtimeCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onInsights?: (data: {
    keyInsights: string[];
    skillSignals: string[];
    followUpQuestions: Array<{ question: string; type: string }>;
    competencyQuestions: Array<{ question: string; type: string }>;
  }, questionId: string) => void;
  onAlerts?: (alerts: AlertItem[]) => void;
  onEvidence?: (cards: EvidenceCard[]) => void;
  onScores?: (payload: CompetencyScorePayload) => void;
  onError?: (msg: string) => void;
}

export class InterviewRealtimeManager {
  private socket: Socket | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private currentQuestionId = "";

  connect(sessionId: string, candidateId: string, callbacks: RealtimeCallbacks): void {
    if (this.socket?.connected) return;

    this.socket = io(WS_BASE, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
    });

    this.socket.on("connect", () => {
      console.log("[HireLens WS] connected");
      this.socket!.emit("session", { sessionId, candidateId, activeQuestion: "" });
    });

    this.socket.on("transcript", (data: { text: string; isFinal: boolean }) => {
      callbacks.onTranscript?.(data.text, data.isFinal);
    });

    this.socket.on("insights", (data: {
      keyInsights: string[];
      skillSignals: string[];
      followUpQuestions: Array<{ question: string; type: string }>;
      competencyQuestions: Array<{ question: string; type: string }>;
    }) => {
      callbacks.onInsights?.(data, this.currentQuestionId);
    });

    this.socket.on("alerts", (data: AlertItem[]) => {
      callbacks.onAlerts?.(data);
    });

    this.socket.on("evidence", (data: EvidenceCard[]) => {
      callbacks.onEvidence?.(data);
    });

    this.socket.on("scores", (data: CompetencyScorePayload) => {
      callbacks.onScores?.(data);
    });

    this.socket.on("error", (data: { message: string }) => {
      callbacks.onError?.(data.message);
    });

    this.socket.on("disconnect", () => {
      console.log("[HireLens WS] disconnected");
    });
  }

  setActiveQuestion(sessionId: string, questionId: string, questionText: string): void {
    this.currentQuestionId = questionId;
    this.socket?.emit("set_question", { sessionId, activeQuestion: questionText });
  }

  async startMic(sessionId: string): Promise<void> {
    if (this.micStream) return;
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true } as MediaTrackConstraints,
      });
      this.audioCtx = new AudioContext({ sampleRate: 16000 });
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
      this.processor.onaudioprocess = (e) => {
        if (!this.socket?.connected) return;
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        this.socket!.emit("audio", { chunk: btoa(binary), encoding: "linear16" });
      };
      source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);
      console.log("[HireLens] Mic streaming started →", sessionId);
    } catch (err) {
      console.error("[HireLens] Mic error:", err);
    }
  }

  stopMic(): void {
    this.processor?.disconnect();
    this.processor = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
  }

  disconnect(): void {
    this.stopMic();
    this.socket?.disconnect();
    this.socket = null;
    this.currentQuestionId = "";
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// ── Mock data for offline dev ─────────────────────────────────────────────────

export const MOCK_INTERVIEW_LIST: InterviewListItem[] = [
  {
    interviewId: "mock-int-aryan",
    candidateId: "mock-cand-aryan",
    candidateName: "Aryan Kapoor",
    candidateSkills: ["React", "TypeScript", "Next.js", "Redux"],
    candidateSummary: "Frontend specialist with 4 years building high-traffic consumer apps. Led InMobi's ad-SDK React migration, reducing bundle size by 38%.",
    roleTitle: "Senior Frontend Engineer",
    department: "Product Engineering",
    level: "Senior",
    questionCount: 5,
    topicCount: 4,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    interviewId: "mock-int-priya",
    candidateId: "mock-cand-priya",
    candidateName: "Priya Nair",
    candidateSkills: ["Go", "gRPC", "PostgreSQL", "Redis"],
    candidateSummary: "Backend systems engineer with 6 years building high-throughput platforms. Owns order-state microservice at Swiggy handling 50K rps peak.",
    roleTitle: "Backend Engineer",
    department: "Platform Engineering",
    level: "Senior",
    questionCount: 5,
    topicCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    interviewId: "mock-int-rahul",
    candidateId: "mock-cand-rahul",
    candidateName: "Rahul Sharma",
    candidateSkills: ["Python", "FastAPI", "Redis", "PostgreSQL"],
    candidateSummary: "Backend engineer with 5 years across fintech and SaaS. Built Razorpay's payment API handling 2M daily requests.",
    roleTitle: "Software Engineer",
    department: "Backend Engineering",
    level: "Mid",
    questionCount: 5,
    topicCount: 3,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

function makeMockSession(item: InterviewListItem): InterviewSession {
  const mockQuestions: Record<string, QuestionItem[]> = {
    "demo-int-1": [
      { id: "dq1", text: "Walk me through how you've structured production FastAPI services.", competency: "Backend", type: "technical", order: 1, answered: false },
      { id: "dq2", text: "Design a caching layer for a high-traffic REST API.", competency: "System Design", type: "technical", order: 2, answered: false },
      { id: "dq3", text: "Tell me about a time you scaled a service under load.", competency: "Scalability", type: "behavioral", order: 3, answered: false },
      { id: "dq4", text: "How do you approach testing for async/event-driven code?", competency: "Testing", type: "technical", order: 4, answered: false },
      { id: "dq5", text: "A teammate pushes a breaking change right before release.", competency: "Collaboration", type: "situational", order: 5, answered: false },
    ],
    "mock-int-aryan": [
      { id: "q1", text: "Walk me through how you'd architect a large-scale React app for 10K concurrent users.", competency: "Frontend Architecture", type: "technical", order: 1, answered: false },
      { id: "q2", text: "When would you choose Redux over Zustand or React Query?", competency: "State Management", type: "technical", order: 2, answered: false },
      { id: "q3", text: "Tell me about a critical performance regression you found in production.", competency: "Problem Solving", type: "behavioral", order: 3, answered: false },
      { id: "q4", text: "Explain how TypeScript's type system has saved you from bugs.", competency: "TypeScript", type: "technical", order: 4, answered: false },
      { id: "q5", text: "Your team is deadlocked on CSS-in-JS vs Tailwind with a 2-week deadline.", competency: "Leadership", type: "situational", order: 5, answered: false },
    ],
    "mock-int-priya": [
      { id: "q1", text: "Explain Go's concurrency model — goroutines, channels, and the scheduler.", competency: "Go Concurrency", type: "technical", order: 1, answered: false },
      { id: "q2", text: "Design a database schema for a multi-tenant SaaS with row-level security.", competency: "Database Design", type: "technical", order: 2, answered: false },
      { id: "q3", text: "Describe the most complex distributed system bug you've debugged.", competency: "Debugging", type: "behavioral", order: 3, answered: false },
      { id: "q4", text: "Implement idempotency in a payment gRPC service under retry conditions.", competency: "System Design", type: "technical", order: 4, answered: false },
      { id: "q5", text: "Your Redis cache is evicting keys aggressively causing 3x latency spikes.", competency: "Performance", type: "situational", order: 5, answered: false },
    ],
    "mock-int-rahul": [
      { id: "q1", text: "Walk me through how you've structured production FastAPI services.", competency: "Backend Architecture", type: "technical", order: 1, answered: false },
      { id: "q2", text: "Design a Redis-based caching layer for a high-traffic REST API.", competency: "Caching", type: "technical", order: 2, answered: false },
      { id: "q3", text: "How did you scale the payment API at Razorpay to 2 million requests per day?", competency: "Scalability", type: "behavioral", order: 3, answered: false },
      { id: "q4", text: "Tell me about a technical decision you made that you later regretted.", competency: "Judgment", type: "behavioral", order: 4, answered: false },
      { id: "q5", text: "A colleague pushes directly to main causing a production incident.", competency: "Collaboration", type: "situational", order: 5, answered: false },
    ],
  };

  const qs = mockQuestions[item.interviewId] ?? mockQuestions["demo-int-1"] ?? [];
  const topicMap: Record<string, string[]> = {};
  qs.forEach((q) => { (topicMap[q.competency] ??= []).push(q.id); });
  const topics = Object.entries(topicMap).map(([name, qIds], i) => ({
    id: `t${i + 1}`,
    name,
    questionIds: qIds,
    covered: false,
  }));

  const mockAlerts: Record<string, AlertItem[]> = {
    "mock-int-aryan": [
      { id: "a1", type: "contradiction", claim: "Candidate says 4 years React; resume shows first React project in Jan 2022.", transcriptSnippet: "", resumeEvidence: "First React project: InMobi Ad SDK — Jan 2022", explanation: "Minor discrepancy — may count side projects.", suggestedQuestion: "When did you start using React professionally?", confidence: 0.78, severity: "low", createdAt: new Date().toISOString() },
    ],
  };

  return {
    sessionId: `mock-session-${item.interviewId}`,
    status: "active",
    jobRole: {
      id: item.interviewId,
      title: item.roleTitle,
      department: item.department,
      level: item.level as InterviewSession["jobRole"]["level"],
      requiredSkills: item.candidateSkills,
    },
    candidate: {
      id: item.candidateId,
      name: item.candidateName,
      experience: "",
      key_skills: item.candidateSkills,
      previous_companies: [],
      summary: item.candidateSummary,
      resumeScore: 85,
    },
    questions: qs,
    topics,
    currentQuestionIndex: 0,
    followUps: [],
    alerts: mockAlerts[item.interviewId] ?? [],
    transcript: [],
    insights: [],
    skillSignals: [],
    evidenceCards: [],
    scores: topics.map((t) => ({ label: t.name, score: 0, outOf: 10 })),
    startedAt: new Date().toISOString(),
    durationSeconds: 0,
    interviewStarted: false,
  };
}
