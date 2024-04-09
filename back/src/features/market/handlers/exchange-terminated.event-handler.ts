import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { MarketService } from '../market.service';

@Injectable()
export class MarketModuleExchangeTerminatedEventHandler {
  private logger = new Logger(EventHandlersContext.MarketModuleEventHandler);

  constructor(private marketService: MarketService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Event: ${Events.EXCHANGE_TERMINATED} - AccountID: ${event.accountId}`;

    try {
      this.marketService.stopTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from market watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
