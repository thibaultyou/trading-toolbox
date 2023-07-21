import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
  FetchAllTickersException,
  FetchTickerHistoryException,
  TickerModuleInitException,
  SubscribeTickerException,
  UnsubscribeTickerException,
  UpdateTickerException,
  GetTickerHistoryException,
} from './ticker.exceptions';

@Catch(
  FetchAllTickersException,
  FetchTickerHistoryException,
  TickerModuleInitException,
  SubscribeTickerException,
  UnsubscribeTickerException,
  UpdateTickerException,
  GetTickerHistoryException,
)
export class TickerExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
