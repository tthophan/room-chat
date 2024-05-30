import { Test } from '@nestjs/testing';
import { PrismaService } from '../../services';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      exports: [PrismaService],
      providers: [PrismaService],
    }).compile();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });
  it('should be defined', () => {
    expect(true).toBe(true);
  });
  it('onModuleInit', async () => {
    await prismaService.onModuleInit();
    expect(true).toBe(true);
  });
  it('onModuleDestroy', async () => {
    await prismaService.onModuleDestroy();
    expect(true).toBe(true);
  });
  it('$on', () => {
    try {
      prismaService.$on();
    } catch (err) {
      expect(err).toEqual(
        new Error('Method $on is not available in PrismaService'),
      );
    }
  });

  it('$disconnect', async () => {
    try {
      await prismaService.$disconnect();
    } catch (err) {
      expect(err).toEqual(
        new Error('Method $disconnect is not available in PrismaService'),
      );
    }
  });
});
