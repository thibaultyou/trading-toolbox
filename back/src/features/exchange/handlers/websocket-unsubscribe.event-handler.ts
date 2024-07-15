import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { WebSocketUnsubscribeEvent } from '../events/websocket-unsubscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleWebSocketUnsubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.WEBSOCKET_UNSUBSCRIBE)
  handle(event: WebSocketUnsubscribeEvent) {
    const actionContext = `${Events.WEBSOCKET_UNSUBSCRIBE} | AccountID: ${event.accountId}`;

    try {
      this.websocketManagerService.unsubscribe(event.accountId, event.topics);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove topic from websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
