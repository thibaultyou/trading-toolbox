import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class USDTBalanceNotFoundException extends BaseCustomException {
  constructor(accountId: string) {
    super('USDT_BALANCE_NOT_FOUND', `USDT balance not found | accountId=${accountId}`, HttpStatus.NOT_FOUND);
  }
}

export class WalletsUpdateAggregatedException extends BaseCustomException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors.map(({ accountId, error }) => `accountId=${accountId}, msg=${error.message}`).join('; ');
    super(
      'WALLETS_UPDATE_FAILED',
      `Multiple wallet updates failed | errors=[${message}]`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
