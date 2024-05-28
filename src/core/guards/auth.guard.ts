import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JWTConfig } from '~/config/configuration.interface';
import { AUTHORIZE } from '../constants';
import { GeneratorService } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  private readonly jwtConfig: JWTConfig
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {
    this.jwtConfig = this.configService.get<JWTConfig>('jwt');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const localAuthData =
      this.reflector.get(AUTHORIZE, context.getHandler()) ??
      this.reflector.get(AUTHORIZE, context.getClass());
    if (!localAuthData) return true;
    
    const result = await GeneratorService.verifyJwtToken(request.context?.accessToken, this.jwtConfig.secret);
    return result && result.verified
  }
}
