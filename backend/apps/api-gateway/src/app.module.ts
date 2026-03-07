import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ResumesModule } from './resumes/resumes.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AssistModule } from './assist/assist.module';

@Module({
  imports: [AuthModule, JobsModule, ResumesModule, InterviewsModule, AssistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
