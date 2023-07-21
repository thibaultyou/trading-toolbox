import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

import { ExchangeService } from '../exchange/exchange.service';
import { SetupService } from '../setup/setup.service';

import {
  TickerModuleInitException,
  SubscribeTickerException,
  UnsubscribeTickerException,
  UpdateTickerException,
  GetTickerHistoryException,
} from './exceptions/ticker.exceptions';
import { Candle } from './ticker.types';

@Injectable()
export class TickerService implements OnModuleInit {
  private tickers: Record<string, Record<string, number>> = {};
  private lastFetchedTimes: Record<string, number> = {};
  private logger = new Logger(TickerService.name);

  constructor(
    private exchangeService: ExchangeService,
    private setupService: SetupService,
  ) {}

  async onModuleInit() {
    try {
      const setups = await this.setupService.findAll();
      const symbols = [
        ...new Set(setups.map((setup) => [setup.account, setup.ticker])),
      ];
      symbols.forEach((symbol) => this.subscribeTicker(symbol[0], symbol[1]));
    } catch (error) {
      throw new TickerModuleInitException(error);
    }
  }

  subscribeTicker(accountName: string, symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        accountName,
        'subscribe',
        `tickers.${symbol}`,
        'subscribing to ticker',
      );
      if (!this.tickers[accountName]) {
        this.tickers[accountName] = {};
      }
    } catch (error) {
      throw new SubscribeTickerException(symbol, error);
    }
  }

  unsubscribeTicker(accountName: string, symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        accountName,
        'unsubscribe',
        `tickers.${symbol}`,
        'unsubscribing from ticker',
      );
      if (this.tickers[accountName]) {
        delete this.tickers[accountName][symbol];
      }
    } catch (error) {
      throw new UnsubscribeTickerException(symbol, error);
    }
  }

  updateTicker(accountName: string, symbol: string, data: any): void {
    try {
      const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;
      if (
        !this.tickers[accountName] ||
        this.tickers[accountName][symbol] !== price
      ) {
        this.tickers[accountName] = { [symbol]: price };
        this.logger.debug(`Updated ticker for ${symbol} ${price}`);
      }
    } catch (error) {
      throw new UpdateTickerException(symbol, error);
    }
  }

  getTicker(accountName: string, symbol: string): number {
    return this.tickers[accountName] && this.tickers[accountName][symbol];
  }

  getTickers(accountName: string): Record<string, number> {
    return this.tickers[accountName];
  }

  async getHistory(symbol: string, fetchNewOnly = false): Promise<Candle[]> {
    try {
      let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=1000`;
      if (fetchNewOnly && this.lastFetchedTimes[symbol]) {
        url += `&startTime=${this.lastFetchedTimes[symbol]}`;
      }

      this.logger.warn('lastFetchedTimes', this.lastFetchedTimes[symbol]);

      const { data } = await axios.get(url);
      const candles = data.map(([time, open, high, low, close]) => ({
        time: time / 1000,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      }));

      if (candles.length) {
        this.lastFetchedTimes[symbol] = candles[candles.length - 1].time * 1000;
      }

      // console.log('Start time:', this.lastFetchedTimes[symbol]);
      // const { data } = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=1000`);
      // return data.map(([time, open, high, low, close]) => ({ time: time / 1000, open: Number(open), high: Number(high), low: Number(low), close: Number(close) }));
      return candles;
    } catch (error) {
      throw new GetTickerHistoryException(symbol, fetchNewOnly, error);
    }
  }
}
