/**
 * DTOs for assist-service pipeline results and WebSocket payloads.
 */

export interface ClaimDto {
  claimText: string;
  predicate?: string;
  object?: string;
  confidence?: number;
}

export interface FollowUpDto {
  question: string;
  type: 'follow_up' | 'competency';
}

export interface ExtractedTopicDto {
  topic: string;
  reason?: string;
  followUpQuestions: FollowUpDto[];
}

export interface AnswerScoreDto {
  relevance: number;
  depth: number;
  specificity: number;
  overall: number;
  feedback: string;
}

export interface EvidenceCardDto {
  type: 'strong' | 'possible' | 'new_info';
  resumeSnippet: string;
  similarity?: number;
  claimText?: string;
}

export interface AlertDto {
  id: string;
  type: 'contradiction' | 'evidence' | 'clarification';
  claim: string;
  transcriptSnippet: string;
  resumeEvidence: string;
  explanation?: string;
  suggestedQuestion: string;
  confidence: number;
  createdAt: string;
}

export interface PipelineAResult {
  keyInsights: string[];
  skillSignals: string[];
  followUpQuestions: FollowUpDto[];
  competencyQuestions: FollowUpDto[];
  extractedTopics: ExtractedTopicDto[];
  answerScore?: AnswerScoreDto;
}

export interface PipelineBResult {
  evidenceCards: EvidenceCardDto[];
  newClaims: ClaimDto[];
  contradictions: AlertDto[];
}

export interface TurnResult {
  turnId: string;
  sessionId: string;
  activeQuestion: string;
  candidateAnswer: string;
  pipelineA: PipelineAResult;
  pipelineB: PipelineBResult;
  processedAt: string;
}

export interface WebSocketSessionPayload {
  sessionId: string;
  candidateId: string;
  interviewerId: string;
  activeQuestion?: string;
}

export interface WebSocketAudioPayload {
  chunk: string; // base64 audio
  encoding?: string;
}
