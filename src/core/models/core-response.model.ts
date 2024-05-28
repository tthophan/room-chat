import { CoreResponse } from '../interfaces';
import { ERR } from '../enums';

export class SuccessResponse<T>
  implements Omit<CoreResponse<T>, 'err' | 'errCode'>
{
  cid: string;
  timestamp: number;
  responseTime: string;
  data: T;
  constructor(data: Partial<SuccessResponse<T>>) {
    Object.assign(this, data);
  }
}

export class ErrorResponse implements Omit<CoreResponse, 'data'> {
  cid: string;
  err: string;
  errCode: ERR;
  timestamp: number;
  responseTime: string;
  constructor(data: Partial<ErrorResponse>) {
    Object.assign(this, data);
  }
}
