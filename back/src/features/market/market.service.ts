import { Injectable, Logger } from '@nestjs/common';
import { Market } from 'ccxt';

import { Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import {
  MarketNotFoundException,
  MarketsUpdateAggregatedException,
} from './exceptions/market.exceptions';

@Injectable()
export class MarketService {
  private logger = new Logger(MarketService.name);
  private markets: Map<string, Market[]> = new Map();

  constructor(private exchangeService: ExchangeService) {}

  async onModuleInit() {
    await this.refreshMarkets();
    setInterval(() => {
      this.refreshMarkets();
    }, Timers.MARKETS_CACHE_COOLDOWN);
  }

  // NOTE don't return this payload directly since it's a huge one
  private async fetchAllMarkets(accountId: string): Promise<Market[]> {
    this.logger.log(`Market fetch initiated - AccountID: ${accountId}`);

    if (!this.markets.has(accountId)) {
      this.logger.error(`Market fetch failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    return this.markets.get(accountId);
  }

  async fetchAllMarketIds(accountId: string): Promise<string[]> {
    this.logger.log(`Market IDs fetch initiated - AccountID: ${accountId}`);
    const allMarkets = await this.fetchAllMarkets(accountId);

    return allMarkets.map((market) => market.id);
  }

  async fetchSpotMarketIds(
    accountId: string,
    quoteCurrency: string = 'USDT',
  ): Promise<string[]> {
    this.logger.log(`Market spot IDs fetch initiated - AccountID: ${accountId}, QuoteCurrency: ${quoteCurrency}`);
    const allMarkets = await this.fetchAllMarkets(accountId);

    return allMarkets
      .filter(
        (market) =>
          market.quote === quoteCurrency && market.active && market.spot,
      )
      .map((market) => market.id);
  }

  async fetchContractMarketIds(
    accountId: string,
    quoteCurrency: string = 'USDT',
  ): Promise<string[]> {
    this.logger.log(`Market contract IDs fetch initiated - AccountID: ${accountId}, QuoteCurrency: ${quoteCurrency}`);

    const allMarkets = await this.fetchAllMarkets(accountId);

    return allMarkets
      .filter(
        (market) =>
          market.quote === quoteCurrency && market.active && market.contract,
      )
      .map((market) => market.id);
  }

  // TODO add other market types ? future, option, index ...

  async findMarketById(accountId: string, marketId: string): Promise<Market> {
    this.logger.log(`Market fetch initiated - AccountID: ${accountId}, MarketID: ${marketId}`);
    const allMarkets = this.markets.get(accountId);

    if (!allMarkets) {
        this.logger.error(`Market fetch failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const specificMarket = allMarkets.find((market) => market.id === marketId);

    if (!specificMarket) {
        this.logger.error(`Market fetch failed - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Market not found`);
      throw new MarketNotFoundException(accountId, marketId);
    }

    return specificMarket;
  }

  private async refreshMarkets() {
    const initializedAccountIds =
      this.exchangeService.getInitializedAccountIds();
    const errors: Array<{ accountId: string; error: Error }> = [];

    const marketsPromises = initializedAccountIds.map(async (accountId) => {
      try {
        const markets = await this.exchangeService.getMarkets(accountId);

        this.markets.set(
          accountId,
          markets.sort((a, b) => a.id.localeCompare(b.id)),
        );
        this.logger.log(
          `Markets updated - AccountID: ${accountId}, Markets count: ${markets.length}`,
        );
      } catch (error) {
        this.logger.error(
          `Markets update failed - AccountID: ${accountId}, Error: ${error.message}`,
          error.stack,
        );
        errors.push({ accountId, error });
      }
    });

    try {
      await Promise.all(marketsPromises);

      if (errors.length > 0) {
        throw new MarketsUpdateAggregatedException(errors);
      }
    } catch (aggregatedError) {
      this.logger.error(
        `Markets update failed - Error: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    }
  }
}
