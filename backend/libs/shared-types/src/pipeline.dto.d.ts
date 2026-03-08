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
    chunk: string;
    encoding?: string;
}
