import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { AlertDto } from '@hirelens/shared-types';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAlert(params: {
    sessionId: string;
    turnId?: string;
    claimId?: string;
    type: string;
    transcriptSnippet: string;
    resumeEvidence: string;
    explanation?: string;
    suggestedQuestion: string;
    confidence: number;
  }): Promise<AlertDto> {
    const alert = await this.prisma.alert.create({
      data: {
        sessionId: params.sessionId,
        turnId: params.turnId,
        claimId: params.claimId,
        type: params.type,
        transcriptSnippet: params.transcriptSnippet,
        resumeEvidence: params.resumeEvidence,
        explanation: params.explanation,
        suggestedQuestion: params.suggestedQuestion,
        confidence: params.confidence,
      },
    });
    return {
      id: alert.id,
      type: alert.type as AlertDto['type'],
      claim: params.transcriptSnippet,
      transcriptSnippet: alert.transcriptSnippet ?? '',
      resumeEvidence: alert.resumeEvidence ?? '',
      explanation: alert.explanation ?? undefined,
      suggestedQuestion: alert.suggestedQuestion ?? '',
      confidence: Number(alert.confidence ?? 0),
      createdAt: alert.createdAt.toISOString(),
    };
  }
}
