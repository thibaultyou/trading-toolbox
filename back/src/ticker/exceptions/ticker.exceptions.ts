import { HttpException, HttpStatus } from '@nestjs/common';

export class FetchAllTickersException extends HttpException {
  constructor(error: string) {
    super(
      `Error fetching all tickers: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class GetTickerPriceException extends HttpException {
  constructor(accountName: string, symbol: string, error: any) {
    super(
      `Error fetching ticker price for ${symbol} in account ${accountName}: ${error.toString()}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class FetchTickersByAccountException extends HttpException {
  constructor(accountName: string, error: string) {
    super(
      `Error fetching tickers for account ${accountName}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class FetchTickerHistoryException extends HttpException {
  constructor(symbol: string, newOnly: boolean, error: string) {
    super(
      `Error fetching ticker history for symbol: ${symbol} with newOnly set to: ${newOnly}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class GetTickerHistoryException extends HttpException {
  constructor(symbol: string, fetchNewOnly: boolean, error: string) {
    super(
      `Error getting history for symbol: ${symbol} with fetchNewOnly set to: ${fetchNewOnly}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SubscribeTickerException extends HttpException {
  constructor(symbol: string, error: string) {
    super(
      `Error subscribing to ticker ${symbol}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class TickerModuleInitException extends HttpException {
  constructor(error: string) {
    super(
      `Error during module initialization: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UnsubscribeTickerException extends HttpException {
  constructor(symbol: string, error: string) {
    super(
      `Error unsubscribing from ticker ${symbol}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UpdateTickerException extends HttpException {
  constructor(symbol: string, error: string) {
    super(
      `Error during ticker update for symbol: ${symbol}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
