import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { ExchangeInitializedEvent } from '../events/exchange-initialized.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.EXCHANGE_INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.websocketManagerService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
