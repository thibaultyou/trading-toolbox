import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ITrackableService } from '../common/interfaces/trackable.service.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { OrdersUpdatedEvent } from './events/orders-updated.event';
import { OrdersUpdateAggregatedException } from './exceptions/orders.exceptions';

@Injectable()
export class OrderService implements OnModuleInit, ITrackableService<Order[]> {
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

  startTrackingAccount(accountId: string) {
    if (!this.orders.has(accountId)) {
      this.logger.log(`Order - Tracking Initiated - AccountID: ${accountId}`);
      this.refreshOne(accountId);
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
      const orders = await this.exchangeService.getOpenOrders(accountId);

      this.orders.set(accountId, orders);
      this.eventEmitter.emit(Events.ORDERS_UPDATED, new OrdersUpdatedEvent(accountId, orders));
      this.logger.log(`Order - Update Success - AccountID: ${accountId}, Count: ${orders.length}`);

      return orders;
    } catch (error) {
      this.logger.error(`Order - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Orders - Refresh Initiated`);
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

      this.logger.error(`Orders - Multiple Updates Failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
      // Avoid interrupting the loop by not throwing an exception
    }
  }
}
