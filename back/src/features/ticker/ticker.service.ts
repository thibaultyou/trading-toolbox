import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/interfaces/account-tracker.interface';
import { IDataRefresher } from '../../common/interfaces/data-refresher.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { WebSocketSubscribeEvent } from '../core/events/websocket-subscribe.event';
import { WebSocketUnsubscribeEvent } from '../core/events/websocket-unsubscribe.event';
import { TickerPriceNotFoundException } from './exceptions/ticker.exceptions';
import { TickerData, WatchListType } from './ticker.types';
import { getPriceFromTickerData, hasTickerDataChanged } from './utils/ticker-data.util';

@Injectable()
export class TickerService implements OnModuleInit, IAccountTracker, IDataRefresher<Set<string>> {
  private logger = new Logger(TickerService.name);
  private ordersTickers: Map<string, Set<string>> = new Map();
  private positionsTickers: Map<string, Set<string>> = new Map();
  private trackedTickers: Map<string, Set<string>> = new Map();
  private tickerValues: Map<string, Map<string, TickerData>> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.TICKERS_CACHE_COOLDOWN);
  }

  // FIXME
  async startTrackingAccount(_accountId: string): Promise<void> {
    throw new Error('startTrackingAccount - Not Implemented');
  }

  stopTrackingAccount(accountId: string) {
    const deletedOrders = this.ordersTickers.delete(accountId);
    const deletedPositions = this.positionsTickers.delete(accountId);
    const deletedTracked = this.trackedTickers.delete(accountId);
    const deletedValues = this.tickerValues.delete(accountId);

    if (deletedOrders || deletedPositions || deletedTracked || deletedValues) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getTickerPrice(accountId: string, marketId: string): number | null {
    this.logger.log(`Ticker Price - Fetch Initiated - AccountID: ${accountId}, MarketID: ${marketId}`);

    if (!this.tickerValues.has(accountId)) {
      this.logger.error(`Ticker Price - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const marketValues = this.tickerValues.get(accountId);

    if (!marketValues || !marketValues.has(marketId)) {
      this.logger.error(
        `Ticker Price - Fetch Failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Ticker Not Found / Not Tracked`
      );
      throw new TickerPriceNotFoundException(accountId, marketId);
    }

    return getPriceFromTickerData(marketValues.get(marketId));
  }

  async updateTickersWatchList(type: WatchListType, accountId: string, marketIds: Set<string>): Promise<void> {
    const tickersMap = type === WatchListType.Positions ? this.positionsTickers : this.ordersTickers;

    tickersMap.set(accountId, marketIds);

    this.logger.log(
      `${type} Tickers Watch List - Updated - AccountID: ${accountId}, MarketIDs: ${Array.from(marketIds).sort().join(', ')}`
    );
    await this.refreshOne(accountId).catch((error) =>
      this.logger.error(
        `${type} Tickers Watch List - Refresh Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      )
    );
  }

  updateTickerPositionsWatchList(accountId: string, marketIds: Set<string>): void {
    this.updateTickersWatchList(WatchListType.Positions, accountId, marketIds);
  }

  updateTickerOrdersWatchList(accountId: string, marketIds: Set<string>): void {
    this.updateTickersWatchList(WatchListType.Orders, accountId, marketIds);
  }

  updateTickerData(accountId: string, marketId: string, data: TickerData): void {
    this.logger.debug(`Ticker Data - Update Initiated - AccountID: ${accountId}`);

    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
    }

    const accountTickers = this.tickerValues.get(accountId);

    if (!accountTickers) {
      this.logger.error(`Ticker Data - Update Failed - AccountID: ${accountId}, Reason: Account not found`);

      return;
    }

    const existingData = accountTickers.get(marketId) || {};
    const hasChanges = hasTickerDataChanged(existingData, data);

    if (hasChanges) {
      const updatedData: TickerData = { ...existingData, ...data };
      const price = getPriceFromTickerData(updatedData);

      if (price !== null) {
        accountTickers.set(marketId, updatedData);
        this.eventEmitter.emit(Events.TICKER_PRICE_UPDATED, { accountId, marketId, price });
        this.logger.debug(`Ticker Data - Updated - AccountID: ${accountId}, MarketID: ${marketId}, Price: ${price}`);
      } else {
        this.logger.warn(
          `Ticker Data - Update Skipped - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Incomplete data`,
          {
            updatedData
          }
        );
      }
    } else {
      this.logger.debug(
        `Ticker Data - Update Skipped - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Unchanged`
      );
    }
  }

  async refreshOne(accountId: string): Promise<Set<string>> {
    this.logger.log(`Tickers Watch List - Refresh Initiated - AccountID: ${accountId}`);
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
      let logMessage = `Tickers Watch List - Updated - AccountID: ${accountId}`;

      if (toSubscribe.length > 0) {
        this.eventEmitter.emit(Events.SUBSCRIBE_WEBSOCKET, new WebSocketSubscribeEvent(accountId, toSubscribe));
        logMessage += `, Subscribed to: ${toSubscribe.sort().join(', ')}`;
      }

      if (toUnsubscribe.length > 0) {
        this.eventEmitter.emit(Events.UNSUBSCRIBE_WEBSOCKET, new WebSocketUnsubscribeEvent(accountId, toUnsubscribe));
        logMessage += `, Unsubscribed from: ${toUnsubscribe.sort().join(', ')}`;
      }

      this.trackedTickers.set(accountId, newUniqueTickers);
      this.logger.log(logMessage);
    } else {
      this.logger.debug(`Tickers Watch List - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
    }

    return newUniqueTickers;
  }

  async refreshAll(): Promise<void> {
    this.logger.log(`All Tickers - Refresh Initiated`);
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
