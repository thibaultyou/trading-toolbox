import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountUpdatedEvent } from '@account/events/account-updated.event';
import { EventHandlersContext, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.ExchangeModule);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.Account.UPDATED)
  async handle(event: AccountUpdatedEvent) {
    const actionContext = `${Events.Account.UPDATED} | AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.cleanResources(event.account.id);
      this.logger.log(`${actionContext} - Successfully cleaned resources`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to clean resources - Error: ${error.message}`, error.stack);
    }

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(`${actionContext} - Successfully initialized exchange`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to initialize exchange - Error: ${error.message}`, error.stack);
    }
  }
}
