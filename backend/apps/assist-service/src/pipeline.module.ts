import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { AnalysisModule } from './analysis/analysis.module';
import { RagModule } from './rag/rag.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [AnalysisModule, RagModule, KnowledgeModule, AlertsModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
