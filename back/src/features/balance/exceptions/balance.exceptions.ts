import { HttpException, HttpStatus } from '@nestjs/common';

export class USDTBalanceNotFoundException extends HttpException {
  constructor(accountId: string) {
    super(
      `Balance - USDT Fetch Error - AccountID: ${accountId}, Reason: USDT balance not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class BalancesUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, error }) =>
          `AccountID: ${accountId}, Error: ${error.message}`,
      )
      .join('; ');

    super(
      `Balance - Multiple Refresh Failures - Error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
