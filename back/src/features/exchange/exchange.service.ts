import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Balances, Market, Order, Position } from 'ccxt';
import { Events } from 'src/config';

import { Account } from '../account/entities/account.entity';
import { ExchangeInitializedEvent } from './events/exchange-initialized.event';
import { ExchangeTerminatedEvent } from './events/exchange-terminated.event';
import {
  ClosePositionException,
  ExchangeNotFoundException,
  ExchangeOperationFailedException,
  UnrecognizedSideException
} from './exceptions/exchange.exceptions';
import { IExchangeService } from './exchange.interfaces';
import { ExchangeFactory } from './services/exchange-service.factory';

@Injectable()
export class ExchangeService {
  private logger: Logger = new Logger(ExchangeService.name);
  private exchanges: Map<string, IExchangeService> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory
  ) {}

  async initializeExchange(account: Account): Promise<void> {
    this.logger.debug(`Exchange - Initialization Initiated - AccountID: ${account.id}`);

    if (!account) {
      this.logger.error(`Exchange - Initialization Skipped - Account: ${account.name}, Reason: Missing account`);

      return;
    }

    if (this.exchanges.has(account.id)) {
      this.logger.error(`Exchange - Initialization Skipped - AccountID: ${account.id}, Reason: Already initialized`);

      return;
    }

    try {
      const exchange = await this.exchangeFactory.createExchange(account);

      this.exchanges.set(account.id, exchange);
      this.logger.log(`Exchange - Initialized Successfully - AccountID: ${account.id}`);
      this.eventEmitter.emit(Events.EXCHANGE_INITIALIZED, new ExchangeInitializedEvent(account.id));
    } catch (error) {
      this.logger.error(
        `Exchange - Initialization Failed - AccountID: ${account.id}, Error: ${error.message}`,
        error.stack
      );
    }
  }

  async cleanResources(accountId: string): Promise<void> {
    this.logger.debug(`Exchange - Cleanup Initiated - AccountID: ${accountId}`);

    const exchange = this.getExchange(accountId);

    if (!exchange) {
      this.logger.warn(`Exchange - Cleanup Skipped - AccountID: ${accountId}, Reason: No associated exchange`);

      return;
    }

    try {
      this.logger.log(`Exchange - Cleanup Started - AccountID: ${accountId}`);
      await exchange.clean();
      this.exchanges.delete(accountId);
      this.eventEmitter.emit(Events.EXCHANGE_TERMINATED, new ExchangeTerminatedEvent(accountId));
      this.logger.log(`Exchange - Cleanup Completed - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Exchange - Cleanup Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('cleanResources', error);
    }
  }

  private getExchange(accountId: string): IExchangeService {
    this.logger.debug(`Exchange - Balances Fetch Initiated - AccountID: ${accountId}`);
    const exchange = this.exchanges.get(accountId);

    if (!exchange) {
      this.logger.error(
        `Exchange - Not Found - AccountID: ${accountId}, Reason: Exchange service for account not initialized`
      );
      throw new ExchangeNotFoundException(accountId);
    }

    return exchange;
  }

  async getBalances(accountId: string): Promise<Balances> {
    this.logger.debug(`Exchange - Balances Fetch Initiated - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const balances = await exchange.getBalances();

      this.logger.debug(`Exchange - Balances Fetched - AccountID: ${accountId}, Balances: ${JSON.stringify(balances)}`);

      return balances;
    } catch (error) {
      this.logger.error(
        `Exchange - Balances Fetch Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getBalances', error);
    }
  }

  async getMarkets(accountId: string): Promise<Market[]> {
    this.logger.debug(`Exchange - Markets Fetch Initiated - AccountID: ${accountId}`);

    const exchange = this.getExchange(accountId);

    try {
      const markets = await exchange.getMarkets();

      this.logger.debug(`Exchange - Markets Fetched - AccountID: '${accountId}', Count: ${markets.length}`);

      return markets;
    } catch (error) {
      this.logger.error(
        `Exchange - Markets Fetch Failed - AccountID: '${accountId}', Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getMarkets', error);
    }
  }

  async getOpenOrders(accountId: string): Promise<Order[]> {
    this.logger.debug(`Exchange - Open Orders Fetch Initiated - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOpenOrders();

      this.logger.debug(`Exchange - Open Orders Fetched - AccountID: ${accountId}, Count: ${orders.length}`);

      return orders;
    } catch (error) {
      this.logger.error(
        `Exchange - Open Orders Fetch Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetchOpenOrders', error);
    }
  }

  async getOpenPositions(accountId: string): Promise<Position[]> {
    this.logger.debug(`Exchange - Open Positions Fetch Initiated - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const positions = await exchange.getOpenPositions();

      this.logger.debug(`Exchange - Open Positions Fetched - AccountID: ${accountId}, Count: ${positions.length}`);

      return positions;
    } catch (error) {
      this.logger.error(
        `Exchange - Open Positions Fetch Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOpenPositions', error);
    }
  }

  async closePosition(accountId: string, currentPosition: Position): Promise<Order> {
    const positionDetails = `${currentPosition.id} ${currentPosition.contracts} ${currentPosition.symbol} ${currentPosition.side}`;

    this.logger.debug(
      `Exchange - Position Close Initiated - AccountID: ${accountId}, Position Details: ${positionDetails}`
    );

    try {
      let order: Order;

      if (currentPosition.side === 'long') {
        order = await this.openMarketShortOrder(accountId, currentPosition.symbol, currentPosition.contracts);
      } else if (currentPosition.side === 'short') {
        order = await this.openMarketLongOrder(accountId, currentPosition.symbol, currentPosition.contracts);
      } else {
        const errorMessage = `Exchange - Close Position Failed - AccountID: ${accountId}, Position Details: ${positionDetails}, Reason: Unrecognized side '${currentPosition.side}'`;

        this.logger.error(errorMessage);
        throw new UnrecognizedSideException(accountId, currentPosition.side);
      }

      this.logger.log(`Exchange - Position Closed - AccountID: ${accountId}, Position Details: ${positionDetails}`);

      return order;
    } catch (error) {
      this.logger.error(
        `Exchange - Position Close Failed - AccountID: ${accountId}, Position Details: ${positionDetails}, Error: ${error.message}`,
        error.stack
      );
      throw new ClosePositionException(accountId, currentPosition.id, error);
    }
  }

  async openLimitLongOrder(accountId: string, symbol: string, size: number, price: number): Promise<Order> {
    this.logger.log(
      `Exchange - Limit Long Order Open Initiated - AccountID: ${accountId}, Symbol: ${symbol}, Size: ${size}, Price: ${price}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.openLimitLongOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Exchange - Limit Long Order Open Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openLimitLongOrder', error);
    }
  }

  async openLimitShortOrder(accountId: string, symbol: string, size: number, price: number): Promise<Order> {
    this.logger.log(
      `Exchange - Limit Short Order Open Initiated - AccountID: ${accountId}, Symbol: ${symbol}, Size: ${size}, Price: ${price}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.openLimitShortOrder(symbol, size, price);
    } catch (error) {
      this.logger.error(
        `Exchange - Limit Short Order Open Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openLimitShortOrder', error);
    }
  }

  async openMarketLongOrder(accountId: string, symbol: string, size: number): Promise<Order> {
    this.logger.log(
      `Exchange - Market Long Order Open Initiated - AccountID: ${accountId}, Symbol: ${symbol}, Size: ${size}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.openMarketLongOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Exchange - Market Long Order Open Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openMarketLongOrder', error);
    }
  }

  async openMarketShortOrder(accountId: string, symbol: string, size: number): Promise<Order> {
    this.logger.log(
      `Exchange - Market Short Order Open Initiated - AccountID: ${accountId}, Symbol: ${symbol}, Size: ${size}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.openMarketShortOrder(symbol, size);
    } catch (error) {
      this.logger.error(
        `Exchange - Market Short Order Open Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openMarketShortOrder', error);
    }
  }

  async updateStopLoss(
    accountId: string,
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number
  ): Promise<Order> {
    this.logger.log(
      `Exchange - Stop Loss Update Initiated - AccountID: ${accountId}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Stop Loss Price: ${stopLossPrice}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.updateStopLoss(orderId, symbol, amount, stopLossPrice);
    } catch (error) {
      this.logger.error(
        `Exchange - Stop Loss Update Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updateStopLoss', error);
    }
  }

  async updateTakeProfit(
    accountId: string,
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number
  ): Promise<Order> {
    this.logger.log(
      `Exchange - Take Profit Update Initiated - AccountID: ${accountId}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Take Profit Price: ${takeProfitPrice}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.updateTakeProfit(orderId, symbol, amount, takeProfitPrice);
    } catch (error) {
      this.logger.error(
        `Exchange - Take Profit Update Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updateTakeProfit', error);
    }
  }

  async closeOrder(accountId: string, orderId: string, symbol: string): Promise<boolean> {
    this.logger.log(
      `Exchange - Order Close Initiated - AccountID: ${accountId}, OrderID: ${orderId}, Symbol: ${symbol}`
    );
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.closeOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(
        `Exchange - Order Close Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closeOrder', error);
    }
  }

  async closeOrdersWithSymbol(accountId: string, symbol: string): Promise<boolean> {
    this.logger.log(`Exchange - Orders Close With Symbol Initiated - AccountID: ${accountId}, Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      // TODO add logs
      return await exchange.closeOrdersWithSymbol(symbol);
    } catch (error) {
      this.logger.error(
        `Exchange - Orders Close With Symbol Failed - AccountID: ${accountId}, Symbol: ${symbol}, Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closeOrdersWithSymbol', error);
    }
  }
}
