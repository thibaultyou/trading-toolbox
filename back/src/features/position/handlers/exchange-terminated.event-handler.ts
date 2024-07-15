import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { PositionService } from '../position.service';

@Injectable()
export class PositionModuleExchangeTerminatedEventHandler {
  private logger = new Logger(EventHandlersContext.PositionModuleEventHandler);

  constructor(private positionService: PositionService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `${Events.EXCHANGE_TERMINATED} | AccountID: ${event.accountId}`;

    try {
      this.positionService.stopTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from position watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
