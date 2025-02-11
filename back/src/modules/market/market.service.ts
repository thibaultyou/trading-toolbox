import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
import { ConfigService, Timers } from '@config';
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
    private marketMapper: MarketMapperService,
    private readonly configService: ConfigService
  ) {}

  @Interval(Timers.MARKETS_CACHE_COOLDOWN)
  sync(): void {
    this.syncAllAccounts();
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (!this.markets.has(accountId)) {
      await this.refreshAccount(accountId);
      this.logger.log(`startTrackingAccount() - success | accountId=${accountId}`);
    } else {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);

    const removed = this.markets.delete(accountId);

    if (removed) {
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  private getAccountMarkets(accountId: string): IMarket[] {
    this.logger.debug(`getAccountMarkets() - start | accountId=${accountId}`);

    if (!this.markets.has(accountId)) {
      this.logger.warn(
        `getAccountMarkets() - skip | accountId=${accountId}, reason=No markets tracked for this account`
      );
      throw new AccountNotFoundException(accountId);
    }

    this.logger.debug(`getAccountMarkets() - success | accountId=${accountId}`);
    return this.markets.get(accountId);
  }

  findAccountMarketIds(accountId: string): string[] {
    this.logger.debug(`findAccountMarketIds() - start | accountId=${accountId}`);
    const markets = this.getAccountMarkets(accountId);
    const marketIds = markets.map((market) => market.id);
    this.logger.debug(`findAccountMarketIds() - success | accountId=${accountId}, count=${marketIds.length}`);
    return marketIds;
  }

  findAccountContractMarketIds(accountId: string, quoteCurrency: string = 'USDT'): string[] {
    this.logger.debug(
      `findAccountContractMarketIds() - start | accountId=${accountId}, quoteCurrency=${quoteCurrency}`
    );
    const markets = this.getAccountMarkets(accountId);
    const contractMarketIds = markets
      .filter((market) => market.quote === quoteCurrency && market.active && market.contract)
      .map((market) => market.id);
    this.logger.debug(
      `findAccountContractMarketIds() - success | accountId=${accountId}, count=${contractMarketIds.length}`
    );
    return contractMarketIds;
  }

  findAccountContractMarketById(accountId: string, marketId: string): IMarket {
    this.logger.debug(`findAccountContractMarketById() - start | accountId=${accountId}, marketId=${marketId}`);
    const markets = this.getAccountMarkets(accountId);
    const specificMarket = markets.find((m) => m.id === marketId && m.active && m.contract);

    if (!specificMarket) {
      this.logger.warn(
        `findAccountContractMarketById() - skip | accountId=${accountId}, marketId=${marketId}, reason=No active contract market found`
      );
      throw new MarketNotFoundException(accountId, marketId);
    }

    this.logger.debug(`findAccountContractMarketById() - success | accountId=${accountId}, marketId=${marketId}`);
    return specificMarket;
  }

  async refreshAccount(accountId: string): Promise<IMarket[]> {
    this.logger.debug(`refreshAccount() - start | accountId=${accountId}`);

    try {
      const externalMarkets = await this.exchangeService.getMarkets(accountId);
      const mappedMarkets = externalMarkets
        .map((m) => this.marketMapper.fromExternal(m))
        .sort((a, b) => a.id.localeCompare(b.id));
      this.markets.set(accountId, mappedMarkets);

      this.eventEmitter.emit(
        this.configService.events.Market.BULK_UPDATED,
        new MarketsUpdatedEvent(accountId, mappedMarkets)
      );
      this.logger.log(`refreshAccount() - success | accountId=${accountId}, count=${mappedMarkets.length}`);
      return mappedMarkets;
    } catch (error) {
      this.logger.error(`refreshAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw error;
    }
  }

  async syncAccount(accountId: string): Promise<IMarket[]> {
    this.logger.debug(`syncAccount() - start | accountId=${accountId}`);

    try {
      const externalMarkets = await this.exchangeService.getMarkets(accountId);
      const mappedMarkets = externalMarkets
        .map((m) => this.marketMapper.fromExternal(m))
        .sort((a, b) => a.id.localeCompare(b.id));
      this.markets.set(accountId, mappedMarkets);

      this.eventEmitter.emit(
        this.configService.events.Market.BULK_UPDATED,
        new MarketsUpdatedEvent(accountId, mappedMarkets)
      );
      this.logger.log(`syncAccount() - success | accountId=${accountId}, count=${mappedMarkets.length}`);
      return mappedMarkets;
    } catch (error) {
      this.logger.error(`syncAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAllAccounts() {
    this.logger.debug('refreshAllAccounts() - start');
    const accountIds = Array.from(this.markets.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const tasks = accountIds.map((id) =>
      this.refreshAccount(id).catch((error) => errors.push({ accountId: id, error }))
    );
    await Promise.all(tasks);

    if (errors.length > 0) {
      const aggregatedError = new MarketsUpdateAggregatedException(errors);
      this.logger.error(`refreshAllAccounts() - error | msg=${aggregatedError.message}`, aggregatedError.stack);
    }

    this.logger.debug('refreshAllAccounts() - success');
  }

  async syncAllAccounts() {
    this.logger.debug('syncAllAccounts() - start');
    const accountIds = Array.from(this.markets.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const tasks = accountIds.map((id) =>
      this.refreshAccount(id).catch((error) => errors.push({ accountId: id, error }))
    );
    await Promise.all(tasks);

    if (errors.length > 0) {
      const aggregatedError = new MarketsUpdateAggregatedException(errors);
      this.logger.error(`syncAllAccounts() - error | msg=${aggregatedError.message}`, aggregatedError.stack);
    }

    this.logger.debug('syncAllAccounts() - success');
  }
}
