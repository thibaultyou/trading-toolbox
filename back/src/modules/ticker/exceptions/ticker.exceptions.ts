import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class TickerPriceNotFoundException extends BaseCustomException {
  constructor(accountId: string, symbol: string) {
    super(
      'TICKER_PRICE_NOT_FOUND',
      `Ticker price not found | accountId=${accountId}, symbol=${symbol}`,
      HttpStatus.NOT_FOUND
    );
  }
}
