/**
 * NATS message pattern names and payload contracts for assist-service.
 */

export const ASSIST_PATTERNS = {
  SESSION_START: 'assist.session.start',
  SESSION_END: 'assist.session.end',
  SESSION_GET: 'assist.session.get',

  // Interview management
  INTERVIEW_CREATE: 'assist.interview.create',
  INTERVIEW_LIST: 'assist.interview.list',
  INTERVIEW_GET: 'assist.interview.get',
} as const;

export interface AssistSessionStartPayload {
  interviewId?: string;
  candidateId: string;
  interviewerId: string;
  meetingLink?: string;
}

export interface AssistSessionStartResponse {
  sessionId: string;
  status: string;
  startedAt: string;
}

export interface AssistSessionEndPayload {
  sessionId: string;
}

export interface AssistSessionEndResponse {
  sessionId: string;
  status: string;
  endedAt: string;
}

export interface AssistGetSessionPayload {
  id: string;
}

export interface AssistGetSessionResponse {
  id: string;
  interviewId?: string;
  candidateId: string;
  interviewerId: string;
  meetingLink?: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Interview management contracts ────────────────────────────────────────────

export interface CreateInterviewPayload {
  interviewerId: string;
  candidateName: string;
  candidateEmail?: string;
  resumeText: string;
  jdText: string;
  roleTitle: string;
  department: string;
  level: string; // Junior | Mid | Senior | Lead | Principal
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: 'technical' | 'behavioral' | 'situational' | 'competency';
  competency: string;
  order: number;
}

export interface GeneratedTopic {
  id: string;
  name: string;
  questionIds: string[];
  questions: GeneratedQuestion[];
}

export interface CreateInterviewResponse {
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
  topics: GeneratedTopic[];
  createdAt: string;
}

export interface InterviewListPayload {
  interviewerId?: string;
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

export interface InterviewListResponse {
  interviews: InterviewListItem[];
}

export interface InterviewGetPayload {
  id: string;
}

export type InterviewGetResponse = CreateInterviewResponse | null;
