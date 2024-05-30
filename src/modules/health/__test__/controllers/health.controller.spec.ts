import { Test } from '@nestjs/testing';
import { HealthController } from '../../controllers';

describe('health controller', () => {
  let healthController: HealthController;
  beforeAll(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    healthController = moduleRef.get<HealthController>(HealthController);
  });
  it('should be defined', () => {
    expect(true).toBe(true);
  });
  it('check', async () => {
    const result = await healthController.check();
    expect(result).toBe('ok');
  });
});
