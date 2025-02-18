import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class OrderInvalidParameterException extends BaseCustomException {
  constructor(message: string) {
    super('ORDER_INVALID_PARAMETER', message, HttpStatus.BAD_REQUEST);
  }
}

export class OrderNotFoundException extends BaseCustomException {
  constructor(accountId: string, orderId?: string) {
    const orderInfo = orderId ? `, orderId=${orderId}` : '';
    super('ORDER_NOT_FOUND', `Order not found | accountId=${accountId}${orderInfo}`, HttpStatus.NOT_FOUND);
  }
}

export class OrderCreationFailedException extends BaseCustomException {
  constructor(accountId: string, reason: string) {
    super(
      'ORDER_CREATION_FAILED',
      `Order creation failed | accountId=${accountId}, msg=${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrderUpdateFailedException extends BaseCustomException {
  constructor(accountId: string, orderId: string, reason: string) {
    super(
      'ORDER_UPDATE_FAILED',
      `Order update failed | accountId=${accountId}, orderId=${orderId}, msg=${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrderCancellationFailedException extends BaseCustomException {
  constructor(accountId: string, orderId: string, reason: string) {
    super(
      'ORDER_CANCELLATION_FAILED',
      `Order cancellation failed | accountId=${accountId}, orderId=${orderId}, msg=${reason}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class OrdersUpdateAggregatedException extends BaseCustomException {
  constructor(errors: Array<{ accountId: string; orderId?: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, orderId, error }) =>
          `accountId=${accountId}${orderId ? `, orderId=${orderId}` : ''}, msg=${error.message}`
      )
      .join('; ');
    super(
      'ORDERS_UPDATE_FAILED',
      `Multiple order updates failed | errors=[${message}]`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
