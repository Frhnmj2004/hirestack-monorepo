export declare function loadPrompt(name: string): string;
export declare const PROMPT_NAMES: {
    readonly ANSWER_ANALYSIS: "answer-analysis";
    readonly CLAIM_EXTRACTION: "claim-extraction";
    readonly CONTRADICTION_CLARIFY: "contradiction-clarify";
    readonly QUESTION_GENERATION: "question-generation";
};
export declare function getAnswerAnalysisPrompt(activeQuestion: string, candidateAnswer: string): string;
export declare function getClaimExtractionPrompt(candidateAnswer: string): string;
export declare function getContradictionClarifyPrompt(claim: string, resumeEvidence: string, contradictionType: string): string;
export declare function getQuestionGenerationPrompt(jdText: string, resumeText: string, roleLevel: string): string;
