import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

import {
  OrderCancellationFailedException,
  OrderCreationFailedException,
  OrderNotFoundException,
  OrdersUpdateAggregatedException
} from './orders.exceptions';

@Catch(
  OrderNotFoundException,
  OrderCreationFailedException,
  OrderCancellationFailedException,
  OrdersUpdateAggregatedException
)
export class OrdersExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message
    });
  }
}
