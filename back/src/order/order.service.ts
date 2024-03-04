import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { AccountService } from '../account/account.service';
import { Events, Timers } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';

import { OrderUpdatedEvent } from './events/order-updated.event';

@Injectable()
export class OrderService implements OnModuleInit {
  private logger = new Logger(OrderService.name);
  private orders: Map<string, Order[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private accountService: AccountService,
  ) { }

  async onModuleInit() {
    await this.updateOrders();
  }

  async getOrders(accountName: string, symbol?: string): Promise<Order[]> {
    const orders = this.orders.get(accountName);
    if (symbol && orders) {
      return orders.filter((order) => order.info.symbol === symbol);
    }
    return orders || [];
  }

  private async updateOrders() {
    const accounts = await this.accountService.findAll();
    for (const account of accounts) {
      try {
        const newOrders = await this.exchangeService.fetchOpenOrders(
          account.name,
        );
        if (this.haveOrdersChanged(account.name, newOrders)) {
          this.orders.set(account.name, newOrders);
          this.logger.debug(`Updating orders for ${account.name}`, newOrders);
          this.eventEmitter.emit(
            Events.ORDER_UPDATED,
            new OrderUpdatedEvent(account.name, newOrders),
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Timers.ORDER_UPDATE_COOLDOWN),
        );
      } catch (error) {
        this.logger.error(
          `Error during orders update for ${account.name}`,
          error.stack,
        );
      }
    }
    setTimeout(() => this.updateOrders(), Timers.ORDER_UPDATE_COOLDOWN);
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
