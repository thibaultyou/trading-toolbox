import { HttpException, HttpStatus } from '@nestjs/common';

export class MarketNotFoundException extends HttpException {
  constructor(accountId: string, marketId: string) {
    super(`Market not found - AccountID: ${accountId} - MarketID: ${marketId}`, HttpStatus.NOT_FOUND);
  }
}

export class MarketsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(({ accountId, error }) => `AccountID: ${accountId} - Error: ${error.message}`)
      .join('; ');
    super(`Multiple market updates failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
