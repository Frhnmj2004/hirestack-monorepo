import { Controller, Post, Get, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ASSIST_PATTERNS } from '@hirelens/shared-types';
import type {
  CreateInterviewPayload,
  CreateInterviewResponse,
  InterviewListResponse,
  InterviewGetResponse,
} from '@hirelens/shared-types';

@Controller('interviews')
export class InterviewsController {
  constructor(@Inject('ASSIST_SERVICE') private readonly client: ClientProxy) {}

  /** POST /interviews — create interview from JD + resume text, generate questions */
  @Post()
  async createInterview(@Body() body: CreateInterviewPayload): Promise<CreateInterviewResponse> {
    return firstValueFrom(
      this.client.send<CreateInterviewResponse>(ASSIST_PATTERNS.INTERVIEW_CREATE, body),
    );
  }

  /** GET /interviews — list all interviews */
  @Get()
  async listInterviews(): Promise<InterviewListResponse> {
    return firstValueFrom(
      this.client.send<InterviewListResponse>(ASSIST_PATTERNS.INTERVIEW_LIST, {}),
    );
  }

  /** GET /interviews/:id — get full interview with topics + questions */
  @Get(':id')
  async getInterview(@Param('id') id: string): Promise<InterviewGetResponse> {
    return firstValueFrom(
      this.client.send<InterviewGetResponse>(ASSIST_PATTERNS.INTERVIEW_GET, { id }),
    );
  }
}
