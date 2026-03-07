import { Controller, Get, Post, Param, HttpCode, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { DynamicInterviewsService } from './dynamic-interviews.service';

/**
 * Handles the candidate-facing session endpoints that the frontend calls:
 *   GET  /v1/dynamic-sessions/:id/status   — check if session is active/ended
 *   GET  /v1/dynamic-sessions/:id/token    — fetch LiveKit credentials to join room
 *   POST /v1/dynamic-sessions/:id/end      — candidate clicks "End Interview"
 *
 * Also exposes:
 *   GET  /v1/dynamic-sessions/results      — list all interview results (recruiter dashboard)
 *   GET  /v1/dynamic-sessions/results/:id  — get evaluation for one session
 */
@Controller('dynamic-sessions')
export class DynamicSessionsController {
  private readonly logger = new Logger(DynamicSessionsController.name);

  constructor(private readonly dynamicInterviewsService: DynamicInterviewsService) {}

  // ── GET /v1/dynamic-sessions/results ─────────────────────────────────────────
  @Get('results')
  async getAllResults() {
    return this.dynamicInterviewsService.getAllResults();
  }

  // ── GET /v1/dynamic-sessions/results/:sessionId ───────────────────────────────
  @Get('results/:sessionId')
  async getResult(@Param('sessionId') sessionId: string) {
    const result = await this.dynamicInterviewsService.getResultBySession(sessionId);
    if (!result) throw new NotFoundException(`No evaluation found for session ${sessionId}`);
    return result;
  }

  // ── GET /v1/dynamic-sessions/:id/status ──────────────────────────────────────
  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    try {
      const session = await this.dynamicInterviewsService.getSession(id);
      return {
        success: true,
        data: {
          status: session.status as 'active' | 'ended',
          session_id: session.id,
          face_id: session.faceId || '',
        },
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`Error fetching status for ${id}`, err);
      throw err;
    }
  }

  // ── GET /v1/dynamic-sessions/:id/token ───────────────────────────────────────
  @Get(':id/token')
  async getToken(@Param('id') id: string) {
    try {
      const creds = await this.dynamicInterviewsService.generateTokenForSession(id);
      return {
        success: true,
        data: creds,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`Error generating token for ${id}`, err);
      throw err;
    }
  }

  // ── POST /v1/dynamic-sessions/:id/end ────────────────────────────────────────
  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  async endSession(@Param('id') id: string) {
    await this.dynamicInterviewsService.endSession(id);
    return { success: true, message: 'Session ended' };
  }
}
