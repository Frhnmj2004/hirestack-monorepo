/**
 * Types aligned with HireLens backend:
 * - assist.contracts.ts: AssistSessionStart/End/Get
 * - pipeline.dto.ts: TurnResult, PipelineA/B, AlertDto, FollowUpDto
 */

// ── Alert types (from backend AlertDto) ─────────────────────────────────────
export type AlertType = "contradiction" | "evidence" | "clarification";
export type AlertSeverity = "low" | "medium" | "high";

export interface AlertItem {
  id: string;
  type: AlertType;
  claim: string;
  transcriptSnippet: string;
  resumeEvidence: string;
  explanation?: string;
  suggestedQuestion: string;
  confidence: number; // 0–1
  severity: AlertSeverity;
  createdAt: string;
}

// ── Follow-up types (from backend FollowUpDto) ───────────────────────────────
export type FollowUpType = "follow_up" | "competency";

export interface FollowUpItem {
  id: string;
  question: string;
  type: FollowUpType;
  reason?: string;
  questionId: string;
}

// ── Evidence cards (from backend EvidenceCardDto) ────────────────────────────
export interface EvidenceCard {
  id: string;
  type: "strong" | "possible" | "new_info";
  resumeSnippet: string;
  similarity?: number;
  claimText?: string;
}

// ── Interview questions ──────────────────────────────────────────────────────
export type QuestionType = "technical" | "behavioral" | "situational" | "competency";

export interface QuestionItem {
  id: string;
  text: string;
  competency: string;
  type: QuestionType;
  order: number;
  answered: boolean;
  skipped?: boolean;
  score?: number; // 0–10, set by pipeline A per answer
}

// ── Topics ───────────────────────────────────────────────────────────────────
export interface InterviewTopic {
  id: string;
  name: string;
  questionIds: string[];
  covered: boolean;
}

// ── Transcript ───────────────────────────────────────────────────────────────
export interface TranscriptEntry {
  id: string;
  speaker: "candidate" | "interviewer";
  text: string;
  timestamp: string; // ISO
}

// ── Candidate & Job ──────────────────────────────────────────────────────────
export interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  experience: string;
  currentRole?: string;
  currentCompany?: string;
  key_skills: string[];
  previous_companies: string[];
  resumeScore?: number; // 0–100
  summary?: string;
  highlights?: {
    top_projects: string[];
    key_achievements: string[];
    technologies: string[];
  };
}

export type RoleLevel = "Junior" | "Mid" | "Senior" | "Lead" | "Principal";

export interface JobRole {
  id: string;
  title: string;
  department: string;
  level: RoleLevel;
  requiredSkills: string[];
}

// ── Competency scores ────────────────────────────────────────────────────────
export interface CompetencyScore {
  label: string;
  score: number; // 0–10
  outOf: number;
}

// ── Full session (used by extension) ────────────────────────────────────────
export interface InterviewSession {
  sessionId: string;
  status: "active" | "paused" | "ended";
  jobRole: JobRole;
  candidate: CandidateProfile;
  questions: QuestionItem[];
  topics: InterviewTopic[];
  currentQuestionIndex: number;
  followUps: FollowUpItem[];    // for the current active question
  alerts: AlertItem[];          // live feed
  transcript: TranscriptEntry[];
  insights: string[];           // keyInsights from pipelineA
  skillSignals: string[];       // skillSignals from pipelineA
  evidenceCards: EvidenceCard[];
  scores: CompetencyScore[];
  startedAt: string;            // ISO
  durationSeconds: number;      // ticked by extension timer
  interviewStarted: boolean;    // false = briefing/Tab1, true = active/Tab2
}

/** Stored in chrome.storage.local; sent to content script */
export interface SessionPayload {
  session: InterviewSession;
  authorizedAt: number;
}

/** Shown in popup interview list — one card per scheduled interview */
export interface AvailableInterview {
  id: string;                   // interviewId for POST /assist/session/start
  candidate: {
    id: string;
    name: string;
    experience: string;
    currentRole?: string;
    currentCompany?: string;
    key_skills: string[];
    resumeScore?: number;
  };
  jobRole: {
    id: string;
    title: string;
    department: string;
    level: RoleLevel;
  };
  scheduledAt: string;          // ISO
  status: "scheduled" | "active" | "completed";
  meetingLink?: string;
}
