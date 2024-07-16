import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';

import { WebSocketUnsubscribeEvent } from '../events/websocket-unsubscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleWebSocketUnsubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.Websocket.UNSUBSCRIBE)
  handle(event: WebSocketUnsubscribeEvent) {
    const actionContext = `${Events.Websocket.UNSUBSCRIBE} | AccountID: ${event.accountId}`;

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
