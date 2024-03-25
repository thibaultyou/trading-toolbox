export class ExchangeInitializationException extends Error {
  constructor(error: string) {
    super(`Exchange - Initialization Failed - Error: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeOperationFailedException extends Error {
  constructor(operation: string, error: string) {
    super(`Exchange - Operation Failed - Operation: ${operation}, Error: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeNotFoundException extends Error {
  constructor(accountId: string) {
    super(`Exchange - Not Found - AccountID: ${accountId}`);
    this.name = this.constructor.name;
  }
}

export class ClosePositionException extends Error {
  constructor(accountId: string, positionId: string, error: any) {
    super(
      `Exchange - Closing Position Failed - AccountID: ${accountId}, PositionID: ${positionId}, Error: ${error.message}`
    );
    this.name = this.constructor.name;
  }
}

export class UnrecognizedSideException extends Error {
  constructor(accountId: string, side: string) {
    super(`Exchange - Unrecognized Side - AccountID: ${accountId}, Side: ${side}`);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsException extends Error {
  constructor(accountId: string) {
    super(`Exchange - Invalid Credentials - AccountID: ${accountId}`);
    this.name = this.constructor.name;
  }
}

export class UnsupportedExchangeException extends Error {
  constructor(exchangeType: string) {
    super(`Exchange - Unsupported Exchange Type - Type: ${exchangeType}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeTerminationFailedException extends Error {
  constructor(accountId: string, error: any) {
    super(`Exchange - Termination Failed - AccountID: ${accountId}, Error: ${error.message}`);
    this.name = this.constructor.name;
  }
}
