import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
import { ConfigService, Timers } from '@config';
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
export class OrderService implements IAccountTracker, IAccountSynchronizer<IOrder[]> {
  private readonly logger = new Logger(OrderService.name);
  private readonly openOrders: Map<string, IOrder[]> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeService: ExchangeService,
    private readonly orderMapper: OrderMapperService,
    private readonly configService: ConfigService
  ) {}

  @Interval(Timers.ORDERS_CACHE_COOLDOWN)
  sync(): void {
    this.syncAllAccounts();
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (!this.openOrders.has(accountId)) {
      await this.syncAccount(accountId);

      if (!this.openOrders.has(accountId)) {
        this.openOrders.set(accountId, []);
        this.logger.warn(`startTrackingAccount() - no open orders | accountId=${accountId}`);
      }

      this.logger.log(`startTrackingAccount() - success | accountId=${accountId}`);
    } else {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);

    const removed = this.openOrders.delete(accountId);

    if (removed) {
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  async getOrders(accountId: string, marketId?: string): Promise<IOrder[]> {
    this.logger.debug(`getOrders() - start | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}`);

    try {
      const externalOrders = await this.exchangeService.getOrders(accountId, marketId);
      const orders = externalOrders.map((order) => this.orderMapper.fromExternal(order));
      this.logger.log(`getOrders() - success | accountId=${accountId}, count=${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `getOrders() - error | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}, msg=${error.message}`,
        error.stack
      );
      throw new OrderNotFoundException(accountId);
    }
  }

  getOpenOrders(accountId: string, marketId?: string): IOrder[] {
    this.logger.debug(`getOpenOrders() - start | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`getOpenOrders() - error | accountId=${accountId}, reason=Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    let orders = this.openOrders.get(accountId);

    if (marketId) {
      orders = orders.filter((order) => order.marketId === marketId);
    }

    this.logger.log(`getOpenOrders() - success | accountId=${accountId}, count=${orders.length}`);
    return orders;
  }

  async getClosedOrders(accountId: string, marketId?: string): Promise<IOrder[]> {
    this.logger.debug(`getClosedOrders() - start | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}`);

    try {
      const externalOrders = await this.exchangeService.getClosedOrders(accountId, marketId);
      const orders = externalOrders.map((order) => this.orderMapper.fromExternal(order));
      this.logger.log(`getClosedOrders() - success | accountId=${accountId}, count=${orders.length}`);
      return orders;
    } catch (error) {
      this.logger.error(
        `getClosedOrders() - error | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}, msg=${error.message}`,
        error.stack
      );
      throw new OrderNotFoundException(accountId);
    }
  }

  async getOrderById(accountId: string, marketId: string, orderId: string): Promise<IOrder> {
    this.logger.debug(`getOrderById() - start | accountId=${accountId}, marketId=${marketId}, orderId=${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`getOrderById() - skip | accountId=${accountId}, reason=Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    try {
      const externalOrder = await this.exchangeService.getOrder(accountId, marketId, orderId);
      const order = this.orderMapper.fromExternal(externalOrder);
      this.logger.log(`getOrderById() - success | accountId=${accountId}, orderId=${orderId}`);
      return order;
    } catch (error) {
      this.logger.error(
        `getOrderById() - error | accountId=${accountId}, orderId=${orderId}, msg=${error.message}`,
        error.stack
      );
      throw new OrderNotFoundException(accountId, orderId);
    }
  }

  async createOrder(accountId: string, dto: OrderCreateRequestDto): Promise<IOrder> {
    this.logger.debug(`createOrder() - start | accountId=${accountId}, marketId=${dto.marketId}`);

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
      const order = this.orderMapper.fromExternal(externalOrder);
      this.logger.log(`createOrder() - success | accountId=${accountId}, orderId=${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`createOrder() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new OrderCreationFailedException(accountId, error.message);
    }
  }

  async cancelOrder(accountId: string, orderId: string): Promise<IOrder> {
    this.logger.debug(`cancelOrder() - start | accountId=${accountId}, orderId=${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`cancelOrder() - skip | accountId=${accountId}, reason=Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const orderToUpdate = this.openOrders.get(accountId).find((o) => o.id === orderId);

    if (!orderToUpdate) {
      this.logger.warn(`cancelOrder() - skip | accountId=${accountId}, orderId=${orderId}, reason=Order not found`);
      throw new OrderNotFoundException(accountId, orderId);
    }

    try {
      const externalOrder = await this.exchangeService.cancelOrder(accountId, orderId, orderToUpdate.marketId);
      const order = this.orderMapper.fromExternal(externalOrder);
      this.logger.log(`cancelOrder() - success | accountId=${accountId}, orderId=${orderId}`);
      return order;
    } catch (error) {
      this.logger.error(
        `cancelOrder() - error | accountId=${accountId}, orderId=${orderId}, msg=${error.message}`,
        error.stack
      );
      throw new OrderCancellationFailedException(accountId, orderId, error.message);
    }
  }

  async cancelOrdersByMarket(accountId: string, marketId: string): Promise<IOrder[]> {
    this.logger.debug(`cancelOrdersByMarket() - start | accountId=${accountId}, marketId=${marketId}`);

    try {
      const externalOrders = await this.exchangeService.cancelOrders(accountId, marketId);
      const orders = externalOrders.map((order) => this.orderMapper.fromExternal(order));

      if (externalOrders.length === 0) {
        this.logger.debug(
          `cancelOrdersByMarket() - skip | accountId=${accountId}, marketId=${marketId}, reason=No orders`
        );
      } else {
        this.logger.log(
          `cancelOrdersByMarket() - success | accountId=${accountId}, marketId=${marketId}, count=${externalOrders.length}`
        );
      }
      return orders;
    } catch (error) {
      this.logger.error(
        `cancelOrdersByMarket() - error | accountId=${accountId}, marketId=${marketId}, msg=${error.message}`,
        error.stack
      );
      throw new OrderCancellationFailedException(accountId, '', error.message);
    }
  }

  async updateOrder(accountId: string, orderId: string, dto: OrderUpdateRequestDto): Promise<IOrder> {
    this.logger.debug(`updateOrder() - start | accountId=${accountId}, orderId=${orderId}`);

    if (!this.openOrders.has(accountId)) {
      this.logger.warn(`updateOrder() - skip | accountId=${accountId}, reason=Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const orderToUpdate = this.openOrders.get(accountId).find((o) => o.id === orderId);

    if (!orderToUpdate) {
      this.logger.warn(`updateOrder() - skip | accountId=${accountId}, orderId=${orderId}, reason=Order not found`);
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
      const updatedOrder = this.orderMapper.fromExternal(updatedExternalOrder);
      this.eventEmitter.emit(
        this.configService.events.Order.UPDATED,
        new OrderUpdatedEvent(accountId, updatedOrder.id, updatedOrder.linkId)
      );
      this.logger.log(`updateOrder() - success | accountId=${accountId}, orderId=${orderId}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `updateOrder() - error | accountId=${accountId}, orderId=${orderId}, msg=${error.message}`,
        error.stack
      );
      throw new OrderUpdateFailedException(accountId, orderId, error.message);
    }
  }

  async syncAccount(accountId: string): Promise<IOrder[]> {
    this.logger.debug(`syncAccount() - start | accountId=${accountId}`);

    try {
      const newExternalOrders = await this.exchangeService.getOpenOrders(accountId);
      const newOrders = newExternalOrders.map((order) => this.orderMapper.fromExternal(order));
      const currentOrders = this.openOrders.get(accountId) || [];
      const changed = haveOrdersChanged(currentOrders, newOrders);

      if (changed) {
        this.openOrders.set(accountId, newOrders);
        this.eventEmitter.emit(
          this.configService.events.Order.BULK_UPDATED,
          new OrdersUpdatedEvent(accountId, newOrders)
        );
        this.logger.log(`syncAccount() - updated | accountId=${accountId}, count=${newOrders.length}`);
      } else {
        this.logger.debug(`syncAccount() - skip | accountId=${accountId}, reason=Unchanged`);
      }
      return newOrders;
    } catch (error) {
      this.logger.error(`syncAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new OrdersUpdateAggregatedException([{ accountId, error }]);
    }
  }

  async syncAllAccounts(): Promise<void> {
    this.logger.debug('syncAllAccounts() - start');
    const accountIds = Array.from(this.openOrders.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const promises = accountIds.map((id) =>
      this.syncAccount(id).catch((error) => {
        errors.push({ accountId: id, error });
      })
    );
    await Promise.all(promises);

    if (errors.length > 0) {
      const aggError = new OrdersUpdateAggregatedException(errors);
      this.logger.error(`syncAllAccounts() - error | msg=${aggError.message}`, aggError.stack);
    }

    this.logger.debug('syncAllAccounts() - complete');
  }
}
