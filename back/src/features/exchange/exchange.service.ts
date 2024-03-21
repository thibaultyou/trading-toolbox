import { Injectable, Logger } from '@nestjs/common';
import { Market, Order } from 'ccxt';

import { AccountService } from '../account/account.service';
import { Account } from '../account/entities/account.entity';
import { Position } from '../position/position.types';

import {
  ExchangeNotFoundException,
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
    await Promise.all(
      accounts.map((account) => this.initializeExchange(account)),
    );
  }

  async initializeExchange(account: Account): Promise<void> {
    if (!account) {
      this.logger.error(
        'Exchange initialization skipped due to missing account.',
      );
      return;
    }

    if (this.exchangeMap.has(account.name)) {
      this.logger.error(
        `Initialization skipped: ${account.exchange} exchange for account ${account.name} is already initialized.`,
      );
      return;
    }

    try {
      const exchange = await this.exchangeFactory.createExchange(account);
      this.exchangeMap.set(account.name, exchange);
      this.logger.log(
        `${account.exchange} exchange for account ${account.name} initialized successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Initialization failure: Could not initialize ${account.exchange} exchange for account ${account.name}. Error: ${error.message}`,
        error.stack,
      );
    }
  }

  getInitializedAccountNames(): string[] {
    return Array.from(this.exchangeMap.keys());
  }

  async getBalance(accountName: string): Promise<number> {
    const exchange = this.getExchange(accountName);
    try {
      const balance = await exchange.getBalance();
      this.logger.debug(
        `Balance fetched: Account ${accountName}, Balance: ${balance}$`,
      );
      return balance;
    } catch (error) {
      this.logger.error(
        `Balance fetch error: Account ${accountName}. Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getBalance', error);
    }
  }

  async getUsdtMarkets(accountName: string): Promise<Market[]> {
    const exchange = this.getExchange(accountName);
    try {
      const markets = await exchange.getUsdtMarkets();
      const marketIds = markets.map((market) => market.id).join(', ');
      this.logger.log(
        `USDT markets fetched: Account ${accountName}, Markets: ${marketIds}`,
      );
      return markets;
    } catch (error) {
      this.logger.error(
        `USDT markets fetch error: Account ${accountName}. Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getUsdtMarkets', error);
    }
  }

  async getSpecificUsdtMarket(
    accountName: string,
    baseCurrency: string,
  ): Promise<Market | null> {
    try {
      const markets = await this.getUsdtMarkets(accountName);
      const specificMarket = markets.find(
        (market) => market.base === baseCurrency && market.quote === 'USDT',
      );

      if (!specificMarket) {
        this.logger.warn(
          `Specific USDT market not found: Account ${accountName}, Base: ${baseCurrency}`,
        );
        return null; // or throw a custom NotFoundException if you prefer
      }

      this.logger.log(
        `Specific USDT market fetched: Account ${accountName}, Market: ${specificMarket.id}`,
      );
      return specificMarket;
    } catch (error) {
      this.logger.error(
        `Specific USDT market fetch error: Account ${accountName}, Base: ${baseCurrency}. Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException(
        'getSpecificUsdtMarket',
        error,
      );
    }
  }

  async fetchOpenOrders(accountName: string): Promise<Order[]> {
    const exchange = this.getExchange(accountName);
    try {
      const orders = await exchange.fetchOpenOrders();
      this.logger.debug(
        `Fetched ${orders.length} open orders: Account ${accountName}.`,
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `Error fetching open orders for ${accountName} account`,
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
      this.logger.log(
        `WebSocket action performed: Account ${accountName}, Action: ${action}, Topic: ${topic}, Description: ${actionDescription}`,
      );
    } catch (error) {
      this.logger.error(
        `WebSocket action error: Account ${accountName}, Action: ${action}. Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('performWsAction', error);
    }
  }

  cleanResources(accountName: string): void {
    const exchange = this.getExchange(accountName);
    try {
      this.logger.log(`Starting resource cleanup for account ${accountName}.`);
      exchange.cleanResources();
      this.exchangeMap.delete(accountName);
      this.logger.log(
        `Resources cleaned up successfully for account ${accountName}.`,
      );
    } catch (error) {
      this.logger.error(
        `Resource cleanup error for account ${accountName}. Error: ${error.message}`,
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
      this.logger.log(`Fetching open positions for account ${accountName}.`);
      const positions = await exchange.getOpenPositions();
      this.logger.debug(
        `Fetched ${positions.length} open positions for account ${accountName}.`,
      );
      return positions;
    } catch (error) {
      this.logger.error(
        `Error getting open positions for ${accountName} account`,
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
        const errorMessage = `Unrecognized side "${currentPosition.side}" for ${accountName} account. Position not closed. Details: ${positionDetails}`;
        this.logger.error(errorMessage);
        throw new UnrecognizedSideException(accountName, currentPosition.side);
      }

      this.logger.log(
        `Position closed: Account ${accountName}, Details: ${positionDetails}`,
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Error closing position for ${accountName} account. Details: ${positionDetails}`,
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
        `Error opening limit long order for ${accountName} account`,
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
        `Error opening limit short order for ${accountName} account`,
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
        `Error opening market long order for ${accountName} account`,
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
        `Error opening market short order for ${accountName} account`,
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
        `Error updating stop loss for ${accountName} account`,
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
        `Error updating take profit for ${accountName} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('updateTakeProfit', error);
    }
  }

  async closeOrder(
    accountName: string,
    orderId: string,
    symbol: string,
  ): Promise<boolean> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.closeOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(
        `Error closing order for ${accountName} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('closeOrder', error);
    }
  }

  async closeOrdersWithSymbol(
    accountName: string,
    symbol: string,
  ): Promise<boolean> {
    const exchange = this.getExchange(accountName);
    try {
      return await exchange.closeOrdersWithSymbol(symbol);
    } catch (error) {
      this.logger.error(
        `Error closing ${symbol} orders for ${accountName} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException(
        'closeOrdersWithSymbol',
        error,
      );
    }
  }
}
