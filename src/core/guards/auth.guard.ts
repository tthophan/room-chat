import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionService } from '~/modules/auth';
import { AUTHORIZE } from '../constants';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const localAuthData =
      this.reflector.get(AUTHORIZE, context.getHandler()) ??
      this.reflector.get(AUTHORIZE, context.getClass());
    if (!localAuthData) return true;
    
    const result = await this.sessionService.validateSession(request.context?.accessToken);
    return result && result.verified
  }
}
