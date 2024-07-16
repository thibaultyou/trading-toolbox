import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountDeletedEvent } from '@account/events/account-deleted.event';
import { EventHandlersContext, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountDeletedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.Account.CREATED)
  async handle(event: AccountDeletedEvent) {
    const actionContext = `${Events.Account.CREATED} | AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.cleanResources(event.account.id);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to clean exchange resources - Error: ${error.message}`, error.stack);
    }
  }
}
