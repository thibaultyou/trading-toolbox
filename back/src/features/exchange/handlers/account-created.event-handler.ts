import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { AccountCreatedEvent } from '../../account/events/account-created.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class AccountCreatedHandler {
  private logger = new Logger(AccountCreatedHandler.name);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.ACCOUNT_CREATED)
  handle(event: AccountCreatedEvent) {
    this.logger.log(`[${Events.ACCOUNT_CREATED}] ${event.account.name}`);
    this.exchangeService.initializeExchange(event.account);
  }
}
