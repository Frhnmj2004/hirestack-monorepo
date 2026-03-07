import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ASSIST_PATTERNS } from '@hirelens/shared-types';
import type {
  AssistSessionStartPayload,
  AssistSessionEndPayload,
  AssistGetSessionResponse,
} from '@hirelens/shared-types';

@Controller('assist')
export class AssistController {
  constructor(@Inject('ASSIST_SERVICE') private readonly client: ClientProxy) {}

  @Post('session/start')
  async startSession(@Body() body: AssistSessionStartPayload) {
    return firstValueFrom(this.client.send(ASSIST_PATTERNS.SESSION_START, body));
  }

  @Post('session/end')
  async endSession(@Body() body: AssistSessionEndPayload) {
    return firstValueFrom(this.client.send(ASSIST_PATTERNS.SESSION_END, body));
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string): Promise<AssistGetSessionResponse | null> {
    return firstValueFrom(this.client.send<AssistGetSessionResponse | null>(ASSIST_PATTERNS.SESSION_GET, { id }));
  }
}
