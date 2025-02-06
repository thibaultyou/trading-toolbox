import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class MarketNotFoundException extends BaseCustomException {
  constructor(accountId: string, marketId: string) {
    super('MARKET_NOT_FOUND', `Market not found | accountId=${accountId}, marketId=${marketId}`, HttpStatus.NOT_FOUND);
  }
}

export class MarketsUpdateAggregatedException extends BaseCustomException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors.map(({ accountId, error }) => `accountId=${accountId}, msg=${error.message}`).join('; ');
    super(
      'MARKETS_UPDATE_FAILED',
      `Multiple market updates failed | errors=[${message}]`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
