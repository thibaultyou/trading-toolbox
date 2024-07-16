import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';

import { ExchangeInitializedEvent } from '../events/exchange-initialized.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.Exchange.INITIALIZED} | AccountID: ${event.accountId}`;

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
