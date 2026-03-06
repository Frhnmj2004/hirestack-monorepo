import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumesModule } from './resumes/resumes.module';
import { ShortlistModule } from './shortlist/shortlist.module';
import { InterviewsModule } from './interviews/interviews.module';
import { RagModule } from './rag/rag.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ResumesModule, ShortlistModule, InterviewsModule, RagModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
