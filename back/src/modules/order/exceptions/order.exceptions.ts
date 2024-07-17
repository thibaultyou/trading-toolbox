import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFoundException extends HttpException {
  constructor(accountId: string, orderId?: string) {
    const orderInfo = orderId ? ` - OrderID: ${orderId}` : '';
    super(`Order not found - AccountID: ${accountId}${orderInfo}`, HttpStatus.NOT_FOUND);
  }
}

export class OrderCreationFailedException extends HttpException {
  constructor(accountId: string, reason: string) {
    super(`Order creation failed - AccountID: ${accountId} - Reason: ${reason}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class OrderUpdateFailedException extends HttpException {
  constructor(accountId: string, orderId: string, reason: string) {
    super(
      `Order update failed - AccountID: ${accountId} - OrderID: ${orderId} - Reason: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrderCancellationFailedException extends HttpException {
  constructor(accountId: string, orderId: string, reason: string) {
    super(
      `Order cancellation failed - AccountID: ${accountId} - OrderID: ${orderId} - Reason: ${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrdersUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; orderId?: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, orderId, error }) =>
          `AccountID: ${accountId}${orderId ? ` - OrderID: ${orderId}` : ''} - Error: ${error.message}`
      )
      .join('; ');
    super(`Multiple order updates failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
