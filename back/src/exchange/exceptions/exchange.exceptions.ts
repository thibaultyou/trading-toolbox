export class ExchangeInitializationException extends Error {
  constructor(error: string) {
    super(`Error during Exchange Initialization: ${error}`);
    this.name = this.constructor.name;
  }
}

export class NoAccountFoundException extends Error {
  constructor() {
    super('No account found. Please create an account first.');
    this.name = this.constructor.name;
  }
}

export class ExchangeOperationFailedException extends Error {
  constructor(operation: string, error: string) {
    super(`Error during ${operation}: ${error}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeNotInitializedException extends Error {
  constructor() {
    super('Exchange not initialized. Please create an account first.');
    this.name = this.constructor.name;
  }
}

export class FetchPositionsNotSupportedException extends Error {
  constructor() {
    super('fetchPositions not supported on this exchange');
    this.name = this.constructor.name;
  }
}

export class ExchangeAlreadyInitializedException extends Error {
  constructor(accountName: string) {
    super(`Exchange already initialized for account ${accountName}`);
    this.name = this.constructor.name;
  }
}

export class ExchangeNotFoundException extends Error {
  constructor(accountName: string) {
    super(`Exchange not initialized for account: ${accountName}`);
  }
}

export class ClosePositionException extends Error {
  constructor(accountName: string, error: any) {
    super(`Error closing position for ${accountName}: ${error.message}`);
    this.name = this.constructor.name;
  }
}

export class UnrecognizedSideException extends Error {
  constructor(accountName: string, side: string) {
    super(`Unrecognized side "${side}" for account ${accountName}.`);
    this.name = this.constructor.name;
  }
}
