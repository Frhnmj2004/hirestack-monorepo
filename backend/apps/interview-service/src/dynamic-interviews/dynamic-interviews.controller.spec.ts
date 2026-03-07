import { Test, TestingModule } from '@nestjs/testing';
import { DynamicInterviewsController } from './dynamic-interviews.controller';

describe('DynamicInterviewsController', () => {
  let controller: DynamicInterviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DynamicInterviewsController],
    }).compile();

    controller = module.get<DynamicInterviewsController>(DynamicInterviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
