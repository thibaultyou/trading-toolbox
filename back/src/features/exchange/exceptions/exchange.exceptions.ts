export class ExchangeInitializationException extends Error {
  constructor(error: string) {
    super(`Exchange - Initialization Error: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeOperationFailedException extends Error {
  constructor(operation: string, error: string) {
    super(`Exchange - Operation Failed - ${operation}: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeNotFoundException extends Error {
  constructor(accountName: string) {
    super(`Exchange - Not Found for Account: ${accountName}`);
    this.name = this.constructor.name;
  }
}

export class ClosePositionException extends Error {
  constructor(accountName: string, error: any) {
    super(
      `Exchange - Closing Position Error for Account: ${accountName}: ${error.message}`,
    );
    this.name = this.constructor.name;
  }
}

export class UnrecognizedSideException extends Error {
  constructor(accountName: string, side: string) {
    super(`Exchange - Unrecognized Side "${side}" for Account: ${accountName}`);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsException extends Error {
  constructor(accountName: string) {
    super(`Exchange - Invalid Credentials for Account: ${accountName}`);
    this.name = this.constructor.name;
  }
}

export class UnsupportedExchangeException extends Error {
  constructor(exchangeType: string) {
    super(`Exchange - Unsupported Type: ${exchangeType}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeTerminationFailedException extends Error {
  constructor(accountId: string, error: any) {
    super(
      `Exchange - Termination Failed for Account: ${accountId}: ${error.message}`,
    );
    this.name = this.constructor.name;
  }
}
