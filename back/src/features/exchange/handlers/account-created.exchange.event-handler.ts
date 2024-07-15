import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountCreatedEvent } from '@account/events/account-created.event';
import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountCreatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_CREATED)
  async handle(event: AccountCreatedEvent) {
    const actionContext = `${Events.ACCOUNT_CREATED} | AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to initialize exchange - Error: ${error.message}`, error.stack);
    }
  }
}
