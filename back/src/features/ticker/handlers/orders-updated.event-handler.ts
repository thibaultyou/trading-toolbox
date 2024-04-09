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
  handle(event: OrdersUpdatedEvent) {
    const actionContext = `Event: ${Events.ORDERS_UPDATED} - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerOrdersWatchList(event.accountId, new Set(event.orders.map((o) => o.info.symbol)));
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker watch list - Error: ${error.message}`, error.stack);
    }
  }
}
