import { HttpException, HttpStatus } from '@nestjs/common';

export class TickerPriceNotFoundException extends HttpException {
  constructor(accountName: string, symbol: string) {
    super(`Ticker price not found - Account: ${accountName} - Symbol: ${symbol}`, HttpStatus.NOT_FOUND);
  }
}
