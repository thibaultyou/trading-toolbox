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

  getOrders(accountId: string, symbol?: string): Order[] {
    const orders = this.orders.get(accountId);

    if (symbol && orders) {
      return orders.filter((order) => order.info.symbol === symbol);
    }

    return orders || [];
  }

  private async updateOrders() {
    const initializedAccountIds =
      this.exchangeService.getInitializedAccountIds();

    for (const accountId of initializedAccountIds) {
      try {
        const newOrders = await this.exchangeService.getOpenOrders(accountId);

        if (this.haveOrdersChanged(accountId, newOrders)) {
          this.orders.set(accountId, newOrders);
          this.logger.debug(
            `Updating orders for ${accountId} account`,
            newOrders,
          );
          this.eventEmitter.emit(
            Events.ORDERS_UPDATED,
            new OrdersUpdatedEvent(accountId, newOrders),
          );
        }

        this.logger.log(`Fetching orders for ${accountId} account`);
        await delay(Timers.ORDER_UPDATE_COOLDOWN);
      } catch (error) {
        this.logger.error(
          `Error during orders update for ${accountId} account`,
          error.stack,
        );
      }
    }
  }

  private haveOrdersChanged(accountId: string, newOrders: Order[]): boolean {
    try {
      return (
        JSON.stringify(newOrders) !== JSON.stringify(this.orders.get(accountId))
      );
    } catch (error) {
      this.logger.error('Error during orders comparison', error.stack);

      return false;
    }
  }
}
