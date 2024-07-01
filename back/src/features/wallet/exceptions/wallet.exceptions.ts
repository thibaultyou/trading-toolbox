import { HttpException, HttpStatus } from '@nestjs/common';

export class USDTBalanceNotFoundException extends HttpException {
  constructor(accountId: string) {
    super(
      `Wallets - USDT Fetch Failed - AccountID: ${accountId}, Reason: USDT balance not found`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class WalletsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors.map(({ accountId, error }) => `AccountID: ${accountId}, Error: ${error.message}`).join('; ');
    super(`Wallets - Multiple Updates Failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
