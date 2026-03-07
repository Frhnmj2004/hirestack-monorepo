import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { InterviewManagementController } from './interview-management.controller';
import { AnalysisModule } from '../analysis/analysis.module';
import { RagModule } from '../rag/rag.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [AnalysisModule, RagModule, KnowledgeModule],
  controllers: [SessionController, InterviewManagementController],
})
export class SessionModule {}
