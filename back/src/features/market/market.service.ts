import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Market } from 'ccxt';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { IDataRefresher } from '@common/types/data-refresher.interface';
import { Events } from '@config/events.config';
import { Timers } from '@config/timers.config';
import { ExchangeService } from '@exchange/exchange.service';

import { MarketsUpdatedEvent } from './events/markets-updated.event';
import { MarketNotFoundException, MarketsUpdateAggregatedException } from './exceptions/market.exceptions';

@Injectable()
export class MarketService implements OnModuleInit, IAccountTracker, IDataRefresher<Market[]> {
  private logger = new Logger(MarketService.name);
  private markets: Map<string, Market[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    setInterval(() => {
      this.refreshAll();
    }, Timers.MARKETS_CACHE_COOLDOWN);
    this.logger.log('Module initialized successfully');
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.markets.has(accountId)) {
      await this.refreshOne(accountId);
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.markets.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  private getAccountMarkets(accountId: string): Market[] {
    this.logger.debug(`Fetching account markets - AccountID: ${accountId}`);

    if (!this.markets.has(accountId)) {
      this.logger.warn(`Account markets not found - AccountID: ${accountId}`);
      throw new AccountNotFoundException(accountId);
    }
    return this.markets.get(accountId);
  }

  findAccountMarketIds(accountId: string): string[] {
    this.logger.debug(`Fetching account market IDs - AccountID: ${accountId}`);
    const markets = this.getAccountMarkets(accountId);
    const marketIds = markets.map((market) => market.id);
    this.logger.debug(`Fetched account market IDs - AccountID: ${accountId} - Count: ${marketIds.length}`);
    return marketIds;
  }

  findAccountContractMarketIds(accountId: string, quoteCurrency: string = 'USDT'): string[] {
    this.logger.debug(
      `Fetching account contract market IDs - AccountID: ${accountId} - QuoteCurrency: ${quoteCurrency}`
    );
    const markets = this.getAccountMarkets(accountId);
    const contractMarketIds = markets
      .filter((market) => market.quote === quoteCurrency && market.active && market.contract)
      .map((market) => market.id);
    this.logger.debug(
      `Fetched account contract market IDs - AccountID: ${accountId} - Count: ${contractMarketIds.length}`
    );
    return contractMarketIds;
  }

  findAccountContractMarketById(accountId: string, marketId: string): Market {
    this.logger.debug(`Fetching account contract market - AccountID: ${accountId} - MarketID: ${marketId}`);
    const markets = this.getAccountMarkets(accountId);
    const specificMarket = markets.find((market) => market.id === marketId && market.active && market.contract);

    if (!specificMarket) {
      this.logger.warn(`Account contract market not found - AccountID: ${accountId} - MarketID: ${marketId}`);
      throw new MarketNotFoundException(accountId, marketId);
    }

    this.logger.debug(`Fetched account contract market - AccountID: ${accountId} - MarketID: ${marketId}`);
    return specificMarket;
  }

  async refreshOne(accountId: string): Promise<Market[]> {
    this.logger.debug(`Refreshing markets - AccountID: ${accountId}`);

    try {
      const markets = await this.exchangeService.getMarkets(accountId);
      this.markets.set(
        accountId,
        markets.sort((a, b) => a.id.localeCompare(b.id))
      );
      this.eventEmitter.emit(Events.MARKETS_UPDATED, new MarketsUpdatedEvent(accountId, markets));
      this.logger.log(`Refreshed markets - AccountID: ${accountId} - Count: ${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`Markets refresh failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll() {
    this.logger.debug('Starting refresh of all markets');
    const accountIds = Array.from(this.markets.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const marketsPromises = accountIds.map((accountId) =>
      this.refreshOne(accountId).catch((error) => {
        errors.push({ accountId, error });
      })
    );
    await Promise.all(marketsPromises);

    if (errors.length > 0) {
      const aggregatedError = new MarketsUpdateAggregatedException(errors);
      this.logger.error(`Multiple market updates failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
    }

    this.logger.debug(`Completed refresh of all markets`);
  }
}
