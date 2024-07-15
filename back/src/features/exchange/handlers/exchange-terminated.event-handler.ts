import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { ExchangeTerminatedEvent } from '../events/exchange-terminated.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleExchangeTerminatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `${Events.EXCHANGE_TERMINATED} | AccountID: ${event.accountId}`;

    try {
      this.websocketManagerService.stopTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
