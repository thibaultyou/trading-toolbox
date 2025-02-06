import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountService } from '@account/account.service';
import { Events, EventHandlersContext } from '@config';

import { WebSocketUnsubscribeEvent } from '../events/websocket-unsubscribe.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleWebSocketUnsubscribeEventEventHandler {
  private readonly logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService
  ) {}

  @OnEvent(Events.Websocket.UNSUBSCRIBE)
  async handle(event: WebSocketUnsubscribeEvent) {
    const accountId = event.accountId;
    const topics = Array.isArray(event.topics) ? event.topics.join(',') : event.topics;
    const actionContext = `${Events.Websocket.UNSUBSCRIBE} | accountId=${accountId}, topics=${topics}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsManager = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      wsManager.unsubscribe(accountId, event.topics);
      this.logger.log(`handle() - success | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
