import { HttpException, HttpStatus } from '@nestjs/common';

export class MarketNotFoundException extends HttpException {
  constructor(accountName: string, baseCurrency: string) {
    super(
      `Market not found - BaseCurrency: ${baseCurrency}, Account: ${accountName}.`,
      HttpStatus.NOT_FOUND,
    );
  }
}
