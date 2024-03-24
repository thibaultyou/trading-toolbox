import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Balances, Market, Order } from 'ccxt';
import { Events } from 'src/config';

import { Account } from '../account/entities/account.entity';
import { Position } from '../position/position.types';
import { ExchangeInitializedEvent } from './events/exchange-initialized.event';
import {
  ClosePositionException,
  ExchangeNotFoundException,
  ExchangeOperationFailedException,
  UnrecognizedSideException,
} from './exceptions/exchange.exceptions';
import { IExchangeService } from './exchange.interfaces';
import { ExchangeFactory } from './services/exchange-service.factory';

@Injectable()
export class ExchangeService {
  private logger: Logger = new Logger(ExchangeService.name);
  private exchanges: Map<string, IExchangeService> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory,
  ) {}

  async initializeExchange(account: Account): Promise<void> {
    if (!account) {
      this.logger.error(
        `Exchange initialization skipped - Exchange: ${account.exchange}, Account: ${account.name}, Reason: Missing account`,
      );

      return;
    }

    if (this.exchanges.has(account.id)) {
      this.logger.error(
        `Exchange initialization skipped - Exchange: ${account.exchange}, AccountID: ${account.id}, Reason: Already initialized`,
      );

      return;
    }

    try {
      const exchange = await this.exchangeFactory.createExchange(account);

      this.exchanges.set(account.id, exchange);
      this.eventEmitter.emit(
        Events.EXCHANGE_INITIALIZED,
        new ExchangeInitializedEvent(account.id, account.exchange),
      );
      this.logger.log(
        `Exchange initialized - Exchange: ${account.exchange}, AccountID: ${account.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Exchange initialization failed - Exchange: ${account.exchange}, AccountID: ${account.id}, Error: ${error.message}`,
        error.stack,
      );
    }
  }

  getInitializedAccountIds(): string[] {
    return Array.from(this.exchanges.keys());
  }

  cleanResources(accountId: string): void {
    const exchange = this.getExchange(accountId);

    try {
      this.logger.log(`Starting resource cleanup for account ${accountId}.`);
      exchange.clean();
      this.exchanges.delete(accountId);
      this.logger.log(
        `Resources cleaned up successfully for account ${accountId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Resource cleanup error for account ${accountId}. Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('cleanResources', error);
    }
  }

  private getExchange(accountId: string): IExchangeService {
    const exchange = this.exchanges.get(accountId);

    if (!exchange) {
      throw new ExchangeNotFoundException(accountId);
    }

    return exchange;
  }

  async getBalances(accountId: string): Promise<Balances> {
    const exchange = this.getExchange(accountId);

    try {
      const balances = await exchange.getBalances();

      this.logger.debug(
        `Balances fetched - AccountID: '${accountId}', Balances: ${JSON.stringify(balances)}`,
      );

      return balances;
    } catch (error) {
      this.logger.error(
        `Balances fetching failed - AccountID: '${accountId}', Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getBalances', error);
    }
  }

  async getMarkets(accountId: string): Promise<Market[]> {
    const exchange = this.getExchange(accountId);

    try {
      const markets = await exchange.getMarkets();

      this.logger.debug(
        `Markets fetched - AccountID: '${accountId}', Markets count: ${markets.length}`,
      );

      return markets;
    } catch (error) {
      this.logger.error(
        `Markets fetching failed - AccountID: '${accountId}', Error: ${error.message}`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getMarkets', error);
    }
  }

  async getOpenOrders(accountId: string): Promise<Order[]> {
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOpenOrders();

      this.logger.debug(
        `Fetched ${orders.length} open orders: Account ${accountId}.`,
      );

      return orders;
    } catch (error) {
      this.logger.error(
        `Error fetching open orders for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('fetchOpenOrders', error);
    }
  }

  async getOpenPositions(accountId: string): Promise<any> {
    const exchange = this.getExchange(accountId);

    try {
      this.logger.log(`Fetching open positions for account ${accountId}.`);
      const positions = await exchange.getOpenPositions();

      this.logger.debug(
        `Fetched ${positions.length} open positions for account ${accountId}.`,
      );

      return positions;
    } catch (error) {
      this.logger.error(
        `Error getting open positions for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('getOpenPositions', error);
    }
  }

  async closePosition(
    accountId: string,
    currentPosition: Position,
  ): Promise<Order> {
    const positionDetails = `${currentPosition.contracts} ${currentPosition.symbol} ${currentPosition.side}`;

    try {
      let order: Order;

      if (currentPosition.side === 'long') {
        order = await this.openMarketShortOrder(
          accountId,
          currentPosition.symbol,
          currentPosition.contracts,
        );
      } else if (currentPosition.side === 'short') {
        order = await this.openMarketLongOrder(
          accountId,
          currentPosition.symbol,
          currentPosition.contracts,
        );
      } else {
        const errorMessage = `Unrecognized side "${currentPosition.side}" for ${accountId} account. Position not closed. Details: ${positionDetails}`;

        this.logger.error(errorMessage);
        throw new UnrecognizedSideException(accountId, currentPosition.side);
      }

      this.logger.log(
        `Position closed: Account ${accountId}, Details: ${positionDetails}`,
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Error closing position for ${accountId} account. Details: ${positionDetails}`,
        error.stack,
      );
      throw new ClosePositionException(accountId, error);
    }
  }

  async openLimitLongOrder(
    accountId: string,
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.openLimitLongOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Error opening limit long order for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openLimitLongOrder', error);
    }
  }

  async openLimitShortOrder(
    accountId: string,
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.openLimitShortOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Error opening limit short order for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openLimitShortOrder', error);
    }
  }

  async openMarketLongOrder(
    accountId: string,
    symbol: string,
    size: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.openMarketLongOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Error opening market long order for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openMarketLongOrder', error);
    }
  }

  async openMarketShortOrder(
    accountId: string,
    symbol: string,
    size: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.openMarketShortOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Error opening market short order for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('openMarketShortOrder', error);
    }
  }

  async updateStopLoss(
    accountId: string,
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.updateStopLoss(
        orderId,
        symbol,
        amount,
        stopLossPrice,
      );
    } catch (error) {
      this.logger.error(
        `Error updating stop loss for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('updateStopLoss', error);
    }
  }

  async updateTakeProfit(
    accountId: string,
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number,
  ): Promise<Order> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.updateTakeProfit(
        orderId,
        symbol,
        amount,
        takeProfitPrice,
      );
    } catch (error) {
      this.logger.error(
        `Error updating take profit for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('updateTakeProfit', error);
    }
  }

  async closeOrder(
    accountId: string,
    orderId: string,
    symbol: string,
  ): Promise<boolean> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.closeOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(
        `Error closing order for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException('closeOrder', error);
    }
  }

  async closeOrdersWithSymbol(
    accountId: string,
    symbol: string,
  ): Promise<boolean> {
    const exchange = this.getExchange(accountId);

    try {
      return await exchange.closeOrdersWithSymbol(symbol);
    } catch (error) {
      this.logger.error(
        `Error closing ${symbol} orders for ${accountId} account`,
        error.stack,
      );
      throw new ExchangeOperationFailedException(
        'closeOrdersWithSymbol',
        error,
      );
    }
  }
}
