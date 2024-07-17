import { HttpException, HttpStatus } from '@nestjs/common';

export class PositionNotFoundException extends HttpException {
  constructor(accountId: string, marketId: string) {
    super(`Position not found - AccountID: ${accountId} - PositionID: ${marketId}`, HttpStatus.NOT_FOUND);
  }
}

export class PositionsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(({ accountId, error }) => `AccountID: ${accountId} - Error: ${error.message}`)
      .join('; ');
    super(`Multiple position updates failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
