import { Body, Controller, Post, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DynamicInterviewsService } from './dynamic-interviews.service';
import { StartInterviewDto } from './start-interview.dto';

@Controller('dynamic-interviews')
export class DynamicInterviewsController {
  private readonly logger = new Logger(DynamicInterviewsController.name);

  constructor(private readonly dynamicInterviewsService: DynamicInterviewsService) {}

  @Post('start')
  async startInterview(@Body() body: StartInterviewDto) {
    return this.dynamicInterviewsService.startDynamicInterview(
      body.resumeText,
      body.jobDescription,
    );
  }

  @EventPattern('interview.dynamic.ended')
  async handleInterviewEnded(@Payload() data: any) {
    this.logger.log(`Received interview.dynamic.ended event for session: ${data.session_id}`);
    
    // NATS stringifies the payload sent from the Python agent
    // Sometimes the NestJS NATS adapter might give a Uint8Array buffer if not properly JSON parsed
    let parsedData = data;
    if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
      parsedData = JSON.parse(data.toString());
    } else if (typeof data === 'string') {
      try { parsedData = JSON.parse(data); } catch (e) {}
    }

    await this.dynamicInterviewsService.saveInterviewResult(parsedData);
  }
}
