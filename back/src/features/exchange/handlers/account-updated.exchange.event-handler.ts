import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { AccountUpdatedEvent } from '../../account/events/account-updated.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeAccountUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_UPDATED)
  async handle(event: AccountUpdatedEvent) {
    const actionContext = `Event: ${Events.ACCOUNT_UPDATED} - AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.cleanResources(event.account.id);
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to updated exchange - Error: ${error.message}`, error.stack);
    }
  }
}
