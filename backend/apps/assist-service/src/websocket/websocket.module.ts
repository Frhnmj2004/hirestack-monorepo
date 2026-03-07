import { Module } from '@nestjs/common';
import { AssistGateway } from './assist/assist.gateway';
import { StreamingModule } from '../streaming/streaming.module';
import { PipelineModule } from '../pipeline.module';

@Module({
  imports: [StreamingModule, PipelineModule],
  providers: [AssistGateway],
})
export class WebsocketModule {}
