import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';
import { ExchangeService } from '../exchange/exchange.service';
import { Events, Timers } from '../app.constants';
import { OrderUpdatedEvent } from './events/order-updated.event';

@Injectable()
export class OrderService implements OnModuleInit {
  private logger = new Logger(OrderService.name);
  private orders: Order[] = [];

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    try {
      await this.updateOrders();
      setInterval(async () => {
        await this.updateOrders();
      }, Timers.ORDER_UPDATE_COOLDOWN);
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  private async updateOrders() {
    try {
      const newOrders = await this.exchangeService.fetchOpenOrders();
      if (this.haveOrdersChanged(newOrders)) {
        this.orders = newOrders;
        this.logger.debug(`Updating orders`, newOrders);
        this.eventEmitter.emit(
          Events.ORDER_UPDATED,
          new OrderUpdatedEvent(newOrders),
        );
      }
    } catch (error) {
      this.logger.error('Error during updating orders', error.stack);
    }
  }

  private haveOrdersChanged(newOrders: Order[]): boolean {
    try {
      return JSON.stringify(newOrders) !== JSON.stringify(this.orders);
    } catch (error) {
      this.logger.error('Error during orders comparison', error.stack);
      return false;
    }
  }
}
