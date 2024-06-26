import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Ticker } from 'ccxt';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { WebSocketSubscribeEvent } from '../core/events/websocket-subscribe.event';
import { WebSocketUnsubscribeEvent } from '../core/events/websocket-unsubscribe.event';
import { ITickerData } from '../core/types/ticker-data.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { OrderService } from '../order/order.service';
import { PositionService } from '../position/position.service';
import { TickerPriceNotFoundException } from './exceptions/ticker.exceptions';
import { fromTickerDataToPrice, haveTickerDataChanged, haveTickerSetsChanged } from './ticker.utils';

// TODO improve logging, error handling, custom exceptions
// TODO improve events to keep track of tickers

@Injectable()
export class TickerService implements OnModuleInit, IAccountTracker {
  private logger = new Logger(TickerService.name);
  private trackedTickers: Map<string, Set<string>> = new Map();
  private tickerValues: Map<string, Map<string, ITickerData>> = new Map(); // accountId, marketId, value

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private orderService: OrderService,
    private positionService: PositionService
  ) {}

  async onModuleInit() {
    // setInterval(() => {
    //   this.refreshAll();
    // }, Timers.TICKERS_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string) {
    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.tickerValues.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async getTickerPrice(accountId: string, marketId: string): Promise<number | null> {
    this.logger.log(`Ticker Price - Fetch Initiated - AccountID: ${accountId}, MarketID: ${marketId}`);

    if (!this.tickerValues.has(accountId)) {
      this.logger.error(`Ticker Price - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const marketValues = this.tickerValues.get(accountId);

    if (!marketValues || !marketValues.has(marketId)) {
      this.logger.warn(
        `Ticker Price - Fetch Failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Ticker Not Found / Not Tracked`
      );

      try {
        const ticker = await this.fetchTicker(accountId, marketId);
        return fromTickerDataToPrice(ticker.info);
      } catch (error) {
        this.logger.error(
          `Ticker Price - Fetch Failed and FetchTicker also failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: ${error.message}`
        );
        throw new TickerPriceNotFoundException(accountId, marketId);
      }
    }
    return fromTickerDataToPrice(marketValues.get(marketId));
  }

  updateTickerData(accountId: string, marketId: string, data: ITickerData): void {
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
    const hasChanges = haveTickerDataChanged(existingData, data);

    if (hasChanges) {
      const updatedData: ITickerData = { ...existingData, ...data };
      const price = fromTickerDataToPrice(updatedData);

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

  private async fetchTicker(accountId: string, marketId: string): Promise<Ticker> {
    this.logger.debug(`Ticker - Fetch Initiated - AccountID: ${accountId}`);

    try {
      const ticker = await this.exchangeService.getTicker(accountId, marketId);
      this.logger.log(`Ticker - Fetched - AccountID: ${accountId}`);
      return ticker;
    } catch (error) {
      this.logger.error(`Ticker - Fetch Failed - AccountID: ${accountId}, Reason: ${error.message}`);
      throw error;
    }
  }

  async refreshAccountTickersWatchList(accountId: string): Promise<Set<string>> {
    this.logger.debug(`Tickers Watch List - Refresh Initiated - AccountID: ${accountId}`);
    const ordersTickers = new Set(this.orderService.getOpenOrders(accountId).map((order) => order.info.symbol));
    const positionsTickers = new Set(this.positionService.getPositions(accountId).map((position) => position.marketId));
    const newUniqueTickers = new Set([...ordersTickers, ...positionsTickers]);
    const previousTickers = this.trackedTickers.get(accountId) || new Set();
    const haveTickersChanged = haveTickerSetsChanged(previousTickers, newUniqueTickers);

    if (haveTickersChanged) {
      const toSubscribe = Array.from(newUniqueTickers)
        .filter((ticker) => !previousTickers.has(ticker))
        .map((ticker) => `tickers.${ticker}`);
      const toUnsubscribe = Array.from(previousTickers)
        .filter((ticker) => !newUniqueTickers.has(ticker))
        .map((ticker) => `tickers.${ticker}`);
      let logMessage = `Tickers Watch List - Updated - AccountID: ${accountId}`;

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
      this.logger.debug(`Tickers Watch List - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
    }
    return newUniqueTickers;
  }

  async refreshAccountsTickersWatchList() {
    this.logger.error(`Tickers Watch List - Refresh All Initiated`);
    await Promise.all(
      Array.from(this.tickerValues.keys()).map((accountId) => this.refreshAccountTickersWatchList(accountId))
    );
  }
}
