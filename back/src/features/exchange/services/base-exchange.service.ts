import { Logger } from '@nestjs/common';
import { Balances, Exchange, Market, Order, Position, Ticker } from 'ccxt';

import { Account } from '../../account/entities/account.entity';
import { OrderSide } from '../../order/types/order-side.enum';
import { OrderType } from '../../order/types/order-type.enum';
import {
  ExchangeOperationFailedException,
  ExchangeTerminationFailedException
} from '../exchange.exceptions';
import { IExchangeService } from '../exchange-service.interface';

// TODO improve logging, error handling, custom exceptions

export abstract class BaseExchangeService implements IExchangeService {
  protected readonly logger = new Logger(BaseExchangeService.name);
  protected exchange: Exchange;
  protected readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  abstract initialize(): Promise<boolean>;

  async getBalances(): Promise<Balances> {
    this.logger.debug(`Fetching balances - AccountID: ${this.account.id}`);

    try {
      const balances = await this.exchange.fetchBalance();
      this.logger.log(`Fetched balances - AccountID: ${this.account.id}`);
      return balances;
    } catch (error) {
      this.logger.error(
        `Failed to fetch balances - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching balances', error.message);
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    this.logger.debug(`Fetching ticker - AccountID: ${this.account.id} - Symbol: ${symbol}`);

    try {
      const ticker = await this.exchange.fetchTicker(symbol);
      this.logger.log(`Fetched ticker - AccountID: ${this.account.id} - Symbol: ${symbol}`);
      return ticker;
    } catch (error) {
      this.logger.error(
        `Failed to fetch ticker - AccountID: ${this.account.id} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching ticker', error.message);
    }
  }

  async getMarkets(): Promise<Market[]> {
    this.logger.debug(`Fetching markets - AccountID: ${this.account.id}`);

    try {
      const markets = await this.exchange.fetchMarkets();
      this.logger.log(`Fetched markets - AccountID: ${this.account.id} - Count: ${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(
        `Failed to fetch markets - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching markets', error.message);
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    this.logger.debug(`Fetching open orders - AccountID: ${this.account.id}`);

    try {
      const orders = await this.exchange.fetchOpenOrders();
      this.logger.log(`Fetched open orders - AccountID: ${this.account.id} - Count: ${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to fetch open orders - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching open orders', error.message);
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    this.logger.debug(`Fetching orders - AccountID: ${this.account.id}${symbol ? ` - Symbol: ${symbol}` : ''}`);

    try {
      const orders = await this.exchange.fetchOrders(symbol, undefined, undefined, { orderIds: [] });
      this.logger.log(`Fetched orders - AccountID: ${this.account.id} - Count: ${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders - AccountID: ${this.account.id}${symbol ? ` - Symbol: ${symbol}` : ''} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching orders', error.message);
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<Order> {
    this.logger.debug(`Fetching order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol}`);

    try {
      const order = await this.exchange.fetchOrder(orderId, symbol);
      this.logger.log(`Fetched order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to fetch order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching order', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    this.logger.debug(`Fetching open positions - AccountID: ${this.account.id}`);

    try {
      const positions = await this.exchange.fetchPositions();
      this.logger.log(`Fetched open positions - AccountID: ${this.account.id} - Count: ${positions.length}`);
      return positions;
    } catch (error) {
      this.logger.error(
        `Failed to fetch open positions - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching open positions', error.message);
    }
  }

  async openOrder(
    symbol: string,
    type: OrderType,
    side: OrderSide,
    quantity: number,
    price?: number,
    takeProfitPrice?: number,
    stopLossPrice?: number,
    params?: Record<string, any>
  ): Promise<Order> {
    this.logger.debug(
      `Opening order - AccountID: ${this.account.id} - Symbol: ${symbol} - Type: ${type} - Side: ${side}`
    );

    try {
      let order: Order;

      if (stopLossPrice || takeProfitPrice) {
        order = await this.exchange.createOrderWithTakeProfitAndStopLoss(
          symbol,
          type,
          side,
          quantity,
          price,
          takeProfitPrice,
          stopLossPrice,
          params
        );
      } else {
        order = await this.exchange.createOrder(symbol, type, side, quantity, price, params);
      }

      this.logger.log(
        `Opened order - AccountID: ${this.account.id} - OrderID: ${order.id} - Symbol: ${symbol} - Type: ${type} - Side: ${side} - Quantity: ${quantity} - Price: ${price}`
      );
      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `Failed to open order - AccountID: ${this.account.id} - Symbol: ${symbol} - Type: ${type} - Side: ${side} - Quantity: ${quantity} - Price: ${price} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('opening order', error.message);
    }
  }

  async updateOrder(
    orderId: string,
    symbol: string,
    type: string,
    side: OrderSide,
    quantity?: number,
    price?: number,
    params?: Record<string, any>
  ): Promise<Order> {
    this.logger.debug(`Updating order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol}`);

    try {
      const order = await this.exchange.editOrder(orderId, symbol, type, side, quantity, price, params);
      this.logger.log(
        `Updated order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol} - Type: ${type} - Side: ${side} - Quantity: ${quantity} - Price: ${price}`
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to update order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol} - Type: ${type} - Side: ${side} - Quantity: ${quantity} - Price: ${price} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updating order', error.message);
    }
  }

  async closePosition(symbol: string, side: OrderSide): Promise<Order> {
    this.logger.debug(`Closing position - AccountID: ${this.account.id} - Symbol: ${symbol} - Side: ${side}`);

    try {
      const order = await this.exchange.closePosition(symbol, side);
      this.logger.log(
        `Closed position - AccountID: ${this.account.id} - Symbol: ${symbol} - Side: ${side} - OrderID: ${order.id}`
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to close position - AccountID: ${this.account.id} - Symbol: ${symbol} - Side: ${side} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closing position', error.message);
    }
  }

  async cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]> {
    this.logger.debug(`Cancelling orders - AccountID: ${this.account.id}${symbol ? ` - Symbol: ${symbol}` : ''}`);

    try {
      const orders = (await this.exchange.cancelAllOrders(symbol, params)) as Order[];
      this.logger.log(
        `Cancelled orders - AccountID: ${this.account.id}${symbol ? ` - Symbol: ${symbol}` : ''} - Count: ${orders.length}`
      );
      return orders.map((order) => ({ ...order, symbol }));
    } catch (error) {
      this.logger.error(
        `Failed to cancel orders - AccountID: ${this.account.id}${symbol ? ` - Symbol: ${symbol}` : ''} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelling orders', error.message);
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<Order> {
    this.logger.debug(`Cancelling order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol}`);

    try {
      const order = (await this.exchange.cancelOrder(orderId, symbol)) as Order;
      this.logger.log(`Cancelled order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol}`);
      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `Failed to cancel order - AccountID: ${this.account.id} - OrderID: ${orderId} - Symbol: ${symbol} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelling order', error.message);
    }
  }

  async clean() {
    this.logger.debug(`Cleaning up exchange - AccountID: ${this.account.id}`);

    try {
      await this.exchange.close();
      this.logger.log(`Cleaned up exchange - AccountID: ${this.account.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to clean up exchange - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeTerminationFailedException(this.account.id, error.message);
    }
  }
}

// getBalances = (): TE.TaskEither<Error, Balances> =>
//   pipe(
//     TE.tryCatch(() => this.exchange.fetchBalance(), toError),
//     TE.tap(logEffect(this.logger, `Exchange - Fetched Balances Successfully - AccountID: ${this.account.id}`)),
//     // TE.mapError((error) => new ExchangeOperationFailedException('fetching balances', String(error))),
//     TE.tapError(logError(this.logger, `Exchange - Failed to Fetch Balances - AccountID: ${this.account.id}`))
//   );

//   async updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order> {
//   try {
//     const updatedOrder = await this.editOrder(
//       orderId,
//       symbol,
//       'stop_loss',
//       'sell',
//       amount,
//       stopLossPrice,
//       'updating stop loss'
//     );

//     this.logger.log(
//       `Stop Loss Updated - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Stop Loss Price: ${stopLossPrice}`
//     );

//     return updatedOrder;
//   } catch (error) {
//     throw error;
//   }
// }

// async updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order> {
//   try {
//     const updatedOrder = await this.editOrder(
//       orderId,
//       symbol,
//       'take_profit',
//       'sell',
//       amount,
//       takeProfitPrice,
//       'updating take profit'
//     );

//     this.logger.log(
//       `Take Profit Updated - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Take Profit Price: ${takeProfitPrice}`
//     );

//     return updatedOrder;
//   } catch (error) {
//     throw error;
//   }
// }
