import {
  AUTHORIZATION,
  CID_HEADER_KEY,
  USER_INFO_HEADER_KEY,
} from '../constants';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestContext } from '../models';
import { generateCID } from '../utils';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor() {}
  use(request: Request, _: Response, next: NextFunction) {
    const tokenPrefix = 'Bearer ';
    const cid =
      request.header(CID_HEADER_KEY) ||
      request.header(CID_HEADER_KEY.toUpperCase());
    const authorization =
      request.header(AUTHORIZATION) ||
      request.header(AUTHORIZATION.toUpperCase());
    request.context = new RequestContext({
      cid: generateCID(cid),
      requestTimestamp: this.getTimestamp(),
      accessToken: authorization?.replace(tokenPrefix, ''),
    });

    const userInfoBase64 = request.header(USER_INFO_HEADER_KEY);
    if (userInfoBase64) {
      try {
        const userInfoStr = Buffer.from(userInfoBase64, 'base64').toString(
          'utf-8',
        );
        request.context.userInfo = JSON.parse(userInfoStr);
      } catch (error) {
        console.warn('Error parsing user info', error);
      }
    }

    next();
  }

  getTimestamp = () => new Date().getTime();
}
