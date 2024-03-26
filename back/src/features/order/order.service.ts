import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { IAccountTracker } from '../../common/interfaces/account-tracker.interface';
import { IDataRefresher } from '../../common/interfaces/data-refresher.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { OrdersUpdatedEvent } from './events/orders-updated.event';
import { OrdersUpdateAggregatedException } from './exceptions/orders.exceptions';

@Injectable()
export class OrderService implements OnModuleInit, IAccountTracker, IDataRefresher<Order[]> {
  private logger = new Logger(OrderService.name);
  private orders: Map<string, Order[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.ORDERS_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    if (!this.orders.has(accountId)) {
      this.logger.log(`Order - Tracking Initiated - AccountID: ${accountId}`);
      await this.refreshOne(accountId);
    } else {
      this.logger.warn(`Order - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.orders.delete(accountId)) {
      this.logger.log(`Order - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Order - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getAccountOrders(accountId: string): Order[] {
    this.logger.log(`Order - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.orders.has(accountId)) {
      this.logger.error(`Order - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);

      throw new AccountNotFoundException(accountId);
    }

    return this.orders.get(accountId);
  }

  async refreshOne(accountId: string): Promise<Order[]> {
    this.logger.debug(`Order - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const newOrders = await this.exchangeService.getOpenOrders(accountId);
      const currentOrders = this.orders.get(accountId) || [];
      const haveOrdersChanged = this.haveOrdersChanged(currentOrders, newOrders);

      if (haveOrdersChanged) {
        this.orders.set(accountId, newOrders);
        this.eventEmitter.emit(Events.ORDERS_UPDATED, new OrdersUpdatedEvent(accountId, newOrders));
        // this.logger.log(`Order - Update Success - AccountID: ${accountId}, Count: ${newOrders.length}, Orders: ${JSON.stringify(newOrders)}`);
        this.logger.log(`Order - Update Success - AccountID: ${accountId}, Count: ${newOrders.length}`);
      } else {
        this.logger.debug(`Order - No Update Required - AccountID: ${accountId}`);
      }

      return newOrders;
    } catch (error) {
      this.logger.error(`Order - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Order - Refresh All Initiated`);
    const accountIds = Array.from(this.orders.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];

    const ordersPromises = accountIds.map((accountId) =>
      this.refreshOne(accountId).catch((error) => {
        errors.push({ accountId, error });
      })
    );

    await Promise.all(ordersPromises);

    if (errors.length > 0) {
      const aggregatedError = new OrdersUpdateAggregatedException(errors);

      this.logger.error(`Order - Multiple Updates Failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
      // Avoid interrupting the loop by not throwing an exception
    }
  }

  private haveOrdersChanged(currentOrders: Order[], newOrders: Order[]): boolean {
    if (currentOrders.length !== newOrders.length) return true;

    const orderMap = new Map(currentOrders.map((order) => [order.id, order]));

    for (const order of newOrders) {
      const currentOrder = orderMap.get(order.id);

      if (!currentOrder || currentOrder.lastUpdateTimestamp !== order.lastUpdateTimestamp) {
        return true;
      }
    }

    return false;
  }
}
