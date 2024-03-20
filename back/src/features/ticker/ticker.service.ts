import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

import { SetupService } from '../../_setup/setup.service';
import { ExchangeService } from '../../features/exchange/exchange.service';

import {
  FetchTickerPriceHistoryException,
  SubscribeToTickerPriceException,
  TickerModuleInitException,
  UnsubscribeFromTickerPriceException,
  UpdateTickerPriceException,
} from './exceptions/ticker.exceptions';
import { Candle } from './ticker.types';

@Injectable()
export class TickerService implements OnModuleInit {
  private tickerPrices: Record<string, Record<string, number>> = {};
  private lastFetchedTimes: Record<string, number> = {};
  private logger = new Logger(TickerService.name);

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly setupService: SetupService,
  ) {}

  async onModuleInit() {
    try {
      const setups = await this.setupService.findAll();
      const uniqueSymbols = new Set(
        setups.map((setup) => `${setup.account}-${setup.market}`),
      );
      uniqueSymbols.forEach((symbolKey) => {
        const [account, symbol] = symbolKey.split('-');
        this.subscribeToTickerPrice(account, symbol);
      });
    } catch (error) {
      throw new TickerModuleInitException(error);
    }
  }

  subscribeToTickerPrice(accountName: string, symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        accountName,
        'subscribe',
        `tickers.${symbol}`,
        'subscribing to ticker price',
      );
      if (!this.tickerPrices[accountName]) {
        this.tickerPrices[accountName] = {};
      }
    } catch (error) {
      throw new SubscribeToTickerPriceException(symbol, error);
    }
  }

  unsubscribeFromTickerPrice(accountName: string, symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        accountName,
        'unsubscribe',
        `tickers.${symbol}`,
        'unsubscribing from ticker price',
      );
      if (this.tickerPrices[accountName]) {
        delete this.tickerPrices[accountName][symbol];
      }
    } catch (error) {
      throw new UnsubscribeFromTickerPriceException(symbol, error);
    }
  }

  updateTickerPrice(accountName: string, symbol: string, data: any): void {
    try {
      const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;
      if (!this.tickerPrices[accountName]) {
        this.tickerPrices[accountName] = {};
      }
      this.tickerPrices[accountName][symbol] = price;
      this.logger.debug(`Updated ticker price for ${symbol} ${price}`);
    } catch (error) {
      throw new UpdateTickerPriceException(symbol, error);
    }
  }

  getTickerPrice(accountName: string, base: string): number | undefined {
    return (
      this.tickerPrices[accountName] && this.tickerPrices[accountName][base]
    );
  }

  getAllTickerPrices(accountName: string): Record<string, number> {
    return this.tickerPrices[accountName] || {};
  }

  async getTickerPriceHistory(
    base: string,
    fetchNewOnly = false,
  ): Promise<Candle[]> {
    try {
      let url = `https://api.binance.com/api/v3/klines?symbol=${base}&interval=1h&limit=1000`;
      if (fetchNewOnly && this.lastFetchedTimes[base]) {
        url += `&startTime=${this.lastFetchedTimes[base]}`;
      }

      const { data } = await axios.get(url);

      const candles = data.map(([time, open, high, low, close]) => ({
        time: time / 1000,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      }));

      if (candles.length) {
        this.lastFetchedTimes[base] = candles[candles.length - 1].time * 1000;
      }

      return candles;
    } catch (error) {
      throw new FetchTickerPriceHistoryException(base, fetchNewOnly, error);
    }
  }
}
