import { HttpException, HttpStatus } from '@nestjs/common';

export class TickerPriceNotFoundException extends HttpException {
  constructor(accountName: string, symbol: string) {
    super(`Ticker price for ${symbol} in account ${accountName} not found.`, HttpStatus.NOT_FOUND);
  }
}
