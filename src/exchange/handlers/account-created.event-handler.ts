import { OnEvent } from '@nestjs/event-emitter';
import { AccountCreatedEvent } from '../../account/events/account-created.event';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from '../../app.constants';

@Injectable()
export class AccountCreatedHandler {
  private logger = new Logger(AccountCreatedHandler.name);

  @OnEvent(Events.ACCOUNT_CREATED)
  handle(event: AccountCreatedEvent) {
    this.logger.log(`[${Events.ACCOUNT_CREATED}] ${event.name}`);
  }
}
