import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountCreatedEvent } from '../../account/events/account-created.event';
import { AppLogger } from '../../logger.service';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler
  implements IEventHandler<AccountCreatedEvent>
{
  private logger = new AppLogger(AccountCreatedHandler.name);

  handle(event: AccountCreatedEvent) {
    this.logger.log(`Account created: ${event.name}`);
  }
}
