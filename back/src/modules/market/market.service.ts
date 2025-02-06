import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { Events, Timers } from '@config';
import { ExchangeService } from '@exchange/exchange.service';

import { MarketsUpdatedEvent } from './events/markets-updated.event';
import { MarketNotFoundException, MarketsUpdateAggregatedException } from './exceptions/market.exceptions';
import { MarketMapperService } from './services/market-mapper.service';
import { IMarket } from './types/market.interface';

@Injectable()
export class MarketService implements IAccountTracker, IAccountSynchronizer<IMarket[]> {
  private logger = new Logger(MarketService.name);
  private markets: Map<string, IMarket[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private marketMapper: MarketMapperService
  ) {}

  @Interval(Timers.MARKETS_CACHE_COOLDOWN)
  sync(): void {
    this.syncAllAccounts();
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.markets.has(accountId)) {
      await this.refreshAccount(accountId);
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

  private getAccountMarkets(accountId: string): IMarket[] {
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

  findAccountContractMarketById(accountId: string, marketId: string): IMarket {
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

  async refreshAccount(accountId: string): Promise<IMarket[]> {
    this.logger.debug(`Refreshing markets - AccountID: ${accountId}`);

    try {
      const externalMarkets = await this.exchangeService.getMarkets(accountId);
      const markets = externalMarkets
        .map((market) => this.marketMapper.fromExternal(market))
        .sort((a, b) => a.id.localeCompare(b.id));
      this.markets.set(accountId, markets);
      this.eventEmitter.emit(Events.Market.BULK_UPDATED, new MarketsUpdatedEvent(accountId, markets));
      this.logger.log(`Refreshed markets - AccountID: ${accountId} - Count: ${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`Markets refresh failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async syncAccount(accountId: string): Promise<IMarket[]> {
    this.logger.debug(`Refreshing markets - AccountID: ${accountId}`);

    try {
      const externalMarkets = await this.exchangeService.getMarkets(accountId);
      const markets = externalMarkets
        .map((market) => this.marketMapper.fromExternal(market))
        .sort((a, b) => a.id.localeCompare(b.id));
      this.markets.set(accountId, markets);
      this.eventEmitter.emit(Events.Market.BULK_UPDATED, new MarketsUpdatedEvent(accountId, markets));
      this.logger.log(`Refreshed markets - AccountID: ${accountId} - Count: ${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`Markets refresh failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAllAccounts() {
    this.logger.debug('Starting refresh of all markets');
    const accountIds = Array.from(this.markets.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const marketsPromises = accountIds.map((accountId) =>
      this.refreshAccount(accountId).catch((error) => {
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

  async syncAllAccounts() {
    this.logger.debug('Starting refresh of all markets');
    const accountIds = Array.from(this.markets.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const marketsPromises = accountIds.map((accountId) =>
      this.refreshAccount(accountId).catch((error) => {
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
