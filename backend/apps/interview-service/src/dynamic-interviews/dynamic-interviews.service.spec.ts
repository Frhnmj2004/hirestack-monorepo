import { Test, TestingModule } from '@nestjs/testing';
import { DynamicInterviewsService } from './dynamic-interviews.service';

describe('DynamicInterviewsService', () => {
  let service: DynamicInterviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamicInterviewsService],
    }).compile();

    service = module.get<DynamicInterviewsService>(DynamicInterviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
