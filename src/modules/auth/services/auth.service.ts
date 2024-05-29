import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '~/core/bases';
import { SignInPayload, SignUpPayload } from '../models';
import { PrismaService } from '~/modules/prisma';
import { BusinessException } from '~/core/exceptions';
import { ERR } from '~/core/enums';
import { GeneratorService } from '~/core/utils';
import { SessionService } from './session.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionService: SessionService,
  ) {
    super();
  }

  async signUp(payload: SignUpPayload) {
    const { username, firstName, lastName, password } = payload;
    const checkUser = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
    if (checkUser)
      throw new BusinessException({
        errorCode: ERR.BAD_USER_INPUT,
        status: HttpStatus.CONFLICT,
        err: 'Username already exists',
      });
    const passwordSecure = GeneratorService.uuid().replace(/-/g, '');
    const user = await this.prismaService.user.create({
      data: {
        username,
        passwordSecure,
        password: await GeneratorService.makeHash(password, passwordSecure),
        firstName,
        lastName,
      },
    });
    return await this.sessionService.createSession({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async SignIn(payload: SignInPayload) {
    const { username, password } = payload;
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
    if (!user)
      throw new BusinessException({
        errorCode: ERR.NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });
    const passwordHash = await GeneratorService.makeHash(
      password,
      user.passwordSecure,
    );
    if (passwordHash !== user.password)
      throw new BusinessException({
        errorCode: ERR.NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
        err: 'Invalid username or password',
      });
    return await this.sessionService.createSession({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
