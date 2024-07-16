import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 500;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorMessage = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      status = 401;
      errorMessage = `Unauthorized: ${exception.message}`;
    } else if (exception.message.includes('API key is invalid')) {
      status = 403;
      errorMessage = `Forbidden: Invalid API key`;
    } else if (exception instanceof NotFoundException) {
      status = 404;
      errorMessage = `Not Found: ${exception.message}`;
    }

    this.logger.warn(`Error: ${errorMessage}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
