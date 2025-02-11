import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountService } from '@account/account.service';
import { ConfigService, Events } from '@config';

import { ExchangeTerminatedEvent } from '../events/exchange-terminated.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleExchangeTerminatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Exchange.TERMINATED)
  async handle(event: ExchangeTerminatedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.TERMINATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsService = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      wsService.stopTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=stopped`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
