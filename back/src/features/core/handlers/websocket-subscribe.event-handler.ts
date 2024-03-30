import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { WebSocketSubscribeEvent } from '../events/websocket-subscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleWebSocketSubscribeEventEventHandler {
  private logger = new Logger(CoreModuleWebSocketSubscribeEventEventHandler.name);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.SUBSCRIBE_WEBSOCKET)
  async handle(event: WebSocketSubscribeEvent) {
    const actionContext = `Event: SUBSCRIBE_WEBSOCKET - AccountID: ${event.accountId}`;

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
