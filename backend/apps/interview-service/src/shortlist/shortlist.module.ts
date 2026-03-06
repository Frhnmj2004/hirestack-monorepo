import { Module } from '@nestjs/common';
import { ShortlistService } from './shortlist.service';
import { ShortlistController } from './shortlist.controller';

@Module({
  providers: [ShortlistService],
  controllers: [ShortlistController]
})
export class ShortlistModule {}
