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

  // #region agent log
  private pipelineLog(msg: string, data: Record<string, unknown>) {
    try {
      const line = JSON.stringify({ sessionId: '104cc8', runId: 'pipeline', hypothesisId: 'H2', location: 'pipeline.service.ts', message: msg, data, timestamp: Date.now() }) + '\n';
      const fs = require('fs'), path = require('path');
      const logPath = path.join(process.cwd(), '.cursor', 'debug-104cc8.log');
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(logPath, line);
    } catch (_) {}
  }
  // #endregion

  async processTurn(input: ProcessTurnInput): Promise<TurnResult> {
    const { sessionId, candidateId, activeQuestion, candidateAnswer } = input;

    // #region agent log
    this.pipelineLog('processTurn START', { sessionId, candidateId, answerLen: candidateAnswer.length, answerPreview: candidateAnswer.slice(0, 120), activeQuestion: activeQuestion.slice(0, 80) });
    // #endregion

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

    // #region agent log
    this.pipelineLog('processTurn DONE', {
      sessionId,
      turnId: turn.id,
      followUps: pipelineAResult.followUpQuestions?.length ?? 0,
      competencyQs: pipelineAResult.competencyQuestions?.length ?? 0,
      keyInsights: pipelineAResult.keyInsights?.length ?? 0,
      evidenceCards: pipelineBResult.evidenceCards?.length ?? 0,
      newClaims: pipelineBResult.newClaims?.length ?? 0,
      contradictions: alertsCreated.length,
      totalClaims: pipelineBResult.allClaims?.length ?? 0,
    });
    // #endregion

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
    // #region agent log
    this.pipelineLog('pipelineB: claims extracted', { claimCount: claims.length, claims: claims.map(c => ({ text: c.claimText?.slice(0, 60), pred: c.predicate, obj: c.object })) });
    // #endregion
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

      if (compare.match === 'match' && compare.existingTriple) {
        evidenceCards.push({
          type: 'strong',
          resumeSnippet: `${compare.existingTriple.predicate}: ${compare.existingTriple.object}`,
          similarity: 1.0,
          claimText: claim.claimText,
        });
        continue;
      }

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

        // Store new claim in knowledge graph so future answers can be cross-checked
        if (claim.predicate) {
          try {
            await this.knowledge.storeFact(candidateId, claim.predicate, claim.object ?? claim.claimText, {
              confidence: claim.confidence,
              source: 'interview',
            });
          } catch (_) { /* best-effort — don't fail the pipeline */ }
        }
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
