import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma.service';
import { ASSIST_PATTERNS } from '@hirelens/shared-types';
import type {
  AssistSessionStartPayload,
  AssistSessionStartResponse,
  AssistSessionEndPayload,
  AssistSessionEndResponse,
  AssistGetSessionPayload,
  AssistGetSessionResponse,
} from '@hirelens/shared-types';

@Controller()
export class SessionController {
  constructor(private readonly prisma: PrismaService) {}

  @MessagePattern(ASSIST_PATTERNS.SESSION_START)
  async startSession(@Payload() payload: AssistSessionStartPayload): Promise<AssistSessionStartResponse> {
    const session = await this.prisma.interviewSession.create({
      data: {
        candidateId: payload.candidateId,
        interviewerId: payload.interviewerId,
        interviewId: payload.interviewId ?? undefined,
        meetingLink: payload.meetingLink ?? undefined,
        status: 'active',
      },
    });
    return {
      sessionId: session.id,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
    };
  }

  @MessagePattern(ASSIST_PATTERNS.SESSION_END)
  async endSession(@Payload() payload: AssistSessionEndPayload): Promise<AssistSessionEndResponse> {
    const session = await this.prisma.interviewSession.update({
      where: { id: payload.sessionId },
      data: { status: 'ended', endedAt: new Date() },
    });
    return {
      sessionId: session.id,
      status: session.status,
      endedAt: session.endedAt!.toISOString(),
    };
  }

  @MessagePattern(ASSIST_PATTERNS.SESSION_GET)
  async getSession(@Payload() payload: AssistGetSessionPayload): Promise<AssistGetSessionResponse | null> {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: payload.id },
    });
    if (!session) return null;
    return {
      id: session.id,
      interviewId: session.interviewId ?? undefined,
      candidateId: session.candidateId,
      interviewerId: session.interviewerId,
      meetingLink: session.meetingLink ?? undefined,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
