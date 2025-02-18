import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class ExchangeInitializationException extends BaseCustomException {
  constructor(error: string) {
    super(
      'EXCHANGE_INITIALIZATION_FAILED',
      `Exchange initialization failed | msg=${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class ExchangeInvalidParameterException extends BaseCustomException {
  constructor(message: string) {
    super('EXCHANGE_INVALID_PARAMETER', message, HttpStatus.BAD_REQUEST);
  }
}

export class ExchangeOperationFailedException extends BaseCustomException {
  constructor(operation: string, error: string) {
    super(
      'EXCHANGE_OPERATION_FAILED',
      `Exchange operation failed | operation=${operation}, msg=${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class ExchangeNotFoundException extends BaseCustomException {
  constructor(accountId: string) {
    super('EXCHANGE_NOT_FOUND', `Exchange not found | accountId=${accountId}`, HttpStatus.NOT_FOUND);
  }
}

export class ClosePositionException extends BaseCustomException {
  constructor(accountId: string, positionId: string, error: Error) {
    super(
      'CLOSE_POSITION_FAILED',
      `Closing position failed | accountId=${accountId}, positionId=${positionId}, msg=${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class UnrecognizedSideException extends BaseCustomException {
  constructor(accountId: string, side: string) {
    super(
      'UNRECOGNIZED_SIDE',
      `Unrecognized side | accountId=${accountId}, side=${side}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class InvalidCredentialsException extends BaseCustomException {
  constructor(accountId: string) {
    super('INVALID_CREDENTIALS', `Invalid credentials | accountId=${accountId}`, HttpStatus.FORBIDDEN);
  }
}

export class UnsupportedExchangeException extends BaseCustomException {
  constructor(exchangeType: string) {
    super('UNSUPPORTED_EXCHANGE', `Unsupported exchange type | type=${exchangeType}`, HttpStatus.BAD_REQUEST);
  }
}

export class ExchangeTerminationFailedException extends BaseCustomException {
  constructor(accountId: string, error: Error) {
    super(
      'EXCHANGE_TERMINATION_FAILED',
      `Exchange termination failed | accountId=${accountId}, msg=${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class TrackingFailedException extends BaseCustomException {
  constructor(accountId: string, error: Error) {
    super(
      'TRACKING_FAILED',
      `Tracking failed | accountId=${accountId}, msg=${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
