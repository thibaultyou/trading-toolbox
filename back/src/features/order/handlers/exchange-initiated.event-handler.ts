import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { OrderService } from '../order.service';

@Injectable()
export class OrderModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.OrderModuleEventHandler);

  constructor(private orderService: OrderService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.EXCHANGE_INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.orderService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to order watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
