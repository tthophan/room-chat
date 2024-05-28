import { HttpStatus } from '@nestjs/common';
import { ERR } from '../enums';

type ExceptionType = {
  errorCode: ERR;
  err?: string;
  status: HttpStatus;
  data?: any;
};
export class BusinessException {
  readonly errorCode: ERR;
  readonly err: string;
  readonly status?: HttpStatus;
  readonly data?: any;

  constructor({ errorCode, err, data = '', status }: ExceptionType) {
    this.errorCode = errorCode;
    this.err = err || String(HttpStatus[status]) || 'Internal Server Error';
    this.status = status || HttpStatus.INTERNAL_SERVER_ERROR;
    this.data = data;
  }
}
