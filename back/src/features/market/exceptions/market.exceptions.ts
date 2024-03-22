import { HttpException, HttpStatus } from '@nestjs/common';

export class MarketNotFoundException extends HttpException {
  constructor(accountId: string, marketId: string) {
    super(
      `Market ${marketId} not found for account ${accountId}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class MarketsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, error }) =>
          `AccountID: ${accountId}, Error: ${error.message}`,
      )
      .join('; ');

    super(
      `Markets update process encountered multiple errors: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
