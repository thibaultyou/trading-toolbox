import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';

import { WebSocketSubscribeEvent } from '../events/websocket-subscribe.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class ExchangeModuleWebSocketSubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.Websocket.SUBSCRIBE)
  async handle(event: WebSocketSubscribeEvent) {
    const actionContext = `${Events.Websocket.SUBSCRIBE} | AccountID: ${event.accountId}, Topics: ${event.topics}`;

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
