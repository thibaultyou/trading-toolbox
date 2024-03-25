import { HttpException, HttpStatus } from '@nestjs/common';

export class MarketNotFoundException extends HttpException {
  constructor(accountId: string, marketId: string) {
    super(
      `Market - Fetch Failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Market not found`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class MarketsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors.map(({ accountId, error }) => `AccountID: ${accountId}, Error: ${error.message}`).join('; ');

    super(`Markets - Multiple Updates Failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
