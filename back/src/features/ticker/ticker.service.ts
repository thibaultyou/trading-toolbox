import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/interfaces/account-tracker.interface';
import { IDataRefresher } from '../../common/interfaces/data-refresher.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { WebSocketSubscribeEvent } from '../core/events/websocket-subscribe.event';
import { WebSocketUnsubscribeEvent } from '../core/events/websocket-unsubscribe.event';

@Injectable()
export class TickerService implements OnModuleInit, IAccountTracker, IDataRefresher<Set<string>> {
  private logger = new Logger(TickerService.name);
  private ordersTickers: Map<string, Set<string>> = new Map();
  private positionsTickers: Map<string, Set<string>> = new Map();
  private trackedTickers: Map<string, Set<string>> = new Map();
  private tickerValues: Map<string, Map<string, number>> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.TICKERS_CACHE_COOLDOWN);
  }

  // FIXME
  async startTrackingAccount(_accountId: string): Promise<void> {
    throw new Error('TickerService - startTrackingAccount - Not Implemented');
  }

  stopTrackingAccount(accountId: string) {
    if (
      this.ordersTickers.delete(accountId) &&
      this.positionsTickers.delete(accountId) &&
      this.trackedTickers.delete(accountId) &&
      this.tickerValues.delete(accountId)
    ) {
      this.logger.log(`Ticker - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Ticker - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async getTickerPrice(accountId: string, marketId: string): Promise<number | null> {
    this.logger.log(`Ticker - Fetch Initiated - AccountID: ${accountId}, MarketID: ${marketId}`);

    if (!this.tickerValues.has(accountId)) {
      this.logger.error(`Ticker - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const marketValues = this.tickerValues.get(accountId);

    if (marketValues.has(marketId)) {
      return marketValues.get(marketId);
    } else {
      this.logger.error(
        `Ticker - Fetch Failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Price not found`
      );

      // TODO improve
      return null;
    }
  }

  private async updateTickersWatchList(
    type: 'positions' | 'orders',
    accountId: string,
    marketIds: string[]
  ): Promise<void> {
    const tickersMap = type === 'positions' ? this.positionsTickers : this.ordersTickers;

    tickersMap.set(accountId, new Set(marketIds));
    this.logger.debug(
      `Ticker - ${type.charAt(0).toUpperCase() + type.slice(1)} Watch List Updated - AccountID: ${accountId}, MarketIDs: ${marketIds.join(', ')}`
    );

    await this.refreshOne(accountId).catch((error) =>
      this.logger.error(
        `Ticker - Immediate Refresh Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      )
    );
  }

  updateTickerPositionsWatchList(accountId: string, marketIds: string[]) {
    this.updateTickersWatchList('positions', accountId, marketIds);
  }

  updateTickerOrdersWatchList(accountId: string, marketIds: string[]) {
    this.updateTickersWatchList('orders', accountId, marketIds);
  }

  updateTickerValue(accountId: string, marketId: string, price: number): void {
    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
    }

    const marketValues = this.tickerValues.get(accountId);

    marketValues.set(marketId, price);
    this.logger.debug(`Ticker - Price Updated - AccountID: ${accountId}, MarketID: ${marketId}, Price: ${price}`);
  }

  async refreshOne(accountId: string): Promise<Set<string>> {
    this.logger.debug(`Ticker - Refresh Initiated - AccountID: ${accountId}`);
    const ordersTickers = this.ordersTickers.get(accountId) || new Set();
    const positionsTickers = this.positionsTickers.get(accountId) || new Set();
    const newUniqueTickers = new Set([...ordersTickers, ...positionsTickers]);
    const previousTickers = this.trackedTickers.get(accountId) || new Set();
    const haveTickersChanged = this.haveTickersChanged(previousTickers, newUniqueTickers);

    if (haveTickersChanged) {
      const toSubscribe = Array.from(newUniqueTickers)
        .filter((ticker) => !previousTickers.has(ticker))
        .map((ticker) => `tickers.${ticker}`);
      const toUnsubscribe = Array.from(previousTickers)
        .filter((ticker) => !newUniqueTickers.has(ticker))
        .map((ticker) => `tickers.${ticker}`);
      let logMessage = `Ticker - Update Success - AccountID: ${accountId}`;

      if (toSubscribe.length > 0) {
        this.eventEmitter.emit(Events.WEBSOCKET_SUBSCRIBE, new WebSocketSubscribeEvent(accountId, toSubscribe));
        logMessage += `, Subscribed to: ${toSubscribe.sort().join(', ')}`;
      }

      if (toUnsubscribe.length > 0) {
        this.eventEmitter.emit(Events.WEBSOCKET_UNSUBSCRIBE, new WebSocketUnsubscribeEvent(accountId, toUnsubscribe));
        logMessage += `, Unsubscribed from: ${toUnsubscribe.sort().join(', ')}`;
      }

      this.trackedTickers.set(accountId, newUniqueTickers);
      this.logger.log(logMessage);
    } else {
      this.logger.debug(`Ticker - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
    }

    return newUniqueTickers;
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Ticker - Refresh All Initiated`);
    const accountIds = new Set([...this.ordersTickers.keys(), ...this.positionsTickers.keys()]);

    accountIds.forEach((accountId) => this.refreshOne(accountId));
  }

  private haveTickersChanged(setA: Set<string>, setB: Set<string>): boolean {
    if (setA.size !== setB.size) return true;

    for (const a of setA) {
      if (!setB.has(a)) return true;
    }

    return false;
  }
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

// async getTickerPriceHistory(base: string, fetchNewOnly = false): Promise<Candle[]> {
//   try {
//     let url = `https://api.binance.com/api/v3/klines?symbol=${base}&interval=1h&limit=1000`;

//     if (fetchNewOnly && this.lastFetchedTimes[base]) {
//       url += `&startTime=${this.lastFetchedTimes[base]}`;
//     }

//     const { data } = await axios.get(url);

//     const candles = data.map(([time, open, high, low, close]) => ({
//       time: time / 1000,
//       open: Number(open),
//       high: Number(high),
//       low: Number(low),
//       close: Number(close)
//     }));

//     if (candles.length) {
//       this.lastFetchedTimes[base] = candles[candles.length - 1].time * 1000;
//     }

//     return candles;
//   } catch (error) {
//     throw new FetchTickerPriceHistoryException(base, fetchNewOnly, error);
//   }
// }
