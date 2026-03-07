import { Module } from '@nestjs/common';
import { DynamicInterviewsController } from './dynamic-interviews.controller';
import { DynamicInterviewsService } from './dynamic-interviews.service';

@Module({
  controllers: [DynamicInterviewsController],
  providers: [DynamicInterviewsService]
})
export class DynamicInterviewsModule {}
