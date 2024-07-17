import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { IDataRefresher } from '@common/types/data-refresher.interface';
import { Events, Timers } from '@config';
import { ExchangeService } from '@exchange/exchange.service';

import { OrderCreateRequestDto } from './dtos/order-create.request.dto';
import { OrderUpdateRequestDto } from './dtos/order-update.request.dto';
import { OrderUpdatedEvent } from './events/order-updated.event';
import { OrdersUpdatedEvent } from './events/orders-updated.event';
import {
  OrderCancellationFailedException,
  OrderCreationFailedException,
  OrderNotFoundException,
  OrdersUpdateAggregatedException,
  OrderUpdateFailedException
} from './exceptions/order.exceptions';
import { haveOrdersChanged } from './order.utils';
import { OrderMapperService } from './services/order-mapper.service';
import { OrderSide } from './types/order-side.enum';
import { IOrder } from './types/order.interface';

@Injectable()
export class OrderService implements OnModuleInit, IAccountTracker, IDataRefresher<IOrder[]> {
  private logger = new Logger(OrderService.name);
  private openOrders: Map<string, IOrder[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private orderMapper: OrderMapperService
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    setInterval(() => {
      this.refreshAll();
    }, Timers.ORDERS_CACHE_COOLDOWN);
    this.logger.log('Module initialized successfully');
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.openOrders.has(accountId)) {
      await this.refreshOne(accountId);
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.openOrders.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  async getOrders(accountId: string, marketId?: string): Promise<IOrder[]> {
    this.logger.debug(`Fetching orders - AccountID: ${accountId}${marketId ? ` - MarketID: ${marketId}` : ''}`);

    try {
      const externalOrders = await this.exchangeService.getOrders(accountId, marketId);
      const orders = externalOrders.map((order) => this.orderMapper.fromExternalOrder(order));
      this.logger.debug(`Fetched orders - AccountID: ${accountId} - Count: ${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `Order fetch failed - AccountID: ${accountId}${marketId ? ` - MarketID: ${marketId}` : ''} - Error: ${error.message}`,
        error.stack
      );
      throw new OrderNotFoundException(accountId, '');
    }
  }

  getOpenOrders(accountId: string, marketId?: string): IOrder[] {
    this.logger.debug(`Fetching open orders - AccountID: ${accountId}${marketId ? ` - MarketID: ${marketId}` : ''}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`Open orders fetch failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    let orders = this.openOrders.get(accountId);

    if (marketId) {
      orders = orders.filter((order) => order.marketId === marketId);
    }

    this.logger.debug(`Fetched open orders - AccountID: ${accountId} - Count: ${orders.length}`);
    return orders;
  }

  async getOrderById(accountId: string, marketId: string, orderId: string): Promise<IOrder> {
    this.logger.debug(`Fetching order - AccountID: ${accountId} - MarketID: ${marketId} - OrderID: ${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`Order fetch failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    try {
      const externalOrder = await this.exchangeService.getOrder(accountId, marketId, orderId);
      const order = this.orderMapper.fromExternalOrder(externalOrder);
      this.logger.debug(`Fetched order - AccountID: ${accountId} - OrderID: ${orderId}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Order fetch failed - AccountID: ${accountId} - OrderID: ${orderId} - Error: ${error.message}`,
        error.stack
      );
      throw new OrderNotFoundException(accountId, orderId);
    }
  }

  async createOrder(accountId: string, dto: OrderCreateRequestDto): Promise<IOrder> {
    this.logger.debug(`Creating order - AccountID: ${accountId} - MarketID: ${dto.marketId}`);

    try {
      const params = {
        ...dto.params,
        orderLinkId: dto.linkId,
        tpslMode: dto.tpslMode || 'Partial',
        positionIdx: dto.side === OrderSide.BUY ? 1 : 2
      };
      const externalOrder = await this.exchangeService.openOrder(
        accountId,
        dto.marketId,
        dto.type,
        dto.side,
        dto.quantity,
        dto.price,
        dto.takeProfitPrice,
        dto.stopLossPrice,
        params
      );
      const order = this.orderMapper.fromExternalOrder(externalOrder);
      this.logger.log(`Created order - AccountID: ${accountId} - OrderID: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Order creation failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new OrderCreationFailedException(accountId, error.message);
    }
  }

  async cancelOrder(accountId: string, orderId: string): Promise<IOrder> {
    this.logger.debug(`Cancelling order - AccountID: ${accountId} - OrderID: ${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`Order cancellation failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const orderToUpdate = this.openOrders.get(accountId).find((order) => order.id === orderId);

    if (!orderToUpdate) {
      this.logger.warn(
        `Order cancellation failed - AccountID: ${accountId} - OrderID: ${orderId} - Reason: Order not found`
      );
      throw new OrderNotFoundException(accountId, orderId);
    }

    try {
      const externalOrder = await this.exchangeService.cancelOrder(accountId, orderId, orderToUpdate.marketId);
      const order = this.orderMapper.fromExternalOrder(externalOrder);
      this.logger.log(`Cancelled order - AccountID: ${accountId} - OrderID: ${orderId}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Order cancellation failed - AccountID: ${accountId} - OrderID: ${orderId} - Error: ${error.message}`,
        error.stack
      );
      throw new OrderCancellationFailedException(accountId, orderId, error.message);
    }
  }

  async cancelOrdersByMarket(accountId: string, marketId: string): Promise<IOrder[]> {
    this.logger.debug(`Cancelling orders by market - AccountID: ${accountId} - MarketID: ${marketId}`);

    try {
      const externalOrders = await this.exchangeService.cancelOrders(accountId, marketId);
      const orders = externalOrders.map((externalOrder) => this.orderMapper.fromExternalOrder(externalOrder));

      if (externalOrders.length === 0) {
        this.logger.debug(
          `Order cancellation skipped - AccountID: ${accountId} - MarketID: ${marketId} - Reason: No orders found`
        );
      } else {
        this.logger.log(
          `Cancelled orders - AccountID: ${accountId} - MarketID: ${marketId} - Count: ${externalOrders.length}`
        );
      }
      return orders;
    } catch (error) {
      this.logger.error(
        `Order cancellation failed - AccountID: ${accountId} - MarketID: ${marketId} - Error: ${error.message}`,
        error.stack
      );
      throw new OrderCancellationFailedException(accountId, '', error.message);
    }
  }

  async updateOrder(accountId: string, orderId: string, dto: OrderUpdateRequestDto): Promise<IOrder> {
    this.logger.debug(`Updating order - AccountID: ${accountId} - OrderID: ${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`Order update failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const orderToUpdate = this.openOrders.get(accountId).find((order) => order.id === orderId);

    if (!orderToUpdate) {
      this.logger.warn(`Order update failed - AccountID: ${accountId} - OrderID: ${orderId} - Reason: Order not found`);
      throw new OrderNotFoundException(accountId, orderId);
    }

    try {
      const params: Record<string, any> = {};

      if (dto.takeProfitPrice !== undefined) params.takeProfit = dto.takeProfitPrice;

      if (dto.stopLossPrice !== undefined) params.stopLoss = dto.stopLossPrice;

      const updatedExternalOrder = await this.exchangeService.updateOrder(
        accountId,
        orderId,
        orderToUpdate.marketId,
        orderToUpdate.type,
        OrderSide[orderToUpdate.side],
        dto.quantity,
        dto.price,
        params
      );
      const updatedOrder = this.orderMapper.fromExternalOrder(updatedExternalOrder);
      this.eventEmitter.emit(
        Events.Order.UPDATED,
        new OrderUpdatedEvent(accountId, updatedOrder.id, updatedOrder.linkId)
      );

      this.logger.log(`Updated order - AccountID: ${accountId} - OrderID: ${orderId}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Order update failed - AccountID: ${accountId} - OrderID: ${orderId} - Error: ${error.message}`,
        error.stack
      );
      throw new OrderUpdateFailedException(accountId, orderId, error.message);
    }
  }

  async refreshOne(accountId: string): Promise<IOrder[]> {
    this.logger.debug(`Refreshing open orders - AccountID: ${accountId}`);

    try {
      const newExternalOrders = await this.exchangeService.getOpenOrders(accountId);
      const newOrders = newExternalOrders.map((order) => this.orderMapper.fromExternalOrder(order));
      const currentOrders = this.openOrders.get(accountId) || [];
      const haveChanged = haveOrdersChanged(currentOrders, newOrders);

      if (haveChanged) {
        this.openOrders.set(accountId, newOrders);
        this.eventEmitter.emit(Events.Order.BULK_UPDATED, new OrdersUpdatedEvent(accountId, newOrders));
        this.logger.log(`Updated open orders - AccountID: ${accountId} - Count: ${newOrders.length}`);
      } else {
        this.logger.debug(`Open orders update skipped - AccountID: ${accountId} - Reason: Unchanged`);
      }
      return newOrders;
    } catch (error) {
      this.logger.error(`Open orders refresh failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new OrdersUpdateAggregatedException([{ accountId, error }]);
    }
  }

  async refreshAll() {
    this.logger.debug('Starting refresh of all open orders');
    const accountIds = Array.from(this.openOrders.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const ordersPromises = accountIds.map((accountId) =>
      this.refreshOne(accountId).catch((error) => {
        errors.push({ accountId, error });
      })
    );
    await Promise.all(ordersPromises);

    if (errors.length > 0) {
      const aggregatedError = new OrdersUpdateAggregatedException(errors);
      this.logger.error(
        `Multiple open orders updates failed - Errors: ${aggregatedError.message}`,
        aggregatedError.stack
      );
    }

    this.logger.debug(`Completed refresh of all open orders`);
  }
}
