import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { CORRELATION_ID_HEADER } from '@config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    let status: number;
    let errorCode: string;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorCode = exception.name;
      } else if (typeof res === 'object') {
        message = (res as any).message || exception.message;
        errorCode = (res as any).errorCode || exception.name || 'ERR_HTTP_EXCEPTION';
      }
    } else {
      status = 500;
      message = exception.message || 'Internal server error';
      errorCode = exception.name || 'ERR_INTERNAL_SERVER';
    }

    const correlationId = request.headers[CORRELATION_ID_HEADER] || (request as any).correlationId || 'N/A';
    const path = request.url;
    const errorResponse = {
      errorCode,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path,
      correlationId
    };
    this.logger.error(
      `catch() - error | correlationId=${correlationId}, path=${path}, errorCode=${errorCode}, msg=${message}`,
      exception.stack
    );
    response.status(status).json(errorResponse);
  }
}
