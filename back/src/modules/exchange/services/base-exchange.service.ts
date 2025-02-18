import { Logger } from '@nestjs/common';
import { Balances, Exchange, Market, Order, Position, Ticker } from 'ccxt';

import { Account } from '@account/entities/account.entity';
import { OrderSide } from '@order/types/order-side.enum';
import { OrderType } from '@order/types/order-type.enum';

import {
  ExchangeOperationFailedException,
  ExchangeTerminationFailedException
} from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../types/exchange-service.interface';

export abstract class BaseExchangeService implements IExchangeService {
  protected readonly logger = new Logger(BaseExchangeService.name);
  protected exchange: Exchange;
  protected readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  abstract initialize(): Promise<boolean>;

  async getBalances(): Promise<Balances> {
    this.logger.debug(`getBalances() - start | accountId=${this.account.id}`);

    try {
      const balances = await this.exchange.fetchBalance();
      this.logger.log(`getBalances() - success | accountId=${this.account.id}`);
      return balances;
    } catch (error) {
      this.logger.error(`getBalances() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getBalances', error.message);
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    this.logger.debug(`getTicker() - start | accountId=${this.account.id}, symbol=${symbol}`);

    try {
      const ticker = await this.exchange.fetchTicker(symbol);
      this.logger.log(`getTicker() - success | accountId=${this.account.id}, symbol=${symbol}`);
      return ticker;
    } catch (error) {
      this.logger.error(
        `getTicker() - error | accountId=${this.account.id}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getTicker', error.message);
    }
  }

  async getMarkets(): Promise<Market[]> {
    this.logger.debug(`getMarkets() - start | accountId=${this.account.id}`);

    try {
      const markets = await this.exchange.fetchMarkets();
      this.logger.log(`getMarkets() - success | accountId=${this.account.id}, count=${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`getMarkets() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getMarkets', error.message);
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    const symbolLog = symbol ? `, symbol=${symbol}` : '';
    this.logger.debug(`getOpenOrders() - start | accountId=${this.account.id}`);

    try {
      const orders = await this.exchange.fetchOpenOrders(symbol);
      this.logger.log(`getOpenOrders() - success | accountId=${this.account.id}, count=${orders.length}${symbolLog}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `getOpenOrders() - error | accountId=${this.account.id}${symbolLog}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOpenOrders', error.message);
    }
  }

  async getClosedOrders(symbol?: string): Promise<Order[]> {
    const symbolLog = symbol ? `, symbol=${symbol}` : '';
    this.logger.debug(`getClosedOrders() - start | accountId=${this.account.id}${symbolLog}`);

    try {
      const orders = await this.exchange.fetchClosedOrders(symbol);
      this.logger.log(`getClosedOrders() - success | accountId=${this.account.id}, count=${orders.length}${symbolLog}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `getClosedOrders() - error | accountId=${this.account.id}${symbolLog}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getClosedOrders', error.message);
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    const symbolLog = symbol ? `, symbol=${symbol}` : '';
    this.logger.debug(`getOrders() - start | accountId=${this.account.id}${symbolLog}`);

    try {
      const orders = await this.exchange.fetchOrders(symbol, undefined, undefined, { orderIds: [] });
      this.logger.log(`getOrders() - success | accountId=${this.account.id}, count=${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `getOrders() - error | accountId=${this.account.id}${symbolLog}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOrders', error.message);
    }
  }

  async getOrder(orderId: string, symbol?: string): Promise<Order> {
    this.logger.debug(`getOrder() - start | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);

    try {
      const order = await this.exchange.fetchOrder(orderId, symbol);
      this.logger.log(`getOrder() - success | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `getOrder() - error | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOrder', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    this.logger.debug(`getOpenPositions() - start | accountId=${this.account.id}`);

    try {
      const positions = await this.exchange.fetchPositions();
      this.logger.log(`getOpenPositions() - success | accountId=${this.account.id}, count=${positions.length}`);
      return positions;
    } catch (error) {
      this.logger.error(`getOpenPositions() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenPositions', error.message);
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
      `openOrder() - start | accountId=${this.account.id}, symbol=${symbol}, type=${type}, side=${side}`
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

      this.logger.log(`openOrder() - success | accountId=${this.account.id}, orderId=${order.id}, symbol=${symbol}`);
      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `openOrder() - error | accountId=${this.account.id}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openOrder', error.message);
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
    this.logger.debug(`updateOrder() - start | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);

    try {
      const order = await this.exchange.editOrder(orderId, symbol, type, side, quantity, price, params);
      this.logger.log(`updateOrder() - success | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `updateOrder() - error | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updateOrder', error.message);
    }
  }

  async closePosition(symbol: string, side: OrderSide): Promise<Order> {
    this.logger.debug(`closePosition() - start | accountId=${this.account.id}, symbol=${symbol}, side=${side}`);

    try {
      const order = await this.exchange.closePosition(symbol, side);
      this.logger.log(
        `closePosition() - success | accountId=${this.account.id}, symbol=${symbol}, side=${side}, orderId=${order.id}`
      );
      return order;
    } catch (error) {
      this.logger.error(
        `closePosition() - error | accountId=${this.account.id}, symbol=${symbol}, side=${side}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closePosition', error.message);
    }
  }

  async cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]> {
    const symbolLog = symbol ? `, symbol=${symbol}` : '';
    this.logger.debug(`cancelOrders() - start | accountId=${this.account.id}${symbolLog}`);

    try {
      const orders = (await this.exchange.cancelAllOrders(symbol, params)) as Order[];
      this.logger.log(`cancelOrders() - success | accountId=${this.account.id}${symbolLog}, count=${orders.length}`);
      return orders.map((order) => ({ ...order, symbol }));
    } catch (error) {
      this.logger.error(
        `cancelOrders() - error | accountId=${this.account.id}${symbolLog}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrders', error.message);
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<Order> {
    this.logger.debug(`cancelOrder() - start | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);

    try {
      const order = (await this.exchange.cancelOrder(orderId, symbol)) as Order;
      this.logger.log(`cancelOrder() - success | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}`);
      return { ...order, symbol };
    } catch (error) {
      this.logger.error(
        `cancelOrder() - error | accountId=${this.account.id}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrder', error.message);
    }
  }

  async clean(): Promise<void> {
    this.logger.debug(`clean() - start | accountId=${this.account.id}`);

    try {
      await this.exchange.close();
      this.logger.log(`clean() - success | accountId=${this.account.id}`);
    } catch (error) {
      this.logger.error(`clean() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeTerminationFailedException(this.account.id, error.message);
    }
  }
}
