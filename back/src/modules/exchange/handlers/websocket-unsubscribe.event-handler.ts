import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events, EventHandlersContext } from '@config';
import { AccountService } from '@account/account.service';

import { WebSocketUnsubscribeEvent } from '../events/websocket-unsubscribe.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleWebSocketUnsubscribeEventEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService
  ) {}

  @OnEvent(Events.Websocket.UNSUBSCRIBE)
  async handle(event: WebSocketUnsubscribeEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Websocket.UNSUBSCRIBE} | AccountID: ${accountId}, Topics: ${event.topics}`;

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsManager = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      wsManager.unsubscribe(accountId, event.topics);

      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to unsubscribe - Error: ${error.message}`, error.stack);
    }
  }
}
