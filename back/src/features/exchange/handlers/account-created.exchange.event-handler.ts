import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { AccountCreatedEvent } from '../../account/events/account-created.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeAccountCreatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_CREATED)
  async handle(event: AccountCreatedEvent) {
    const actionContext = `Event: ${Events.ACCOUNT_CREATED} - AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to initialize exchange - Error: ${error.message}`, error.stack);
    }
  }
}
