/**
 * HireLens Extension API layer.
 *
 * API_BASE points to api-gateway (default: http://localhost:3000)
 * WS_BASE  points to assist-service WebSocket — must match assist-service PORT (default 3002)
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
export const WS_BASE  = "http://localhost:3002";

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
  onConnect?: () => void;
  onDisconnect?: () => void;
  /** Called every N audio chunks sent (for debug panel). */
  onAudioChunkSent?: (count: number) => void;
  /** Called when audio is not sent because WS is disconnected (throttled). */
  onAudioSkipped?: (reason: string) => void;
  /** Called periodically with tab audio level info: rms, hasContent, consecutiveSilentChunks. Use for debugging silent tab capture. */
  onTabAudioLevel?: (rms: number, hasContent: boolean, consecutiveSilent: number) => void;
  onTranscript?: (text: string, isFinal: boolean, speaker?: "interviewer" | "candidate") => void;
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

const AUDIO_LOG_EVERY_CHUNKS = 50;
const AUDIO_SKIP_LOG_THROTTLE_MS = 3000;
/** RMS below this = chunk treated as silent (tab audio may be muted or not playing). */
const TAB_AUDIO_SILENT_RMS_THRESHOLD = 0.0005;
/** After this many consecutive silent chunks, log error and notify (e.g. ~15s at 50 chunks/5s). */
const TAB_AUDIO_SILENT_ERROR_AFTER_CHUNKS = 150;

const AUDIO_CHUNK_SAMPLES = 4096;

function computeChunkRms(float32: Float32Array): number {
  if (float32.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < float32.length; i++) {
    const s = float32[i];
    sumSq += s * s;
  }
  return Math.sqrt(sumSq / float32.length);
}

export class InterviewRealtimeManager {
  private socket: Socket | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private float32Buffer: number[] = [];
  private currentQuestionId = "";
  private callbacks: RealtimeCallbacks = {};
  private audioChunkCount = 0;
  private lastAudioSkipLog = 0;
  private consecutiveSilentChunks = 0;
  private tabAudioSilentErrorLogged = false;

