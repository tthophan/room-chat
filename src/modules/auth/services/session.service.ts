import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWTConfig } from '~/config/configuration.interface';
import { BaseService } from '~/core/bases';
import { GeneratorService } from '~/core/utils';
import { SessionParam, UserSession } from '../types';

@Injectable()
export class SessionService extends BaseService {
  private readonly jwtConfig: JWTConfig;

  constructor(private readonly configService: ConfigService) {
    super();
    this.jwtConfig = this.configService.get<JWTConfig>('jwt');
  }

  async createSession(input: SessionParam): Promise<UserSession> {
    return await new Promise((resolve) => {
      const jwt = GeneratorService.createToken(input, this.jwtConfig.secret, {
        expiresIn: this.jwtConfig.expiresIn,
        issuer: this.jwtConfig.issuer,
      });
      resolve({
        ...input,
        token: jwt,
      });
    });
  }

  async validateSession(token: string) {
    return GeneratorService.verifyJwtToken<SessionParam>(
      token,
      this.jwtConfig.secret,
    );
  }
}
