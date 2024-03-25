import { HttpException, HttpStatus } from '@nestjs/common';

export class FetchAllTickerPricesException extends HttpException {
  constructor(error: string) {
    super(`Error fetching all ticker prices: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class TickerPriceNotFoundException extends HttpException {
  constructor(accountName: string, symbol: string) {
    super(`Ticker price for ${symbol} in account ${accountName} not found.`, HttpStatus.NOT_FOUND);
  }
}

export class GetTickerPriceException extends HttpException {
  constructor(accountName: string, symbol: string, error: any) {
    super(
      `Error fetching ticker price for ${symbol} in account ${accountName}: ${error.toString()}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class FetchTickerPricesByAccountException extends HttpException {
  constructor(accountName: string, error: string) {
    super(`Error fetching ticker prices for account ${accountName}: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class FetchTickerPriceHistoryException extends HttpException {
  constructor(symbol: string, newOnly: boolean, error: string) {
    super(
      `Error fetching ticker price history for symbol: ${symbol} with newOnly set to: ${newOnly}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class SubscribeToTickerPriceException extends HttpException {
  constructor(symbol: string, error: string) {
    super(`Error subscribing to ticker price for ${symbol}: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class TickerModuleInitException extends HttpException {
  constructor(error: string) {
    super(`Error during ticker module initialization: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class UnsubscribeFromTickerPriceException extends HttpException {
  constructor(symbol: string, error: string) {
    super(`Error unsubscribing from ticker price for ${symbol}: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class UpdateTickerPriceException extends HttpException {
  constructor(symbol: string, error: string) {
    super(`Error during ticker price update for symbol: ${symbol}: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
