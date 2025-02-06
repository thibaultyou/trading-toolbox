import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountService } from '@account/account.service';
import { Events, EventHandlersContext } from '@config';

import { ExchangeTerminatedEvent } from '../events/exchange-terminated.event';
import { ExchangeWebsocketFactory } from '../services/exchange-websocket-factory';

@Injectable()
export class ExchangeModuleExchangeTerminatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(
    private readonly exchangeWebsocketFactory: ExchangeWebsocketFactory,
    private readonly accountService: AccountService
  ) {}

  @OnEvent(Events.Exchange.TERMINATED)
  async handle(event: ExchangeTerminatedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.TERMINATED} | AccountID: ${accountId}`;

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsService = this.exchangeWebsocketFactory.getWebsocketService(account.exchange);
      wsService.stopTrackingAccount(accountId);

      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
