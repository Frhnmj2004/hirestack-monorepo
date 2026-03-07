/**
 * NATS message pattern names and payload contracts for assist-service.
 */

export const ASSIST_PATTERNS = {
  SESSION_START: 'assist.session.start',
  SESSION_END: 'assist.session.end',
  SESSION_GET: 'assist.session.get',
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
