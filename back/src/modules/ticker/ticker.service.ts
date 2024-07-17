import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { Events, Timers } from '@config';
import { WebSocketSubscribeEvent } from '@exchange/events/websocket-subscribe.event';
import { WebSocketUnsubscribeEvent } from '@exchange/events/websocket-unsubscribe.event';
import { ExchangeService } from '@exchange/exchange.service';
import { ITickerData } from '@exchange/types/ticker-data.interface';
import { OrderService } from '@order/order.service';
import { PositionService } from '@position/position.service';

import { TickerPriceNotFoundException } from './exceptions/ticker.exceptions';
import { fromTickerDataToPrice, haveTickerDataChanged } from './ticker.utils';

@Injectable()
export class TickerService implements OnModuleInit, IAccountTracker {
  private readonly logger = new Logger(TickerService.name);
  private readonly tickerValues: Map<string, Map<string, ITickerData>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeService: ExchangeService,
    private readonly orderService: OrderService,
    private readonly positionService: PositionService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.debug('Initializing module');
    this.startPeriodicRefresh();
    this.logger.log('Module initialized successfully');
  }

  private startPeriodicRefresh(): void {
    setInterval(() => {
      this.refreshAccountsTickersWatchList();
    }, Timers.TICKERS_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.tickerValues.has(accountId)) {
      this.tickerValues.set(accountId, new Map());
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.tickerValues.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  async getTickerPrice(accountId: string, marketId: string): Promise<number> {
    this.logger.debug(`Fetching ticker price - AccountID: ${accountId} - MarketID: ${marketId}`);

    const accountTickers = this.tickerValues.get(accountId);

    if (!accountTickers) {
      this.logger.warn(`Ticker price fetch failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    if (!accountTickers.has(marketId)) {
      this.logger.warn(
        `Ticker price not in cache - AccountID: ${accountId} - MarketID: ${marketId} - Action: Fetching and subscribing`
      );
      await this.subscribeToTicker(accountId, marketId);
      return this.fetchAndCacheTicker(accountId, marketId);
    }

    const price = fromTickerDataToPrice(accountTickers.get(marketId));
    this.logger.debug(`Fetched ticker price - AccountID: ${accountId} - MarketID: ${marketId} - Price: ${price}`);
    return price;
  }

  updateTickerData(accountId: string, marketId: string, data: ITickerData): void {
    this.logger.debug(`Updating ticker data - AccountID: ${accountId} - MarketID: ${marketId}`);

    const accountTickers = this.tickerValues.get(accountId) || new Map();
    this.tickerValues.set(accountId, accountTickers);

    const existingData = accountTickers.get(marketId) || {};

    if (haveTickerDataChanged(existingData, data)) {
      const updatedData: ITickerData = { ...existingData, ...data };
      const price = fromTickerDataToPrice(updatedData);

      if (price !== null) {
        accountTickers.set(marketId, updatedData);
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

  private async fetchAndCacheTicker(accountId: string, marketId: string): Promise<number> {
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

  private async refreshAccountsTickersWatchList(): Promise<void> {
    this.logger.debug('Refreshing all accounts tickers watch list');
    const accountIds = Array.from(this.tickerValues.keys());
    await Promise.all(accountIds.map((accountId) => this.refreshAccountTickersWatchList(accountId)));
    this.logger.debug(`Refreshed all accounts tickers watch list`);
  }

  private async refreshAccountTickersWatchList(accountId: string): Promise<void> {
    this.logger.debug(`Refreshing tickers watch list - AccountID: ${accountId}`);

    const newUniqueTickers = this.getUniqueTickersForAccount(accountId);
    const currentlyTracked = Array.from(this.tickerValues.get(accountId)?.keys() || []);
    const toSubscribe = newUniqueTickers.filter((ticker) => !currentlyTracked.includes(ticker));
    const toUnsubscribe = currentlyTracked.filter((ticker) => !newUniqueTickers.includes(ticker));
    await this.handleTickerSubscriptions(accountId, toSubscribe, toUnsubscribe);

    if (toSubscribe.length + toUnsubscribe.length > 0) {
      this.logger.log(`Updated tickers watch list - AccountID: ${accountId} - NewCount: ${newUniqueTickers.length}`);
    } else {
      this.logger.debug(`Tickers watch list unchanged - AccountID: ${accountId} - Count: ${currentlyTracked.length}`);
    }
  }

  private getUniqueTickersForAccount(accountId: string): string[] {
    const ordersTickers = this.orderService.getOpenOrders(accountId).map((order) => order.marketId);
    const positionsTickers = this.positionService.getPositions(accountId).map((position) => position.marketId);
    return Array.from(new Set([...ordersTickers, ...positionsTickers]));
  }

  private async handleTickerSubscriptions(
    accountId: string,
    toSubscribe: string[],
    toUnsubscribe: string[]
  ): Promise<void> {
    if (toSubscribe.length > 0) {
      await this.subscribeToTickers(accountId, toSubscribe);
    }

    if (toUnsubscribe.length > 0) {
      await this.unsubscribeFromTickers(accountId, toUnsubscribe);
    }
  }

  private async subscribeToTickers(accountId: string, tickers: string[]): Promise<void> {
    this.eventEmitter.emit(
      Events.Websocket.SUBSCRIBE,
      new WebSocketSubscribeEvent(
        accountId,
        tickers.map((t) => `tickers.${t}`)
      )
    );
    this.logger.debug(`Subscribed to tickers - AccountID: ${accountId} - Tickers: ${tickers.join(', ')}`);
  }

  private async unsubscribeFromTickers(accountId: string, tickers: string[]): Promise<void> {
    this.eventEmitter.emit(
      Events.Websocket.UNSUBSCRIBE,
      new WebSocketUnsubscribeEvent(
        accountId,
        tickers.map((t) => `tickers.${t}`)
      )
    );
    this.logger.debug(`Unsubscribed from tickers - AccountID: ${accountId} - Tickers: ${tickers.join(', ')}`);
    tickers.forEach((ticker) => this.tickerValues.get(accountId)?.delete(ticker));
  }

  private async subscribeToTicker(accountId: string, marketId: string): Promise<void> {
    await this.subscribeToTickers(accountId, [marketId]);
  }
}
