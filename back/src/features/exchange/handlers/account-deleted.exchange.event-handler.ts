import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountDeletedEvent } from '@account/events/account-deleted.event';
import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeAccountDeletedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModuleEventHandler);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_CREATED)
  async handle(event: AccountDeletedEvent) {
    const actionContext = `${Events.ACCOUNT_CREATED} | AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.cleanResources(event.account.id);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to clean exchange resources - Error: ${error.message}`, error.stack);
    }
  }
}
