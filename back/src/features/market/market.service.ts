import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Market } from 'ccxt';

import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ITrackableService } from '../common/interfaces/trackable.service.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { MarketsUpdatedEvent } from './events/markets-updated.event';
import { MarketNotFoundException, MarketsUpdateAggregatedException } from './exceptions/market.exceptions';

@Injectable()
export class MarketService implements OnModuleInit, ITrackableService<Market[]> {
  private logger = new Logger(MarketService.name);
  private markets: Map<string, Market[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.MARKETS_CACHE_COOLDOWN);
  }

  startTrackingAccount(accountId: string) {
    if (!this.markets.has(accountId)) {
      this.logger.log(`Market - Tracking Initiated - AccountID: ${accountId}`);
      this.refreshOne(accountId);
    } else {
      this.logger.warn(`Market - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.markets.delete(accountId)) {
      this.logger.log(`Market - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Market - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  // NOTE don't return this payload directly since it's a huge one
  private getAccountMarkets(accountId: string): Market[] {
    this.logger.log(`Markets - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.markets.has(accountId)) {
      this.logger.error(`Market - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    return this.markets.get(accountId);
  }

  findAccountMarketIds(accountId: string): string[] {
    this.logger.log(`Market IDs - Fetch Initiated - AccountID: ${accountId}`);
    const markets = this.getAccountMarkets(accountId);

    return markets.map((market) => market.id);
  }

  findAccountSpotMarketIds(accountId: string, quoteCurrency: string = 'USDT'): string[] {
    this.logger.log(`Market Spot - Fetch Initiated - AccountID: ${accountId}, QuoteCurrency: ${quoteCurrency}`);
    const markets = this.getAccountMarkets(accountId);

    return markets
      .filter((market) => market.quote === quoteCurrency && market.active && market.spot)
      .map((market) => market.id);
  }

  findAccountContractMarketIds(accountId: string, quoteCurrency: string = 'USDT'): string[] {
    this.logger.log(`Market Contract - Fetch Initiated - AccountID: ${accountId}, QuoteCurrency: ${quoteCurrency}`);

    const markets = this.getAccountMarkets(accountId);

    return markets
      .filter((market) => market.quote === quoteCurrency && market.active && market.contract)
      .map((market) => market.id);
  }

  // TODO add other market types ? future, option, index ...

  findAccountMarketById(accountId: string, marketId: string): Market {
    this.logger.log(`Market - Fetch Initiated - AccountID: ${accountId}, MarketID: ${marketId}`);
    const markets = this.getAccountMarkets(accountId);

    const specificMarket = markets.find((market) => market.id === marketId);

    if (!specificMarket) {
      this.logger.error(
        `Market - Fetch Failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Market not found`
      );
      throw new MarketNotFoundException(accountId, marketId);
    }

    return specificMarket;
  }

  async refreshOne(accountId: string): Promise<Market[]> {
    this.logger.debug(`Market - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const markets = await this.exchangeService.getMarkets(accountId);

      this.markets.set(
        accountId,
        markets.sort((a, b) => a.id.localeCompare(b.id))
      );
      this.eventEmitter.emit(Events.MARKETS_UPDATED, new MarketsUpdatedEvent(accountId, markets));
      this.logger.log(`Market - Update Success - AccountID: ${accountId}, Count: ${markets.length}`);

      return markets;
    } catch (error) {
      this.logger.error(`Market - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Markets - Refresh Initiated`);
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

      this.logger.error(
        `Markets - Multiple Updates Failed - Errors: ${aggregatedError.message}`,
        aggregatedError.stack
      );
      // Avoid interrupting the loop by not throwing an exception
    }
  }
}
