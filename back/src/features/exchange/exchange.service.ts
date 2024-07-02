import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Balances, Market, Order, Position, Ticker } from 'ccxt';

import { Events } from '../../config';
import { Account } from '../account/entities/account.entity';
import { OrderSide } from '../order/types/order-side.enum';
import { OrderType } from '../order/types/order-type.enum';
import { ExchangeInitializedEvent } from './events/exchange-initialized.event';
import { ExchangeTerminatedEvent } from './events/exchange-terminated.event';
import { ExchangeNotFoundException, ExchangeOperationFailedException } from './exchange.exceptions';
import { IExchangeService } from './types/exchange-service.interface';
import { ExchangeFactory } from './services/exchange-service.factory';

// TODO move bybit related content out of here
// TODO improve logging, error handling, custom exceptions

@Injectable()
export class ExchangeService {
  private logger = new Logger(ExchangeService.name);
  private exchanges: Map<string, IExchangeService> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory
  ) {}

  async initializeExchange(account: Account) {
    this.logger.debug(`Initializing exchange - AccountID: ${account.id}`);

    if (!account) {
      this.logger.warn(`Exchange initialization skipped - AccountID: ${account.id} - Reason: Missing account`);
      return;
    }

    if (this.exchanges.has(account.id)) {
      this.logger.warn(`Exchange initialization skipped - AccountID: ${account.id} - Reason: Already initialized`);
      return;
    }

    try {
      const exchange = await this.exchangeFactory.createExchange(account);
      this.exchanges.set(account.id, exchange);
      this.logger.log(`Initialized exchange - AccountID: ${account.id}`);
      this.eventEmitter.emit(Events.EXCHANGE_INITIALIZED, new ExchangeInitializedEvent(account.id));
    } catch (error) {
      this.logger.error(
        `Exchange initialization failed - AccountID: ${account.id} - Error: ${error.message}`,
        error.stack
      );
    }
  }

  private getExchange(accountId: string): IExchangeService {
    this.logger.debug(`Fetching exchange - AccountID: ${accountId}`);
    const exchange = this.exchanges.get(accountId);

    if (!exchange) {
      this.logger.warn(`Exchange not found - AccountID: ${accountId} - Reason: Exchange service not initialized`);
      throw new ExchangeNotFoundException(accountId);
    }
    return exchange;
  }

  async getBalances(accountId: string): Promise<Balances> {
    this.logger.debug(`Fetching balances - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const balances = await exchange.getBalances();
      this.logger.log(`Fetched balances - AccountID: ${accountId}`);
      return balances;
    } catch (error) {
      this.logger.error(`Balances fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getBalances', error);
    }
  }

  async getTicker(accountId: string, symbol: string): Promise<Ticker> {
    this.logger.debug(`Fetching ticker - AccountID: ${accountId} - Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const ticker = await exchange.getTicker(symbol);
      this.logger.log(`Fetched ticker - AccountID: ${accountId} - Symbol: ${symbol}`);
      return ticker;
    } catch (error) {
      this.logger.error(
        `Ticker fetch failed - AccountID: ${accountId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getTicker', error);
    }
  }

  async getMarkets(accountId: string): Promise<Market[]> {
    this.logger.debug(`Fetching markets - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const markets = await exchange.getMarkets();
      this.logger.log(`Fetched markets - AccountID: ${accountId} - Count: ${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`Markets fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getMarkets', error);
    }
  }

  async getOpenOrders(accountId: string): Promise<Order[]> {
    this.logger.debug(`Fetching open orders - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOpenOrders();
      this.logger.log(`Fetched open orders - AccountID: ${accountId} - Count: ${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(`Open orders fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('fetchOpenOrders', error);
    }
  }

  async getOrders(accountId: string, symbol?: string): Promise<Order[]> {
    this.logger.debug(`Fetching orders - AccountID: ${accountId}${symbol ? ` - Symbol: ${symbol}` : ''}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOrders(symbol);
      this.logger.log(
        `Fetched orders - AccountID: ${accountId} - Count: ${orders.length}${symbol ? ` - Symbol: ${symbol}` : ''}`
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `Orders fetch failed - AccountID: ${accountId}${symbol ? ` - Symbol: ${symbol}` : ''} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetchOrders', error);
    }
  }

  async getOrder(accountId: string, symbol: string, orderId: string): Promise<Order> {
    this.logger.debug(`Fetching order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.getOrder(orderId, symbol);
      this.logger.log(`Fetched order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Order fetch failed - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetchOrder', error);
    }
  }

  async getOpenPositions(accountId: string): Promise<Position[]> {
    this.logger.debug(`Fetching open positions - AccountID: ${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const positions = await exchange.getOpenPositions();
      this.logger.log(`Fetched open positions - AccountID: ${accountId} - Count: ${positions.length}`);
      return positions;
    } catch (error) {
      this.logger.error(`Open positions fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenPositions', error);
    }
  }

  async openOrder(
    accountId: string,
    symbol: string,
    type: OrderType,
    side: OrderSide,
    quantity: number,
    price?: number,
    takeProfitPrice?: number,
    stopLossPrice?: number,
    params?: Record<string, any>
  ): Promise<Order> {
    this.logger.debug(`Opening order - AccountID: ${accountId} - Symbol: ${symbol} - Type: ${type} - Side: ${side}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.openOrder(
        symbol,
        type,
        side,
        quantity,
        price,
        takeProfitPrice,
        stopLossPrice,
        params
      );
      this.logger.log(`Opened order - AccountID: ${accountId} - OrderID: ${order.id} - Symbol: ${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Order opening failed - AccountID: ${accountId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openOrder', error);
    }
  }

  async updateOrder(
    accountId: string,
    orderId: string,
    symbol: string,
    type: string,
    side: OrderSide,
    quantity?: number,
    price?: number,
    params?: Record<string, any>
  ): Promise<Order> {
    this.logger.debug(`Updating order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.updateOrder(orderId, symbol, type, side, quantity, price, params);
      this.logger.log(`Updated order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Order update failed - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updateOrder', error);
    }
  }

  async closePosition(accountId: string, symbol: string, side: OrderSide, quantity: number): Promise<Order> {
    this.logger.debug(`Closing position - AccountID: ${accountId} - Symbol: ${symbol} - Side: ${side}`);

    try {
      const order = await this.openOrder(
        accountId,
        symbol,
        OrderType.MARKET,
        side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
        quantity,
        undefined,
        undefined,
        undefined,
        { positionIdx: side === OrderSide.BUY ? 1 : 2 }
      );
      this.logger.log(`Closed position - AccountID: ${accountId} - Symbol: ${symbol} - Side: ${side}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Position closing failed - AccountID: ${accountId} - Symbol: ${symbol} - Side: ${side} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closePosition', error);
    }
  }

  async cancelOrder(accountId: string, orderId: string, symbol: string): Promise<Order> {
    this.logger.debug(`Cancelling order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.cancelOrder(orderId, symbol);

      if (!order) {
        this.logger.warn(
          `Order cancellation failed - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol} - Reason: No order returned`
        );
      } else {
        this.logger.log(`Cancelled order - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol}`);
      }
      return order;
    } catch (error) {
      this.logger.error(
        `Order cancellation failed - AccountID: ${accountId} - OrderID: ${orderId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrder', error);
    }
  }

  async cancelOrders(accountId: string, symbol: string): Promise<Order[]> {
    this.logger.debug(`Cancelling orders - AccountID: ${accountId} - Symbol: ${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.cancelOrders(symbol);

      if (orders.length === 0) {
        this.logger.warn(`Orders cancellation - No orders to cancel - AccountID: ${accountId} - Symbol: ${symbol}`);
      } else {
        this.logger.log(`Cancelled orders - AccountID: ${accountId} - Symbol: ${symbol} - Count: ${orders.length}`);
      }
      return orders;
    } catch (error) {
      this.logger.error(
        `Orders cancellation failed - AccountID: ${accountId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrders', error);
    }
  }

  async cleanResources(accountId: string) {
    this.logger.debug(`Cleaning up exchange resources - AccountID: ${accountId}`);

    const exchange = this.getExchange(accountId);

    if (!exchange) {
      this.logger.warn(`Exchange cleanup skipped - AccountID: ${accountId} - Reason: No associated exchange`);
      return;
    }

    try {
      await exchange.clean();
      this.exchanges.delete(accountId);
      this.eventEmitter.emit(Events.EXCHANGE_TERMINATED, new ExchangeTerminatedEvent(accountId));
      this.logger.log(`Cleaned up exchange resources - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Exchange cleanup failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('cleanResources', error);
    }
  }
}

// getBalances = (accountId: string): TE.TaskEither<Error, Balances> =>
//   pipe(
//     TE.right(accountId),
//     TE.tapIO((id) => logEffect(this.logger, `Balances - Fetch Initiated - AccountID: ${id}`)(id)),
//     TE.flatMap(() => this.getExchange(accountId).getBalances()),
//     TE.tapIO((balances) =>
//       logEffect(
//         this.logger,
//         `Balances - Fetched - AccountID: ${accountId}`
//       )(balances)
//     ),
//     TE.mapError((error) => new ExchangeOperationFailedException('getBalances', error.message)),
//     TE.tapError((error) => logError(this.logger, `Balances Fetch Failed - AccountID: ${accountId}`)(error))
//   );
