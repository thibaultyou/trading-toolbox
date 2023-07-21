import { Injectable, Logger } from '@nestjs/common';
import { Order } from 'ccxt';

import { Account } from '../account/entities/account.entity';

import {
  ExchangeNotFoundException,
  ExchangeAlreadyInitializedException,
  ExchangeInitializationException,
  NoAccountFoundException,
  ExchangeOperationFailedException,
} from './exceptions/exchange.exceptions';
import { IExchangeService } from './exchange.interfaces';
import { ExchangeFactory } from './services/exchange-service.factory';

@Injectable()
export class ExchangeService {
  private exchangeMap: Map<string, IExchangeService> = new Map();
  private logger: Logger = new Logger(ExchangeService.name);

  constructor(private exchangeFactory: ExchangeFactory) {}

  initializeExchange(account: Account) {
    if (!account) {
      throw new NoAccountFoundException();
    }

    if (!this.exchangeMap.has(account.name)) {
      try {
        const exchange = this.exchangeFactory.createExchange(account);
        exchange.initialize();
        this.exchangeMap.set(account.name, exchange);
      } catch (error) {
        this.logger.error(
          `Error initializing exchange for ${account.name}`,
          error.stack,
        );
        throw new ExchangeInitializationException(error);
      }
    } else {
      throw new ExchangeAlreadyInitializedException(account.name);
    }
  }

  async getBalance(accountName: string): Promise<number> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.getBalance();
    } catch (error) {
      this.logger.error(
        `Error getting balance for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getBalance', error);
    }
  }

  async getTickers(accountName: string): Promise<string[]> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.getTickers();
    } catch (error) {
      this.logger.error(
        `Error getting tickers for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getTickers', error);
    }
  }

  async fetchOpenOrders(accountName: string): Promise<Order[]> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.fetchOpenOrders();
    } catch (error) {
      this.logger.error(
        `Error fetching open orders for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('fetchOpenOrders', error);
    }
  }

  performWsAction(
    accountName: string,
    action: string,
    topic: string,
    actionDescription: string,
  ): void {
    const exchange = this.getExchange(accountName);
    try {
      exchange.performWsAction(action, topic, actionDescription);
    } catch (error) {
      this.logger.error(
        `Error performing websocket action for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('performWsAction', error);
    }
  }

  cleanResources(accountName: string): void {
    const exchange = this.getExchange(accountName);
    try {
      exchange.cleanResources();
      this.exchangeMap.delete(accountName);
    } catch (error) {
      this.logger.error(
        `Error cleaning resources for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('cleanResources', error);
    }
  }

  private getExchange(accountName: string): IExchangeService {
    const exchange = this.exchangeMap.get(accountName);
    if (!exchange) {
      throw new ExchangeNotFoundException(accountName);
    }
    return exchange;
  }

  async getOpenPositions(accountName: string): Promise<any> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.getOpenPositions();
    } catch (error) {
      this.logger.error(
        `Error getting open positions for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getOpenPositions', error);
    }
  }
}
