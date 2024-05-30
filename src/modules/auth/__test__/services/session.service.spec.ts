import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { GeneratorService } from '~/core/utils';
import { PrismaModule } from '~/modules/prisma';
import { AuthController } from '../../controllers';
import { AuthService, SessionService } from '../../services';

describe('SessionService', () => {
  let sessionService: SessionService;
  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, SessionService],
    }).compile();

    sessionService = moduleRef.get<SessionService>(SessionService);
    Reflect.set(sessionService, 'jwtConfig', {});
  });

  describe('createSession', () => {
    it('should return token', async () => {
      const payload = {
        userId: 1,
        firstName: 'test',
        lastName: 'test',
      };
      jest.spyOn(GeneratorService, 'createToken').mockReturnValue('test');
      const result = await sessionService.createSession(payload);
      expect(result).toEqual(
        expect.objectContaining({
          token: 'test',
        }),
      );
    });
  });
  describe('validateSession', () => {
    it('should return token', async () => {
      const token = 'test';
      jest
        .spyOn(GeneratorService, 'verifyJwtToken')
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            resolve({
              data: {},
              verified: true,
            });
          });
        });
      const result = await sessionService.validateSession(token);
      expect(result).toEqual(
        expect.objectContaining({
          verified: true,
        }),
      );
    });
  });
});
