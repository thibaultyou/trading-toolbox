import { Logger } from '@nestjs/common';
import ccxt, { Balances, Exchange, Market, Order, Position } from 'ccxt';

import { Account } from '../../account/entities/account.entity';
import { OrderSide, OrderType } from '../../order/order.types';
import {
  ExchangeOperationFailedException,
  ExchangeTerminationFailedException
} from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../exchange.interfaces';

// TODO improve logging, error handling, custom exceptions

export abstract class AbstractExchangeService implements IExchangeService {
  protected readonly logger = new Logger(AbstractExchangeService.name);
  protected exchange: Exchange;
  protected readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  abstract initialize(): Promise<boolean>;

  async testCredentials(): Promise<void> {
    try {
      await this.exchange.fetchBalance();
    } catch (error) {
      const errMsg = `Credentials Verification Failed - Account: ${this.account.name}, Error: ${error.message}`;

      this.logger.error(errMsg, error.stack);

      if (error instanceof ccxt.AuthenticationError) {
        throw new ExchangeOperationFailedException('verifying credentials', errMsg);
      }

      throw new ExchangeOperationFailedException('verifying credentials', error.message);
    }
  }

  async getBalances(): Promise<Balances> {
    try {
      const balances = await this.exchange.fetchBalance();

      this.logger.log(`Fetched Balances Successfully - AccountID: ${this.account.id}`);

      return balances;
    } catch (error) {
      this.logger.error(`Failed to Fetch Balances - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching balances', error.message);
    }
  }

  async getMarkets(): Promise<Market[]> {
    try {
      const markets = await this.exchange.fetchMarkets();

      this.logger.log(`Fetched Markets Successfully - AccountID: ${this.account.id}`);

      return markets;
    } catch (error) {
      this.logger.error(`Failed to Fetch Markets - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching markets', error.message);
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchOpenOrders();

      this.logger.log(`Fetched Open Orders Successfully - AccountID: ${this.account.id}`);

      return orders;
    } catch (error) {
      this.logger.error(`Failed to Fetch Open Orders - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching open orders', error.message);
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchOrders(symbol, undefined, undefined, { orderIds: [] });

      this.logger.log(`Fetched Orders Successfully - AccountID: ${this.account.id}`);

      return orders;
    } catch (error) {
      this.logger.error(`Failed to Fetch Orders - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching orders', error.message);
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      const order = await this.exchange.fetchOrder(orderId, symbol);

      this.logger.log(
        `Fetched Order Successfully - AccountID: ${this.account.id}, OrderID: ${orderId}, MarketID: ${symbol}`
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Failed to Fetch Order - AccountID: ${this.account.id}, OrderID: ${orderId}, MarketID: ${symbol}, Error: ${error.message}`
      );
      throw new ExchangeOperationFailedException('fetching order', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    try {
      const positions = await this.exchange.fetchPositions();

      this.logger.log(`Fetched Open Positions Successfully - AccountID: ${this.account.id}`);

      return positions;
    } catch (error) {
      this.logger.error(`Failed to Fetch Open Positions - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching open positions', error.message);
    }
  }

  async openOrder(
    symbol: string,
    side: OrderSide,
    volume: number,
    price?: number,
    stopLossPrice?: number,
    takeProfitPrice?: number,
    params?: Record<string, any>
  ): Promise<Order> {
    const orderType = price ? OrderType.Limit : OrderType.Market;

    try {
      let order: Order;

      if (stopLossPrice || takeProfitPrice) {
        order = await this.exchange.createOrderWithTakeProfitAndStopLoss(
          symbol,
          orderType,
          side,
          volume,
          price,
          takeProfitPrice,
          stopLossPrice,
          params
        );
      } else {
        order = await this.exchange.createOrder(symbol, orderType, side, volume, price, params);
      }

      this.logger.log(
        `${orderType} Order Opened - OrderID: ${order.id}, Side: ${side}, Symbol: ${symbol}, Volume: ${volume}, Price: ${price}`
      );

      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `Failed to Open ${orderType} Order - Side: ${side}, Symbol: ${symbol}, Volume: ${volume}, Price: ${price}. Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('opening order', error.message);
    }
  }

  async closePosition(symbol: string, side: OrderSide): Promise<Order> {
    try {
      const order = await this.exchange.closePosition(symbol, side);

      this.logger.log(`Position Closed - AccountID: ${this.account.id}, Order: ${JSON.stringify(order)}`);

      return order;
    } catch (error) {
      this.logger.error(`Failed to Close Position - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('close position', error.message);
    }
  }

  // async updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order> {
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

  // private async editOrder(
  //   orderId: string,
  //   symbol: string,
  //   type: string,
  //   side: string,
  //   amount: number,
  //   price: number,
  //   actionDescription: string
  // ): Promise<Order> {
  //   try {
  //     const order = await this.exchange.editOrder(orderId, symbol, type, side, amount, price);

  //     this.logger.log(
  //       `Order Edited - AccountID: ${this.account.id}, Type: ${type}, Side: ${side}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Price: ${price}`
  //     );

  //     return order;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to Edit Order - AccountID: ${this.account.id}, Type: ${type}, Side: ${side}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Price: ${price}, Error: ${error.message}`
  //     );
  //     throw new ExchangeOperationFailedException(actionDescription, error.message);
  //   }
  // }

  async cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]> {
    try {
      const orders = (await this.exchange.cancelAllOrders(symbol, params)) as Order[];

      this.logger.log(
        `Orders Cancelled - AccountID: ${this.account.id}${symbol ? `, Symbol: ${symbol}` : ''}${params ? `, Details: ${params}` : ''}`
      );

      return orders.map((order) => ({ ...order, symbol }));
    } catch (error) {
      this.logger.error(
        `Failed to Cancel Orders - AccountID: ${this.account.id}${symbol ? `, Symbol: ${symbol}` : ''}${params ? `, Details: ${params}` : ''}, Error: ${error.message}`
      );
      throw new ExchangeOperationFailedException('cancel orders', error.message);
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      const order = (await this.exchange.cancelOrder(orderId, symbol)) as Order;

      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `Failed to Cancel Order - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Error: ${error.message}`
      );
      throw new ExchangeOperationFailedException('cancel order', error.message);
    }
  }

  async clean() {
    try {
      await this.exchange.close();
      this.logger.log(`Termination Successful - AccountID: ${this.account.id}`);
    } catch (error) {
      const errMsg = `Termination Failed - AccountID: ${this.account.id}, Error: ${error.message}`;

      this.logger.error(errMsg);
      throw new ExchangeTerminationFailedException(this.account.id, errMsg);
    }
  }
}
