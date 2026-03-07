import { Injectable } from '@nestjs/common';
import { AnalysisService } from './analysis/analysis.service';
import { RagService } from './rag/rag.service';
import { KnowledgeService, CompareResult } from './knowledge/knowledge.service';
import { AlertsService } from './alerts/alerts.service';
import { PrismaService } from './prisma.service';
import type {
  TurnResult,
  PipelineAResult,
  PipelineBResult,
  AlertDto,
  ClaimDto,
  EvidenceCardDto,
} from '@hirelens/shared-types';

export interface ProcessTurnInput {
  sessionId: string;
  candidateId: string;
  activeQuestion: string;
  candidateAnswer: string;
}

@Injectable()
export class PipelineService {
  constructor(
    private readonly analysis: AnalysisService,
    private readonly rag: RagService,
    private readonly knowledge: KnowledgeService,
    private readonly alerts: AlertsService,
    private readonly prisma: PrismaService,
  ) {}

  async processTurn(input: ProcessTurnInput): Promise<TurnResult> {
    const { sessionId, candidateId, activeQuestion, candidateAnswer } = input;

    const [pipelineAResult, pipelineBResult] = await Promise.all([
      this.runPipelineA(activeQuestion, candidateAnswer),
      this.runPipelineB(sessionId, candidateId, candidateAnswer),
    ]);

    const turn = await this.prisma.interviewTurn.create({
      data: {
        sessionId,
        activeQuestion,
        candidateAnswer,
        transcriptSnippet: candidateAnswer,
        turnIndex: await this.getNextTurnIndex(sessionId),
      },
    });

    const allClaims = pipelineBResult.allClaims;
    const claimRecords = await this.createClaims(turn.id, sessionId, candidateId, allClaims);
    const alertsCreated: AlertDto[] = [];
    for (const c of pipelineBResult.contradictions) {
      const claimId = claimRecords.find((r) => r.claimText === c.claim)?.id;
      const alert = await this.alerts.createAlert({
        sessionId,
        turnId: turn.id,
        claimId,
        type: 'contradiction',
        transcriptSnippet: c.transcriptSnippet,
        resumeEvidence: c.resumeEvidence,
        explanation: c.explanation,
        suggestedQuestion: c.suggestedQuestion,
        confidence: c.confidence,
      });
      alertsCreated.push(alert);
    }

    return {
      turnId: turn.id,
      sessionId,
      activeQuestion,
      candidateAnswer,
      pipelineA: pipelineAResult,
      pipelineB: {
        evidenceCards: pipelineBResult.evidenceCards,
        newClaims: pipelineBResult.newClaims,
        contradictions: alertsCreated,
      },
      processedAt: new Date().toISOString(),
    };
  }

  private async runPipelineA(activeQuestion: string, candidateAnswer: string): Promise<PipelineAResult> {
    return this.analysis.generateFollowUps(activeQuestion, candidateAnswer);
  }

  private async runPipelineB(
    sessionId: string,
    candidateId: string,
    candidateAnswer: string,
  ): Promise<{
    evidenceCards: EvidenceCardDto[];
    newClaims: ClaimDto[];
    contradictions: Array<{
      claim: string;
      transcriptSnippet: string;
      resumeEvidence: string;
      explanation?: string;
      suggestedQuestion: string;
      confidence: number;
    }>;
    allClaims: ClaimDto[];
  }> {
    const claims = await this.analysis.extractClaims(candidateAnswer);
    const evidenceCards: EvidenceCardDto[] = [];
    const newClaims: ClaimDto[] = [];
    const contradictions: Array<{
      claim: string;
      transcriptSnippet: string;
      resumeEvidence: string;
      explanation?: string;
      suggestedQuestion: string;
      confidence: number;
    }> = [];

    const compareResults = await this.knowledge.compareClaims(candidateId, claims);

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      const compare = compareResults[i];
      if (!compare) continue;

      if (compare.match === 'contradiction' && compare.existingTriple) {
        const { explanation, suggestedQuestion } = await this.analysis.generateContradictionClarify(
          claim.claimText,
          compare.existingTriple.object,
          'value_mismatch',
        );
        contradictions.push({
          claim: claim.claimText,
          transcriptSnippet: candidateAnswer.slice(0, 200),
          resumeEvidence: compare.existingTriple.object,
          explanation,
          suggestedQuestion,
          confidence: claim.confidence ?? 0.8,
        });
        continue;
      }

      if (compare.match === 'new_information') {
        const embedding = await this.rag.embed(claim.claimText);
        const searchResults = await this.rag.search(candidateId, embedding, 3);
        const cards = this.rag.resultsToEvidenceCards(
          searchResults.map((r) => ({ textChunk: r.textChunk, similarity: r.similarity })),
          claim.claimText,
        );
        evidenceCards.push(...cards);
        if (cards.length === 0) newClaims.push(claim);
      }
    }

    return {
      evidenceCards,
      newClaims,
      contradictions,
      allClaims: claims,
    };
  }

  private async getNextTurnIndex(sessionId: string): Promise<number> {
    const last = await this.prisma.interviewTurn.findFirst({
      where: { sessionId },
      orderBy: { turnIndex: 'desc' },
    });
    return (last?.turnIndex ?? -1) + 1;
  }

  private async createClaims(
    turnId: string,
    sessionId: string,
    candidateId: string,
    claims: ClaimDto[],
  ): Promise<Array<{ id: string; claimText: string }>> {
    const created: Array<{ id: string; claimText: string }> = [];
    for (const c of claims) {
      const rec = await this.prisma.claim.create({
        data: {
          turnId,
          sessionId,
          candidateId,
          claimText: c.claimText,
          predicate: c.predicate,
          object: c.object,
          confidence: c.confidence,
        },
      });
      created.push({ id: rec.id, claimText: rec.claimText });
    }
    return created;
  }
}
