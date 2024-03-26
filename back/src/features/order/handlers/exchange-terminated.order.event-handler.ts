import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { OrderService } from '../order.service';

@Injectable()
export class OrderExchangeTerminatedEventHandler {
  private logger = new Logger(OrderExchangeTerminatedEventHandler.name);

  constructor(private orderService: OrderService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  async handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Order Module - Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.orderService.stopTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Removed account from order watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from order watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
