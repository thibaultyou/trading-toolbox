import { Injectable, Logger } from '@nestjs/common';
import { Order } from 'ccxt';

import { AccountService } from '../account/account.service';
import { Account } from '../account/entities/account.entity';
import { Position } from '../position/position.types';

import {
  ExchangeNotFoundException,
  ExchangeAlreadyInitializedException,
  ExchangeInitializationException,
  NoAccountFoundException,
  ExchangeOperationFailedException,
  UnrecognizedSideException,
  ClosePositionException,
} from './exceptions/exchange.exceptions';
import { IExchangeService } from './exchange.interfaces';
import { ExchangeFactory } from './services/exchange-service.factory';

@Injectable()
export class ExchangeService {
  // FIXME replace name mapping with id
  private exchangeMap: Map<string, IExchangeService> = new Map();
  private logger: Logger = new Logger(ExchangeService.name);

  constructor(
    private exchangeFactory: ExchangeFactory,
    private accountService: AccountService,
  ) {}

  async onModuleInit(): Promise<void> {
    const accounts = await this.accountService.findAll();
    for (const account of accounts) {
      this.initializeExchange(account);
    }
  }

  initializeExchange(account: Account) {
    if (!account) {
      throw new NoAccountFoundException();
    }

    if (!this.exchangeMap.has(account.name)) {
      try {
        const exchange = this.exchangeFactory.createExchange(account);
        exchange.initialize();
        this.exchangeMap.set(account.name, exchange);
        this.logger.log(`Exchange ${account.name} initialized successfully`);
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
      const balance = await exchange.getBalance();
      this.logger.log(`Fetched balance for ${accountName}: ${balance}`);
      return balance;
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
      const tickers = await exchange.getTickers();
      this.logger.log(
        `Fetched tickers for ${accountName}: ${tickers.join(', ')}`,
      );
      return tickers;
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

  async closePosition(
    accountName: string,
    currentPosition: Position,
  ): Promise<Order> {
    const positionDetails = `${currentPosition.contracts} ${currentPosition.symbol} ${currentPosition.side}`;

    try {
      let order: Order;

      if (currentPosition.side === 'long') {
        order = await this.openMarketShortOrder(
          accountName,
          currentPosition.symbol,
          currentPosition.contracts,
        );
      } else if (currentPosition.side === 'short') {
        order = await this.openMarketLongOrder(
          accountName,
          currentPosition.symbol,
          currentPosition.contracts,
        );
      } else {
        const errorMessage = `Unrecognized side "${currentPosition.side}" for ${accountName}. Position not closed. Details: ${positionDetails}`;
        this.logger.error(errorMessage);
        throw new UnrecognizedSideException(accountName, currentPosition.side);
      }

      this.logger.log(
        `[${accountName}] ${positionDetails} position closed successfully.`,
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Error closing position for ${accountName}. Details: ${positionDetails}`,
        error.stack,
      );
      throw new ClosePositionException(accountName, error);
    }
  }

  async openLimitLongOrder(
    accountName: string,
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.openLimitLongOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Error opening limit long order for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openLimitLongOrder', error);
    }
  }

  async openLimitShortOrder(
    accountName: string,
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.openLimitShortOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Error opening limit short order for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openLimitShortOrder', error);
    }
  }

  async openMarketLongOrder(
    accountName: string,
    symbol: string,
    size: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.openMarketLongOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Error opening market long order for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openMarketLongOrder', error);
    }
  }

  async openMarketShortOrder(
    accountName: string,
    symbol: string,
    size: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.openMarketShortOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Error opening market short order for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openMarketShortOrder', error);
    }
  }

  async updateStopLoss(
    accountName: string,
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.updateStopLoss(
        orderId,
        symbol,
        amount,
        stopLossPrice,
      );
    } catch (error) {
      this.logger.error(
        `Error updating stop loss for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('updateStopLoss', error);
    }
  }

  async updateTakeProfit(
    accountName: string,
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.updateTakeProfit(
        orderId,
        symbol,
        amount,
        takeProfitPrice,
      );
    } catch (error) {
      this.logger.error(
        `Error updating take profit for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('updateTakeProfit', error);
    }
  }

  async closeOrder(
    accountName: string,
    orderId: string,
    symbol: string,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.closeOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(`Error closing order for ${accountName}`, error.stack);
      throw new ExchangeOperationFailedException('closeOrder', error);
    }
  }

  async closeOrdersWithSymbol(
    accountName: string,
    symbol: string,
  ): Promise<Order> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.closeOrdersWithSymbol(symbol);
    } catch (error) {
      this.logger.error(
        `Error closing ${symbol} orders for ${accountName}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException(
        'closeOrdersWithSymbol',
        error,
      );
    }
  }
}
