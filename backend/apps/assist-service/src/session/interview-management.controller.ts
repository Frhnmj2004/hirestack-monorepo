import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AnalysisService } from '../analysis/analysis.service';
import { RagService } from '../rag/rag.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { ASSIST_PATTERNS } from '@hirelens/shared-types';
import type {
  CreateInterviewPayload,
  CreateInterviewResponse,
  InterviewListPayload,
  InterviewListResponse,
  InterviewGetPayload,
  InterviewGetResponse,
  GeneratedTopic,
} from '@hirelens/shared-types';

/** Split resume text into ~600-char chunks with 80-char overlap */
function chunkText(text: string, chunkSize = 600, overlap = 80): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks.filter((c) => c.trim().length > 20);
}

@Controller()
export class InterviewManagementController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analysis: AnalysisService,
    private readonly rag: RagService,
    private readonly knowledge: KnowledgeService,
  ) {}

  @MessagePattern(ASSIST_PATTERNS.INTERVIEW_CREATE)
  async createInterview(@Payload() payload: CreateInterviewPayload): Promise<CreateInterviewResponse> {
    const candidateId = randomUUID();

    // 1. Generate interview plan (questions + candidate analysis) via OpenAI
    const plan = await this.analysis.generateInterviewPlan(
      payload.jdText,
      payload.resumeText,
      payload.level,
    );

    // 2. Chunk + embed resume text → store in resume_chunks for RAG
    const chunks = chunkText(payload.resumeText);
    await Promise.all(
      chunks.map((chunk) =>
        this.rag.storeChunk(candidateId, chunk, { source: 'resume', candidateName: payload.candidateName }),
      ),
    );

    // 3. Extract claims from resume → seed knowledge triples for contradiction detection
    const claims = await this.analysis.extractClaims(payload.resumeText);
    await Promise.all(
      claims.map((claim) =>
        this.knowledge.storeFact(
          candidateId,
          claim.predicate || claim.claimText.slice(0, 50).replace(/\s+/g, '_').toLowerCase(),
          claim.object || claim.claimText,
          { confidence: claim.confidence, source: 'resume' },
        ),
      ),
    );

    // 4. Store candidate metadata + create Interview with topics + questions in DB
    const candidateMeta = JSON.stringify({
      candidateId,
      candidateName: payload.candidateName,
      candidateEmail: payload.candidateEmail || null,
      summary: plan.candidateSummary,
      skills: plan.candidateSkills,
      previousCompanies: plan.previousCompanies,
    });

    const interview = await this.prisma.interview.create({
      data: {
        jobDescription: payload.jdText,
        cultureFit: candidateMeta,
        roleLevel: payload.level,
        competencyRequirements: JSON.stringify({
          roleTitle: payload.roleTitle,
          department: payload.department,
          interviewerId: payload.interviewerId,
        }),
        topics: {
          create: plan.topics.map((topic, tIdx) => ({
            name: topic.name,
            sortOrder: tIdx,
            questions: {
              create: topic.questions.map((q, qIdx) => ({
                questionText: q.text,
                mandatory: true,
                sortOrder: qIdx,
              })),
            },
          })),
        },
      },
      include: {
        topics: {
          include: { questions: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // 5. Build response with generated question IDs
    const responseTopics: GeneratedTopic[] = interview.topics.map((topic) => {
      const questions = topic.questions.map((q, idx) => ({
        id: q.id,
        text: q.questionText,
        type: (plan.topics.find((t) => t.name === topic.name)?.questions[idx]?.type ?? 'technical') as GeneratedTopic['questions'][0]['type'],
        competency: plan.topics.find((t) => t.name === topic.name)?.questions[idx]?.competency ?? topic.name,
        order: q.sortOrder,
      }));
      return {
        id: topic.id,
        name: topic.name,
        questionIds: questions.map((q) => q.id),
        questions,
      };
    });

    return {
      interviewId: interview.id,
      candidateId,
      candidateName: payload.candidateName,
      candidateEmail: payload.candidateEmail,
      roleTitle: payload.roleTitle,
      department: payload.department,
      level: payload.level,
      candidateSummary: plan.candidateSummary,
      candidateSkills: plan.candidateSkills,
      previousCompanies: plan.previousCompanies,
      topics: responseTopics,
      createdAt: interview.createdAt.toISOString(),
    };
  }

  @MessagePattern(ASSIST_PATTERNS.INTERVIEW_LIST)
  async listInterviews(@Payload() _payload: InterviewListPayload): Promise<InterviewListResponse> {
    const interviews = await this.prisma.interview.findMany({
      include: {
        topics: {
          include: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const items = interviews.map((iv) => {
      let meta: { candidateId?: string; candidateName?: string; candidateSkills?: string[]; candidateSummary?: string } = {};
      let roleInfo: { roleTitle?: string; department?: string } = {};
      try { meta = JSON.parse(iv.cultureFit || '{}'); } catch { /* ignore */ }
      try { roleInfo = JSON.parse(iv.competencyRequirements || '{}'); } catch { /* ignore */ }

      const questionCount = iv.topics.reduce((s, t) => s + t.questions.length, 0);

      return {
        interviewId: iv.id,
        candidateId: meta.candidateId || '',
        candidateName: meta.candidateName || 'Unknown',
        candidateSkills: meta.candidateSkills || [],
        candidateSummary: meta.candidateSummary || '',
        roleTitle: roleInfo.roleTitle || '',
        department: roleInfo.department || '',
        level: iv.roleLevel || '',
        questionCount,
        topicCount: iv.topics.length,
        createdAt: iv.createdAt.toISOString(),
      };
    });

    return { interviews: items };
  }

  @MessagePattern(ASSIST_PATTERNS.INTERVIEW_GET)
  async getInterview(@Payload() payload: InterviewGetPayload): Promise<InterviewGetResponse> {
    const iv = await this.prisma.interview.findUnique({
      where: { id: payload.id },
      include: {
        topics: {
          include: { questions: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!iv) return null;

    let meta: { candidateId?: string; candidateName?: string; candidateEmail?: string; skills?: string[]; summary?: string; previousCompanies?: string[] } = {};
    let roleInfo: { roleTitle?: string; department?: string } = {};
    try { meta = JSON.parse(iv.cultureFit || '{}'); } catch { /* ignore */ }
    try { roleInfo = JSON.parse(iv.competencyRequirements || '{}'); } catch { /* ignore */ }

    const topics: GeneratedTopic[] = iv.topics.map((topic) => {
      const questions = topic.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        type: 'technical' as const,
        competency: topic.name,
        order: q.sortOrder,
      }));
      return {
        id: topic.id,
        name: topic.name,
        questionIds: questions.map((q) => q.id),
        questions,
      };
    });

    return {
      interviewId: iv.id,
      candidateId: meta.candidateId || '',
      candidateName: meta.candidateName || 'Unknown',
      candidateEmail: meta.candidateEmail,
      roleTitle: roleInfo.roleTitle || '',
      department: roleInfo.department || '',
      level: iv.roleLevel || '',
      candidateSummary: meta.summary || '',
      candidateSkills: meta.skills || [],
      previousCompanies: meta.previousCompanies || [],
      topics,
      createdAt: iv.createdAt.toISOString(),
    };
  }
}
