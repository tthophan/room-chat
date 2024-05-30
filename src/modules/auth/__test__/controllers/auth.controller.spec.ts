import { Test } from '@nestjs/testing';
import { AuthService, SessionService } from '../../services';
import { AuthController } from '../../controllers/auth.controller';
import { PrismaModule } from '~/modules/prisma';
import { ConfigModule } from '@nestjs/config';
import { BusinessException } from '~/core/exceptions';
import { ERR } from '~/core/enums';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;
  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, SessionService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    authController = moduleRef.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return user', async () => {
      const payload = {
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        password: 'test',
      };
      jest.spyOn(authService, 'signUp').mockImplementation(async () => {
        return new Promise((resolve) => {
          resolve({
            token: 'test',
            firstName: 'test',
            lastName: 'test',
            userId: 1,
          });
        });
      });
      const result = await authController.signup(payload);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(authService.signUp).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        token: 'test',
        firstName: 'test',
        lastName: 'test',
        userId: 1,
      });
    });

    it('should return error', async () => {
      const payload = {
        username: 'test',
        firstName: 'test',
        lastName: 'test',
        password: 'test',
      };
      jest.spyOn(authService, 'signUp').mockRejectedValue(
        new BusinessException({
          errorCode: ERR.BAD_USER_INPUT,
          err: 'test error',
          status: HttpStatus.CONFLICT,
        }),
      );
      await authController.signup(payload).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });
      expect(authService.signUp).toHaveBeenCalledTimes(1);
      expect(authService.signUp).toHaveBeenCalledWith(payload);
    });
  });
  describe('signin', () => {
    it('should return user', async () => {
      const payload = {
        username: 'test',
        password: 'test',
      };
      jest.spyOn(authService, 'SignIn').mockImplementation(async () => {
        return new Promise((resolve) => {
          resolve({
            token: 'test',
            firstName: 'test',
            lastName: 'test',
            userId: 1,
          });
        });
      });
      const result = await authController.signin(payload);
      expect(authService.SignIn).toHaveBeenCalledTimes(1);
      expect(authService.SignIn).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        token: 'test',
        firstName: 'test',
        lastName: 'test',
        userId: 1,
      });
    });

    it('should return error', async () => {
      const payload = {
        username: 'test',
        password: 'test',
      };
      jest.spyOn(authService, 'SignIn').mockRejectedValue(
        new BusinessException({
          errorCode: ERR.NOT_FOUND,
          err: 'test error',
          status: HttpStatus.NOT_FOUND,
        }),
      );
      await authController.signin(payload).catch((ex) => {
        expect(ex).toBeInstanceOf(BusinessException);
      });

      expect(authService.SignIn).toHaveBeenCalledTimes(1);
      expect(authService.SignIn).toHaveBeenCalledWith(payload);
    });
  });
});
