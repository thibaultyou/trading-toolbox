import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { OrdersUpdatedEvent } from '../../order/events/orders-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleOrdersUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.ORDERS_UPDATED)
  async handle(event: OrdersUpdatedEvent) {
    const actionContext = `${Events.ORDERS_UPDATED} | AccountID: ${event.accountId}`;

    try {
      await this.tickerService.updateTickerOrdersWatchList(
        event.accountId,
        new Set(event.orders.map((o) => o.info.symbol))
      );
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker watch list - Error: ${error.message}`, error.stack);
    }
  }
}
