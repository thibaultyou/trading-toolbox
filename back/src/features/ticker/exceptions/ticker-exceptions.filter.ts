import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
  FetchAllTickerPricesException,
  FetchTickerPriceHistoryException,
  FetchTickerPricesByAccountException,
  GetTickerPriceException,
  SubscribeToTickerPriceException,
  TickerModuleInitException,
  TickerPriceNotFoundException,
  UnsubscribeFromTickerPriceException,
  UpdateTickerPriceException,
} from './ticker.exceptions';

@Catch(
  FetchAllTickerPricesException,
  TickerModuleInitException,
  SubscribeToTickerPriceException,
  UnsubscribeFromTickerPriceException,
  UpdateTickerPriceException,
  GetTickerPriceException,
  TickerPriceNotFoundException,
  FetchTickerPricesByAccountException,
  FetchTickerPriceHistoryException,
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
