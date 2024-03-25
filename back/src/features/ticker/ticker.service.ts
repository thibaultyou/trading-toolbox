import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { WebsocketClient } from 'bybit-api';

import { ExchangeService } from '../../features/exchange/exchange.service';
import { AccountService } from '../account/account.service';
import { ExchangeType } from '../exchange/exchange.types';
import { FetchTickerPriceHistoryException } from './exceptions/ticker.exceptions';
import { Candle } from './ticker.types';

@Injectable()
export class TickerService implements OnModuleInit {
  private logger = new Logger(TickerService.name);
  private lastFetchedTimes: Record<string, number> = {};
  // FIXME find an alternative for non-Bybit exchanges
  protected ws: Record<ExchangeType, WebsocketClient>;
  private tickers: Map<ExchangeType, Map<string, number>> = new Map();

  constructor(
    private readonly exchangeService: ExchangeService,
    // private readonly setupService: SetupService,
    private readonly accountService: AccountService
  ) {}

  async onModuleInit() {
    // TODO add ws subscription logic here
  }

  // async onModuleInit() {
  // try {
  //   const setups = await this.setupService.findAll();
  //   const uniqueSymbols = new Set(
  //     setups.map((setup) => `${setup.account}-${setup.market}`),
  //   );

  //   uniqueSymbols.forEach((symbolKey) => {
  //     const [account, symbol] = symbolKey.split('-');

  //     this.subscribeToTickerPrice(account, symbol);
  //   });
  // } catch (error) {
  //   throw new TickerModuleInitException(error);
  // }
  // }

  // subscribeToTickerPrice(accountId: string, symbol: string): void {
  // try {
  //   this.exchangeService.performWsAction(
  //     accountId,
  //     'subscribe',
  //     `tickers.${symbol}`,
  //     'subscribing to ticker price',
  //   );

  //   if (!this.tickerPrices[accountId]) {
  //     this.tickerPrices[accountId] = {};
  //   }
  // } catch (error) {
  //   throw new SubscribeToTickerPriceException(symbol, error);
  // }
  // }

  // unsubscribeFromTickerPrice(accountId: string, symbol: string): void {
  // try {
  //   this.exchangeService.performWsAction(
  //     accountId,
  //     'unsubscribe',
  //     `tickers.${symbol}`,
  //     'unsubscribing from ticker price',
  //   );

  //   if (this.tickerPrices[accountId]) {
  //     delete this.tickerPrices[accountId][symbol];
  //   }
  // } catch (error) {
  //   throw new UnsubscribeFromTickerPriceException(symbol, error);
  // }
  // }

  // updateTickerPrice(accountId: string, symbol: string, data: any): void {
  //   try {
  //     const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;

  //     if (!this.tickerPrices[accountId]) {
  //       this.tickerPrices[accountId] = {};
  //     }

  //     this.tickerPrices[accountId][symbol] = price;
  //     this.logger.debug(`Updated ticker price for ${symbol} ${price}`);
  //   } catch (error) {
  //     throw new UpdateTickerPriceException(symbol, error);
  //   }
  // }

  // getTickerPrice(accountId: string, base: string): number | undefined {
  //   return this.tickerPrices[accountId] && this.tickerPrices[accountId][base];
  // }

  // getAllTickerPrices(accountId: string): Record<string, number> {
  //   return this.tickerPrices[accountId] || {};
  // }

  async getTickerPriceHistory(base: string, fetchNewOnly = false): Promise<Candle[]> {
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
        close: Number(close)
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
