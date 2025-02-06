import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountService } from '@account/account.service';
import { Events, EventHandlersContext } from '@config';
import { ExchangeInitializedEvent } from '../events/exchange-initialized.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService
  ) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.INITIALIZED} | AccountID: ${accountId}`;
    this.logger.log(actionContext);

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsService = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      await wsService.startTrackingAccount(accountId);
      this.logger.log(`${actionContext} - Successfully started websocket tracking`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
