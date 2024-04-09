import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.CoreModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `Event: ${Events.EXCHANGE_INITIALIZED} - AccountID: ${event.accountId}`;

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
