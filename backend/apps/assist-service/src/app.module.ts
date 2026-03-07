import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StreamingModule } from './streaming/streaming.module';
import { AnalysisModule } from './analysis/analysis.module';
import { RagModule } from './rag/rag.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AlertsModule } from './alerts/alerts.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SessionModule } from './session/session.module';
import { PrismaModule } from './prisma.module';
import { PipelineModule } from './pipeline.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          ttl: 86400 * 1000,
        }),
      }),
    }),
    PrismaModule,
    StreamingModule,
    AnalysisModule,
    RagModule,
    KnowledgeModule,
    AlertsModule,
    PipelineModule,
    WebsocketModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
