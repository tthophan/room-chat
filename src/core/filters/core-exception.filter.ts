import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatMilliseconds } from '../utils';
import { Request, Response } from 'express';
import _ from 'lodash';
import { ErrorResponse } from '../models';
import { ERR } from '../enums';
import { BusinessException } from '../exceptions';

type ExceptionResponse =
  | {
    data?: unknown;
    statusCode: number;
    message: string | string[];
    error: string;
  }
  | string;
@Catch()
@Injectable()
export class CoreExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  /**
   * Handles exceptions thrown in the NestJS application and returns an appropriate error response.
   * @param exception - The exception object that was thrown.
   * @param host - The host object that contains the request and response objects.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let errMsg: string;
    let errCode: ERR;
    if (exception instanceof BusinessException) {
      const bizException = exception as BusinessException;
      response.status(bizException.status);
      errMsg = bizException?.err;
      errCode = bizException?.errorCode;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse() as ExceptionResponse;
      if (typeof res === 'object' && Array.isArray(res.message)) {
        const { message } = res;
        errMsg = _.first(message);
      } else if (typeof res === 'object' && typeof res.message === 'string') {
        errMsg = res.message;
      } else if (typeof res === 'string') {
        errMsg = res;
      }
      response.status(exception.getStatus());
    } else {
      response.status(500);
    }

    const resData = new ErrorResponse({
      timestamp: request.context?.requestTimestamp,
      cid: request.context?.cid,
      responseTime: this.calculateResponseTime(
        request.context?.requestTimestamp,
      ),
      err: errMsg ?? this.getErrorMessage(exception),
      errCode: errCode ?? ERR.E_RUNTIME_EXCEPTION,
    });

    response.json(resData);

    return resData;
  }

  /**
   * Gets the error message based on the environment and the exception's stack or message.
   * @param exception - The exception object.
   * @returns The error message.
   */
  private getErrorMessage(exception: HttpException): string {
    if (this.configService.get('env') === 'development') {
      return exception?.stack ?? exception?.message ?? 'Internal Server Error';
    } else {
      return 'Internal Server Error';
    }
  }

  /**
   * Calculates the response time based on the given timestamp.
   * @param timestamp - The timestamp of the request.
   * @returns The formatted response time.
   */
  private calculateResponseTime(timestamp: number): string {
    const responseTime = new Date().getTime() - timestamp;
    return formatMilliseconds(responseTime);
  }
}
