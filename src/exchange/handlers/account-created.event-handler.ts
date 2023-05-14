import { OnEvent } from '@nestjs/event-emitter';
import { AccountCreatedEvent } from '../../account/events/account-created.event';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AccountCreatedHandler {
  private logger = new Logger(AccountCreatedHandler.name);

  @OnEvent('account.created')
  handle(event: AccountCreatedEvent) {
    this.logger.log(`Account created: ${event.name}`);
  }
}
