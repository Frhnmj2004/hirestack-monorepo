import { Module } from '@nestjs/common';
import { DynamicInterviewsController } from './dynamic-interviews.controller';
import { DynamicSessionsController } from './dynamic-sessions.controller';
import { DynamicInterviewsService } from './dynamic-interviews.service';

@Module({
  controllers: [DynamicInterviewsController, DynamicSessionsController],
  providers: [DynamicInterviewsService],
})
export class DynamicInterviewsModule {}
