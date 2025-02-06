import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
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
export class TickerService implements IAccountTracker, IAccountSynchronizer<Map<string, ITickerData>> {
  private readonly logger = new Logger(TickerService.name);
  private readonly tickerValues: Map<string, Map<string, ITickerData>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeService: ExchangeService,
    private readonly orderService: OrderService,
    private readonly positionService: PositionService
  ) {}

  @Interval(Timers.TICKERS_CACHE_COOLDOWN)
  sync(): void {
    this.syncAllAccounts();
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (this.tickerValues.has(accountId)) {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracked`);
      return;
    }

    this.tickerValues.set(accountId, new Map());
    this.logger.log(`startTrackingAccount() - success | accountId=${accountId}, tracking=started`);
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);

    if (this.tickerValues.delete(accountId)) {
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}, tracking=stopped`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  async getTickerPrice(accountId: string, marketId: string): Promise<number> {
    this.logger.debug(`getTickerPrice() - start | accountId=${accountId}, marketId=${marketId}`);

    const accountTickers = this.tickerValues.get(accountId);

    if (!accountTickers) {
      this.logger.warn(`getTickerPrice() - error | accountId=${accountId}, reason=Account not found in tickerValues`);
      throw new AccountNotFoundException(accountId);
    }

    if (!accountTickers.has(marketId)) {
      this.logger.warn(
        `getTickerPrice() - cache miss | accountId=${accountId}, marketId=${marketId}, action=subscribe+fetch`
      );
      await this.subscribeToTicker(accountId, marketId);
      return this.fetchAndCacheTicker(accountId, marketId);
    }

    const price = fromTickerDataToPrice(accountTickers.get(marketId));
    this.logger.log(`getTickerPrice() - success | accountId=${accountId}, marketId=${marketId}, price=${price}`);
    return price;
  }

  updateTickerData(accountId: string, marketId: string, data: ITickerData): void {
    // NOTE Avoiding logs here to prevent high frequency noise
    // this.logger.debug(
    //   `updateTickerData() - start | accountId=${accountId}, marketId=${marketId}`
    // );

    const accountTickers = this.tickerValues.get(accountId) || new Map<string, ITickerData>();
    this.tickerValues.set(accountId, accountTickers);

    const existingData = accountTickers.get(marketId) || {};

    if (haveTickerDataChanged(existingData, data)) {
      const updatedData: ITickerData = { ...existingData, ...data };
      const price = fromTickerDataToPrice(updatedData);

      if (price !== null) {
        accountTickers.set(marketId, updatedData);
        // this.logger.log(`updateTickerData() - success | accountId=${accountId}, marketId=${marketId}, price=${price}`);
      } else {
        this.logger.warn(
          `updateTickerData() - skip | accountId=${accountId}, marketId=${marketId}, reason=No valid bid/ask`
        );
      }
    }
  }

  private async fetchAndCacheTicker(accountId: string, marketId: string): Promise<number> {
    this.logger.debug(`fetchAndCacheTicker() - start | accountId=${accountId}, marketId=${marketId}`);

    try {
      const ticker = await this.exchangeService.getTicker(accountId, marketId);
      this.updateTickerData(accountId, marketId, ticker.info);

      const finalPrice = fromTickerDataToPrice(ticker.info);
      this.logger.log(
        `fetchAndCacheTicker() - success | accountId=${accountId}, marketId=${marketId}, price=${finalPrice}`
      );
      return finalPrice;
    } catch (error) {
      this.logger.error(
        `fetchAndCacheTicker() - error | accountId=${accountId}, marketId=${marketId}, msg=${error.message}`,
        error.stack
      );
      throw new TickerPriceNotFoundException(accountId, marketId);
    }
  }

  private getUniqueTickersForAccount(accountId: string): string[] {
    this.logger.debug(`getUniqueTickersForAccount() - start | accountId=${accountId}`);
    const openOrders = this.orderService.getOpenOrders(accountId);
    const openPositions = this.positionService.getPositions(accountId);
    const ordersTickers = openOrders.map((o) => o.marketId);
    const positionsTickers = openPositions.map((p) => p.marketId);
    const combined = new Set([...ordersTickers, ...positionsTickers]);
    const uniqueTickers = [...combined];
    this.logger.debug(
      `getUniqueTickersForAccount() - success | accountId=${accountId}, tickers=[${uniqueTickers.join(',')}]`
    );
    return uniqueTickers;
  }

  private async subscribeToTickers(accountId: string, tickers: string[]): Promise<void> {
    this.logger.debug(`subscribeToTickers() - start | accountId=${accountId}, tickers=[${tickers.join(',')}]`);
    this.eventEmitter.emit(
      Events.Websocket.SUBSCRIBE,
      new WebSocketSubscribeEvent(
        accountId,
        tickers.map((t) => `tickers.${t}`)
      )
    );
    this.logger.log(`subscribeToTickers() - success | accountId=${accountId}, count=${tickers.length}`);
  }

  private async unsubscribeFromTickers(accountId: string, tickers: string[]): Promise<void> {
    this.logger.debug(`unsubscribeFromTickers() - start | accountId=${accountId}, tickers=[${tickers.join(',')}]`);
    this.eventEmitter.emit(
      Events.Websocket.UNSUBSCRIBE,
      new WebSocketUnsubscribeEvent(
        accountId,
        tickers.map((t) => `tickers.${t}`)
      )
    );

    const accountTickers = this.tickerValues.get(accountId);

    if (accountTickers) {
      tickers.forEach((ticker) => accountTickers.delete(ticker));
    }

    this.logger.log(`unsubscribeFromTickers() - success | accountId=${accountId}, count=${tickers.length}`);
  }

  private async subscribeToTicker(accountId: string, marketId: string): Promise<void> {
    this.logger.debug(`subscribeToTicker() - start | accountId=${accountId}, marketId=${marketId}`);
    await this.subscribeToTickers(accountId, [marketId]);
  }

  async syncAccount(accountId: string): Promise<Map<string, ITickerData>> {
    this.logger.debug(`syncAccount() - start | accountId=${accountId}`);

    const accountTickers = this.tickerValues.get(accountId) || new Map<string, ITickerData>();
    this.tickerValues.set(accountId, accountTickers);

    const newUniqueTickers = this.getUniqueTickersForAccount(accountId);
    const currentlyTracked = Array.from(accountTickers.keys());
    const toSubscribe = newUniqueTickers.filter((t) => !currentlyTracked.includes(t));

    if (toSubscribe.length > 0) {
      await this.subscribeToTickers(accountId, toSubscribe);
    }

    const toUnsubscribe = currentlyTracked.filter((ticker) => !newUniqueTickers.includes(ticker));

    if (toUnsubscribe.length > 0) {
      await this.unsubscribeFromTickers(accountId, toUnsubscribe);
    }

    if (toSubscribe.length + toUnsubscribe.length > 0) {
      this.logger.log(`syncAccount() - success | accountId=${accountId}, count=${newUniqueTickers.length}`);
    } else {
      this.logger.debug(
        `syncAccount() - skip | accountId=${accountId}, reason=No changes, count=${currentlyTracked.length}`
      );
    }
    return accountTickers;
  }

  async syncAllAccounts(): Promise<void> {
    this.logger.debug('syncAllAccounts() - start');
    const accountIds = Array.from(this.tickerValues.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const refreshPromises = accountIds.map(async (id) =>
      this.syncAccount(id).catch((error) => errors.push({ accountId: id, error }))
    );
    await Promise.all(refreshPromises);

    if (errors.length > 0) {
      const errorMsg = errors.map((e) => `${e.accountId}: ${e.error.message}`).join('; ');
      this.logger.error(`syncAllAccounts() - error | multiple refresh failures, msg=${errorMsg}`);
    }

    this.logger.debug('syncAllAccounts() - complete');
  }
}
