// in apps/backend/src/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IErrorResponse } from './common/exceptions/api.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An internal server error occurred';

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as IErrorResponse | string;
      if (typeof response === 'object' && response.errorCode) {
        // This is our custom ApiException
        errorCode = response.errorCode;
        message = response.message;
      } else {
        // This is a standard NestJS HttpException
        message = (response as any).message || response;
        errorCode = (response as any).error || 'UNSPECIFIED_HTTP_ERROR';
      }
    }
    
    // In a real app, you would also log the full technical exception here
    console.error(exception);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      errorCode,
      message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}