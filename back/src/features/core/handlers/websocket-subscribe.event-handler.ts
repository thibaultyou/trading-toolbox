import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { WebSocketSubscribeEvent } from '../events/websocket-subscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleWebSocketSubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.CoreModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.WEBSOCKET_SUBSCRIBE)
  async handle(event: WebSocketSubscribeEvent) {
    const actionContext = `${Events.WEBSOCKET_SUBSCRIBE} | AccountID: ${event.accountId}`;

    try {
      await this.websocketManagerService.subscribe(event.accountId, event.topics);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add topic to websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
