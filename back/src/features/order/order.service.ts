import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { Events, Timers } from '../../config';
import { delay } from '../../utils/delay.util';
import { ExchangeService } from '../exchange/exchange.service';

import { OrdersUpdatedEvent } from './events/orders-updated.event';

@Injectable()
export class OrderService implements OnModuleInit {
  private logger = new Logger(OrderService.name);
  private orders: Map<string, Order[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    this.updateOrders();
    setInterval(() => {
      this.updateOrders();
    }, Timers.ORDER_UPDATE_COOLDOWN);
  }

  getOrders(accountName: string, symbol?: string): Order[] {
    const orders = this.orders.get(accountName);
    if (symbol && orders) {
      return orders.filter((order) => order.info.symbol === symbol);
    }
    return orders || [];
  }

  private async updateOrders() {
    const initializedAccountNames =
      this.exchangeService.getInitializedAccountNames();
    for (const accountName of initializedAccountNames) {
      try {
        const newOrders =
          await this.exchangeService.fetchOpenOrders(accountName);
        if (this.haveOrdersChanged(accountName, newOrders)) {
          this.orders.set(accountName, newOrders);
          this.logger.debug(
            `Updating orders for ${accountName} account`,
            newOrders,
          );
          this.eventEmitter.emit(
            Events.ORDERS_UPDATED,
            new OrdersUpdatedEvent(accountName, newOrders),
          );
        }
        this.logger.log(`Fetching orders for ${accountName} account`);
        await delay(Timers.ORDER_UPDATE_COOLDOWN);
      } catch (error) {
        this.logger.error(
          `Error during orders update for ${accountName} account`,
          error.stack,
        );
      }
    }
  }

  private haveOrdersChanged(accountName: string, newOrders: Order[]): boolean {
    try {
      return (
        JSON.stringify(newOrders) !==
        JSON.stringify(this.orders.get(accountName))
      );
    } catch (error) {
      this.logger.error('Error during orders comparison', error.stack);
      return false;
    }
  }
}
