import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountCreatedEvent } from '@account/events/account-created.event';
import { EventHandlersContext, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountCreatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.Account.CREATED)
  async handle(event: AccountCreatedEvent) {
    const actionContext = `${Events.Account.CREATED} | AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to initialize exchange - Error: ${error.message}`, error.stack);
    }
  }
}
