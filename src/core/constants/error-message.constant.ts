import { HttpStatus } from '@nestjs/common';
import { ERR } from '../enums';
import { BusinessException } from '../exceptions';

export const ERROR_MSG: Record<
  ERR,
  (message?: string, data?: string) => never
> = {
  [ERR.BAD_USER_INPUT]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Request wrong format',
      status: HttpStatus.BAD_REQUEST,
      errorCode: ERR.BAD_USER_INPUT,
      data,
    });
  },
  [ERR.INVALID_FILE_FORMAT]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'File wrong format',
      status: HttpStatus.BAD_REQUEST,
      errorCode: ERR.INVALID_FILE_FORMAT,
      data,
    });
  },
  [ERR.INVALID_REQUEST]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Request wrong format',
      status: HttpStatus.BAD_REQUEST,
      errorCode: ERR.INVALID_REQUEST,
      data,
    });
  },
  [ERR.INVALID_TOKEN]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Invalid Token',
      status: HttpStatus.UNAUTHORIZED,
      errorCode: ERR.INVALID_TOKEN,
      data,
    });
  },
  [ERR.NOT_FOUND]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Not fount event',
      status: HttpStatus.NOT_FOUND,
      errorCode: ERR.NOT_FOUND,
      data,
    });
  },
  [ERR.NO_SERVICE]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Not provide the service',
      status: HttpStatus.BAD_REQUEST,
      errorCode: ERR.NO_SERVICE,
      data,
    });
  },
  [ERR.SEND_ALERT_FAILED]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Cant not send alert',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ERR.SEND_ALERT_FAILED,
      data,
    });
  },
  [ERR.TOKEN_EXPIRES]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Token is expires login again',
      status: HttpStatus.UNAUTHORIZED,
      errorCode: ERR.TOKEN_EXPIRES,
      data,
    });
  },
  [ERR.UNEXPECTED_ERROR]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Server has by unexpected error. We fixed them soon',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ERR.UNEXPECTED_ERROR,
      data,
    });
  },
  [ERR.EXISTED_DATA]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Registered phone number',
      status: HttpStatus.CONFLICT,
      errorCode: ERR.EXISTED_DATA,
      data,
    });
  },
  [ERR.MISS_FIELD_HEADER]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Missing field device id or language code',
      status: HttpStatus.BAD_REQUEST,
      errorCode: ERR.MISS_FIELD_HEADER,
      data,
    });
  },
  [ERR.DUPLICATE_DATA]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Duplicate Data',
      status: HttpStatus.CONFLICT,
      errorCode: ERR.DUPLICATE_DATA,
      data,
    });
  },
  [ERR.INVALID_DATE_FORMAT]: (message?: string, data?: any) => {
    throw new BusinessException({
      err: message ?? 'Wrong date format',
      status: HttpStatus.CONFLICT,
      errorCode: ERR.INVALID_DATE_FORMAT,
      data,
    });
  },
  [ERR.E_RUNTIME_EXCEPTION]: (message?: string, data?: any) => {
    throw new BusinessException({
      errorCode: ERR.E_RUNTIME_EXCEPTION,
      err: message ?? 'Internal Server Error',
      status: HttpStatus.BAD_REQUEST,
      data,
    });
  },
};
