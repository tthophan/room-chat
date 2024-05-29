import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { formatMilliseconds } from '../utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger();
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const requestContext = request.context;

    this.logger.debug(
      `Accepted Request [${requestContext.cid}] - ${request.url} - ${request.method}`,
      {
        method: request.method,
        url: request.url,
        cid: requestContext.cid,
        timestamp: requestContext.requestTimestamp,
      },
    );

    return next.handle().pipe(
      tap(() =>
        this.logger.debug(
          `Response [${requestContext.cid}] - [${response.statusCode}]: ${formatMilliseconds(new Date().getTime() - requestContext.requestTimestamp)}`,
          {
            status: response.statusCode,
            cid: requestContext.cid,
          },
        ),
      ),
      catchError((err) => {
        this.logger.error(
          `$Exception  [${requestContext.cid}] - [${response.statusCode}]: ${formatMilliseconds(new Date().getTime() - requestContext.requestTimestamp)}`,
          {
            status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            cid: requestContext.cid,
            stackTraces: err.stack,
          },
        );
        return throwError(() => err);
      }),
    );
  }
}
