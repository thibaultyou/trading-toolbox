import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { AccountDeletedEvent } from '../../account/events/account-deleted.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeAccountDeletedEventHandler {
  private logger = new Logger(ExchangeAccountDeletedEventHandler.name);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_DELETED)
  async handle(event: AccountDeletedEvent) {
    const actionContext = `Exchange Module - Event: ACCOUNT_DELETED - AccountID: ${event.account.id}`;

    try {
      await this.exchangeService.cleanResources(event.account.id);
      this.logger.log(`${actionContext} - Exchange cleaned`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to clean exchange resources - Error: ${error.message}`, error.stack);
    }
  }
}
