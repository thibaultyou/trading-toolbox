import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { OrdersUpdatedEvent } from '../../order/events/orders-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleOrdersUpdatedEventHandler {
  private logger = new Logger(TickerModuleOrdersUpdatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.ORDERS_UPDATED)
  handle(event: OrdersUpdatedEvent) {
    const actionContext = `Ticker Module - Event: ORDERS_UPDATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerOrdersWatchList(
        event.accountId,
        event.orders.map((o) => o.info.symbol)
      );
      this.logger.log(`${actionContext} - Updated ticker watch list`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker watch list - Error: ${error.message}`, error.stack);
    }
  }
}
