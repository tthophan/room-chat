import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaModule, PrismaService } from '~/modules/prisma';
import { AuthController } from '../../controllers';
import { AuthService, SessionService } from '../../services';
import { BusinessException } from '~/core/exceptions';
import { GeneratorService } from '~/core/utils';
import { HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let sessionService: SessionService;
  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, SessionService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    sessionService = moduleRef.get<SessionService>(SessionService);
  });
  describe('signUp', () => {
    it('should return user', async () => {
      const payload = {
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        password: 'test',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue(null);
      jest.spyOn(prismaService.user, 'create').mockReturnValue({
        id: 1,
      } as any);
      jest
        .spyOn(sessionService, 'createSession')
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            resolve({
              token: 'test',
              firstName: 'test',
              lastName: 'test',
              userId: 1,
            });
          });
        });
      const result = await authService.signUp(payload);
      expect(result).toEqual({
        token: 'test',
        firstName: 'test',
        lastName: 'test',
        userId: 1,
      });
    });

    it('should exists user', async () => {
      const payload = {
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        password: 'test',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue({
        id: 1,
      } as any);
      await authService.signUp(payload).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });
    });
  });

  describe('SignIn', () => {
    it('should return user', async () => {
      const payload = {
        username: 'test',
        password: 'test',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue({
        id: 1,
        password: 'test',
      } as any);
      jest.spyOn(GeneratorService, 'makeHash').mockReturnValue(
        new Promise((resolve) => {
          resolve('test');
        }),
      );
      jest
        .spyOn(sessionService, 'createSession')
        .mockImplementation(async () => {
          return new Promise((resolve) => {
            resolve({
              token: 'test',
              firstName: 'test',
              lastName: 'test',
              userId: 1,
            });
          });
        });
      const result = await authService.SignIn(payload);
      expect(result).toEqual({
        token: 'test',
        firstName: 'test',
        lastName: 'test',
        userId: 1,
      });
    });

    it('should not exists user', async () => {
      const payload = {
        username: 'test',
        password: 'test',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue(null);
      await authService.SignIn(payload).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });
    });

    it('should wrong password error', async () => {
      const payload = {
        username: 'test',
        password: 'test',
      };
      jest.spyOn(prismaService.user, 'findUnique').mockReturnValue({
        id: 1,
        password: 'test',
      } as any);
      jest.spyOn(GeneratorService, 'makeHash').mockImplementation(async () => {
        return new Promise((resolve) => {
          resolve('123');
        });
      });
      await authService.SignIn(payload).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
        expect((ex as BusinessException).status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });
});
