import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events, EventHandlersContext } from '@config';
import { AccountService } from '@account/account.service';

import { WebSocketSubscribeEvent } from '../events/websocket-subscribe.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleWebSocketSubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService
  ) {}

  @OnEvent(Events.Websocket.SUBSCRIBE)
  async handle(event: WebSocketSubscribeEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Websocket.SUBSCRIBE} | AccountID: ${accountId}, Topics: ${event.topics}`;

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsManager = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      await wsManager.subscribe(accountId, event.topics);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add topic to websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
