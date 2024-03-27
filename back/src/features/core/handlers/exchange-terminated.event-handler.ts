import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleExchangeTerminatedEventHandler {
  private logger = new Logger(CoreModuleExchangeTerminatedEventHandler.name);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Core Module - Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.websocketManagerService.stopTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Removed account from websocket manager`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
