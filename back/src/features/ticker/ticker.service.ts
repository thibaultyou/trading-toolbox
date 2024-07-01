import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { WebSocketSubscribeEvent } from '../core/events/websocket-subscribe.event';
import { WebSocketUnsubscribeEvent } from '../core/events/websocket-unsubscribe.event';
import { ITickerData } from '../core/types/ticker-data.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { OrderService } from '../order/order.service';
import { PositionService } from '../position/position.service';
import { TickerPriceNotFoundException } from './exceptions/ticker.exceptions';
import { fromTickerDataToPrice, haveTickerDataChanged } from './ticker.utils';

@Injectable()
export class TickerService implements OnModuleInit, IAccountTracker {
  private logger = new Logger(TickerService.name);
  private tickerValues: Map<string, Map<string, ITickerData>> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private orderService: OrderService,
    private positionService: PositionService
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    setInterval(() => {
      this.refreshAccountsTickersWatchList();
    }, Timers.TICKERS_CACHE_COOLDOWN);
    this.logger.log('Module initialized successfully');
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.tickerValues.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  async getTickerPrice(accountId: string, marketId: string): Promise<number | null> {
    this.logger.debug(`Fetching ticker price - AccountID: ${accountId} - MarketID: ${marketId}`);

    if (!this.tickerValues.has(accountId)) {
      this.logger.warn(`Ticker price fetch failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const marketValues = this.tickerValues.get(accountId);

    if (!marketValues || !marketValues.has(marketId)) {
      this.logger.warn(
        `Ticker price not in cache - AccountID: ${accountId} - MarketID: ${marketId} - Action: Fetching and subscribing`
      );
      this.eventEmitter.emit(
        Events.WEBSOCKET_SUBSCRIBE,
        new WebSocketSubscribeEvent(accountId, [`tickers.${marketId}`])
      );
      return await this.fetchAndCacheTicker(accountId, marketId);
    }

    const price = fromTickerDataToPrice(marketValues.get(marketId));
    this.logger.debug(`Fetched ticker price - AccountID: ${accountId} - MarketID: ${marketId} - Price: ${price}`);
    return price;
  }

  updateTickerData(accountId: string, marketId: string, data: ITickerData): void {
    this.logger.debug(`Updating ticker data - AccountID: ${accountId} - MarketID: ${marketId}`);

    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
    }

    const accountTickers = this.tickerValues.get(accountId);

    if (!accountTickers) {
      this.logger.warn(`Ticker data update failed - AccountID: ${accountId} - Reason: Account not found`);
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
        this.logger.debug(`Updated ticker data - AccountID: ${accountId} - MarketID: ${marketId} - Price: ${price}`);
      } else {
        this.logger.warn(
          `Ticker data update skipped - AccountID: ${accountId} - MarketID: ${marketId} - Reason: Incomplete data`,
          { updatedData }
        );
      }
    } else {
      this.logger.debug(
        `Ticker data update skipped - AccountID: ${accountId} - MarketID: ${marketId} - Reason: Unchanged`
      );
    }
  }

  private async fetchAndCacheTicker(accountId: string, marketId: string): Promise<number | null> {
    try {
      const ticker = await this.exchangeService.getTicker(accountId, marketId);
      this.updateTickerData(accountId, marketId, ticker.info);
      return fromTickerDataToPrice(ticker.info);
    } catch (error) {
      this.logger.error(
        `Ticker fetch failed - AccountID: ${accountId} - MarketID: ${marketId} - Error: ${error.message}`,
        error.stack
      );
      throw new TickerPriceNotFoundException(accountId, marketId);
    }
  }

  private async refreshAccountsTickersWatchList() {
    this.logger.debug('Refreshing all accounts tickers watch list');
    const accountIds = Array.from(this.tickerValues.keys());
    await Promise.all(accountIds.map((accountId) => this.refreshAccountTickersWatchList(accountId)));
    this.logger.log(`Refreshed all accounts tickers watch list`);
  }

  private async refreshAccountTickersWatchList(accountId: string): Promise<void> {
    this.logger.debug(`Refreshing tickers watch list - AccountID: ${accountId}`);
    const ordersTickers = new Set(this.orderService.getOpenOrders(accountId).map((order) => order.info.symbol));
    const positionsTickers = new Set(this.positionService.getPositions(accountId).map((position) => position.marketId));
    const newUniqueTickers = new Set([...ordersTickers, ...positionsTickers]);
    const currentlyTracked = this.tickerValues.get(accountId)?.keys() || [];
    const currentlyTrackedSet = new Set(currentlyTracked);
    const toSubscribe = Array.from(newUniqueTickers).filter((ticker) => !currentlyTrackedSet.has(ticker));
    const toUnsubscribe = Array.from(currentlyTrackedSet).filter((ticker) => !newUniqueTickers.has(ticker));
    let updated = false;

    if (toSubscribe.length > 0) {
      this.eventEmitter.emit(
        Events.WEBSOCKET_SUBSCRIBE,
        new WebSocketSubscribeEvent(
          accountId,
          toSubscribe.map((t) => `tickers.${t}`)
        )
      );
      this.logger.debug(`Subscribed to tickers - AccountID: ${accountId} - Tickers: ${toSubscribe.join(', ')}`);
      updated = true;
    }

    if (toUnsubscribe.length > 0) {
      this.eventEmitter.emit(
        Events.WEBSOCKET_UNSUBSCRIBE,
        new WebSocketUnsubscribeEvent(
          accountId,
          toUnsubscribe.map((t) => `tickers.${t}`)
        )
      );
      this.logger.debug(`Unsubscribed from tickers - AccountID: ${accountId} - Tickers: ${toUnsubscribe.join(', ')}`);
      toUnsubscribe.forEach((ticker) => this.tickerValues.get(accountId)?.delete(ticker));
      updated = true;
    }

    if (updated) {
      this.logger.log(`Updated tickers watch list - AccountID: ${accountId} - NewCount: ${newUniqueTickers.size}`);
    } else {
      this.logger.debug(`Tickers watch list unchanged - AccountID: ${accountId} - Count: ${newUniqueTickers.size}`);
    }
  }
}
