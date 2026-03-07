import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  getAnswerAnalysisPrompt,
  getClaimExtractionPrompt,
  getContradictionClarifyPrompt,
  getQuestionGenerationPrompt,
} from '@hirelens/shared-prompts';
import type { PipelineAResult, ClaimDto } from '@hirelens/shared-types';
import { withRetry } from '../common/retry.util';

export interface InterviewPlanQuestion {
  text: string;
  type: 'technical' | 'behavioral' | 'situational' | 'competency';
  competency: string;
}

export interface InterviewPlanTopic {
  name: string;
  questions: InterviewPlanQuestion[];
}

export interface InterviewPlan {
  candidateSummary: string;
  candidateSkills: string[];
  previousCompanies: string[];
  topics: InterviewPlanTopic[];
}

@Injectable()
export class AnalysisService {
  private readonly openai: OpenAI;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required');
    this.openai = new OpenAI({ apiKey: key });
  }

  async generateInterviewPlan(jdText: string, resumeText: string, roleLevel: string): Promise<InterviewPlan> {
    const prompt = getQuestionGenerationPrompt(jdText, resumeText, roleLevel);
    const result = await withRetry(() =>
      this.openai.chat.completions.create({
        model: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    );
    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI response for interview plan');
    const parsed = JSON.parse(content) as {
      candidateSummary?: string;
      candidateSkills?: string[];
      previousCompanies?: string[];
      topics?: Array<{
        name?: string;
        questions?: Array<{ text?: string; type?: string; competency?: string }>;
      }>;
    };
    return {
      candidateSummary: parsed.candidateSummary || '',
      candidateSkills: Array.isArray(parsed.candidateSkills) ? parsed.candidateSkills : [],
      previousCompanies: Array.isArray(parsed.previousCompanies) ? parsed.previousCompanies : [],
      topics: (parsed.topics || []).map((t) => ({
        name: t.name || 'General',
        questions: (t.questions || []).map((q) => ({
          text: q.text || '',
          type: (['technical', 'behavioral', 'situational', 'competency'].includes(q.type || '')
            ? q.type
            : 'technical') as InterviewPlanQuestion['type'],
          competency: q.competency || t.name || 'General',
        })),
      })),
    };
  }

  async generateFollowUps(activeQuestion: string, candidateAnswer: string): Promise<PipelineAResult> {
    const prompt = getAnswerAnalysisPrompt(activeQuestion, candidateAnswer);
    const result = await withRetry(() =>
      this.openai.chat.completions.create({
        model: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    );
    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('Empty OpenAI response');
    const parsed = JSON.parse(content) as {
      keyInsights?: string[];
      skillSignals?: string[];
      followUpQuestions?: Array<{ question: string; type: string }>;
      competencyQuestions?: Array<{ question: string; type: string }>;
    };
    return {
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      skillSignals: Array.isArray(parsed.skillSignals) ? parsed.skillSignals : [],
      followUpQuestions: (parsed.followUpQuestions || []).map((q) => ({
        question: q.question || '',
        type: (q.type === 'competency' ? 'competency' : 'follow_up') as 'follow_up' | 'competency',
      })),
      competencyQuestions: (parsed.competencyQuestions || []).map((q) => ({
        question: q.question || '',
        type: 'competency' as const,
      })),
    };
  }

  async extractClaims(candidateAnswer: string): Promise<ClaimDto[]> {
    const prompt = getClaimExtractionPrompt(candidateAnswer);
    const result = await withRetry(() =>
      this.openai.chat.completions.create({
        model: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    );
    const content = result.choices[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content) as { claims?: Array<{ claimText: string; predicate?: string; object?: string; confidence?: number }> };
    return (parsed.claims || []).map((c) => ({
      claimText: c.claimText || '',
      predicate: c.predicate,
      object: c.object,
      confidence: typeof c.confidence === 'number' ? c.confidence : undefined,
    }));
  }

  async generateContradictionClarify(
    claim: string,
    resumeEvidence: string,
    contradictionType: string,
  ): Promise<{ explanation: string; suggestedQuestion: string }> {
    const prompt = getContradictionClarifyPrompt(claim, resumeEvidence, contradictionType);
    const result = await withRetry(() =>
      this.openai.chat.completions.create({
        model: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    );
    const content = result.choices[0]?.message?.content;
    if (!content) return { explanation: 'Discrepancy detected.', suggestedQuestion: 'Could you clarify?' };
    const parsed = JSON.parse(content) as { explanation?: string; suggestedQuestion?: string };
    return {
      explanation: parsed.explanation || 'Discrepancy detected.',
      suggestedQuestion: parsed.suggestedQuestion || 'Could you clarify?',
    };
  }
}
