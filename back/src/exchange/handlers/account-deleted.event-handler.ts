import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountDeletedEvent } from '../../account/events/account-deleted.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class AccountDeletedHandler {
  private logger = new Logger(AccountDeletedHandler.name);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent('account.deleted')
  handle(event: AccountDeletedEvent) {
    this.logger.log(`Account deleted: ${event.account.name}`);
    this.exchangeService.cleanResources(event.account.name);
  }
}