  connect(sessionId: string, candidateId: string, callbacks: RealtimeCallbacks): void {
    if (this.socket?.connected) return;

    this.callbacks = callbacks;
    this.audioChunkCount = 0;
    this.lastAudioSkipLog = 0;

    // #region agent log
    try {
      fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
        body: JSON.stringify({
          sessionId: "104cc8",
          runId: "ws-flow",
          hypothesisId: "H1-H4",
          location: "api.ts:connect",
          message: "WS connect attempt",
          data: { WS_BASE, sessionId, candidateId },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch (_) {}
    // #endregion

    this.socket = io(WS_BASE, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      // #region agent log
      try {
        fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
          body: JSON.stringify({
            sessionId: "104cc8",
            runId: "ws-flow",
            hypothesisId: "H5",
            location: "api.ts:connect:on(connect)",
            message: "WS connected",
            data: { sessionId },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      } catch (_) {}
      // #endregion
      console.log("[HireLens WS] connected");
      this.socket!.emit("session", { sessionId, candidateId, activeQuestion: "" });
      callbacks.onConnect?.();
    });

    this.socket.on("connect_error", (err: Error & { message?: string }) => {
      try {
        // #region agent log
        try {
          fetch("http://127.0.0.1:7915/ingest/dd54c4a1-1460-43df-87cd-c42e5e8f10a8", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "104cc8" },
            body: JSON.stringify({
              sessionId: "104cc8",
              runId: "ws-flow",
              hypothesisId: "H1-H3",
              location: "api.ts:connect:on(connect_error)",
              message: "WS connect_error",
              data: {
                message: err?.message ?? String(err),
                type: err?.name,
                WS_BASE,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
        } catch (_) {}
        // #endregion
        console.error("[HireLens WS] connect_error", err?.message ?? err);
        callbacks.onDisconnect?.();
      } catch (_) {
        // Prevent uncaught errors (e.g. Extension context invalidated) from breaking socket.io
      }
    });

    this.socket.on("transcript", (data: { text: string; isFinal: boolean; speaker?: "interviewer" | "candidate" }) => {
      const speaker = data.speaker ?? "candidate";
      if (data.isFinal && data.text?.trim()) console.log("[HireLens] transcript (final):", speaker, data.text.slice(0, 60));
      callbacks.onTranscript?.(data.text, data.isFinal, speaker);
    });

    this.socket.on("insights", (data: {
      keyInsights: string[];
      skillSignals: string[];
      followUpQuestions: Array<{ question: string; type: string }>;
      competencyQuestions: Array<{ question: string; type: string }>;
    }) => {
      const total = (data.followUpQuestions?.length ?? 0) + (data.competencyQuestions?.length ?? 0);
      if (total > 0) console.log("[HireLens] insights:", total, "follow-ups for question", this.currentQuestionId);
      callbacks.onInsights?.(data, this.currentQuestionId);
    });

    this.socket.on("alerts", (data: AlertItem[]) => {
      if (data?.length) console.log("[HireLens] alerts (flags):", data.length);
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

    this.socket.on("disconnect", (reason) => {
      try {
        console.log("[HireLens WS] disconnected", reason);
        this.callbacks.onAudioSkipped?.("WS disconnected: " + reason);
        callbacks.onDisconnect?.();
      } catch (_) {
        // Prevent uncaught errors from breaking socket.io
      }
    });
  }

  setActiveQuestion(sessionId: string, questionId: string, questionText: string): void {
    this.currentQuestionId = questionId;
    this.socket?.emit("set_question", { sessionId, activeQuestion: questionText });
  }

  private sendAudioChunk(float32: Float32Array): void {
    const rms = computeChunkRms(float32);
    const hasContent = rms >= TAB_AUDIO_SILENT_RMS_THRESHOLD;
    if (hasContent) {
      this.consecutiveSilentChunks = 0;
    } else {
      this.consecutiveSilentChunks += 1;
    }

    if (this.audioChunkCount % AUDIO_LOG_EVERY_CHUNKS === 0) {
      this.callbacks.onTabAudioLevel?.(rms, hasContent, this.consecutiveSilentChunks);
      if (hasContent) {
        console.log("[HireLens] Tab audio level: rms=" + rms.toFixed(6) + " (has content), chunk#" + this.audioChunkCount);
      } else {
        console.warn("[HireLens] Tab audio level: rms=" + rms.toFixed(6) + " (silent), consecutiveSilent=" + this.consecutiveSilentChunks + ", chunk#" + this.audioChunkCount);
        if (this.consecutiveSilentChunks >= TAB_AUDIO_SILENT_ERROR_AFTER_CHUNKS && !this.tabAudioSilentErrorLogged) {
          this.tabAudioSilentErrorLogged = true;
          console.error("[HireLens] Tab audio appears silent for too long. Ensure the shared tab is playing the call, volume is up, and you selected the correct tab.");
          this.callbacks.onAudioSkipped?.("Tab audio silent — check shared tab volume and that the call is playing.");
        }
      }
    }

    if (!this.socket?.connected) {
      const now = Date.now();
      if (now - this.lastAudioSkipLog >= AUDIO_SKIP_LOG_THROTTLE_MS) {
        this.lastAudioSkipLog = now;
        this.callbacks.onAudioSkipped?.("WS not connected");
      }
      return;
    }
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    this.socket!.emit("audio", { chunk: btoa(binary), encoding: "linear16" });
    this.audioChunkCount += 1;
    if (this.audioChunkCount % AUDIO_LOG_EVERY_CHUNKS === 0) {
      this.callbacks.onAudioChunkSent?.(this.audioChunkCount);
    }
  }

  /**
   * Start streaming audio from the given MediaStream (e.g. tab capture = candidate audio).
   * Use this instead of startMic() so we capture the Meet tab output (candidate) not the device mic (interviewer).
   */
  async startMicWithStream(sessionId: string, stream: MediaStream): Promise<void> {
    if (this.micStream) return Promise.resolve();
    this.micStream = stream;
    this.float32Buffer = [];
    this.consecutiveSilentChunks = 0;
    this.tabAudioSilentErrorLogged = false;
    this.audioCtx = new AudioContext({ sampleRate: 16000 });

    const processorUrl =
      typeof chrome !== "undefined" && chrome?.runtime?.getURL
        ? chrome.runtime.getURL("audio-worklet-processor.js")
        : "";
    if (!processorUrl) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
      throw new Error("HireLens: extension runtime not available for audio worklet");
    }

    let workletModuleUrl: string | undefined;
    try {
      const script = await fetch(processorUrl).then((r) => r.text());
      const blob = new Blob([script], { type: "application/javascript" });
      workletModuleUrl = URL.createObjectURL(blob);
      await this.audioCtx.audioWorklet.addModule(workletModuleUrl);
    } finally {
      if (workletModuleUrl) URL.revokeObjectURL(workletModuleUrl);
    }

    const source = this.audioCtx.createMediaStreamSource(this.micStream);
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = 5.0;
    const node = new AudioWorkletNode(this.audioCtx, "capture-processor");
    this.workletNode = node;

    source.connect(gainNode);
    gainNode.connect(node);
    node.connect(this.audioCtx.destination);

    node.port.onmessage = (e: MessageEvent<{ samples: Float32Array }>) => {
      const samples = e.data?.samples;
      if (!samples?.length) return;
      for (let i = 0; i < samples.length; i++) this.float32Buffer.push(samples[i]);
      while (this.float32Buffer.length >= AUDIO_CHUNK_SAMPLES) {
        const chunk = new Float32Array(AUDIO_CHUNK_SAMPLES);
        for (let i = 0; i < AUDIO_CHUNK_SAMPLES; i++) chunk[i] = this.float32Buffer.shift()!;
        this.sendAudioChunk(chunk);
      }
    };

    console.log("[HireLens] Tab audio streaming started (candidate) →", sessionId);
  }

  /**
   * Send a pre-encoded audio chunk (base64 linear16) received from the offscreen document
   * via the background script. This bypasses the local AudioContext pipeline entirely.
   */
  sendEncodedChunk(chunk: string, encoding: string, _chunkCount: number): void {
    if (!this.socket?.connected) {
      const now = Date.now();
      if (now - this.lastAudioSkipLog >= AUDIO_SKIP_LOG_THROTTLE_MS) {
        this.lastAudioSkipLog = now;
        this.callbacks.onAudioSkipped?.("WS not connected (offscreen chunk)");
      }
      return;
    }
    this.socket!.emit("audio", { chunk, encoding });
    this.audioChunkCount += 1;
    if (this.audioChunkCount % AUDIO_LOG_EVERY_CHUNKS === 0) {
      this.callbacks.onAudioChunkSent?.(this.audioChunkCount);
    }
  }

  stopMic(): void {
    this.workletNode?.disconnect();
    this.workletNode = null;
    this.float32Buffer = [];
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
    alerts: [],
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
