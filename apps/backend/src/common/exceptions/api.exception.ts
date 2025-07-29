import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes.enum';

/**
 * Custom API exception for standardized error responses.
 */
export interface IErrorResponse {
  message: string;
  errorCode: ErrorCode;
}

export class ApiException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, statusCode: HttpStatus) {
    const response: IErrorResponse = {
      message,
      errorCode,
    };
    
    super(response, statusCode);
  }
}
