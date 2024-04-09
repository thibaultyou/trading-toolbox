import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { WebSocketUnsubscribeEvent } from '../events/websocket-unsubscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleWebSocketUnsubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.CoreModuleEventHandler);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.UNSUBSCRIBE_WEBSOCKET)
  handle(event: WebSocketUnsubscribeEvent) {
    const actionContext = `Event: ${Events.UNSUBSCRIBE_WEBSOCKET} - AccountID: ${event.accountId}`;

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
