import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountService } from '@account/account.service';
import { ConfigService, Events } from '@config';

import { WebSocketSubscribeEvent } from '../events/websocket-subscribe.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleWebSocketSubscribeEventEventHandler {
  private readonly logger = new Logger(this.configService.handlers.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Websocket.SUBSCRIBE)
  async handle(event: WebSocketSubscribeEvent) {
    const accountId = event.accountId;
    const topics = Array.isArray(event.topics) ? `[${event.topics.join(',')}]` : event.topics;
    const actionContext = `${Events.Websocket.SUBSCRIBE} | accountId=${accountId}, topics=${topics}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsManager = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      await wsManager.subscribe(accountId, event.topics);
      this.logger.log(`handle() - success | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
