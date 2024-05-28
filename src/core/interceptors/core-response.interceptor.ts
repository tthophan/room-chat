import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import { map } from 'rxjs';
import { IGNORE_CORE_RESPONSE_KEY } from '../constants';
import { CoreResponse } from '../interfaces';
import { SuccessResponse } from '../models';
import { formatMilliseconds } from '../utils';

@Injectable()
export class CoreResponseInterceptor<T>
  implements NestInterceptor<T, Partial<CoreResponse<T>>>
{
  constructor(public readonly reflector: Reflector) {}
  private checkExcludeInterceptor(ctx: ExecutionContext) {
    return (
      this.reflector.get(IGNORE_CORE_RESPONSE_KEY, ctx.getClass()) ||
      this.reflector.get(IGNORE_CORE_RESPONSE_KEY, ctx.getHandler())
    );
  }
  intercept(context: ExecutionContext, next: CallHandler<T>) {
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data) => {
        if (this.checkExcludeInterceptor(context)) return data;
        return new SuccessResponse<T>({
          cid: request.context?.cid,
          data: instanceToPlain(data, {
            strategy: 'exposeAll',
            excludePrefixes: [
              '_',
              '__',
              'createdAt',
              'createdBy',
              'updatedAt',
              'updatedBy',
              'isDeleted',
            ],
            exposeUnsetFields: true,
          }) as T,
          responseTime: formatMilliseconds(
            new Date().getTime() - request.context?.requestTimestamp,
          ),
          timestamp: request.context?.requestTimestamp,
        });
      }),
    );
  }
}
