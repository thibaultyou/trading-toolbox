export class ExchangeInitializationException extends Error {
  constructor(error: string) {
    super(`Exchange initialization failed - Error: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeOperationFailedException extends Error {
  constructor(operation: string, error: string) {
    super(`Exchange operation failed - Operation: ${operation} - Error: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeNotFoundException extends Error {
  constructor(accountId: string) {
    super(`Exchange not found - AccountID: ${accountId}`);
    this.name = this.constructor.name;
  }
}

export class ClosePositionException extends Error {
  constructor(accountId: string, positionId: string, error: any) {
    super(`Closing position failed - AccountID: ${accountId} - PositionID: ${positionId} - Error: ${error.message}`);
    this.name = this.constructor.name;
  }
}

export class UnrecognizedSideException extends Error {
  constructor(accountId: string, side: string) {
    super(`Unrecognized side - AccountID: ${accountId} - Side: ${side}`);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsException extends Error {
  constructor(accountId: string) {
    super(`Invalid credentials - AccountID: ${accountId}`);
    this.name = this.constructor.name;
  }
}

export class UnsupportedExchangeException extends Error {
  constructor(exchangeType: string) {
    super(`Unsupported exchange type - Type: ${exchangeType}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeTerminationFailedException extends Error {
  constructor(accountId: string, error: any) {
    super(`Exchange termination failed - AccountID: ${accountId} - Error: ${error.message}`);
    this.name = this.constructor.name;
  }
}
