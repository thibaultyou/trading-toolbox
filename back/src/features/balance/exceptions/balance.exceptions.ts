import { HttpException, HttpStatus } from '@nestjs/common';

export class USDTBalanceNotFoundException extends HttpException {
  constructor(accountId: string) {
    super(
      `Balance (USDT) not found for account ${accountId}`,
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
      `Balances update process encountered multiple errors: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
