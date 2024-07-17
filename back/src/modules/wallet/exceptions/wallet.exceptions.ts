import { HttpException, HttpStatus } from '@nestjs/common';

export class USDTBalanceNotFoundException extends HttpException {
  constructor(accountId: string) {
    super(`USDT balance not found - AccountID: ${accountId}`, HttpStatus.NOT_FOUND);
  }
}

export class WalletsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(({ accountId, error }) => `AccountID: ${accountId} - Error: ${error.message}`)
      .join('; ');
    super(`Multiple wallet updates failed - Errors: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
