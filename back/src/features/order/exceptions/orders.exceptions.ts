import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
  constructor(accountId: string, orderId?: string) {
    const orderInfo = orderId ? `, OrderID: ${orderId}` : '';
    super(`Orders - Fetch Failed - AccountID: ${accountId}${orderInfo}, Reason: Order not found`, HttpStatus.NOT_FOUND);
  }
}

export class OrderCreationFailedException extends HttpException {
  constructor(accountId: string, reason: string) {
    super(`Orders - Creation Failed - AccountID: ${accountId}, Reason: ${reason}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class OrderCancellationFailedException extends HttpException {
  constructor(accountId: string, orderId: string, reason: string) {
    super(
      `Orders - Cancellation Failed - AccountID: ${accountId}, OrderID: ${orderId}, Reason: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrdersUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; orderId?: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, orderId, error }) =>
          `AccountID: ${accountId}${orderId ? `, OrderID: ${orderId}` : ''}, Error: ${error.message}`
      )
      .join('; ');
    super(`Orders - Multiple Updates Failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
