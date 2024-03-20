export class PositionNotFoundException extends Error {
  constructor(accountName: string) {
    super(`Positions not found for ${accountName}`);
    this.name = this.constructor.name;
  }
}

export class PositionUpdateException extends Error {
  constructor(error: any) {
    super(`Error updating positions: ${error.message}`);
    this.name = this.constructor.name;
  }
}

export class PositionComparisonException extends Error {
  constructor(error: any) {
    super(`Error during positions comparison: ${error.message}`);
    this.name = this.constructor.name;
  }
}
