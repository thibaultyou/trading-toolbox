import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Timeout } from '@nestjs/schedule';
import { Balances, Market, Order, Position, Ticker } from 'ccxt';

import { AccountService } from '@account/account.service';
import { Account } from '@account/entities/account.entity';
import { Events, Timers } from '@config';
import { OrderSide } from '@order/types/order-side.enum';
import { OrderType } from '@order/types/order-type.enum';

import { ExchangeInitializedEvent } from './events/exchange-initialized.event';
import { ExchangeTerminatedEvent } from './events/exchange-terminated.event';
import { ExchangeNotFoundException, ExchangeOperationFailedException } from './exceptions/exchange.exceptions';
import { ExchangeFactory } from './services/exchange-service.factory';
import { IExchangeService } from './types/exchange-service.interface';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly exchanges: Map<string, IExchangeService> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeFactory: ExchangeFactory,
    private readonly accountService: AccountService
  ) {}

  @Timeout(Timers.EXCHANGES_INIT_DELAY)
  private async initExchangesAfterDelay(): Promise<void> {
    const accounts = await this.accountService.getAllAccountsForSystem();
    this.logger.debug(`initExchangesAfterDelay() - start | count=${accounts.length}`);

    await Promise.all(accounts.map((account) => this.initializeExchange(account)));

    this.logger.debug('initExchangesAfterDelay() - complete');
  }

  async initializeExchange(account: Account): Promise<void> {
    const accountId = account?.id;
    this.logger.debug(`initializeExchange() - start | accountId=${accountId}`);

    if (!account) {
      this.logger.warn(`initializeExchange() - skip | accountId=${accountId}, reason=Missing account`);
      return;
    }

    if (this.exchanges.has(account.id)) {
      this.logger.warn(`initializeExchange() - skip | accountId=${accountId}, reason=Already initialized`);
      return;
    }

    try {
      const exchange = await this.exchangeFactory.createExchange(account);
      this.exchanges.set(account.id, exchange);

      this.logger.log(`initializeExchange() - success | accountId=${accountId}`);
      this.eventEmitter.emit(Events.Exchange.INITIALIZED, new ExchangeInitializedEvent(account.id));
    } catch (error) {
      this.logger.error(`initializeExchange() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
    }
  }

  private getExchange(accountId: string): IExchangeService {
    this.logger.debug(`getExchange() - start | accountId=${accountId}`);
    const exchange = this.exchanges.get(accountId);

    if (!exchange) {
      this.logger.warn(`getExchange() - not found | accountId=${accountId}, reason=Service not initialized`);
      throw new ExchangeNotFoundException(accountId);
    }
    return exchange;
  }

  async getBalances(accountId: string): Promise<Balances> {
    this.logger.debug(`getBalances() - start | accountId=${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const balances = await exchange.getBalances();
      this.logger.log(`getBalances() - success | accountId=${accountId}`);
      return balances;
    } catch (error) {
      this.logger.error(`getBalances() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getBalances', error.message);
    }
  }

  async getTicker(accountId: string, symbol: string): Promise<Ticker> {
    this.logger.debug(`getTicker() - start | accountId=${accountId}, symbol=${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const ticker = await exchange.getTicker(symbol);
      this.logger.log(`getTicker() - success | accountId=${accountId}, symbol=${symbol}`);
      return ticker;
    } catch (error) {
      this.logger.error(
        `getTicker() - error | accountId=${accountId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getTicker', error.message);
    }
  }

  async getMarkets(accountId: string): Promise<Market[]> {
    this.logger.debug(`getMarkets() - start | accountId=${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const markets = await exchange.getMarkets();
      this.logger.log(`getMarkets() - success | accountId=${accountId}, count=${markets.length}`);
      return markets;
    } catch (error) {
      this.logger.error(`getMarkets() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getMarkets', error.message);
    }
  }

  async getOpenOrders(accountId: string): Promise<Order[]> {
    this.logger.debug(`getOpenOrders() - start | accountId=${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOpenOrders();
      this.logger.log(`getOpenOrders() - success | accountId=${accountId}, count=${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(`getOpenOrders() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenOrders', error.message);
    }
  }

  async getClosedOrders(accountId: string, symbol?: string): Promise<Order[]> {
    this.logger.debug(`getClosedOrders() - start | accountId=${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getClosedOrders(symbol);
      this.logger.log(`getClosedOrders() - success | accountId=${accountId}, count=${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(`getClosedOrders() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getClosedOrders', error.message);
    }
  }

  async getOrders(accountId: string, symbol?: string): Promise<Order[]> {
    this.logger.debug(`getOrders() - start | accountId=${accountId}${symbol ? `, symbol=${symbol}` : ''}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.getOrders(symbol);
      this.logger.log(
        `getOrders() - success | accountId=${accountId}, count=${orders.length}${symbol ? `, symbol=${symbol}` : ''}`
      );
      return orders;
    } catch (error) {
      this.logger.error(
        `getOrders() - error | accountId=${accountId}${symbol ? `, symbol=${symbol}` : ''}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOrders', error.message);
    }
  }

  async getOrder(accountId: string, symbol: string, orderId: string): Promise<Order> {
    this.logger.debug(`getOrder() - start | accountId=${accountId}, symbol=${symbol}, orderId=${orderId}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.getOrder(orderId, symbol);
      this.logger.log(`getOrder() - success | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `getOrder() - error | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOrder', error.message);
    }
  }

  async getOpenPositions(accountId: string): Promise<Position[]> {
    this.logger.debug(`getOpenPositions() - start | accountId=${accountId}`);
    const exchange = this.getExchange(accountId);

    try {
      const positions = await exchange.getOpenPositions();
      this.logger.log(`getOpenPositions() - success | accountId=${accountId}, count=${positions.length}`);
      return positions;
    } catch (error) {
      this.logger.error(`getOpenPositions() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenPositions', error.message);
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
    this.logger.debug(`openOrder() - start | accountId=${accountId}, symbol=${symbol}, type=${type}, side=${side}`);
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
      this.logger.log(`openOrder() - success | accountId=${accountId}, orderId=${order.id}, symbol=${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `openOrder() - error | accountId=${accountId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('openOrder', error.message);
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
    this.logger.debug(`updateOrder() - start | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.updateOrder(orderId, symbol, type, side, quantity, price, params);
      this.logger.log(`updateOrder() - success | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}`);
      return order;
    } catch (error) {
      this.logger.error(
        `updateOrder() - error | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('updateOrder', error.message);
    }
  }

  async closePosition(accountId: string, symbol: string, side: OrderSide, quantity: number): Promise<Order> {
    this.logger.debug(
      `closePosition() - start | accountId=${accountId}, symbol=${symbol}, side=${side}, qty=${quantity}`
    );

    try {
      // NOTE Opposite side for closing
      const finalSide = side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
      const order = await this.openOrder(
        accountId,
        symbol,
        OrderType.MARKET,
        finalSide,
        quantity,
        undefined,
        undefined,
        undefined,
        { positionIdx: side === OrderSide.BUY ? 1 : 2 }
      );
      this.logger.log(`closePosition() - success | accountId=${accountId}, symbol=${symbol}, side=${side}`);
      return order;
    } catch (error) {
      this.logger.error(
        `closePosition() - error | accountId=${accountId}, symbol=${symbol}, side=${side}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('closePosition', error.message);
    }
  }

  async cancelOrder(accountId: string, orderId: string, symbol: string): Promise<Order> {
    this.logger.debug(`cancelOrder() - start | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const order = await exchange.cancelOrder(orderId, symbol);

      if (!order) {
        this.logger.warn(
          `cancelOrder() - skip | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}, reason=No order returned`
        );
      } else {
        this.logger.log(`cancelOrder() - success | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}`);
      }
      return order;
    } catch (error) {
      this.logger.error(
        `cancelOrder() - error | accountId=${accountId}, orderId=${orderId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrder', error.message);
    }
  }

  async cancelOrders(accountId: string, symbol: string): Promise<Order[]> {
    this.logger.debug(`cancelOrders() - start | accountId=${accountId}, symbol=${symbol}`);
    const exchange = this.getExchange(accountId);

    try {
      const orders = await exchange.cancelOrders(symbol);

      if (orders.length === 0) {
        this.logger.warn(
          `cancelOrders() - skip | accountId=${accountId}, symbol=${symbol}, reason=No orders to cancel`
        );
      } else {
        this.logger.log(`cancelOrders() - success | accountId=${accountId}, symbol=${symbol}, count=${orders.length}`);
      }
      return orders;
    } catch (error) {
      this.logger.error(
        `cancelOrders() - error | accountId=${accountId}, symbol=${symbol}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('cancelOrders', error.message);
    }
  }

  async cleanResources(accountId: string): Promise<void> {
    this.logger.debug(`cleanResources() - start | accountId=${accountId}`);
    const exchange = this.exchanges.get(accountId);

    if (!exchange) {
      this.logger.warn(`cleanResources() - skip | accountId=${accountId}, reason=No associated exchange`);
      return;
    }

    try {
      await exchange.clean();
      this.exchanges.delete(accountId);

      this.logger.log(`cleanResources() - success | accountId=${accountId}`);
      this.eventEmitter.emit(Events.Exchange.TERMINATED, new ExchangeTerminatedEvent(accountId));
    } catch (error) {
      this.logger.error(`cleanResources() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('cleanResources', error.message);
    }
  }
}
